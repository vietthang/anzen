import joi, { AnySchema } from 'joi'
import { defaultMetadataStore } from './metadataStore'
import { isClass } from './utils'

// tslint:disable-next-line
const joiPhoneNumberExtension = require('joi-phone-number')

const extendedJoi: typeof joi = joi.extend(joiPhoneNumberExtension)

const listSymbol = Symbol('List')

export interface IListSchema<T extends unknown = unknown> {
  symbol: typeof listSymbol
  _: T
  schemaResolvable: SchemaLike
}

export function List<T extends SchemaLike>(
  schemaResolvable: T,
): IListSchema<ResolveType<T>> {
  return {
    symbol: listSymbol,
    get _(): any {
      /* istanbul ignore next */
      throw new Error('static reference only')
    },
    schemaResolvable,
  }
}

const tupleSymbol = Symbol('tuple')

export interface ITupleSchema<
  Args extends [unknown, ...Array<unknown>] = [unknown, ...Array<unknown>]
> {
  symbol: typeof tupleSymbol
  _: Args
  childSchemas: SchemaLike[]
}

export function Tuple<Resolvables extends [SchemaLike, ...SchemaLike[]]>(
  ...schemaResolvables: Resolvables
): ITupleSchema<{ [key in keyof Resolvables]: ResolveType<Resolvables[key]> }> {
  return {
    symbol: tupleSymbol,
    get _(): any {
      /* istanbul ignore next */
      throw new Error('static reference only')
    },
    childSchemas: schemaResolvables,
  }
}

const enumSymbol = Symbol('Enum')

export interface IEnumSchema<T extends unknown = unknown> {
  symbol: typeof enumSymbol
  _: T
  enumObject: any
}

export function Enum<T>(enumObject: T): IEnumSchema<T[keyof T]> {
  return {
    symbol: enumSymbol,
    get _(): any {
      /* istanbul ignore next */
      throw new Error('static reference only')
    },
    enumObject,
  }
}

export type Provider<T> = () => T

export type Thunk<T> = T | Provider<T>

export type Constructor<T extends unknown = unknown> = new (...args: any[]) => T

export type SchemaLike =
  | typeof Boolean
  | typeof Number
  | typeof String
  | typeof Date
  | typeof Buffer
  | IListSchema
  | ITupleSchema
  | IEnumSchema
  | Thunk<Constructor>

export type ResolveType<T> = T extends joi.Schema
  ? unknown
  : T extends typeof Boolean
  ? boolean
  : T extends typeof Number
  ? number
  : T extends typeof String
  ? string
  : T extends typeof Date
  ? Date
  : T extends typeof Buffer
  ? Buffer
  : T extends IListSchema<infer U>
  ? U[]
  : T extends ITupleSchema<infer U>
  ? U
  : T extends IEnumSchema<infer U>
  ? U
  : T extends Thunk<Constructor<infer U>>
  ? U
  : never

export type ResolveJoiSchemaType<T> = T extends boolean
  ? joi.BooleanSchema
  : T extends number
  ? joi.NumberSchema
  : T extends string
  ? joi.StringSchema
  : T extends Date
  ? joi.DateSchema
  : T extends Buffer
  ? joi.BinarySchema
  : T extends Array<unknown>
  ? joi.ArraySchema
  : T extends object
  ? joi.ObjectSchema
  : joi.AnySchema

type Transformer<T, U> = (value: T) => U

function cache<T extends object, U>(
  transfomer: Transformer<T, U>,
): Transformer<T, U> {
  const resultCache = new WeakMap<T, U>()
  return (value: T): U => {
    if (resultCache.has(value)) {
      return resultCache.get(value)!
    }
    const result = transfomer(value)
    resultCache.set(value, result)
    return result
  }
}

const classToSchema = cache(
  (ctor: Constructor): joi.Schema => {
    if (!defaultMetadataStore.isSchemaClass(ctor)) {
      return joi.object().type(ctor)
    }
    const keys = defaultMetadataStore.keys(ctor)
    const schemaMap: joi.SchemaMap = {}
    for (const key of keys) {
      const schema = defaultMetadataStore.getPropertySchema(ctor, key)
      let joiSchema = resolveMaybeSchema(schema)
      const transformers = defaultMetadataStore.getPropertyJoiTransformers(
        ctor,
        key,
      )
      joiSchema = transformers.reduce(
        (prev, transformer) => transformer(prev),
        joiSchema,
      )

      schemaMap[key] = joiSchema
    }

    let classJoiSchema: AnySchema = joi.object(schemaMap)
    const schemaTransformers = defaultMetadataStore.getSchemaJoiTransformers(
      ctor,
    )
    for (const transformer of schemaTransformers) {
      classJoiSchema = transformer(classJoiSchema)
    }
    return classJoiSchema
  },
)

