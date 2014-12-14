"use strict";
Object.defineProperties(exports, {
  wu: {get: function() {
      return wu;
    }},
  __esModule: {value: true}
});
var wu = null;
(function() {
  "use strict";
  wu = function(iterable) {
    if (!isIterable(iterable)) {
      throw new Error("wu: `" + iterable + "` is not iterable!");
    }
    return new Wu(iterable);
  };
  function Wu(iterable) {
    var iterator = getIterator(iterable);
    this.next = iterator.next.bind(iterator);
  }
  wu.prototype = Wu.prototype;
  Object.defineProperty(wu, "iteratorSymbol", {value: (function() {
      if (typeof Proxy === "function") {
        var symbol;
        try {
          var proxy = new Proxy({}, {get: (function(_, name) {
              symbol = name;
              throw Error();
            })});
          for (var $__0 = proxy[$traceurRuntime.toProperty(Symbol.iterator)](),
              $__1; !($__1 = $__0.next()).done; ) {
            var _ = $__1.value;
            {
              break;
            }
          }
        } catch (e) {}
        if (symbol) {
          return symbol;
        }
      }
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        return Symbol.iterator;
      }
      throw new Error("Cannot find iterator symbol.");
    }())});
  wu.prototype[wu.iteratorSymbol] = function() {
    return this;
  };
  var MISSING = {};
  var isIterable = (function(thing) {
    return thing && typeof thing[wu.iteratorSymbol] === "function";
  });
  var getIterator = (function(thing) {
    if (isIterable(thing)) {
      return thing[wu.iteratorSymbol]();
    }
    throw new TypeError("Not iterable: " + thing);
  });
  var staticMethod = (function(name, fn) {
    fn.prototype = Wu.prototype;
    wu[name] = fn;
  });
  var prototypeAndStatic = (function(name, fn) {
    var expectedArgs = arguments[2] !== (void 0) ? arguments[2] : fn.length;
    fn.prototype = Wu.prototype;
    Wu.prototype[name] = fn;
    expectedArgs += 1;
    wu[name] = wu.curryable((function() {
      var $__11;
      for (var args = [],
          $__4 = 0; $__4 < arguments.length; $__4++)
        args[$__4] = arguments[$__4];
      var iterable = args.pop();
      return ($__11 = wu(iterable))[name].apply($__11, $traceurRuntime.spread(args));
    }), expectedArgs);
  });
  var rewrap = (function(fn) {
    return function() {
      var $__11;
      for (var args = [],
          $__4 = 0; $__4 < arguments.length; $__4++)
        args[$__4] = arguments[$__4];
      return wu(($__11 = fn).call.apply($__11, $traceurRuntime.spread([this], args)));
    };
  });
  var rewrapStaticMethod = (function(name, fn) {
    return staticMethod(name, rewrap(fn));
  });
  var rewrapPrototypeAndStatic = (function(name, fn, expectedArgs) {
    return prototypeAndStatic(name, rewrap(fn), expectedArgs);
  });
  function curry(fn, args) {
    return function() {
      var $__11;
      for (var moreArgs = [],
          $__4 = 0; $__4 < arguments.length; $__4++)
        moreArgs[$__4] = arguments[$__4];
      return ($__11 = fn).call.apply($__11, $traceurRuntime.spread([this], args, moreArgs));
    };
  }
  staticMethod("curryable", (function(fn) {
    var expected = arguments[1] !== (void 0) ? arguments[1] : fn.length;
    return function f() {
      for (var args = [],
          $__4 = 0; $__4 < arguments.length; $__4++)
        args[$__4] = arguments[$__4];
      return args.length >= expected ? fn.apply(this, args) : curry(f, args);
    };
  }));
  rewrapStaticMethod("entries", function*(obj) {
    for (var $__0 = Object.keys(obj)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var k = $__1.value;
      {
        yield [k, obj[k]];
      }
    }
  });
  rewrapStaticMethod("keys", function*(obj) {
    yield* Object.keys(obj);
  });
  rewrapStaticMethod("values", function*(obj) {
    for (var $__0 = Object.keys(obj)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var k = $__1.value;
      {
        yield obj[k];
      }
    }
  });
  rewrapPrototypeAndStatic("cycle", function*() {
    var saved = [];
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        yield x;
        saved.push(x);
      }
    }
    while (saved) {
      yield* saved;
    }
  });
  rewrapStaticMethod("count", function*() {
    var start = arguments[0] !== (void 0) ? arguments[0] : 0;
    var step = arguments[1] !== (void 0) ? arguments[1] : 1;
    var n = start;
    while (true) {
      yield n;
      n += step;
    }
  });
  rewrapStaticMethod("repeat", function*(thing) {
    var times = arguments[1] !== (void 0) ? arguments[1] : Infinity;
    if (times === Infinity) {
      while (true) {
        yield thing;
      }
    } else {
      for (var i = 0; i < times; i++) {
        yield thing;
      }
    }
  });
  rewrapStaticMethod("chain", function*() {
    for (var iterables = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      iterables[$__4] = arguments[$__4];
    for (var $__0 = iterables[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var it = $__1.value;
      {
        yield* it;
      }
    }
  });
  rewrapPrototypeAndStatic("chunk", function*() {
    var n = arguments[0] !== (void 0) ? arguments[0] : 2;
    var items = [];
    var index = 0;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var item = $__1.value;
      {
        items[index++] = item;
        if (index === n) {
          yield items;
          items = [];
          index = 0;
        }
      }
    }
    if (index) {
      yield items;
    }
  }, 1);
  rewrapPrototypeAndStatic("concatMap", function*(fn) {
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        yield* fn(x);
      }
    }
  });
  rewrapPrototypeAndStatic("drop", function*(n) {
    var i = 0;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (i++ < n) {
          continue;
        }
        yield x;
        break;
      }
    }
    yield* this;
  });
  rewrapPrototypeAndStatic("dropWhile", function*() {
    var fn = arguments[0] !== (void 0) ? arguments[0] : Boolean;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (fn(x)) {
          continue;
        }
        yield x;
        break;
      }
    }
    yield* this;
  }, 1);
  rewrapPrototypeAndStatic("enumerate", function*() {
    yield* _zip([this, wu.count()]);
  });
  rewrapPrototypeAndStatic("filter", function*() {
    var fn = arguments[0] !== (void 0) ? arguments[0] : Boolean;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (fn(x)) {
          yield x;
        }
      }
    }
  }, 1);
  rewrapPrototypeAndStatic("flatten", function*() {
    var shallow = arguments[0] !== (void 0) ? arguments[0] : false;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (typeof x !== "string" && isIterable(x)) {
          yield* (shallow ? x : wu(x).flatten());
        } else {
          yield x;
        }
      }
    }
  }, 1);
  rewrapPrototypeAndStatic("invoke", function*(name) {
    var $__11;
    for (var args = [],
        $__5 = 1; $__5 < arguments.length; $__5++)
      args[$__5 - 1] = arguments[$__5];
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        yield ($__11 = x)[name].apply($__11, $traceurRuntime.spread(args));
      }
    }
  });
  rewrapPrototypeAndStatic("map", function*(fn) {
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        yield fn(x);
      }
    }
  });
  rewrapPrototypeAndStatic("pluck", function*(name) {
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        yield x[name];
      }
    }
  });
  rewrapPrototypeAndStatic("reductions", function*(fn) {
    var initial = arguments[1];
    var val = initial;
    if (val === undefined) {
      for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__1; !($__1 = $__0.next()).done; ) {
        var x = $__1.value;
        {
          val = x;
          break;
        }
      }
    }
    yield val;
    for (var $__2 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      var x$__12 = $__3.value;
      {
        yield (val = fn(val, x$__12));
      }
    }
    return val;
  }, 2);
  rewrapPrototypeAndStatic("reject", function*() {
    var fn = arguments[0] !== (void 0) ? arguments[0] : Boolean;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (!fn(x)) {
          yield x;
        }
      }
    }
  }, 1);
  rewrapPrototypeAndStatic("slice", function*() {
    var start = arguments[0] !== (void 0) ? arguments[0] : 0;
    var stop = arguments[1] !== (void 0) ? arguments[1] : Infinity;
    if (stop < start) {
      throw new RangeError("parameter `stop` (= " + stop + ") must be >= `start` (= " + start + ")");
    }
    for (var $__0 = this.enumerate()[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var $__9 = $__1.value,
          x = $__9[0],
          i = $__9[1];
      {
        if (i < start) {
          continue;
        }
        if (i >= stop) {
          break;
        }
        yield x;
      }
    }
  }, 2);
  rewrapPrototypeAndStatic("spreadMap", function*(fn) {
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        yield fn.apply(null, $traceurRuntime.spread(x));
      }
    }
  });
  rewrapPrototypeAndStatic("take", function*(n) {
    if (n < 1) {
      return;
    }
    var i = 0;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        yield x;
        if (++i >= n) {
          break;
        }
      }
    }
  });
  rewrapPrototypeAndStatic("takeWhile", function*() {
    var fn = arguments[0] !== (void 0) ? arguments[0] : Boolean;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (!fn(x)) {
          break;
        }
        yield x;
      }
    }
  }, 1);
  rewrapPrototypeAndStatic("tap", function*() {
    var fn = arguments[0] !== (void 0) ? arguments[0] : console.log.bind(console);
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        fn(x);
        yield x;
      }
    }
  }, 1);
  rewrapPrototypeAndStatic("unique", function*() {
    var seen = new Set();
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (!seen.has(x)) {
          yield x;
          seen.add(x);
        }
      }
    }
    seen.clear();
  });
  var _zip = rewrap(function*(iterables) {
    var longest = arguments[1] !== (void 0) ? arguments[1] : false;
    if (!iterables.length) {
      return;
    }
    var iters = iterables.map(getIterator);
    var numIters = iterables.length;
    var numFinished = 0;
    var finished = false;
    while (!finished) {
      var zipped = [];
      for (var $__0 = iters[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__1; !($__1 = $__0.next()).done; ) {
        var it = $__1.value;
        {
          var $__9 = it.next(),
              value = $__9.value,
              done = $__9.done;
          if (done) {
            if (!longest) {
              return;
            }
            if (++numFinished == numIters) {
              finished = true;
            }
          }
          if (value === undefined) {
            zipped.length++;
          } else {
            zipped.push(value);
          }
        }
      }
      yield zipped;
    }
  });
  rewrapStaticMethod("zip", function*() {
    for (var iterables = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      iterables[$__6] = arguments[$__6];
    yield* _zip(iterables);
  });
  rewrapStaticMethod("zipLongest", function*() {
    for (var iterables = [],
        $__7 = 0; $__7 < arguments.length; $__7++)
      iterables[$__7] = arguments[$__7];
    yield* _zip(iterables, true);
  });
  rewrapStaticMethod("zipWith", function*(fn) {
    for (var iterables = [],
        $__8 = 1; $__8 < arguments.length; $__8++)
      iterables[$__8 - 1] = arguments[$__8];
    yield* _zip(iterables).spreadMap(fn);
  });
  wu.MAX_BLOCK = 15;
  wu.TIMEOUT = 1;
  prototypeAndStatic("asyncEach", function(fn) {
    var maxBlock = arguments[1] !== (void 0) ? arguments[1] : wu.MAX_BLOCK;
    var timeout = arguments[2] !== (void 0) ? arguments[2] : wu.TIMEOUT;
    var iter = getIterator(this);
    return new Promise((function(resolve, reject) {
      (function loop() {
        var start = Date.now();
        for (var $__0 = iter[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__1; !($__1 = $__0.next()).done; ) {
          var x = $__1.value;
          {
            try {
              fn(x);
            } catch (e) {
              reject(e);
              return;
            }
            if (Date.now() - start > maxBlock) {
              setTimeout(loop, timeout);
              return;
            }
          }
        }
        resolve();
      }());
    }));
  }, 3);
  prototypeAndStatic("every", function() {
    var fn = arguments[0] !== (void 0) ? arguments[0] : Boolean;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (!fn(x)) {
          return false;
        }
      }
    }
    return true;
  }, 1);
  prototypeAndStatic("find", function(fn) {
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (fn(x)) {
          return x;
        }
      }
    }
  });
  prototypeAndStatic("forEach", function(fn) {
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        fn(x);
      }
    }
  });
  prototypeAndStatic("has", function(thing) {
    return this.some((function(x) {
      return x === thing;
    }));
  });
  prototypeAndStatic("reduce", function(fn) {
    var initial = arguments[1];
    var val = initial;
    if (val === undefined) {
      for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__1; !($__1 = $__0.next()).done; ) {
        var x = $__1.value;
        {
          val = x;
          break;
        }
      }
    }
    for (var $__2 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      var x$__13 = $__3.value;
      {
        val = fn(val, x$__13);
      }
    }
    return val;
  }, 2);
  prototypeAndStatic("some", function() {
    var fn = arguments[0] !== (void 0) ? arguments[0] : Boolean;
    for (var $__0 = this[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__1; !($__1 = $__0.next()).done; ) {
      var x = $__1.value;
      {
        if (fn(x)) {
          return true;
        }
      }
    }
    return false;
  }, 1);
  prototypeAndStatic("toArray", function() {
    return $traceurRuntime.spread(this);
  });
  var MAX_CACHE = 500;
  var _tee = rewrap(function*(iterator, cache) {
    var items = cache.items;
    var index = 0;
    while (true) {
      if (index === items.length) {
        var $__10 = iterator.next(),
            done = $__10.done,
            value = $__10.value;
        if (done) {
          if (cache.returned === MISSING) {
            cache.returned = value;
          }
          break;
        }
        yield items[index++] = value;
      } else if (index === cache.tail) {
        var value$__14 = items[index];
        if (index === MAX_CACHE) {
          items = cache.items = items.slice(index);
          index = 0;
          cache.tail = 0;
        } else {
          items[index] = undefined;
          cache.tail = ++index;
        }
        yield value$__14;
      } else {
        yield items[index++];
      }
    }
    if (cache.tail === index) {
      items.length = 0;
    }
    return cache.returned;
  });
  _tee.prototype = Wu.prototype;
  prototypeAndStatic("tee", function() {
    var n = arguments[0] !== (void 0) ? arguments[0] : 2;
    var iterables = new Array(n);
    var cache = {
      tail: 0,
      items: [],
      returned: MISSING
    };
    while (n--) {
      iterables[n] = _tee(this, cache);
    }
    return iterables;
  }, 1);
  prototypeAndStatic("unzip", function() {
    var n = arguments[0] !== (void 0) ? arguments[0] : 2;
    return this.tee(n).map((function(iter, i) {
      return iter.pluck(i);
    }));
  }, 1);
  wu.tang = {clan: 36};
  return wu;
})();
