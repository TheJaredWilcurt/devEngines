import { execSync } from 'node:child_process';

import { CLI_VERSION, HELP_MENU } from '@@/data/constants.js';

describe('index.js', () => {
  test('Run devEngines --help', () => {
    let stdout;
    try {
      stdout = String(execSync('node index.js')).trim();
    } catch (error) {
      console.log('Error:' + error.toString());
    }

    expect(stdout)
      .toEqual(HELP_MENU);
  });

  test('Run devEngines -v', () => {
    let stdout;
    try {
      stdout = String(execSync('node index.js -v')).trim();
    } catch (error) {
      console.log('Error:' + error.toString());
    }

    expect(stdout)
      .toEqual('devEngines ' + CLI_VERSION);
  });
});
