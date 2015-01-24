"use strict";
Object.defineProperties(exports, {
  obj: {get: function() {
      return obj;
    }},
  __esModule: {value: true}
});
var $__baseLib__,
    $___46__46__47_lib_47_logger__,
    $___46__46__47_lib_47_utils__,
    $___46__46__47_immutable_47_nodeProxiedImmutable__;
var m = ($__baseLib__ = require("./baseLib"), $__baseLib__ && $__baseLib__.__esModule && $__baseLib__ || {default: $__baseLib__}).m;
var log = ($___46__46__47_lib_47_logger__ = require("../lib/logger"), $___46__46__47_lib_47_logger__ && $___46__46__47_lib_47_logger__.__esModule && $___46__46__47_lib_47_logger__ || {default: $___46__46__47_lib_47_logger__}).default;
var getIterator = ($___46__46__47_lib_47_utils__ = require("../lib/utils"), $___46__46__47_lib_47_utils__ && $___46__46__47_lib_47_utils__.__esModule && $___46__46__47_lib_47_utils__ || {default: $___46__46__47_lib_47_utils__}).getIterator;
var immutableObj = ($___46__46__47_immutable_47_nodeProxiedImmutable__ = require("../immutable/nodeProxiedImmutable"), $___46__46__47_immutable_47_nodeProxiedImmutable__ && $___46__46__47_immutable_47_nodeProxiedImmutable__.__esModule && $___46__46__47_immutable_47_nodeProxiedImmutable__ || {default: $___46__46__47_immutable_47_nodeProxiedImmutable__}).immutableTom;
m().addGen(function* asyncData(subscribable, initialVal) {
  var latestVal = initialVal;
  subscribable.onValue((function(v) {
    return latestVal = immutableObj(v);
  }));
  var iterator = {next: (function() {
      var res = {
        value: latestVal,
        done: false
      };
      latestVal = null;
      return res;
    })};
  yield* iterator;
});
m().addGen(function* asyncDataLatest(subscribable, initialVal) {
  yield* getIterator(m().asyncData(subscribable, initialVal).scan(initialVal, (function(previous, next) {
    return next === null ? previous : next;
  })));
});
m().addGen(function* hotSwapper2(func, node) {
  log.info("hotswapper added to sequence " + node);
  var lastTime = -1;
  var activeSequenceIterator = getIterator(node);
  var hotSwapIterator = {next: (function() {
      var n = activeSequenceIterator.next();
      if (!n.done && n.value.time)
        lastTime = n.value.time;
      return n;
    })};
  var swapFunc = function(newSequence) {
    var startTime = arguments[1] !== (void 0) ? arguments[1] : null;
    if (startTime === null) {
      startTime = lastTime;
    }
    log.debug("swapping sequence " + node + " for new sequence" + newSequence);
    activeSequenceIterator = getIterator(m(newSequence).delay(Math.max(startTime, 0)));
  };
  func(swapFunc);
  yield* hotSwapIterator;
});
var swap;
var tst = m().evt({
  pitch: [60, 52, 68],
  velocity: [0.7, 0.3, 0.5],
  duration: [0.1, 0.1]
}).metro(2).hotSwapper2((function(f) {
  swap = f;
}));
log.debug(tst.take(10).toArray());
log.debug("sequence is" + tst);
var i = getIterator(tst);
log.debug(i.next().value);
log.debug(i.next().value);
log.debug(i.next().value);
log.debug(i.next().value);
swap(m().evt({
  pitch: 10,
  velocity: 0.2,
  duration: 0.1,
  swapped: true
}).metro(3.3));
log.debug(i.next().value);
log.debug(i.next().value);
log.debug(i.next().value);
log.debug(i.next().value);
m().addGen(function* hotSwapper(swapReference, fieldName, node) {
  fieldName = "" + fieldName;
  var lastTime = -1;
  var activeSequenceIterator = null;
  var activeSequence = null;
  activeSequence = swapReference[fieldName] || node;
  if (activeSequence)
    activeSequenceIterator = getIterator(activeSequence);
  var hotSwapIterator = {next: (function() {
      var n = activeSequenceIterator.next();
      if (!n.done && n.value.time)
        lastTime = n.value.time;
      return n;
    })};
  Object.observe(swapReference, function(changes) {
    log.debug("swap changes", changes);
    var filtered = changes.filter((function(c) {
      return c.name == fieldName;
    }));
    log.debug("filtered", filtered, filtered.length);
    if (filtered.length === 0)
      return;
    var newSequence = swapReference[fieldName];
    if (newSequence == activeSequence)
      return;
    activeSequence = newSequence;
    activeSequenceIterator = getIterator(m(newSequence));
    log.debug("swapped sequence for new sequence: " + newSequence);
  });
  yield* hotSwapIterator;
});
swap = {};
var tst2 = m().evt({
  pitch: [30, 52, 68],
  velocity: [0.7, 0.3, 0.5],
  duration: 0.1
}).metro(2).hotSwapper(swap, "swap");
log.debug("sequence2 is" + tst2);
i = getIterator(tst2);
log.debug("val", i.next().value);
log.debug("val", i.next().value);
log.debug("val", i.next().value);
log.debug("val", i.next().value);
swap.swap = m().evt({
  pitch: 10,
  velocity: 0.2,
  duration: 0.1,
  swapped: true
}).metro(3.3);
log.debug("val", i.next().value);
log.debug("val", i.next().value);
log.debug("val", i.next().value);
log.debug("val", i.next().value);
var obj = {};
Object.observe(obj, function(changes) {
  console.log(changes);
});
obj.name = "hemanth";
console.log("should have observed the change to hemanth");
