import { getCliVersion } from '@/cliVersion.js';

import { CLI_VERSION } from '@@/data/constants.js';

describe('cliVersion.js', () => {
  describe('getCliVersion', () => {
    test('Returns version from manifest', () => {
      expect(getCliVersion())
        .toEqual(CLI_VERSION);
    });

    test('Returns error message', () => {
      const forceThrow = true;

      expect(getCliVersion(forceThrow))
        .toEqual('[Error checking devEngines CLI version]');
    });
  });
});
