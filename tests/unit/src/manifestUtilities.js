import { join } from 'node:path';

import { findManifest } from '@/manifestUtilities.js';

const __dirname = import.meta.dirname;

describe('manifestUtilities.js', () => {
  describe('findManifest', () => {
    test('Finds the manifest', () => {
      expect(findManifest())
        .toEqual(join(__dirname, '..', '..', '..', 'package.json'));
    });

    test('Hits max attempts', () => {
      process.chdir(
        join(
          __dirname,
          '..',
          '..',
          'data',
          '22',
          '21',
          '20',
          '19',
          '18',
          '17',
          '16',
          '15',
          '14',
          '13',
          '12',
          '11',
          '10',
          '9',
          '8',
          '7',
          '6',
          '5',
          '4',
          '3',
          '2',
          '1',
          '0'
        )
      );

      expect(findManifest())
        .toEqual('');
    });

    test('Hits system root', () => {
      process.chdir(join(__dirname, '..', '..', '..', '..'));

      expect(findManifest())
        .toEqual('');
    });
  });
});
