import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const __dirname = import.meta.dirname;

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

/**
 * @typedef {object} GLOBALTOOLS
 * @param   {string} [node]       The global Node version, if set
 * @param   {string} [npm]        The global npm version, if set
 */

/**
 * Returns the global tool version user settings, if possible.
 *
 * @return {GLOBALTOOLS} The user's global versions for tools.
 */
export const getGlobalToolVersions = function () {
  const globalToolsPath = join(__dirname, '..', 'globalTools.json');
  let globalToolsExist = false;
  try {
    globalToolsExist = existsSync(globalToolsPath);
  } catch {
    // do nothing
  }
  let globalTools;
  if (globalToolsExist) {
    try {
      globalTools = readFileSync(globalToolsPath);
      globalTools = JSON.parse(globalTools);
    } catch {
      // do nothing
    }
  }

  if (
    globalTools &&
    typeof(globalTools) === 'object'
  ) {
    return globalTools;
  }
  return {};
};

export const getManifest = function () {
  const manifestPath = findManifest();
  if (!manifestPath) {
    return {};
  }
  let manifest;
  try {
    let manifestData = readFileSync(manifestPath);
    manifest = JSON.parse(manifestData);
  } catch {
    // do nothing
  }
  return manifest;
};

export const getRawToolVersions = function () {
  const manifest = getManifest();
  let versions = {};
  if (
    manifest?.devEngines?.runtime &&
    !Array.isArray(manifest.devEngines.runtime) &&
    manifest.devEngines.runtime?.name &&
    manifest.devEngines.runtime?.version
  ) {
    versions[manifest.devEngines.runtime.name] = manifest.devEngines.runtime.version;
  }
  if (
    manifest?.devEngines?.packageManager &&
    !Array.isArray(manifest.devEngines.packageManager) &&
    manifest.devEngines.packageManager?.name &&
    manifest.devEngines.packageManager?.version
  ) {
    versions[manifest.devEngines.packageManager.name] = manifest.devEngines.packageManager.version;
  }
  return versions;
};
