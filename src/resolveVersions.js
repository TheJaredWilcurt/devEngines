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

const nodeVersionsPath = join(__dirname, '..', 'nodeVersions.json');

export const loadAllNodeVersionsFromCache = function () {
  let nodeVersionsExist = false;
  try {
    nodeVersionsExist = existsSync(nodeVersionsPath);
  } catch {
    // do nothing
  }
  let data;
  if (nodeVersionsExist) {
    try {
      const contents = readFileSync(nodeVersionsPath);
      data = JSON.parse(contents);
    } catch {
      // do nothing
    }
  }
  return data;
};

export const downloadAndCacheAllNodeVersions = async function () {
  const nodeVersionsUrl = 'https://nodejs.org/download/release/index.json';
  let data = loadAllNodeVersionsFromCache();
  if (data?.length) {
    const timeStamp = data[data.length - 1].date;
    const now = (new Date()).getTime();
    const TEN_SECONDS = 10 * 1000;
    if (now - timeStamp < TEN_SECONDS) {
      return data;
    }
  }
  try {
    const response = await axios.get(nodeVersionsUrl);
    data = response.data.map((release) => {
      return {
        version: release.version.replace('v', ''),
        date: release.date,
        files: release.files,
        npm: release.npm,
        lts: release.lts
      };
    });
    // Store the timestamp of the last download of this list
    data.push({
      version: '',
      date: (new Date()).getTime(),
      files: [],
      npm: '',
      lts: false
    });
    const contents = JSON.stringify(data, null, 2) + '\n';
    writeFileSync(nodeVersionsPath, contents);
  } catch (error) {
    console.log('Error checking for latest Node/npm releases');
    console.log(error);
  }
  return data;
};

/**
 * Finds an exact version number based on the desired version passed in.
 *
 * @param  {string} version  A version (`22`, `>=24.0.0`, `lts`, etc)
 * @return {string}          An exact version number (`24.1.0`)
 */
export const resolveNodeVersion = async function (version) {
  // Anything other than an exact version returns null
  if (valid(version)) {
    return version;
  }

  const nodeVersions = await downloadAndCacheAllNodeVersions();

  if (version === 'latest') {
    return nodeVersions[0].version;
  }

  if (version === 'lts') {
    return nodeVersions.find((release) => {
      return release.lts;
    }).version;
  }

  if (validRange(version)) {
    const latestInRange = nodeVersions.find((release) => {
      return satisfies(release.version, version);
    });
    if (latestInRange?.version) {
      return latestInRange.version;
    }
  }

  console.log('Desired Node version cannot be found.');
}
