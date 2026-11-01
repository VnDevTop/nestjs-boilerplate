/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'ci', 'test', 'perf', 'refactor', 'style'],
    ],
    // Scope is required for every commit.
    'scope-empty': [2, 'never'],
    // Subject must be lowercase.
    'subject-case': [2, 'always', 'lower-case'],
  },
};