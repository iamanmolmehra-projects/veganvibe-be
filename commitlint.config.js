module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'module',
        'fix',
        'update',
        'add',
        'modified',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
  },
};
