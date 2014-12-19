var _ = require("lodash");


export var immutableObj = function(initial={}, extendWith=undefined) {

  const me = Object.create(
  { set: (...args) => {
      var val=args[0];
      if (args.length > 1) {
        val = {[args[0]]:args[1]};
      }
      return immutableObj(me,val);
    }
  });
  for (let k of Object.keys(initial)) {
    me[k] = initial[k];
  }
  if (extendWith)
  for (let k of Object.keys(extendWith)) {
    me[k] = extendWith[k];
  }
  return Object.freeze(me);
}

export var addObjectProp = (obj, name, val, enumerable) => obj.set(name, val);
export var addObjectProps = (obj, props, enumerable) => {
  // console.log("adding to immuuutable",obj,props,obj.set);
  props = _.mapValues(props, (value) => (typeof value === "function" && value.length <= 1) ? value(obj) : value);
  return obj.set(props);
}
