# gl-api
![](http://img.shields.io/badge/stability-unstable-yellow.svg?style=flat)
![](http://img.shields.io/npm/v/gl-api.svg?style=flat)
![](http://img.shields.io/npm/dm/gl-api.svg?style=flat)
![](http://img.shields.io/npm/l/gl-api.svg?style=flat)

A JSON listing of the WebGL 1.0 API, scraped from the
[OpenGL ES 2.0 Reference Pages](https://www.khronos.org/opengles/sdk/docs/man/xhtml/).

Inspired by **[@gre](http://github.com/gre)**'s
[glsldoc](http://github.com/glslio/glsldoc) package, this should be useful if
you're looking to add contextual documentation to WebGL code or other forms
of generated documentation.

**Incomplete: still in need of better conversion between OpenGL ES and WebGL.
Please pitch in if you'd like to help!**

## Usage

[![NPM](https://nodei.co/npm/gl-api.png)](https://nodei.co/npm/gl-api/)

### `api = require('gl-api')`

Where `api` is an array, containing the following properties:

* `name`: the property/variable name.
* `kind`: the kind of value that's being documented.
* `description`: a short description of the value.
* `usage`: a short description of how the value should be used. If it's a
  function, this is its signature (annotated with types).
* `parameters`: an object listing the parameters used in a function, where
  the keys are the argument names and the values are a description of those
  arguments.
* `href`: the original source of the documentation.
* `also`: an array of related properties/variables, each with a `name` and a
  `href` linking to the relevant OpenGL ES Reference Page.

## Contributing

See [stackgl/contributing](http://github.com/stackgl/contributing).

## License

MIT. See [LICENSE.md](http://github.com/hughsk/gl-api/blob/master/LICENSE.md) for details.
