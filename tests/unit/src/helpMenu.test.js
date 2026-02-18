import { showHelpMenu } from '@/helpMenu.js';

import { HELP_MENU } from '@@/data/constants.js';

describe('helpMenu.js', () => {
  describe('showHelpMenu', () => {
    test('Shows menu of commands', () => {
      showHelpMenu();

      expect(console.log)
        .toHaveBeenCalledWith(HELP_MENU);
    });
  });
});