function isList(schemaResolvable: SchemaLike): schemaResolvable is IListSchema {
  return (schemaResolvable as IListSchema).symbol === listSymbol
}

function isTuple(
  schemaResolvable: SchemaLike,
): schemaResolvable is ITupleSchema {
  return (schemaResolvable as ITupleSchema).symbol === tupleSymbol
}

function isEnum(schemaResolvable: SchemaLike): schemaResolvable is IEnumSchema {
  return (schemaResolvable as IEnumSchema).symbol === enumSymbol
}

function isBuffer(
  schemaResolvable: SchemaLike,
): schemaResolvable is typeof Buffer {
  return schemaResolvable === Buffer
}

function getClass(schema: SchemaLike): Constructor | undefined {
  switch (schema) {
    case Boolean:
    case Number:
    case String:
    case Date:
      return undefined
  }

  if (isBuffer(schema)) {
    return undefined
  }

  if (isList(schema)) {
    return undefined
  }

  if (isTuple(schema)) {
    return undefined
  }

  if (isEnum(schema)) {
    return undefined
  }

  if (isClass(schema)) {
    return schema
  }

  return schema()
}

export function resolveMaybeSchema(schema: SchemaLike | undefined): joi.Schema {
  if (!schema) {
    return extendedJoi.any().optional()
  }
  return resolveSchema(schema)
}

export const resolveSchema = cache(
  (resolvable: SchemaLike): joi.Schema => {
    switch (resolvable) {
      case Boolean:
        return extendedJoi.boolean()

      case Number:
        return extendedJoi.number()

      case String:
        return extendedJoi.string().empty('')

      case Date:
        return extendedJoi.date()
    }

    if (isBuffer(resolvable)) {
      return extendedJoi.binary().encoding('base64')
    }

    if (isList(resolvable)) {
      return extendedJoi
        .array()
        .items(resolveMaybeSchema(resolvable.schemaResolvable))
    }

    if (isTuple(resolvable)) {
      return extendedJoi
        .array()
        .ordered(resolvable.childSchemas.map(resolveSchema))
    }

    if (isEnum(resolvable)) {
      return extendedJoi.only(Object.values(resolvable.enumObject))
    }

    if (isClass(resolvable)) {
      return classToSchema(resolvable)
    }

    return resolveMaybeSchema(resolvable())
  },
)

export const resolveInputSchema = cache(
  (schema: SchemaLike): joi.ObjectSchema => {
    // we need to wrap schema into object to allow validate undefined value by wrapping it into { input: undefined }
    return extendedJoi.object({ input: resolveSchema(schema) })
  },
)

function convertToClass(value: any, classType: Constructor): any {
  if (value instanceof classType) {
    return value
  }

  const keys = defaultMetadataStore.keys(classType)
  const ret = Object.create(classType.prototype)
  for (const key of keys) {
    ret[key] = transformClass(
      value[key],
      defaultMetadataStore.getPropertySchema(classType, key),
    )
  }
  return ret
}

function transformClass(value: any, schema: SchemaLike | undefined): any {
  if (!value) {
    return value
  }

  if (!schema) {
    return value
  }

  const classType = getClass(schema)
  if (classType) {
    return convertToClass(value, classType)
  }

  if (isList(schema)) {
    return (value as any[]).map(item =>
      transformClass(item, schema.schemaResolvable),
    )
  }

  if (isTuple(schema)) {
    return schema.childSchemas.map((schema, index) =>
      transformClass(value[index], schema),
    )
  }

  return value
}

export interface ITransformOptions {
  transformToClass?: boolean
  allowUnknown?: boolean
  stripUnknown?: boolean
  convert?: boolean
}

export function validate<T extends SchemaLike>(
  input: any,
  schema: T,
  {
    transformToClass = true,
    allowUnknown = true,
    stripUnknown = true,
    convert = true,
  }: ITransformOptions = {},
): ResolveType<T> {
  const joiSchema = resolveInputSchema(schema)
  const result = joiSchema.validate(
    { input },
    {
      allowUnknown,
      stripUnknown,
      presence: 'required',
      convert,
    },
  )
  if (result.error) {
    throw result.error
  }
  let ret = result.value.input
  if (transformToClass) {
    ret = transformClass(ret, schema)
  }
  return ret
}
