import { randomUUID } from 'node:crypto';
import { DataSource, QueryRunner } from 'typeorm';
import { buildDataSourceOptions } from '../src/database/data-source';

async function requireEmptyDatabase(db: DataSource): Promise<void> {
  const [{ schema }] = await db.query<{ schema: string }[]>(
    'SELECT current_schema() AS schema',
  );
  if (schema !== 'public') {
    throw new Error('Test database must use public as its effective schema');
  }
  const tables: unknown[] = await db.query(`
    SELECT c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
  `);
  if (tables.length !== 0) {
    throw new Error('Test database must be empty; refusing to modify it');
  }
}

describe('Word answer database', () => {
  let db: DataSource;
  let ownsSchema = false;

  beforeAll(async () => {
    const options = buildDataSourceOptions();
    const database = process.env.TEST_DB_NAME;
    if (!database?.endsWith('_test') || database === options.database) {
      throw new Error('TEST_DB_NAME must end in _test and differ from DB_NAME');
    }
    db = new DataSource({ ...options, database, entities: [] });
    await db.initialize();
    await requireEmptyDatabase(db);
    // Verify the guard against an occupied custom schema before migrations.
    await db.query('CREATE SCHEMA learning_guard_test');
    try {
      await db.query('CREATE TABLE learning_guard_test.sentinel (id integer)');
      await expect(requireEmptyDatabase(db)).rejects.toThrow('must be empty');
    } finally {
      await db.query('DROP TABLE IF EXISTS learning_guard_test.sentinel');
      await db.query('DROP SCHEMA learning_guard_test');
    }
    await requireEmptyDatabase(db);
    ownsSchema = true;
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await db.runMigrations();
  });

  afterAll(async () => {
    if (!db?.isInitialized) return;
    try {
      if (ownsSchema) {
        // Undo only migrations this suite applied to its initially empty DB.
        const rows: unknown[] = await db.query('SELECT id FROM migrations');
        for (let i = 0; i < rows.length; i++) await db.undoLastMigration();
        await db.query('DROP TABLE migrations');
      }
    } finally {
      await db.destroy();
    }
  });

  it('registers the two initial exercise types', async () => {
    expect(
      await db.query('SELECT name, type FROM exercise_types ORDER BY type'),
    ).toEqual([
      { name: 'Choose translation', type: 'choose_translation' },
      { name: 'Compile word', type: 'compile_word' },
    ]);
    await expect(
      db.query(`INSERT INTO exercise_types(name, type)
        VALUES ('Duplicate', 'compile_word')`),
    ).rejects.toMatchObject({ driverError: { code: '23505' } });
  });

  describe('answer history', () => {
    let runner: QueryRunner;
    let userId: string;
    let otherUserId: string;
    let wordId: string;
    let lessonA: string;
    let lessonB: string;
    let compileId: string;
    let chooseId: string;

    function query<T = unknown>(
      sql: string,
      parameters: unknown[] = [],
    ): Promise<T> {
      return db.query<T>(sql, parameters, runner);
    }

    beforeEach(async () => {
      runner = db.createQueryRunner();
      await runner.connect();
      await runner.startTransaction();
      const users = await query<{ id: string }[]>(`
        INSERT INTO users(email, password_hash)
        VALUES ('learner@example.test', 'unused'), ('other@example.test', 'unused')
        RETURNING id`);
      [userId, otherUserId] = users.map((user) => user.id);
      [{ id: wordId }] = await query<{ id: string }[]>(
        `INSERT INTO words(word) VALUES ('apple') RETURNING id`,
      );
      const [{ id: topicId }] = await query<{ id: string }[]>(
        `INSERT INTO topics(name, slug) VALUES ('Fruit', 'fruit') RETURNING id`,
      );
      const lessons = await query<{ id: string }[]>(
        `INSERT INTO lessons(name, slug, topic_id)
         VALUES ('A', 'a', $1), ('B', 'b', $1) RETURNING id`,
        [topicId],
      );
      [lessonA, lessonB] = lessons.map((lesson) => lesson.id);
      await query(
        `INSERT INTO lesson_words(lesson_id, word_id) VALUES ($1, $2)`,
        [lessonA, wordId],
      );
      const types = await query<{ id: string; type: string }[]>(
        'SELECT id, type FROM exercise_types',
      );
      compileId = types.find((type) => type.type === 'compile_word')!.id;
      chooseId = types.find((type) => type.type === 'choose_translation')!.id;
    });

    afterEach(async () => {
      if (runner?.isTransactionActive) await runner.rollbackTransaction();
      await runner?.release();
    });

    function answer(overrides: Record<string, unknown> = {}) {
      return {
        id: randomUUID(),
        user_id: userId,
        word_id: wordId,
        lesson_id: lessonA,
        exercise_type_id: compileId,
        is_correct: true,
        points_awarded: 10,
        answered_at: '2026-01-01T12:00:00+02:00',
        ...overrides,
      };
    }

    async function insert(values = answer()) {
      const columns = Object.keys(values);
      return query<{ answered_at: Date; created_at: Date }[]>(
        `INSERT INTO word_answers (${columns.map((c) => `"${c}"`).join(', ')})
         VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
        Object.values(values),
      );
    }

    async function rejected(values: ReturnType<typeof answer>, code: string) {
      // PostgreSQL aborts a transaction after a constraint violation.
      await query('SAVEPOINT invalid_answer');
      await expect(insert(values)).rejects.toMatchObject({
        driverError: { code },
      });
      await query('ROLLBACK TO SAVEPOINT invalid_answer');
      await query('RELEASE SAVEPOINT invalid_answer');
    }

    it('rejects duplicate UUIDs but allows distinct attempts for the same word', async () => {
      const values = answer();
      await insert(values);
      await rejected(values, '23505');
      await insert();
      expect(
        await query('SELECT count(*)::int AS count FROM word_answers'),
      ).toEqual([{ count: 2 }]);
    });

    it('requires all answer fields except lesson and server creation time', async () => {
      for (const field of [
        'id',
        'user_id',
        'word_id',
        'exercise_type_id',
        'is_correct',
        'points_awarded',
        'answered_at',
      ]) {
        const values = answer();
        delete values[field];
        await rejected(values, '23502');
      }
      await insert(answer({ lesson_id: null, points_awarded: -5 }));
    });

    it('rejects nonexistent parents for every foreign key', async () => {
      for (const field of [
        'user_id',
        'word_id',
        'lesson_id',
        'exercise_type_id',
      ]) {
        await rejected(answer({ [field]: randomUUID() }), '23503');
      }
    });

    it('combines global knowledge while isolating lesson, exercise, and user points', async () => {
      for (let i = 0; i < 7; i++) await insert();
      for (let i = 0; i < 3; i++) {
        await insert(
          answer({
            lesson_id: lessonB,
            exercise_type_id: chooseId,
            points_awarded: 20,
          }),
        );
      }
      await insert(answer({ is_correct: false, points_awarded: 0 }));
      await insert(answer({ user_id: otherUserId, points_awarded: 500 }));
      expect(
        await query(
          `SELECT count(*)::int AS count FROM word_answers
         WHERE user_id = $1 AND word_id = $2 AND is_correct`,
          [userId, wordId],
        ),
      ).toEqual([{ count: 10 }]);
      const totals = await query(
        `SELECT lesson_id, exercise_type_id, SUM(points_awarded)::int AS points
         FROM word_answers WHERE user_id = $1 GROUP BY lesson_id, exercise_type_id`,
        [userId],
      );
      expect(totals).toHaveLength(2);
      expect(totals).toEqual(
        expect.arrayContaining([
          { lesson_id: lessonA, exercise_type_id: compileId, points: 70 },
          { lesson_id: lessonB, exercise_type_id: chooseId, points: 60 },
        ]),
      );
    });

    it('preserves history when membership or the lesson is removed', async () => {
      await insert();
      await query('DELETE FROM lesson_words WHERE lesson_id = $1', [lessonA]);
      expect(
        await query('SELECT count(*)::int AS count FROM word_answers'),
      ).toEqual([{ count: 1 }]);
      await query('DELETE FROM lessons WHERE id = $1', [lessonA]);
      expect(
        await query(
          'SELECT lesson_id, points_awarded, is_correct, word_id FROM word_answers',
        ),
      ).toEqual([
        {
          lesson_id: null,
          points_awarded: 10,
          is_correct: true,
          word_id: wordId,
        },
      ]);
    });

    it('restricts deleting referenced words and exercise types', async () => {
      await insert();
      for (const [table, id] of [
        ['words', wordId],
        ['exercise_types', compileId],
      ]) {
        await query('SAVEPOINT parent_delete');
        await expect(
          query(`DELETE FROM ${table} WHERE id = $1`, [id]),
        ).rejects.toMatchObject({
          // RESTRICT can report restrict_violation or foreign_key_violation.
          driverError: {
            code: expect.stringMatching(/^(23001|23503)$/) as unknown,
          },
        });
        await query('ROLLBACK TO SAVEPOINT parent_delete');
        await query('RELEASE SAVEPOINT parent_delete');
        expect(
          await query(`SELECT id FROM ${table} WHERE id = $1`, [id]),
        ).toEqual([{ id }]);
      }
    });

    it('deletes only the removed user’s answers', async () => {
      await insert();
      await insert(answer({ user_id: otherUserId }));
      await query('DELETE FROM users WHERE id = $1', [userId]);
      expect(await query('SELECT user_id FROM word_answers')).toEqual([
        { user_id: otherUserId },
      ]);
    });

    it('keeps device time separate from server time and preserves timezone instants', async () => {
      const [saved] = await insert();
      expect(saved.answered_at.toISOString()).toBe('2026-01-01T10:00:00.000Z');
      expect(saved.created_at.getTime()).toBeGreaterThan(
        saved.answered_at.getTime(),
      );
    });
  });

  describe('migration rollback', () => {
    it('removes only the learning tables and can recreate them with seed data', async () => {
      // Answer fixtures have been rolled back before this destructive test.
      await db.undoLastMigration();
      expect(
        await db.query(`SELECT to_regclass('word_answers') AS answers,
        to_regclass('exercise_types') AS types, to_regclass('lessons') AS lessons`),
      ).toEqual([{ answers: null, types: null, lessons: 'lessons' }]);
      await db.runMigrations();
      expect(
        await db.query('SELECT count(*)::int AS count FROM exercise_types'),
      ).toEqual([{ count: 2 }]);
    });
  });
});
