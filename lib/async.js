import { fromCallback } from 'bluebird'

export function fcb(fn) {
  return fromCallback(fn)
}
