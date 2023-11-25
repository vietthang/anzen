import { Constructor, ResolveJoiSchemaType } from './core'
import { defaultMetadataStore } from './metadataStore'
import { SafePropertyDecorator } from './utils'

export type JoiSchemaTransformer<T> = (
  schema: ResolveJoiSchemaType<T>,
) => ResolveJoiSchemaType<T>

export function PropertyConfig<T = unknown>(
  transformer: JoiSchemaTransformer<T>,
): SafePropertyDecorator<T> {
  return (target, key) => {
    if (typeof key !== 'string') {
      throw new Error('non string property is not supported')
    }
    defaultMetadataStore.addPropertyJoiTransformer(
      target.constructor as Constructor,
      key,
      transformer,
    )
  }
}
