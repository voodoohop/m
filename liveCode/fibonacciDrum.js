

function* fibonacci() {
  let a = 0, b = 1;

  while(true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
export var fib = m().note()

.set({fib:m(fibonacci()).take(64).toArray()}).simpleMap(n => n.set({fibMod3: n.fib % 7}))
.set({count: m().count(0,1)})
.filter(n => n.count % 2 ==0)
.metro(1/2)
// .filter(n=> n.fibMod3 ===0)
.simpleMap(n => n.set({pitch:36+n.fibMod3*2}))

.simpleMap(n => {
    // log(n);
    return n;
})
;

log(m(fibonacci()).simpleMap(n=>n%7).take(32).toArray());
