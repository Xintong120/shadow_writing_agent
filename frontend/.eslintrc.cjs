module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: { 
    react: { 
      version: '18.3',
    },
  },
  plugins: [
    'react-refresh',
    'theme-consistency',
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    
    // 主题一致性规则
    'theme-consistency/no-hardcoded-colors': 'error',
    'theme-consistency/no-hardcoded-spacing': 'error',
    'theme-consistency/no-hardcoded-typography': 'error',
    'theme-consistency/no-hardcoded-radius': 'error',
  },
};
