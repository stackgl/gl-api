var test = require('tape')
var api  = require('./')
var gl   = document.createElement('canvas').getContext('webgl')

test('all methods listed actually exist', function(t) {
  for (var i = 0; i < api.length; i++) {
    var key = api[i].name.slice(3)
    t.ok(gl[key], api[i].name)
  }

  t.end()
})

test('there are no methods unaccounted for', function(t) {
  outer: for (var k in gl) {
    if (typeof gl[k] !== 'function') continue
    for (var i = 0; i < api.length; i++) {
      if (api[i].name.slice(3) === k) {
        t.pass(api[i].name)
        continue outer
      }
    }

    t.fail('gl.' + k)
  }

  t.end()
})

test('shutdown', function(t) {
  t.end()
  window.close()
})
