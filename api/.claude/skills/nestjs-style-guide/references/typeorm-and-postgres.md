# TypeORM and PostgreSQL

## Entities

```ts
@Entity('lessons')
@Unique('UQ_lessons_topic_slug', ['topic', 'slug'])
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lesson_number', type: 'int', nullable: true })
  lessonNumber!: number | null;

  @ManyToOne(() => Topic, (topic) => topic.lessons, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'topic_id',
    foreignKeyConstraintName: 'FK_lessons_topic',
  })
  topic!: Topic;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
```

- Tables are plural snake_case (`word_answers`); columns are snake_case through `name`, properties are camelCase.
- UUID primary keys. Name constraints and indexes explicitly (`UQ_…`, `FK_…`, `IDX_…`), so migrations and error messages are readable.
- Nullable columns are typed `T | null` and declared `nullable: true`; everything else is NOT NULL.
- Choose `onDelete` on purpose: `CASCADE` for children that can't exist alone (translations, junction rows), `SET NULL` for optional references (`addedBy`), the default (restrict) when deleting the parent should be blocked.
- Enums are TypeScript enums in `src/common/enums/` mapped to Postgres enum types.
- Hide relations or columns that must not reach clients with `@Exclude()`.

## Choosing column types

| Data                     | Postgres type                                    |
| ------------------------ | ------------------------------------------------ |
| ids                      | `uuid`                                           |
| points in time           | `timestamptz` (never `timestamp`)                |
| short text with a limit  | `varchar` / `character varying`                  |
| free text                | `text`                                           |
| whole numbers / counts   | `int` (`bigint` if it can pass 2³¹)              |
| money or exact decimals  | `numeric(p, s)`, never `float`                   |
| a fixed set of values    | enum type                                        |
| flexible structured data | `jsonb`, only when it isn't queried relationally |

## Constraints are the source of truth

A service check (`ensureUnique`) gives a friendly message, but two requests can pass it at the same time. Back every rule with a constraint: `UNIQUE`, `FOREIGN KEY`, `NOT NULL`, `CHECK`. Map the resulting Postgres errors in the service (see `services-and-errors.md`).

## Indexes

- Postgres indexes primary keys and unique constraints automatically, but **not foreign keys**. Add an index for each FK column you filter or join by (`IDX_lesson_words_word_id`).
- Index columns used in `WHERE`, `ORDER BY` and joins of hot queries. Composite index columns go from most selective / always-filtered to least.
- Don't index everything: each index slows writes. Check with `EXPLAIN ANALYZE` that a query actually uses it.

## Queries

- Use repository `find*` with `where`/`relations`/`order` for simple reads, and the query builder for joins, computed columns or conditional filters.
- Always bind values: `.where('topic.id = :topicId', { topicId })`. Never interpolate user input into SQL strings, including in `query()` and `VirtualColumn` code.
- Select only what you need for internal lookups (`select: { id: true }`).
- **Avoid N+1 queries.** Don't query inside a loop over results. Load relations in the same query, or collect ids and run one `find({ where: { id: In(ids) } })`.
- Prefer set-based SQL (one `UPDATE … WHERE`, one bulk `insert()`) over loading rows and saving them one by one.

## Pagination

```ts
const [items, total] = await this.lessonQuery()
  .orderBy('lesson.createdAt', 'ASC')
  .addOrderBy('lesson.id', 'ASC')
  .take(limit)
  .skip((page - 1) * limit)
  .getManyAndCount();

return paginated(items, total, page, limit);
```

- The order must be total: finish with a unique column (`id`), or rows with equal sort keys can appear on two pages or none.
- With joined collections, `take`/`skip` works on root entities, and nested ordering of the joined rows can be ignored. Page the root ids first, then load the full entities with `find({ where: { id: In(ids) }, relations, order })`, where nested `order` sorts the children.
- `limit` is capped by `PaginationQueryDto` (max 100). Keep a cap on every list.

## Transactions and concurrency

- Use `manager.transaction()` for multi-statement writes (see `services-and-errors.md`). Postgres' default isolation (`READ COMMITTED`) is fine for most work; rely on constraints for uniqueness instead of read-then-write checks.
- To change a row based on its current value, either update atomically in SQL (`SET count = count + 1`) or lock it (`setLock('pessimistic_write')`) inside the transaction.
- Keep transactions short; never wait for network calls or files inside one.

## Checking performance

Run slow queries with `EXPLAIN (ANALYZE, BUFFERS)` in `psql`. A `Seq Scan` on a large table in a hot query usually means a missing index; estimated rows far off from actual rows means stale statistics (`ANALYZE table`).
