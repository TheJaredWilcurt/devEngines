import { argumentProcessing } from './src/processArguments.js';
import { showHelpMenu } from './src/helpMenu.js';
import { run } from './src/run.js';

/**
 * If this is a global install and
 * the first non-global argument.
 */
const {
  isGlobal,
  arg
} = argumentProcessing();

if (arg) {
  run(isGlobal, arg);
} else {
  showHelpMenu();
}
