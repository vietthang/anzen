import { Constructor, ResolveType, SchemaLike, Thunk } from './core'
import { defaultMetadataStore } from './metadataStore'
import { SafePropertyDecorator } from './utils'

export const Schema = Object.assign(
  () => (target: Constructor) => {
    defaultMetadataStore.setSchemaClass(target)
  },
  {
    Optional: <T = undefined>(defaultValue?: Thunk<T>) => {
      return (classType: Constructor<T>) => {
        defaultMetadataStore.addSchemaJoiTransformer(classType, schema => {
          if (defaultValue !== undefined) {
            return schema
              .optional()
              .default(defaultValue)
              .allow(defaultValue)
          }
          return schema.optional()
        })
      }
    },
  },
)

export function Property(): SafePropertyDecorator<unknown>

export function Property<T extends SchemaLike>(
  schema: T,
): SafePropertyDecorator<ResolveType<T>>

export function Property(schema?: SchemaLike): SafePropertyDecorator<unknown> {
  return (target, key) => {
    if (typeof key !== 'string') {
      throw new Error('non string property is not supported')
    }
    defaultMetadataStore.putPropertySchema(
      target.constructor as Constructor,
      key,
      schema,
    )
  }
}
