/**
 * @file Helper functions regarding package.json files.
 */

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
  return findManifest(newCwd, attempt - 1);
};

/**
 * @typedef  {object} GLOBALTOOLS
 * @property {string} [node]       The global Node version, if set
 * @property {string} [npm]        The global npm version, if set
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

/**
 * Finds, parses, and returns the closest package.json
 * to the current working directory.
 *
 * @return {object} The package.json as an object
 */
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

/**
 * @typedef  {object} RAWVERSIONS
 * @property {string} [node]       The raw Node.js version
 * @property {string} [deno]       The raw Deno version
 * @property {string} [bun]        The raw Bun version
 * @property {string} [npm]        The raw npm version
 * @property {string} [pnpm]       The raw pnpm version
 * @property {string} [yarn]       The raw Yarn version
 */

/**
 * Returns the tool versions as defined in the devEngines,
 * to be validated and resolved later.
 *
 * @return {RAWVERSIONS} Simplified object of raw tool versions.
 */
export const getRawToolVersions = function () {
  const manifest = getManifest();
  let versions = {};
  function setVersionForDevEngine (type) {
    if (
      manifest?.devEngines &&
      manifest.devEngines[type]
    ) {
      if (Array.isArray(manifest.devEngines[type])) {
        manifest.devEngines[type].forEach((tool) => {
          if (tool?.name && tool?.version) {
            versions[tool.name.toLowerCase()] = tool.version;
          }
        });
      } else if (
        manifest.devEngines[type].name &&
        manifest.devEngines[type].version
      ) {
        versions[manifest.devEngines[type].name.toLowerCase()] = manifest.devEngines[type].version;
      }
    }
  }
  setVersionForDevEngine('runtime');
  setVersionForDevEngine('packageManager');
  return versions;
};
