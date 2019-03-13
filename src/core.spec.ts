// tslint:disable:max-classes-per-file
import 'jest'
import 'reflect-metadata'

import { Enum, List, Tuple, validate } from './core'
import { Property, Schema } from './decorators'

describe('test basic types', () => {
  @Schema()
  class A {
    @Property(String)
    public strValue!: string

    @Property(Number)
    public numberValue!: number

    @Property(Boolean)
    public booleanValue!: boolean
  }

  it('should transform to correct value', () => {
    const a = validate(
      {
        strValue: 'string',
        numberValue: 1.1,
        booleanValue: true,
        unknown: 'unknown',
      },
      A,
    )
    expect(a).toBeInstanceOf(A)
    expect(a).toEqual({
      strValue: 'string',
      numberValue: 1.1,
      booleanValue: true,
    })
  })

  it('should throw when transform with invalid data', () => {
    expect(() =>
      validate(
        {
          strValue: 'string',
          numberValue: 1.1,
          booleanValue: 1,
        },
        A,
      ),
    ).toThrowError()
  })

  it('should coerce string to other primitive types correctly', () => {
    const a = validate(
      {
        strValue: 'string',
        numberValue: '1.1',
        booleanValue: 'true',
        unknown: 'unknown',
      },
      A,
    )
    expect(a).toBeInstanceOf(A)
    expect(a).toEqual({
      strValue: 'string',
      booleanValue: true,
      numberValue: 1.1,
    })
  })
})

describe('test Date', () => {
  @Schema()
  class A {
    @Property(Date)
    public date!: Date

    @Property(Date)
    public dateMs!: Date

    @Property(Date)
    public dateISOString!: Date
  }

  it('should coerce from ms, string, Date correctly', () => {
    const date = new Date(Date.UTC(2019, 1, 1))
    const a = validate(
      { date, dateMs: date.getTime(), dateISOString: date.toISOString() },
      A,
    )
    expect(a).toEqual({ date, dateMs: date, dateISOString: date })
  })
})

describe('test Any', () => {
  @Schema()
  class A {
    @Property()
    public anyValue: any
  }

  it('should success with every value', () => {
    const values = [null, undefined, 1, 1.1, new Date(), 'foo', Buffer.alloc(0)]
    for (const value of values) {
      const a = validate({ anyValue: value }, A)
      expect(a).toBeInstanceOf(A)
      expect(a).toEqual({ anyValue: value })
    }
  })
})

describe('test array', () => {
  @Schema()
  class A {
    @Property(List(String))
    public stringValues!: string[]
  }
  it('should success with correct array', () => {
    const a = validate({ stringValues: ['foo'] }, A)
    expect(a).toEqual({ stringValues: ['foo'] })
  })

  it('should success with an empty array', () => {
    const a = validate({ stringValues: [] }, A)
    expect(a).toEqual({ stringValues: [] })
  })

  it('should fail with an invalid array type', () => {
    expect(() => validate({ stringValues: [1] }, A)).toThrowError()
  })
})

describe('test Buffer', () => {
  @Schema()
  class A {
    @Property(Buffer)
    public buffer!: Buffer
  }

  const buffer = Buffer.from('deadbeef', 'base64')

  it('should success with buffer value', () => {
    const a = validate({ buffer }, A)
    expect(a).toBeInstanceOf(A)
    expect(a).toEqual({ buffer })
  })

  it('should success with base64 value', () => {
    const a = validate({ buffer: 'deadbeef' }, A)
    expect(a).toBeInstanceOf(A)
    expect(a).toEqual({ buffer })
  })

  it('should success with invalid base64 value', () => {
    // TODO this should throw error, but behavior of Buffer node.js is bad in this case
    const a = validate({ buffer: 'invalid base64 string' }, A)
    expect(a).toBeInstanceOf(A)
    expect(a).toEqual({
      buffer: Buffer.from('invalid base64 string', 'base64'),
    })
  })
})

