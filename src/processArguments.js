/**
 * Forces user arguments to lowercase strings.
 *
 * @param  {string} argument  Argument provided by the user, or undefined
 * @return {string}           Lowercase string or empty string
 */
const cleanArgument = function (argument) {
  return argument?.toLowerCase() || '';
}

/**
 * @typedef {object}  PROCESSEDARGS
 * @param   {boolean} isGlobal       Did they use -g
 * @param   {string}  arg            The first non -g argument
 */

/**
 * Process the command line arguments passed in by the user.
 *
 * @return {PROCESSEDARGS} Processed argurments
 */
export const argumentProcessing = function () {
  let args = process.argv;
  const preIndex = args.findIndex(function (argument) {
    return (
      argument.includes('devEngines/index.js') ||
      argument.includes('devEngines\\index.js')
    );
  });
  const startingIndex = preIndex + 1;

  args = args.slice(startingIndex);
  let first = cleanArgument(args[0]);
  const second = cleanArgument(args[1]);
  const isGlobal = [first, second].includes('-g');

  let arg = first;
  if (first === '-g') {
    arg = second;
  }
  return {
    arg,
    isGlobal
  };
}
