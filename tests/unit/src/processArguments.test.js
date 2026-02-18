import { argumentProcessing } from '@/processArguments.js';

describe('processArguments.js', () => {
  describe('argumentProcessing', () => {
    test('Global Node installation', () => {
      process.argv = [
        'node.exe',
        'devEngines/index.js',
        '-g',
        'node@lts'
      ];

      expect(argumentProcessing())
        .toEqual({
          arg: 'node@lts',
          isGlobal: true
        });
    });

    test('Local npm installation', () => {
      process.argv = [
        'node.exe',
        'devEngines/index.js',
        'npm@latest'
      ];

      expect(argumentProcessing())
        .toEqual({
          arg: 'npm@latest',
          isGlobal: false
        });
    });

    test('Help menu', () => {
      process.argv = [
        'node.exe',
        'devEngines/index.js'
      ];

      expect(argumentProcessing())
        .toEqual({
          arg: '',
          isGlobal: false
        });
    });
  });
});
