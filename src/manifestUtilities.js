import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Recursively looks for the package.json file in the current directory
 * and each parent directory until it finds it, hits the system root,
 * or reaches a max retry amount.
 *
 * @param  {string} cwd      File path to look for the package.json in
 * @param  {number} attempt  The current retry we are on
 * @return {string}          The file path to the package.json or empty string if not found
 */
export const findManifest = function (cwd, attempt) {
  cwd = cwd || process.cwd();
  if (typeof(attempt) !== 'number') {
    attempt = 20;
  }

  let potentialManifestPath = join(cwd, 'package.json');

  let manifestExists = false;
  try {
    manifestExists = existsSync(potentialManifestPath);
  } catch {
    // do nothing
  }
  if (manifestExists) {
    return potentialManifestPath;
  }

  let newCwd = join(cwd, '..');
  if (
    cwd === newCwd ||
    attempt === 0
  ) {
    return '';
  }
  return findManifest(newCwd, attempt - 1)
};
