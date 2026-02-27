/**
 * @file The entry point to the devEngines CLI installer.
 */

import console from 'node:console';

import { handleExistingInstall } from './existingInstall.js';
import { logger } from './logger.js';
import { logo } from './logo.js';
import { initializeState } from './state.js';

const run = async function () {
  console.log(logo);

  const state = await initializeState();
  // Remove later
  console.log({ state });

  const existingOutcome = await handleExistingInstall(state);
  if (existingOutcome === 'done') {
    logger('Done.');
    return;
  }
};

run();
