module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ['airbnb-base', 'prettier'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
        indent: ['error', 4, { SwitchCase: 1 }],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'no-constant-condition': ['error', { checkLoops: false }],
        'spaced-comment': 'off',
        'no-console': 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'import/no-absolute-path': 'off',
    },
};

// npm i eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb-base prettier
