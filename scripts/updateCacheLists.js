/**
 * @file Used by `npm run update-lists` to update the
 *       nodeVersions.json and npmVersions.json file.
 */

import node from '../src/tools/node.js';
import npm from '../src/tools/npm.js';

async function udpateCacheLists () {
  await node.getLatestReleases();
  await npm.getLatestReleases();
}

udpateCacheLists();
