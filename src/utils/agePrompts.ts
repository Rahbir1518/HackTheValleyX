export const AGE_PROMPTS = {
  '0': {
    prompt: 'Generate a single simple vowel sound or babbling sound appropriate for a 0-year-old baby, such as "aaa", "ooo", "eee", "mmm", "baba", "dada". Return ONLY the sound, nothing else. Keep it 1-3 syllables maximum.',
    examples: ['aaa', 'ooo', 'mmm', 'baba', 'mama', 'dada'],
    description: 'Simple sounds & babbling'
  },
  '1': {
    prompt: 'Generate a single simple word or repeated syllable appropriate for a 1-year-old child, such as "ball", "mama", "dada", "cup", "dog", "cat", "more", "up". Return ONLY the word, nothing else. Maximum 2 syllables.',
    examples: ['ball', 'mama', 'more', 'dog', 'cup', 'milk'],
    description: 'First words'
  },
  '2-3': {
    prompt: 'Generate a simple 2-4 word phrase appropriate for a 2-3 year old child, such as "want milk", "play ball", "big dog", "go outside", "my toy". Use simple, common words. Return ONLY the phrase, nothing else.',
    examples: ['want milk', 'play ball', 'big truck', 'go park', 'my toy', 'red car'],
    description: 'Short phrases'
  },
  '4-6': {
    prompt: 'Generate a simple, clear sentence 6-12 words long appropriate for a 4-6 year old child to practice pronunciation. The sentence should use common words, proper grammar, and be easy to understand. Topics can include daily activities, animals, toys, family, or nature. Return ONLY the sentence, nothing else.',
    examples: [
      'I like to play with my friends at the park.',
      'The big brown dog runs fast in the yard.',
      'My favorite color is blue like the sky.',
      'We eat breakfast together every morning.'
    ],
    description: 'Complete sentences'
  }
} as const;

export type AgeCategory = keyof typeof AGE_PROMPTS;

export const getAgeCategory = (age: string | undefined): AgeCategory => {
  if (!age) return '4-6';
  if (age in AGE_PROMPTS) return age as AgeCategory;
  return '4-6';
};