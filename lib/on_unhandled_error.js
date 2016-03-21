
export function onUnhandledError(prefix = 'FATAL ERROR') {
  return err => {
    process.stderr.write(`${prefix}:\n`)
    err.stack.split('\n').forEach(l => process.stderr.write(`  ${l}\n`))
    process.exit(1)
  }
}
