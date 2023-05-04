module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },

    rules: {
        indent: ['error', 4],
        quotes: ['error', 'single'],
        'no-constant-condition': ['error', { checkLoops: false }],
    },
};
