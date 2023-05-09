module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },

    rules: {
        indent: ['error', 4],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'no-constant-condition': ['error', { checkLoops: false }],
    },
};
