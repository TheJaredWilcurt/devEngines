/**
 * @file Handles tool version resolution to exact versions.
 */

import { execSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  writeFileSync
} from 'node:fs';
import { join } from 'node:path';

import axios from 'axios';
import {
  satisfies,
  valid,
  validRange
} from 'semver';

const __dirname = import.meta.dirname;

const nodeVersionsPath = join(__dirname, '..', 'cacheLists', 'nodeVersions.json');
const npmVersionsPath = join(__dirname, '..', 'cacheLists', 'npmVersions.json');
const TEN_SECONDS = 10 * 1000;

/**
 * @typedef  {object}   NODERELEASE
 * @property {string}   version      The Node.js version ('25.6.1')
 * @property {string}   date         Node release publish date ('2026-02-09')
 * @property {string[]} files        Names of the published files for this Node release
 * @property {string}   npm          The npm version shipped with this Node release
 * @property {boolean}  lts          If this was a Long Term Support (LTS) release
 */

/**
 * @typedef  {object}   CACHEDDATA
 * @property {number}   date        The timestamp of when the data was last cached
 * @property {object[]} data        The cached data
 */

/**
 * @typedef  {object}        NODERELEASES
 * @property {number}        date          The timestamp of when the data was last cached
 * @property {NODERELEASE[]} data          Array of Node.js release objects
 */

/**
 * @typedef  {object}   NPMRELEASES
 * @property {number}   date         The timestamp of when the data was last cached
 * @property {string[]} data         Array of npm version numbers
 */

/**
 * Checks if the file exists, reads it, returns it as parsed JSON.
 *
 * @param  {string}     filePath  The location of the JSON file to load
 * @return {CACHEDDATA}           The loaded data
 */
const loadJsonFile = function (filePath) {
  let fileExists = false;
  try {
    fileExists = existsSync(filePath);
  } catch {
    // do nothing
  }
  let data;
  if (fileExists) {
    try {
      const contents = readFileSync(filePath);
      data = JSON.parse(contents);
    } catch {
      // do nothing
    }
  }
  return data;
};

/**
 * Reads/Parses/returns the nodeVersions.json file.
 *
 * @return {NODERELEASES} List of node releases with timestamp
 */
export const loadAllNodeReleasesFromCache = function () {
  return loadJsonFile(nodeVersionsPath);
};

/**
 * Reads/Parses/returns the nodeVersions.json file.
 *
 * @return {NPMRELEASES} List of npm versions with timestamp
 */
export const loadAllNpmVersionsFromCache = function () {
  return loadJsonFile(npmVersionsPath);;
};

/**
 * Loads the cached nodeVersions.json file, checks if it was cached in the
 * last 10 seconds and if so, returns it. Otherwise downloads the latest
 * version and updates the nodeVersions.json cache.
 *
 * @return {NODERELEASES} List of node releases (or undefined) and a timestamp
 */
export const downloadAndCacheAllNodeReleases = async function () {
  const nodeVersionsUrl = 'https://nodejs.org/download/release/index.json';
  let cache = loadAllNodeReleasesFromCache();
  let contents = cache;
  if (cache?.data?.length) {
    const timeStamp = cache.date;
    const now = (new Date()).getTime();
    if (now - timeStamp < TEN_SECONDS) {
      return cache;
    }
  }
  try {
    const response = await axios.get(nodeVersionsUrl);
    const data = response.data.map((release) => {
      return {
        version: release.version.replace('v', ''),
        date: release.date,
        files: release.files,
        npm: release.npm,
        lts: release.lts
      };
    });
    // TODO: If the data is the same as in the cache, don't save a new timestamp
    contents = {
      date: (new Date()).getTime(),
      data
    };
    const fileContents = JSON.stringify(contents, null, 2) + '\n';
    writeFileSync(nodeVersionsPath, fileContents);
  } catch (error) {
    console.log('Error checking for latest Node releases');
    console.log(error);
  }
  return contents;
};

/**
 * Loads the cached nodeVersions.json file, checks if it was cached in the
 * last 10 seconds and if so, returns it. Otherwise downloads the latest
 * version and updates the nodeVersions.json cache.
 *
 * @return {NPMRELEASES} List of npm versions and a timestamp
 */
export const downloadAndCacheAllNpmReleases = function () {
  let cache = loadAllNpmVersionsFromCache();
  let contents = cache;
  if (cache?.data?.length) {
    const timeStamp = cache.date;
    const now = (new Date()).getTime();
    if (now - timeStamp < TEN_SECONDS) {
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
    if (versions?.length) {
      // TODO: If the data is the same as in the cache, don't save a new timestamp
      contents = {
        date: (new Date()).getTime(),
        data: versions
      };
    }
    const fileContents = JSON.stringify(contents, null, 2) + '\n';
    writeFileSync(npmVersionsPath, fileContents);
  } catch (error) {
    console.log('Error checking for latest npm releases');
    console.log(error);
  }
  return contents;
};

/**
 * Finds an exact version number based on the desired version passed in.
 *
 * @param  {string} version  A version (`22`, `>=24.0.0`, `lts`, etc)
 * @return {string}          An exact version number (`24.1.0`)
 */
export const resolveNodeVersion = async function (version) {
  const nodeReleases = await downloadAndCacheAllNodeReleases();
  const nodeVersions = nodeReleases?.data?.map((release) => {
    return release.version;
  });

  if (version === 'latest') {
    return nodeVersions[0];
  }

  if (version === 'lts') {
    return nodeReleases?.data?.find((release) => {
      return release.lts;
    }).version;
  }

  if (
    // Anything other than an exact version returns null
    valid(version) &&
    nodeVersions.includes(version)
  ) {
    return version;
  }

  if (validRange(version)) {
    const latestInRange = nodeReleases?.data?.find((release) => {
      return satisfies(release.version, version);
    });
    if (latestInRange?.version) {
      return latestInRange.version;
    }
  }

  console.log('Desired Node version cannot be found.');
};

/**
 * Finds an exact version number based on the desired version passed in.
 *
 * @param  {string} desiredVersion  A version (`9`, `>=9.0.0`, `lts`, etc)
 * @return {string}                 An exact version number (`9.9.4`)
 */
export const resolveNpmVersion = function (desiredVersion) {
  const npmReleases = downloadAndCacheAllNpmReleases();
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
