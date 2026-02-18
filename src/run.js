/**
 * @file The core logic execution of the devEngines CLI tool.
 */

import { getCliVersion } from './cliVersion.js';
import { showHelpMenu } from './helpMenu.js';

/**
 * Update a tool, like Node or npm.
 *
 * @param {string} tool  'node' or 'npm'
 * @param {string} arg   User argument
 */
const updateTool = function (tool, arg) {
  if (!arg.includes('@') || !arg.split('@')[1]) {
    console.log([
      'Missing ' + tool + ' version, try:',
      'devEngines [toolname]@[version]',
      'Like this:',
      'devEngines ' + tool.toLowerCase() + '@latest'
    ].join('\n'));
  } else {
    console.log('Pin local ' + tool + ' to ' + arg.split('@')[1]);
  }
};

/**
 * Updates both Node and npm to Latest or LTS version
 * in the local package.json.
 *
 * @param {string} arg  User argument
 */
export const updateAllTools = function (arg) {
  if (arg === 'lts') {
    console.log('Pin local to LTS');
  } else if (arg === 'latest') {
    console.log('Pin local to latest');
  }
};

/**
 * Runs the core logic of the CLI.
 *
 * @param {boolean} isGlobal  If the user requested a global install with -g
 * @param {string}  arg       The command line argument provided by the user
 */
export const run = function (isGlobal, arg) {
  arg = arg || '';
  if (isGlobal) {
    if (!arg) {
      console.log('Missing an argument after -g');
    } else {
      console.log('Global install of ' + arg);
    }
  } else if (['--version', '-v', 'v', 'version'].includes(arg)) {
    console.log('devEngines ' + getCliVersion());
  } else if (['lts', 'latest'].includes(arg)) {
    updateAllTools(arg);
  } else if (arg.startsWith('node')) {
    updateTool('Node', arg);
  } else if (arg.startsWith('npm')) {
    updateTool('npm', arg);
  } else {
    showHelpMenu();
  }
};
