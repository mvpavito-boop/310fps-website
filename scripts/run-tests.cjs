/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS bootstraps ts-node before loading the TypeScript tests. */
// Reuse the project's installed TypeScript runtime; no live service calls.
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node' } });
require('tsconfig-paths/register');
require('../tests/site-audit.test.ts');
require('../tests/commerce.test.ts');
require('../tests/component-reference.test.ts');
require('../tests/component-picker.test.ts');
require('../tests/build-component-choices.test.ts');
require('../tests/auto-series.test.ts');
require('../tests/admin-content.test.ts');
require('../tests/admin-component-picker.test.tsx');
require('../tests/manual-component.test.ts');
require('../tests/admin-manual-component.test.tsx');
require('../tests/admin-component-prices.test.tsx');
require('../tests/release-readiness.test.ts');
