import { spawn } from 'child_process'

export async function exec({ cmd, args, cwd, stdio, env = process.env }) {
  await new Promise((resolve, reject) => {
    spawn(cmd, args, { cwd, stdio, shell: true, env })
      .on('error', reject)
      .on('exit', code => {
        if (code > 0) {
          const err = new Error(`${cmd} ended with non-zero exit code ${code}`)
          err.exitCode = code
          reject(err)
        } else {
          resolve()
        }
      })
  })
}
