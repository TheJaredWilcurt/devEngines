/**
 * @file Handles getting the list of npm releases, caching it, and
 *       resolve a given npm version to an exact version.
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  satisfies,
  valid,
  validRange
} from 'semver';

import {
  API_COOL_DOWN,
  loadJsonFile
} from '../helpers.js';

const __dirname = import.meta.dirname;

const npmVersionsPath = join(__dirname, '..', '..', 'cacheLists', 'npmVersions.json');

/**
 * @typedef  {object}   NPMRELEASES
 * @property {number}   date         The timestamp of when the data was last cached
 * @property {string[]} data         Array of npm version numbers
 */

/**
 * Reads/Parses/returns the nodeVersions.json file.
 *
 * @return {NPMRELEASES} List of npm versions with timestamp
 */
const getCachedReleases = function () {
  return loadJsonFile(npmVersionsPath);
};

/**
 * Loads the cached nodeVersions.json file, checks if it was cached in the
 * last 10 seconds and if so, returns it. Otherwise downloads the latest
 * version and updates the nodeVersions.json cache.
 *
 * @return {NPMRELEASES} List of npm versions and a timestamp
 */
const getLatestReleases = function () {
  let cache = getCachedReleases();
  let contents = cache;
  if (cache?.data?.length) {
    const timeStamp = cache.date;
    const now = (new Date()).getTime();
    if (now - timeStamp < API_COOL_DOWN) {
      return cache;
    }
  }

  try {
    // TODO: Replace with regular network call to more easily mock in tests
    // TODO: May also need URL that returns release download file names
    let versions = execSync('npm view npm versions');
    versions = String(versions);
    versions = versions.replaceAll('\'', '"');
    versions = JSON.parse(versions);
    versions = versions.reverse();
    if (versions?.length > (cache?.data?.length || 0)) {
      contents = {
        date: (new Date()).getTime(),
        data: versions
      };
      const fileContents = JSON.stringify(contents, null, 2) + '\n';
      writeFileSync(npmVersionsPath, fileContents);
    }
  } catch (error) {
    console.log('Error checking for latest npm releases');
    console.log(error);
  }
  return contents;
};

/**
 * Finds an exact version number based on the desired version passed in.
 *
 * @param  {string} desiredVersion  A version (`9`, `>=9.0.0`, `lts`, etc)
 * @return {string}                 An exact version number (`9.9.4`)
 */
const resolveVersion = function (desiredVersion) {
  const npmReleases = getLatestReleases();
  const npmVersions = npmReleases?.data || [];

  if (desiredVersion === 'latest') {
    return npmVersions[0];
  }

  if (desiredVersion === 'lts') {
    return npmVersions.filter((desiredVersion) => {
      return !desiredVersion.includes('-');
    })[0];
  }

  if (
    // Anything other than an exact version returns null
    valid(desiredVersion) &&
    npmVersions.includes(desiredVersion)
  ) {
    return desiredVersion;
  }

  if (validRange(desiredVersion)) {
    const latestInRange = npmVersions.find((officialVersion) => {
      return satisfies(officialVersion, desiredVersion);
    });
    if (latestInRange) {
      return latestInRange;
    }
  }

  console.log('Desired npm version cannot be found.');
  return undefined;
};

export default {
  getCachedReleases,
  getLatestReleases,
  resolveVersion
};
