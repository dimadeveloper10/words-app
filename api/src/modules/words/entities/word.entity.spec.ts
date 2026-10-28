import { instanceToPlain } from 'class-transformer';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Word } from './word.entity';

describe('Word serialization', () => {
  it('exposes only the lesson fields used by word views', () => {
    const word = new Word();
    word.lessons = [
      Object.assign(new Lesson(), {
        id: 'lesson-id',
        lessonNumber: 12,
        name: 'Basics',
        slug: 'basics',
      }),
    ];

    const serialized = instanceToPlain(word);

    expect(serialized.lessons).toEqual([
      { id: 'lesson-id', lessonNumber: 12, name: 'Basics' },
    ]);
  });
});
