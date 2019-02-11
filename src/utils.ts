import { Constructor } from './core'

export function isClass(func: any): func is Constructor {
  return (
    typeof func === 'function' &&
    /^class\s/.test(Function.prototype.toString.call(func))
  )
}

export type SafePropertyDecorator<Value extends unknown> = <
  T extends { [key in Key]?: Value extends T[key] ? T[key] : never },
  Key extends (keyof T) & (string | symbol)
>(
  target: T,
  key: Key,
) => void
