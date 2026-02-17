import { unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  findManifest,
  getGlobalToolVersions,
  getManifest,
  getRawToolVersions
} from '@/manifestUtilities.js';

const __dirname = import.meta.dirname;

describe('manifestUtilities.js', () => {
  afterEach(() => {
    process.chdir(__dirname);
  });

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

  describe('getGlobalToolVersions', () => {
    test('Returns the global versions', () => {
      expect(getGlobalToolVersions())
        .toEqual({
          node: '',
          npm: ''
        });
    });

    test('Does not find the globalTools.json', () => {
      const globalToolsPath = join(__dirname, '..', '..', '..', 'globalTools.json');
      unlinkSync(globalToolsPath);

      expect(getGlobalToolVersions())
        .toEqual({});

      const content = JSON.stringify({ node: '', npm: '' }, null, 2) + '\n';

      writeFileSync(globalToolsPath, content);
    });
  });

  describe('getManifest', () => {
    test('Returns the manifest as JSON', () => {
      const manifest = getManifest();

      expect(typeof(manifest) === 'object')
        .toEqual(true);

      expect(manifest.name)
        .toEqual('dev-engines');
    });

    test('Returns empty object if manifest not found', () => {
      process.chdir(join(__dirname, '..', '..', '..', '..'));

      const manifest = getManifest();

      expect(manifest)
        .toEqual({});
    });
  });

  describe('getRawToolVersions', () => {
    test('Returns versions', () => {
      process.chdir(join(__dirname, '..', '..', 'data', 'dummyNodeNpmVersions'));

      expect(getRawToolVersions())
        .toEqual({
          node: '25.0.0',
          npm: '11.0.0'
        });
    });

    test('Returns empty object', () => {
      process.chdir(join(__dirname, '..', '..', 'data', 'dummyNoVersions'));

      expect(getRawToolVersions())
        .toEqual({});
    });
  });
});
