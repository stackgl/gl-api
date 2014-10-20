var map     = require('map-limit')
var request = require('request')
var cheerio = require('cheerio')
var slice   = require('sliced')
var url     = require('url')

var source = 'https://www.khronos.org/opengles/sdk/docs/man/xhtml/'
var convert = {
    'gl.clearDepthf': 'gl.clearDepth'
  , 'gl.get': 'gl.getParameter'
}

var exclude = [
    'gl.shaderBinary'
  , 'gl.clearDepthf'
  , 'gl.deleteBuffers'
  , 'gl.deleteFramebuffers'
  , 'gl.deleteRenderbuffers'
  , 'gl.deleteTextures'
  , 'gl.depthRangef'
  , 'gl.genBuffers'
  , 'gl.genFramebuffers'
  , 'gl.genRenderbuffers'
  , 'gl.genTextures'
  , 'gl.get'
  , 'gl.getBufferParameteriv'
  , 'gl.getFramebufferAttachmentParameteriv'
  , 'gl.getProgramiv'
  , 'gl.getRenderbufferParameteriv'
  , 'gl.getShaderiv'
  , 'gl.getString'
  , 'gl.getVertexAttribPointerv'
  , 'gl.releaseShaderCompiler'
  , 'gl.texParameter'
  , 'gl.uniform'
  , 'gl.vertexAttrib'
]

getMethods(function(err, methods) {
  if (err) throw err

  map(methods, 10, function(method, next) {
    getMethodData(method.name, method.href, next)
  }, function(err, data) {
    if (err) throw err

    data = data.filter(Boolean)
    data = JSON.stringify(data, null, 2)

    console.log(data)
  })
})

function getMethods(done) {
  request.get(source, function(err, res, body) {
    if (err) return done(err)
    var $ = cheerio.load(body)

    var els = slice($('tr td a'))
    var methods = els.map(function(el) {
      var $el  = $(el)
      var href = $el.attr('href')
      var name = $el.text()
      if (name === 'Top') return

      return {
          href: url.resolve(source, href)
        , name: name
      }
    }).filter(Boolean)

    done(null, methods)
  })
}

function getMethodData(name, href, done) {
  name = name.replace(/GL_([A-Z_])/g, function(_, con) {
    return 'gl.' + con
  })

  name = name.replace(/([^a-zA-Z]|^)gl([a-zA-Z])/g, function(_, prefix, method) {
    return prefix + 'gl.' + method.charAt(0).toLowerCase() + method.slice(1)
  })

  name = convert[name] || name
  if (exclude.indexOf(name) !== -1) return done()

  request.get(href, {
    followRedirect: true
  }, function(err, res, body) {
    if (err) return done(err)
    var $ = cheerio.load(body)
    var content  = $('meta').attr('content')
    var redirect = content.match(/\;URL\=(.+\.xml)/)
    if (redirect && redirect[1]) {
      return getMethodData(name, url.resolve(href, redirect[1]), done)
    }

    var $html = $('html')
    makeLinksAbsolute($, $html, href)
    webglReferences($, $html)

    console.error(name)

    var shorter     = getShorter($, href)
    var spec        = getSpec($, href)
    var also        = getAlso($, href)

    // excluded for now:
    // var description = getDescription($, href)

    done(null, {
        name: name
      , kind: 'function'
      , description: shorter
      , usage: spec.usage
      , parameters: spec.parameters
      , href: href
      , also: also
    })
  })
}

function makeLinksAbsolute($$, $, src) {
  $.find('a[href]').each(function(i, a) {
    var $a = $$(a)
    var href = $a.attr('href')
    $a.attr('href', url.resolve(src, href))
  })
}

function webglReferences($$, $) {
  var contents = $.find('*').contents()

  $$(contents).each(function(_, el) {
    var $el  = $$(el)
    if ($el.text() !== $el.html()) return
    var text = $el.text().trim()
    if (!text) return

    text = text.replace(/GL_([A-Z_])/g, function(_, con) {
      return 'gl.' + con
    })

    text = text.replace(/([^a-zA-Z]|^)gl([a-zA-Z])/g, function(_, prefix, method) {
      return prefix + 'gl.' + method.charAt(0).toLowerCase() + method.slice(1)
    })

    text = text.replace(/gl\.TRUE/g, 'true')
    text = text.replace(/gl\.FALSE/g, 'false')
    text = text.replace(/gl\.get$/g, 'gl.getParameter')

    return $el.text(text)
  })
}

function getDescription($, href) {
  var $descref = $('#description')
  var description = $descref.parent()

  $descref.remove()

  return description.html()
}

function getShorter($, href) {
  var text = $('.refnamediv p')
    .first()
    .text()
    .replace(/^.+—/, '')
    .trim()

  text = text.charAt(0).toUpperCase() + text.slice(1)
  if (text.slice(-1) !== '.') text += '.'

  return text
}

function getSpec($, href) {
  var usage       = $('.funcsynopsis').first().text()
  var param       = $('#parameters').first().parent().find('dl.variablelist')
  var paramDefs   = []
  var paramLabels = []

  usage = usage
    .replace(/GLuint program/g, 'WebGLProgram program')
    .replace(/GLuint texture/g, 'WebGLTexture texture')
    .replace(/GLuint shader/g, 'WebGLShader shader')
    .replace(/GLboolean/g, 'Boolean')
    .replace(/GLclampf/g, 'Number')
    .replace(/GLsizei/g, 'Number')
    .replace(/GLfloat/g, 'Number')
    .replace(/GLuint/g, 'Number')
    .replace(/GLint/g, 'Number')

  param.find('dd').each(function(_, dd) {
    paramDefs.push($(dd).text().trim())
  })
  param.find('dt').each(function(_, dt) {
    paramLabels.push($(dt).text().trim())
  })

  var params = paramLabels.reduce(function(params, label, i) {
    params[label] = paramDefs[i]
    return params
  }, {})

  return {
      usage: usage
    , parameters: params
  }
}

function getAlso($, href) {
  var links = $('#seealso').parent().find('a')

  return slice(links).map(function(el) {
    var $el  = $(el)
    var href = ($el).attr('href')

    return href && {
        href: href
      , name: $el.text()
    }
  }).filter(Boolean)
}
