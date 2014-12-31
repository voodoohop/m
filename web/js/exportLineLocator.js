var esprima = require("esprima-fb");

module.exports = function(code) {
  console.log("analysing with esprima", code);
  var ast = esprima.parse(code,{loc: true});
  var res = ast.body.filter(function (n) { return n.type=="ExportDeclaration"}).map(n => n.declaration.declarations[0].id);
  console.log("fond dec",res);
  return res;
}
