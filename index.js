/**
 * Node.js process Argument processing.
 */
let args = process.argv;
const preIndex = args.findIndex(function (argument) {
  return (
    argument.includes('devEngines/index.js') ||
    argument.includes('devEngines\\index.js')
  );
});
const startingIndex = preIndex + 1;
args = args.slice(startingIndex);
let first = args[0] && args[0].toLowerCase();
const second = args[1] && args[1].toLowerCase();
let isGlobal = first === '-g';
if (isGlobal) {
  first = second && second.toLowerCase();
}

/**
 * The help menu is shown whenever an
 * empty or unrecognized command is ran.
 * It contains examples of how to use the CLI.
 */
function showHelpMenu () {
  console.log([
    'devEngines CLI v0.0.1',
    'Node and npm version switching and pinning',
    '',
    'Updating all versions in the local package.json',
    '  devEngines lts',
    '  devEngines latest',
    '',
    'Globally update all versions (fallback if local tool version not found)',
    '  devEngines -g lts',
    '  devEngines -g latest',
    '',
    'Pinning a specific tool locally',
    '  devEngines [toolname]@[version]',
    '  devEngines node@lts',
    '  devEngines node@latest',
    '  devEngines node@24.0.0',
    '  devEngines node@24',
    '  devEngines npm@latest',
    '  etc.',
    '',
    'Pinning a specific tool globally (fallback if local tool version not found)',
    '  devEngines -g [toolname]@[version]',
    '  devEngines -g node@lts',
    '  etc.',
    '',
    'Clearing local cache of tool version downloads',
    '  devEngines purge',
    '',
    'Get the devEngines CLI version',
    '  devEngines -v'
  ].join('\n'));
}

function updateTool (tool) {
  if (!first.includes('@') || !first.split('@')[1]) {
    console.log('Missing ' + tool + ' version, try:');
    console.log('devEngines [toolname]@[version]');
    console.log('Like this:');
    console.log('devEngines ' + tool.toLowerCase() + '@latest');
    return;
  }
  console.log('Pin local ' + tool + ' to ' + first.split('@')[1]);
}

function updateAllTools () {
  if (first === 'lts') {
    console.log('Pin local to LTS');
    return;
  }

  if (first === 'latest') {
    console.log('Pin local to latest');
    return;
  }
}

function run () {
  if (isGlobal) {
    if (!first) {
      console.log('Missing an argument after -g');
    } else {
      console.log('Global install of ' + first);
    }
  } else if (['--version', '-v', 'v', 'version']) {
    console.log('devEngines v0.0.1');
  } else if (['lts', 'latest'].includes(first)) {
    updateAllTools();
  } else if (first.startsWith('node')) {
    updateTool('Node');
  } else if (first.startsWith('npm')) {
    updateTool('npm');
  } else {
    showHelpMenu();
  }
}

if (first) {
  run();
} else {
  showHelpMenu();
}
