var util = require('util');

var colors = require('colors');

var oldLog= console.log;

var lengthLimit = 20000;
var limitStringLength = (s) => s.length>lengthLimit ? (s.substring(0,lengthLimit)).yellow+"...".bold.underline : s;

var toStringForLog =  (a, depth=1) => {
  if (a === undefined)
    return "undefined".bgMagenta;
  if (a=== null)
    return "null".bgMagenta;
  if (typeof a == "string")
    return depth > 0 ? '"'+limitStringLength(a)+'"' : limitStringLength(a);
    if (typeof a == "object" && a.isTom)
      return toStringForLog(""+a);
    if (depth > 0 && typeof a == "object" && !util.isArray(a)) {
        return "{ "+Object.keys(a).map(key => key.bold+ ": " + toStringForLog(a[key],0)).join(", ")+" }";
      }

      return limitStringLength(util.inspect(a,{colors:true}));
    }

    var newLog = bgCol => function(...args) {
      var mapped = args.map(toStringForLog);
      if (bgCol)
        mapped = mapped.map(a => a[bgCol]);
      oldLog(...mapped);
    }

    console.log = newLog(null);
    console.warn = newLog("bgMagenta");
    console.error = newLog("bgRed");
