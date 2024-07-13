import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import PluginJest from 'eslint-plugin-jest'

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      '/Users/altruistiq/dan code/emissions/emissions-tracker/*.js',
      'dist/lib/',
    ],
    plugins: {
      jest: PluginJest,
    },
  },
]
