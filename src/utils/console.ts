import { dim, yellow, red } from 'kleur/colors'

/**
 * Log stuff to the console in a faded gray color
 *
 * @param args What you want to log
 */
export function info(...args: any[]): void {
  console.info(...args.map((arg) => dim(arg)))
}

/**
 * Warns stuff in yellow to the console
 *
 * @param args What you want to log
 */
export function warn(...args: any[]): void {
  console.warn(...args.map((arg) => yellow(arg)))
}

export function error(error: Error, shouldAskForReport: boolean = false) {
  const redLog = (arg: any) => console.error(red(arg))

  redLog('The following error occurred whilst executing this program: \n')

  error.message
    .split('\n')
    .map((line) => dim(`  | ${line}`))
    .forEach(console.error)

  if (shouldAskForReport) {
    redLog(
      '\n This may be an error on our part. If you feel that it is, please file an issue on github.'
    )
  }

  redLog('The full stack trace is as follows:')

  throw error
}

/**
 * Only logs if the environment is not production. Doesn't apply any formatting
 */
export function debug() {
  if (process.env.NODE_ENV === 'development') {
    console.debug(...arguments)
  }
}
