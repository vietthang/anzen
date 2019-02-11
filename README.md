# Anzenjs

## Introduction

Anzenjs is type-safe decorator library that help to ensure type-safety in runtime for typescript project. At compile time, it guards user from wrongly decorated property in class. At run time, it uses `joi` to validate input and transform it into correct decorated schema.

For examples please see the test directory. :)

## Features

- TODO

## TODO

- Add more tests.
- Investigate some way to support more fine-grained type (like Email, Phone ...). Some ideas: [newtype-ts](https://github.com/gcanti/newtype-ts)
- Maybe remove `joi` dependency from core library, so we can use it as a metadata library for other purpose?

## Alternatives

There are some awesome libraries that solve the same problem domain:

- [class-transform](https://github.com/typestack/class-transformer) & [class-validator](https://github.com/typestack/class-validator): Does not support coerce values very well.
- [joi](https://github.com/hapijs/joi) & [ajv](https://github.com/epoberezkin/ajv): Javascript, non-type-safe library.
