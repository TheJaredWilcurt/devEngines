import {
  determineEndOfLineCharacter,
  determineIndentation
} from '@/helpers.js';

describe('helpers.js', () => {
  describe('determineEndOfLineCharacter', () => {
    test.each([
      ['CRLF', '\r\n'],
      ['CR', '\r'],
      ['LF', '\n']
    ])('Detect %s', (name, eol) => {
      const data = [
        '{',
        '  "name": "test"',
        '}'
      ].join(eol);

      expect(determineEndOfLineCharacter(data))
        .toEqual(eol);
    });
  });

  describe('determineIndentation', () => {
    test.each([
      ['tabs', '\t', '\t'],
      ['1 space', ' ', 1],
      ['2 spaces', '  ', 2],
      ['3 spaces', '   ', 3],
      ['4 spaces', '    ', 4],
      ['5 spaces', '     ', 5],
      ['6 spaces', '      ', 6],
      ['7 spaces', '       ', 7],
      ['8 spaces', '        ', 8]
    ])('Detects %s', (name, indentation, amount) => {
      const data = [
        '{',
        indentation + '"name": "test"',
        '}'
      ].join('\n');

      expect(determineIndentation(data))
        .toEqual(amount);
    });
  });
});
