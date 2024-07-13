import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import PluginJest from 'eslint-plugin-jest'

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['dist/lib/'],
  },
  {
    files: ['**/*.test.js'],
    plugins: {
      PluginJest,
    },
  },
]
