/**
 * @file Generic helper functions used across files.
 */

import {
  existsSync,
  readFileSync
} from 'node:fs';

/**
 * @typedef  {object}   CACHEDDATA
 * @property {number}   date        The timestamp of when the data was last cached
 * @property {object[]} data        The cached data
 */

/**
 * Checks if the file exists, reads it, returns it as parsed JSON.
 *
 * @param  {string}     filePath  The location of the JSON file to load
 * @return {CACHEDDATA}           The loaded data
 */
export const loadJsonFile = function (filePath) {
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
 * This prevents making network calls to API's when we have
 * a recently cached local version that could be used.
 *
 * @type {number}
 */
export const API_COOL_DOWN = 10 * 1000;
