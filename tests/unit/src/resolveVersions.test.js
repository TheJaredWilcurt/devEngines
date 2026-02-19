import {
  existsSync,
  readFileSync,
  unlinkSync
} from 'node:fs';
import { join } from 'node:path';

import axios from 'axios';

import {
  downloadAndCacheAllNodeReleases,
  downloadAndCacheAllNpmReleases,
  loadAllNodeReleasesFromCache,
  loadAllNpmVersionsFromCache,
  resolveNodeVersion,
  resolveNpmVersion
} from '@/resolveVersions.js';

import { error } from '@@/data/error.js';

const __dirname = import.meta.dirname;
const nodeVersionsPath = join(__dirname, '..', '..', '..', 'cacheLists', 'nodeVersions.json');
const npmVersionsPath = join(__dirname, '..', '..', '..', 'cacheLists', 'npmVersions.json');
let allNodeVersions;
let allNpmVersions;

describe('resolveVersions.js', () => {
  describe('downloadAndCacheAllNodeReleases', () => {
    test('Network call fails', async () => {
      const axiosGet = axios.get;
      axios.get = vi.fn(() => Promise.reject(error));

      if (existsSync(nodeVersionsPath)) {
        allNodeVersions = JSON.parse(readFileSync(nodeVersionsPath));
      }
      const releases = await downloadAndCacheAllNodeReleases();

      expect(releases.data.length > 100)
        .toEqual(true);

      expect(releases.data.length)
        .toEqual(allNodeVersions.data.length);

      expect(console.log)
        .toHaveBeenCalledWith('Error checking for latest Node releases');

      expect(console.log)
        .toHaveBeenCalledWith(error);

      axios.get = axiosGet;
    });

    test('Updates the nodeVersions.json file', async () => {
      if (existsSync(nodeVersionsPath)) {
        unlinkSync(nodeVersionsPath);
      }

      const releases = await downloadAndCacheAllNodeReleases();

      expect(readFileSync(nodeVersionsPath).length > 100)
        .toEqual(true);

      expect(releases.data.length > 100)
        .toEqual(true);

      expect(releases.data.length)
        .toEqual(allNodeVersions.data.length);

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('Running twice in a row skips the network call', async () => {
      const axiosGet = axios.get;
      axios.get = vi.fn();

      await downloadAndCacheAllNodeReleases();

      expect(axios.get)
        .not.toHaveBeenCalled();

      axios.get = axiosGet;
    });
  });

  describe('downloadAndCacheAllNpmReleases', () => {
    test('Updates the npmVersions.json file', async () => {
      if (existsSync(npmVersionsPath)) {
        allNpmVersions = JSON.parse(readFileSync(npmVersionsPath));
      }
      if (existsSync(npmVersionsPath)) {
        unlinkSync(npmVersionsPath);
      }

      const releases = await downloadAndCacheAllNpmReleases();

      expect(readFileSync(npmVersionsPath).length > 100)
        .toEqual(true);

      expect(releases.data.length > 100)
        .toEqual(true);

      expect(releases.data.length)
        .toEqual(allNpmVersions.data.length);

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('Running twice in a row uses the cache', async () => {
      if (existsSync(npmVersionsPath)) {
        allNpmVersions = JSON.parse(readFileSync(npmVersionsPath));
      }
      const releases = await downloadAndCacheAllNpmReleases();

      expect(releases.date)
        .toEqual(allNpmVersions.date);
    });
  });

  describe('loadAllNodeReleasesFromCache', () => {
    test('Loads contents', () => {
      if (existsSync(nodeVersionsPath)) {
        allNodeVersions = JSON.parse(readFileSync(nodeVersionsPath));
      }

      expect(loadAllNodeReleasesFromCache().data)
        .toEqual(allNodeVersions.data);
    });
  });

  describe('loadAllNpmVersionsFromCache', () => {
    test('Loads contents', () => {
      if (existsSync(npmVersionsPath)) {
        allNpmVersions = JSON.parse(readFileSync(npmVersionsPath));
      }

      expect(loadAllNpmVersionsFromCache().data)
        .toEqual(allNpmVersions.data);
    });
  });

  describe('resolveNodeVersion', () => {
    const axiosGet = axios.get;

    beforeEach(() => {
      axios.get = vi.fn(() => Promise.reject(error));
    });

    afterEach(() => {
      axios.get = axiosGet;
    });

    test('Returns the value if it is already exact', async () => {
      const result = await resolveNodeVersion('22.0.0');

      expect(result)
        .toEqual('22.0.0');
    });

    test('Returns the latest Node version', async () => {
      const result = await resolveNodeVersion('latest');

      expect(result)
        .toMatchInlineSnapshot('"25.6.1"');
    });

    test('Returns the LTS Node version', async () => {
      const result = await resolveNodeVersion('lts');

      expect(result)
        .toMatchInlineSnapshot('"24.13.1"');
    });

    test('Returns the latest Node version 22', async () => {
      const result = await resolveNodeVersion('22.x.x');

      expect(result)
        .toMatchInlineSnapshot('"22.22.0"');
    });

    test('Console logs error if Node version cannot be satisfied', async () => {
      await resolveNodeVersion('9001.x.x');

      expect(console.log)
        .toHaveBeenCalledWith('Desired Node version cannot be found.');
    });

    test('Console logs error for invalid Node version', async () => {
      await resolveNodeVersion('asdf');

      expect(console.log)
        .toHaveBeenCalledWith('Desired Node version cannot be found.');
    });
  });

  describe('resolveNpmVersion', () => {
    test('Returns the value if it is already exact', async () => {
      const result = await resolveNpmVersion('11.0.0');

      expect(result)
        .toEqual('11.0.0');
    });

    test('Returns the latest npm version', async () => {
      const result = await resolveNpmVersion('latest');

      expect(result)
        .toMatchInlineSnapshot('"11.10.0"');
    });

    test('Returns the LTS npm version', async () => {
      const result = await resolveNpmVersion('lts');

      expect(result)
        .toMatchInlineSnapshot('"11.10.0"');
    });

    test('Returns the latest npm version 9', async () => {
      const result = await resolveNpmVersion('9.x.x');

      expect(result)
        .toMatchInlineSnapshot('"9.9.4"');
    });

    test('Console logs error if npm version cannot be satisfied', async () => {
      await resolveNpmVersion('9001.x.x');

      expect(console.log)
        .toHaveBeenCalledWith('Desired npm version cannot be found.');
    });

    test('Console logs error for invalid npm version', async () => {
      await resolveNpmVersion('asdf');

      expect(console.log)
        .toHaveBeenCalledWith('Desired npm version cannot be found.');
    });
  });
});
