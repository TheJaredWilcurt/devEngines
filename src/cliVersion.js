import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const __dirname = import.meta.dirname;

export const getCliVersion = function () {
  let version;
  try {
    const manifestPath = join(__dirname, '..', 'package.json');
    const manifestData = readFileSync(manifestPath);
    const manifest = JSON.parse(manifestData);
    version = 'v' + manifest.version;
  } catch {
    version = '[Error checking devEngines CLI version]';
  }
  return version;
};