describe('test nested class', () => {
  describe('test nested class with provider', () => {
    it('should success with correct value', () => {
      @Schema()
      class Nested {
        @Property(Number)
        public id!: number
      }

      @Schema()
      class A {
        @Property(Number)
        public id!: number

        @Property(() => Nested)
        public nested!: Nested
      }
      const a = validate({ id: 1, nested: { id: 1 } }, A)
      expect(a).toEqual({ id: 1, nested: { id: 1 } })
      expect(a).toBeInstanceOf(A)
      expect(a.nested).toBeInstanceOf(Nested)
    })
  })

  describe('test nested class with direct constructor', () => {
    it('should success with correct value', () => {
      @Schema()
      class Nested {
        @Property(Number)
        public id!: number
      }

      @Schema()
      class A {
        @Property(Number)
        public id!: number

        @Property(Nested)
        public nested!: Nested
      }
      const a = validate({ id: 1, nested: { id: 1 } }, A)
      expect(a).toEqual({ id: 1, nested: { id: 1 } })
      expect(a).toBeInstanceOf(A)
      expect(a.nested).toBeInstanceOf(Nested)
    })
  })

  describe('test nested class with non-schema class', () => {
    it('should success with correct value', () => {
      class Nested {
        constructor(public readonly id: number) {}
      }

      @Schema()
      class A {
        @Property(Number)
        public id!: number

        @Property(Nested)
        public nested!: Nested
      }
      const a = validate({ id: 1, nested: new Nested(1) }, A)
      expect(a).toEqual({ id: 1, nested: { id: 1 } })
      expect(a).toBeInstanceOf(A)
      expect(a.nested).toBeInstanceOf(Nested)
    })
  })
})

describe('test non-schema class', () => {
  class A {
    constructor(readonly foo: string) {}
  }

  it('should failed with invalid instance', () => {
    expect(() => validate({ foo: 'string' }, A)).toThrow()
  })

  it('should success with object constructor from A', () => {
    const a = validate(new A('foo'), A)
    expect(a).toEqual({ foo: 'foo' })
    expect(a).toBeInstanceOf(A)
  })
})

describe('test Tuple', () => {
  @Schema()
  class Nested {
    @Property(Number)
    public id!: number
  }

  @Schema()
  class A {
    @Property(Tuple(String, Nested))
    public foo!: [string, Nested]
  }

  it('should success with correct value', () => {
    const a = validate({ foo: ['foo', { id: 0 }] }, A)
    expect(a).toEqual({ foo: ['foo', { id: 0 }] })
    expect(a).toBeInstanceOf(A)
    expect(a.foo[1]).toBeInstanceOf(Nested)
  })
})

describe('test Enum', () => {
  enum Color {
    Red = 'Red',
    Blue = 'Blue',
  }
  @Schema()
  class A {
    @Property(Enum(Color))
    public color!: Color
  }

  it('should success with correct value', () => {
    const a = validate({ color: Color.Blue }, A)
    expect(a).toEqual({ color: Color.Blue })
    expect(a).toBeInstanceOf(A)
  })

  it('should success with string value', () => {
    const a = validate({ color: 'Blue' }, A)
    expect(a).toEqual({ color: Color.Blue })
    expect(a).toBeInstanceOf(A)
  })

  it('should fail with invalid value', () => {
    expect(() => validate({ color: 'Yellow' }, A)).toThrow()
  })
})

describe('test non-schema class', () => {
  class NonSchemaObject {
    constructor(public readonly foo: string) {}
  }

  it('should failed with raw object', () => {
    expect(() => validate({ foo: 'foo' }, NonSchemaObject)).toThrow()
  })

  it('should success with correct object', () => {
    const out = validate(new NonSchemaObject('foo'), NonSchemaObject)
    expect(out).toBeInstanceOf(NonSchemaObject)
    expect(out).toEqual({ foo: 'foo' })
  })
})

describe('test @Schema.Default', () => {
  @Schema()
  @Schema.Optional({ foo: 'bar' })
  class A {
    @Property(String)
    public foo!: string
  }

  it('should return default value when transform undefined', () => {
    const out = validate(undefined, A)
    expect(out).toBeInstanceOf(A)
    expect(out).toEqual({ foo: 'bar' })
  })
})
