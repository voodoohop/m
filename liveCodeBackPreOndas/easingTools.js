

export function easeAutomate(easeType,paramName, startVal, endVal) {
    var easer = new Easer(easeType);
    return function(node) { 
       return node.automate(paramName, n => easer(n.time/n.duraration));
    }
}