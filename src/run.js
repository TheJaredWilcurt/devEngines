/**
 * @file The core logic execution of the devEngines CLI tool.
 */

import { getCliVersion } from './cliVersion.js';
import { showHelpMenu } from './helpMenu.js';
import node from './tools/node.js';
import npm from './tools/npm.js';

/**
 * Update a tool, like Node or npm.
 *
 * @param {string} tool  'node' or 'npm'
 * @param {string} arg   User argument
 */
const updateTool = async function (tool, arg) {
  if (!arg.includes('@') || !arg.split('@')[1]) {
    console.log([
      'Missing ' + tool + ' version, try:',
      'devEngines [toolname]@[version]',
      'Like this:',
      'devEngines ' + tool.toLowerCase() + '@latest'
    ].join('\n'));
  } else {
    let toolMap = {
      Node: node.resolveVersion,
      npm: npm.resolveVersion
    };
    let desiredVersion = arg.split('@')[1];
    let resolvedVersion = await toolMap[tool](desiredVersion);
    console.log('Pin local ' + tool + ' to ' + resolvedVersion);
    // TODO: Update the version in the package.json:devEngines
  }
};

/**
 * Updates both Node and npm to Latest or LTS version
 * in the local package.json.
 *
 * @param {string} arg  User argument
 */
export const updateAllTools = async function (arg) {
  // TODO: look up what tools the package.json:devEngines use
  // TODO: Update Node and/or npm versions in the package.json:devEngines after resolved
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
export const run = async function (isGlobal, arg) {
  arg = arg || '';
  if (isGlobal) {
    if (!arg) {
      console.log('Missing an argument after -g');
    } else {
      // TODO: stub
      console.log('Global install of ' + arg);
    }
  } else if (['--version', '-v', 'v', 'version'].includes(arg)) {
    console.log('devEngines ' + getCliVersion());
  } else if (['lts', 'latest'].includes(arg)) {
    await updateAllTools(arg);
  } else if (arg.startsWith('node')) {
    await updateTool('Node', arg);
  } else if (arg.startsWith('npm')) {
    await updateTool('npm', arg);
  } else {
    showHelpMenu();
  }
};
