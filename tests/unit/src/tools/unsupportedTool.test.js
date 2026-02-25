import tool, { message } from '@/tools/unsupportedTool.js';

describe('unsupportedTools.js', () => {
  test('getCachedReleases', async () => {
    await tool.getCachedReleases();

    expect(console.log)
      .toHaveBeenCalledWith(message);
  });

  test('getLatestReleases', async () => {
    await tool.getLatestReleases();

    expect(console.log)
      .toHaveBeenCalledWith(message);
  });

  test('resolveVersion', async () => {
    await tool.resolveVersion();

    expect(console.log)
      .toHaveBeenCalledWith(message);
  });
});
