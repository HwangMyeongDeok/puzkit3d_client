module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting, no code change
        'refactor', // Code restructure
        'test', // Adding tests
        'chore', // Maintenance
        'revert', // Revert commits
        'perf', // Performance improvement
        'ci', // CI/CD changes
      ],
    ],
    'subject-case': [0], // Disable case check for Vietnamese
  },
};
