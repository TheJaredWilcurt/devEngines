import {
  existsSync,
  readFileSync,
  unlinkSync
} from 'node:fs';
import { join } from 'node:path';

import axios from 'axios';

import {
  downloadAndCacheAllNodeVersions,
  loadAllNodeVersionsFromCache,
  resolveNodeVersion
} from '@/resolveVersions.js';

import { error } from '@@/data/error.js';

const __dirname = import.meta.dirname;
const nodeVersionsPath = join(__dirname, '..', '..', '..', 'nodeVersions.json');
let allNodeVersions;

describe('resolveVersions.js', () => {
  describe('downloadAndCacheAllNodeVersions', () => {
    test('Network call fails', async () => {
      if (existsSync(nodeVersionsPath)) {
        allNodeVersions = JSON.parse(readFileSync(nodeVersionsPath));
      }

      const axiosGet = axios.get;
      axios.get = vi.fn(() => Promise.reject(error));

      const data = await downloadAndCacheAllNodeVersions();
      axios.get = axiosGet;

      expect(readFileSync(nodeVersionsPath).length > 100)
        .toEqual(true);

      expect(data.length > 100)
        .toEqual(true);

      expect(data.length)
        .toEqual(allNodeVersions.length);

      expect(console.log)
        .toHaveBeenCalledWith('Error checking for latest Node/npm releases');

      expect(console.log)
        .toHaveBeenCalledWith(error);
    });

    test('Updates the nodeVersions.json file', async () => {
      if (existsSync(nodeVersionsPath)) {
        unlinkSync(nodeVersionsPath);
      }

      const data = await downloadAndCacheAllNodeVersions();

      expect(readFileSync(nodeVersionsPath).length > 100)
        .toEqual(true);

      expect(data.length > 100)
        .toEqual(true);

      expect(data.length)
        .toEqual(allNodeVersions.length);

      expect(console.log)
        .not.toHaveBeenCalled();
    });

    test('Running twice in a row skips the network call', async () => {
      const axiosGet = axios.get;
      axios.get = vi.fn();

      await downloadAndCacheAllNodeVersions();

      expect(axios.get)
        .not.toHaveBeenCalled();

      axios.get = axiosGet;
    });
  });

  describe('loadAllNodeVersionsFromCache', () => {
    test('Loads contents', () => {
      if (existsSync(nodeVersionsPath)) {
        allNodeVersions = JSON.parse(readFileSync(nodeVersionsPath));
      }

      expect(loadAllNodeVersionsFromCache())
        .toEqual(allNodeVersions);
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
});
