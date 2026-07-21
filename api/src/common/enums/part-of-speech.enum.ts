/**
 * Part of speech for a word translation (noun, verb, adjective, ...).
 * Stored as a Postgres enum on the word_translations table.
 */
export enum PartOfSpeech {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PRONOUN = 'pronoun',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  INTERJECTION = 'interjection',
  NUMERAL = 'numeral',
}
