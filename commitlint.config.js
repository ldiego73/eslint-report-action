module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': () => [
      2,
      'always',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case', 'kebab-case'],
    ],
    'type-empty': () => [2, 'never'],
    'subject-empty': () => [2, 'never'],
  },
};
