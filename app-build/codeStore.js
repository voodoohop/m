"use strict";
Object.defineProperties(exports, {
  codeStore: {get: function() {
      return codeStore;
    }},
  onCodeLoaded: {get: function() {
      return onCodeLoaded;
    }},
  baconStore: {get: function() {
      return baconStore;
    }},
  __esModule: {value: true}
});
var Bacon = require("baconjs");
var nStore = require("nstore");
nStore = nStore.extend(require('nstore/query')());
var storeLoaded = false;
var storeLoadedListeners = [];
var codeStore = nStore.new("code.db", (function() {
  storeLoaded = true;
  storeLoadedListeners.forEach((function(l) {
    return l();
  }));
}));
var onCodeLoaded = function(listener) {
  if (storeLoaded)
    listener();
  storeLoadedListeners.push(listener);
};
var baconStore = new Bacon.Bus();
baconStore.onValue((function(s) {
  if (s.sequence) {
    codeStore.get(s.device, function(err, prevCode) {
      if (prevCode == undefined)
        prevCode = "";
      var prevCode = prevCode.replace("export var " + s.name + " = ", "var " + s.name + Math.floor(Math.random() * 100000) + " = ");
      var newCode = "" + prevCode + ";\n export var " + s.name + " = " + s.sequence.toString() + ";";
      console.log("saving new code for ", s.device, newCode);
      codeStore.save(s.device, newCode, function(err) {
        console.log("stored code", s);
      });
    });
  } else
    codeStore.save(s.device, s.code, function(err) {
      console.log("stored code", s);
    });
}));
