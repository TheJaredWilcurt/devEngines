/**
 * @file devEngines CLI entry point.
 */

import { showHelpMenu } from './src/helpMenu.js';
import { argumentProcessing } from './src/processArguments.js';
import { run } from './src/run.js';

/**
 * If this is a global install and
 * the first non-global argument.
 */
const {
  arg,
  isGlobal
} = argumentProcessing();

if (arg) {
  run(isGlobal, arg);
} else {
  showHelpMenu();
}
