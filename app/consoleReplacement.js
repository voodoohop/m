
export default {
  log: function(...args) {
    var mapped = args.map(a => a.toString()).map(s => s.length>100 ? (s.substring(0,100)+"...").green : s);
    console.log(...mapped);
  }
}
