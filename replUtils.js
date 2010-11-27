/**
 * replUtils.js
 *
 * node-oriented repl utilities, including dumping routines.
 * These functions are intended to be complementary to node's REPL,
 * and in particular to node-replique, running via vim-noderepl.
 */

// I don't understand why these two functions do not do the same thing.


// These initial versions are very simplistic and lack slicing capabilities.

// Doesn't work (as expected?) for e.g. `dump(Object)`.
var dump = (function (o) { var a = {}; for (var i in o) { a[i] = o[i]; }; return a; });

// Dump using getOwnPropertyNames.
// This will print out the properties of Object.
// It will also print out, e.g. the `length` of an instantiated Array.
// Neither of these functions will print out methods like 
var dumpOwn = (function (o) { var a = {}; Object.getOwnPropertyNames(o).forEach(function (k) { a[k] = o[k]; }); return a; });

var dumpOwnConProto = (function (o) { var a = {}; Object.getOwnPropertyNames(o.constructor.prototype).forEach(function (k) { a[k] = o[k]; }); return a; });


// These versions are built from a common ancestor function
// and provide slicing facilities.

// Base dump function.
// This is intended to be useful even with a REPL that does not catch output.
// For this reason, it returns an object rather than logging to the console,
// with the expectation that the REPL will dump the object.
// In order to avoid interfering with this process,
// it renames any "toString" method "_toString".
//
// The optional `start` and `afterEnd` parameters
// provide slicing using Python-style range indices.
var _dump = function (getPropertyNames, o, start, afterEnd) {
  var keys = getPropertyNames(o);
  var start = start || 0;
  var afterEnd = afterEnd || keys.length;
  var ret = {};
  var key, destKey;
  for (var i = start; i < afterEnd; i++) {
    destKey = key = keys[i];
    // Side-step bootstrap issues by not overriding toString.
    // TODO: This should really prefix-escape anything matching /^_+toString$/.
    if (destKey === "toString") {
      destKey = "_toString";
    }
    ret[destKey] = o[key];
  }
  return ret;
}

// Doesn't work (as expected?) for e.g. `dump(Object)`.
var dump = _dump.bind(this, function (o) {
  var a = [];
  for (var i in o) a.push(i);
  return a
});

// Determine properties using Object.getOwnPropertyNames.
// This will print out the properties of Object.
// It will also print out, e.g. the `length` of an instantiated Array.
// Neither of these functions will print out builtin methods like 
// e.g. Array.prototype.push if called on an instantiated array.
var dumpOwn = _dump.bind(this, Object.getOwnPropertyNames);

// Determine properties using Object.getOwnPropertyNames,
// called on the prototype of the constructor of the passed object.
// This will dump the builtins (one level deep)
// but breaks for Array.toString for some reason, with this error message:
//     TypeError: Array.prototype.toString is not generic
var dumpOwnConProto = _dump.bind(this, function (o) {
  return Object.getOwnPropertyNames(o.constructor.prototype);
});
