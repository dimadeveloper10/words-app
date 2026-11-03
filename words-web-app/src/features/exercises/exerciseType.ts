export enum ExerciseType {
  CompileWord = 'compile_word',
  ChooseTranslation = 'choose_translation',
}

export const exerciseTypeNames: Record<ExerciseType, string> = {
  [ExerciseType.CompileWord]: 'Compile word',
  [ExerciseType.ChooseTranslation]: 'Choose translation',
};

export const exerciseTypes = Object.values(ExerciseType);
