// tslint:disable:max-classes-per-file
import 'jest'
import 'reflect-metadata'
import { validate } from './core'
import { Property, Schema } from './decorators'
import { Allow, Integer, Optional } from './helpers'

describe('test @Integer', () => {
  @Schema()
  class A {
    @Integer()
    @Property(Number)
    public intValue!: number
  }

  it('should success with valid integer value', () => {
    const output = validate({ intValue: 1 }, A)
    expect(output).toBeInstanceOf(A)
    expect(output).toEqual({ intValue: 1 })
  })
})

describe('test @Optional', () => {
  describe('without default value', () => {
    @Schema()
    class A {
      @Optional()
      @Property(String)
      public foo?: string
    }

    it('should success with string value', () => {
      const a = validate({ foo: 'foo' }, A)
      expect(a).toEqual({ foo: 'foo' })
      expect(a).toBeInstanceOf(A)
    })

    it('should fail with null value', () => {
      expect(() => validate({ foo: null }, A)).toThrow()
    })

    it('should success with undefined value', () => {
      const a = validate({ foo: undefined }, A)
      expect(a).toEqual({ foo: undefined })
      expect(a).toBeInstanceOf(A)
    })

    it('should success with empty value', () => {
      const a = validate({}, A)
      expect(a).toEqual({})
      expect(a).toBeInstanceOf(A)
    })
  })

  describe('without default value', () => {
    @Schema()
    class A {
      @Optional(null)
      @Property(String)
      public foo!: string | null
    }

    it('should success with string value', () => {
      const a = validate({ foo: 'foo' }, A)
      expect(a).toEqual({ foo: 'foo' })
      expect(a).toBeInstanceOf(A)
    })

    it('should success with default value', () => {
      const a = validate({ foo: null }, A)
      expect(a).toEqual({ foo: null })
      expect(a).toBeInstanceOf(A)
    })

    it('should success with undefined value', () => {
      const a = validate({ foo: undefined }, A)
      expect(a).toEqual({ foo: null })
      expect(a).toBeInstanceOf(A)
    })

    it('should success with empty value', () => {
      const a = validate({}, A)
      expect(a).toEqual({ foo: null })
      expect(a).toBeInstanceOf(A)
    })
  })
})

describe('test @Allow', () => {
  @Schema()
  class A {
    @Allow(null, 10)
    @Property(String)
    public foo!: string | null | 10
  }

  it('should success with string value', () => {
    const a = validate({ foo: 'foo' }, A)
    expect(a).toEqual({ foo: 'foo' })
    expect(a).toBeInstanceOf(A)
  })

  it('should success with null value', () => {
    const a = validate({ foo: null }, A)
    expect(a).toEqual({ foo: null })
    expect(a).toBeInstanceOf(A)
  })

  it('should success with allowed value', () => {
    const a = validate({ foo: 10 }, A)
    expect(a).toEqual({ foo: 10 })
    expect(a).toBeInstanceOf(A)
  })

  it('should fail with undefined value', () => {
    expect(() => validate({ foo: undefined }, A)).toThrow()
  })

  it('should fail with empty value', () => {
    expect(() => validate({}, A)).toThrow()
  })
})
