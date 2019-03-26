import {
  Base64Options,
  DataUriOptions,
  EmailOptions,
  GuidOptions,
  HexOptions,
  IpOptions,
  StringRegexOptions,
  UriOptions,
} from 'joi'

import { Thunk } from './core'
import { PropertyConfig } from './schemaConfig'

export function Integer() {
  return PropertyConfig<number>(schema => schema.integer())
}

export function Min(min: number) {
  return PropertyConfig<number | string | Array<unknown>>(schema =>
    schema.min(min),
  )
}

export function Max(max: number) {
  return PropertyConfig<number | string | Array<unknown>>(schema =>
    schema.max(max),
  )
}

export function Length(length: number) {
  return PropertyConfig<Buffer | string | Array<unknown>>(schema =>
    schema.length(length),
  )
}

export function Truncate(enabled?: boolean) {
  return PropertyConfig<string>(schema => schema.truncate(enabled))
}

export function CreditCard() {
  return PropertyConfig<string>(schema => schema.creditCard())
}

export function Regex(pattern: RegExp, options?: string | StringRegexOptions) {
  return PropertyConfig<string>(schema => schema.regex(pattern, options))
}

export function Alphanum() {
  return PropertyConfig<string>(schema => schema.alphanum())
}

export function Token() {
  return PropertyConfig<string>(schema => schema.token())
}

export function Email(options?: EmailOptions) {
  return PropertyConfig<string>(schema => schema.email(options))
}

export function Ip(options?: IpOptions) {
  return PropertyConfig<string>(schema => schema.ip(options))
}

export function Uri(options?: UriOptions) {
  return PropertyConfig<string>(schema => schema.uri(options))
}

export function Guid(options?: GuidOptions) {
  return PropertyConfig<string>(schema => schema.guid(options))
}

export function Hex(options?: HexOptions) {
  return PropertyConfig<string>(schema => schema.hex(options))
}

export function Base64(options?: Base64Options) {
  return PropertyConfig<string>(schema => schema.base64(options))
}

export function DataUri(options?: DataUriOptions) {
  return PropertyConfig<string>(schema => schema.dataUri(options))
}

export function Hostname() {
  return PropertyConfig<string>(schema => schema.hostname())
}

export function Normalize(form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD') {
  return PropertyConfig<string>(schema => schema.normalize(form))
}

export function Lowercase() {
  return PropertyConfig<string>(schema => schema.lowercase())
}

export function Uppercase() {
  return PropertyConfig<string>(schema => schema.uppercase())
}

export function Trim() {
  return PropertyConfig<string>(schema => schema.trim())
}

export function IsoDate() {
  return PropertyConfig<string>(schema => schema.isoDate())
}

export function Positive() {
  return PropertyConfig<number>(schema => schema.positive())
}

export function Negative() {
  return PropertyConfig<number>(schema => schema.negative())
}

export function Port() {
  return PropertyConfig<number>(schema => schema.port())
}

export function Multiple(multiple: number) {
  return PropertyConfig<number>(schema => schema.multiple(multiple))
}

export function Precision(precision: number) {
  return PropertyConfig<number>(schema => schema.precision(precision))
}

export function Single(enabled?: boolean) {
  return PropertyConfig<Array<unknown>>(schema => schema.single(enabled))
}

export function Sparse(enabled?: boolean) {
  return PropertyConfig<Array<unknown>>(schema => schema.sparse(enabled))
}

export function Encoding(encoding: string) {
  return PropertyConfig<Buffer>(schema => schema.encoding(encoding))
}

export function Unique<T>(comparator?: (lhs: T, rhs: T) => boolean) {
  return PropertyConfig<T[]>(schema => schema.unique(comparator))
}

export function Optional<T extends unknown = undefined>(
  defaultValue?: Thunk<T>,
) {
  return PropertyConfig<T>(schema => {
    if (defaultValue !== undefined) {
      return schema
        .optional()
        .default(defaultValue)
        .allow(defaultValue)
    }
    return schema.optional()
  })
}

export function Allow<Args extends Array<unknown>>(...args: Args) {
  return PropertyConfig<Args[number]>(schema => schema.allow(args))
}
