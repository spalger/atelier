
export function inherits(Class, SuperClass) {
  // prevent infinite loop by tracking out path
  const path = []
  return (function checkPrototype(Current) {
    if (!Current || path.includes(Current)) {
      return false
    }

    if (Current.prototype === SuperClass.prototype) {
      return true
    }

    path.push(Current)
    return checkPrototype(Current.prototype.constructor)
  }(Class))
}
