import { Constructor, SchemaLike } from './core'
import { JoiSchemaTransformer } from './schemaConfig'

const schemaSymbol = Symbol('schema')

const propertySymbol = Symbol('property')

const keysSymbol = Symbol('keys')

const propertyTransformersSymbol = Symbol('property:transformers')

const schemaTransformersSymbol = Symbol('schema:transformers')

declare const Reflect: any

export class MetadataStore {
  public setSchemaClass(classType: Constructor) {
    Object.defineProperty(classType, schemaSymbol, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: true,
    })
  }
  public isSchemaClass(classType: Constructor): boolean {
    return !!(classType as any)[schemaSymbol]
  }
  public putPropertySchema(
    classType: Constructor,
    key: string,
    schema: SchemaLike | undefined,
  ) {
    Reflect.defineMetadata(propertySymbol, schema, classType, key)
    const keys: Iterable<string> =
      Reflect.getMetadata(keysSymbol, classType) || []

    Reflect.defineMetadata(keysSymbol, new Set([...keys, key]), classType)
  }
  public getPropertySchema(
    classType: Constructor,
    key: string,
  ): SchemaLike | undefined {
    return Reflect.getMetadata(propertySymbol, classType, key)
  }
  public keys(classType: Constructor): string[] {
    return [...(Reflect.getMetadata(keysSymbol, classType) || [])]
  }
  public addPropertyJoiTransformer(
    classType: Constructor,
    key: string,
    transformer: JoiSchemaTransformer<any>,
  ) {
    Reflect.defineMetadata(
      propertyTransformersSymbol,
      this.getPropertyJoiTransformers(classType, key).concat(transformer),
      classType,
      key,
    )
  }
  public getPropertyJoiTransformers(
    classType: Constructor,
    key: string,
  ): Array<JoiSchemaTransformer<any>> {
    return Reflect.getMetadata(propertyTransformersSymbol, classType, key) || []
  }
  public addSchemaJoiTransformer(
    classType: Constructor,
    transformer: JoiSchemaTransformer<any>,
  ) {
    Reflect.defineMetadata(
      schemaTransformersSymbol,
      this.getSchemaJoiTransformers(classType).concat(transformer),
      classType,
    )
  }
  public getSchemaJoiTransformers(
    classType: Constructor,
  ): Array<JoiSchemaTransformer<any>> {
    return Reflect.getMetadata(schemaTransformersSymbol, classType) || []
  }
}

export const defaultMetadataStore = new MetadataStore()
