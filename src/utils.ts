import { Constructor } from './core'

export function isClass(func: unknown): func is Constructor {
  return (
    typeof func === 'function' &&
    /^class\s/.test(Function.prototype.toString.call(func))
  )
}

export type SafePropertyDecorator<Value> = <
  T extends { [key in Key]?: Value extends T[key] ? T[key] : never },
  Key extends (keyof T) & (string | symbol)
>(
  target: T,
  key: Key,
) => void
