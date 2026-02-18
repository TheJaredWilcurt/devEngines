/**
 * @file Global Vitest setup file
 */


let consoleLog = console.log;

global.beforeEach(() => {
  console.log = vi.fn();
});

global.afterEach(() => {
  console.log = consoleLog;
});
