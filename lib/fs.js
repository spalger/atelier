import fs from 'fs'

import { fcb } from './'

export async function read(path) {
  return await fcb(cb => fs.readFile(path, 'utf8', cb))
}

export async function write(path, content) {
  const rawContent = typeof content === 'string' || Buffer.isBuffer(content)
  const toWrite = rawContent ? content : JSON.stringify(content, null, '  ')
  return await fcb(cb => fs.writeFile(path, toWrite, 'utf8', cb))
}

export async function mkdir(path) {
  await fcb(cb => fs.mkdir(path, cb))
}

export async function stat(path) {
  return fcb(cb => fs.stat(path, cb))
}

export async function isFile(path) {
  try {
    const _stat = await stat(path)
    return _stat.isFile()
  } catch (e) {
    return false
  }
}
