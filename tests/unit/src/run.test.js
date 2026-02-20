import { run, updateAllTools } from '@/run.js';

import { CLI_VERSION, HELP_MENU } from '@@/data/constants.js';

describe('run.js', () => {
  describe('run', () => {
    describe('Global installs', () => {
      test('Global without argument', async () => {
        await run(true);

        expect(console.log)
          .toHaveBeenCalledWith('Missing an argument after -g');
      });

      test('Global with argument', async () => {
        await run(true, 'node@latest');

        expect(console.log)
          .toHaveBeenCalledWith('Global install of node@latest');
      });
    });

    describe('Version number', () => {
      const version = 'devEngines ' + CLI_VERSION;

      test('Argument --version', async () => {
        await run(false, '--version');

        expect(console.log)
          .toHaveBeenCalledWith(version);
      });

      test('Argument -v', async () => {
        await run(false, '-v');

        expect(console.log)
          .toHaveBeenCalledWith(version);
      });

      test('Argument v', async () => {
        await run(false, 'v');

        expect(console.log)
          .toHaveBeenCalledWith(version);
      });

      test('Argument version', async () => {
        await run(false, 'version');

        expect(console.log)
          .toHaveBeenCalledWith(version);
      });
    });

    describe('Update all tools', () => {
      test('LTS', async () => {
        await run(false, 'lts');

        expect(console.log)
          .toHaveBeenCalledWith('Pin local to LTS');
      });

      test('Latest', async () => {
        await run(false, 'latest');

        expect(console.log)
          .toHaveBeenCalledWith('Pin local to latest');
      });
    });

    describe('Update Node', () => {
      test('Run devEngines node@latest', async () => {
        await run(false, 'node@latest');

        expect(console.log)
          .toHaveBeenCalledWith('Pin local Node to 25.6.1');
      });

      test('Run devEngines node@', async () => {
        await run(false, 'node@');

        expect(console.log)
          .toHaveBeenCalledWith([
            'Missing Node version, try:',
            'devEngines [toolname]@[version]',
            'Like this:',
            'devEngines node@latest'
          ].join('\n'));
      });
    });

    describe('Update npm', () => {
      test('Run devEngines npm@latest', async () => {
        await run(false, 'npm@latest');

        expect(console.log)
          .toHaveBeenCalledWith('Pin local npm to 11.10.1');
      });

      test('Run devEngines npm@', async () => {
        await run(false, 'npm@');

        expect(console.log)
          .toHaveBeenCalledWith([
            'Missing npm version, try:',
            'devEngines [toolname]@[version]',
            'Like this:',
            'devEngines npm@latest'
          ].join('\n'));
      });
    });

    test('Fallback to help menu', async () => {
      await run(false);

      expect(console.log)
        .toHaveBeenCalledWith(HELP_MENU);
    });
  });

  describe('updateAllTools', () => {
    test('Logs nothing if arg is not lts or latest', () => {
      updateAllTools('asdf');

      expect(console.log)
        .not.toHaveBeenCalled();
    });
  });
});
