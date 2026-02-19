/**
 * @file Used by `npm run update-lists` to update the
 *       nodeVersions.json and npmVersions.json file.
 */

import {
  downloadAndCacheAllNodeReleases,
  downloadAndCacheAllNpmReleases
} from '../src/resolveVersions.js';

async function udpateCacheLists () {
  await downloadAndCacheAllNodeReleases();
  downloadAndCacheAllNpmReleases();
}

udpateCacheLists();
