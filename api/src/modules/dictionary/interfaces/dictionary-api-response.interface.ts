export interface DictionaryApiPhonetic {
  text?: string;
}

export interface DictionaryApiEntry {
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
}
