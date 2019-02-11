// TypeScript Version: 3.3
import { Schema, Property, Optional, Allow, List, Enum } from '../../src'

class Nested {
  foo!: string
}

export enum Color {
  Red = 'Red',
  Blue = 'Blue',
  Green = 'Green',
}

@Schema()
export class A {
  @Property(String)
  stringOnStringSchema!: string

  @Optional() // $ExpectError
  @Property(String)
  stringOnOptionalStringSchema!: string

  @Property(String)
  nullableStringOnStringSchema!: string | null // should allow type which is broader than defined

  @Property(String)
  optionalStringOnStringSchema?: string

  @Optional()
  @Property(String)
  stringOrUndefinedOnOptionalStringSchema!: string | undefined

  @Allow(null)
  @Property(String)
  stringOrNullOnAllowNullStringSchema!: string | null

  @Allow(null) // $ExpectError
  @Property(String)
  stringOnAllowNullStringSchema!: string

  @Property(String) // $ExpectError
  stringLiteralOnStringSchema!: 'string'

  @Property(Nested)
  nestedOnNestedSchema!: Nested

  @Property(Nested) // $ExpectError
  stringOnNestedSchema!: string

  @Property(() => Nested)
  nestedOnNestedProviderSchema!: Nested

  @Property(() => Nested)
  nestedOrNullOnNestedProviderSchema!: Nested | null

  @Property(() => Nested)
  nestedOrNullOrUndefinedOnNestedProviderSchema!: Nested | null | undefined

  @Property(List(() => Nested)) // $ExpectError
  stringOnNestedListSchema!: string

  @Property(List(() => Nested)) // $ExpectError
  nestedOnNestedListSchema!: Nested

  @Property(List(() => Nested))
  nestedArrayOnNestedListSchema!: Nested[]

  @Property(Enum(Color))
  colorOnColorSchema!: Color
}
