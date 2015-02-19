

    var primes = [1, 3, 7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143, 4194301, 8388593, 16777213, 33554393, 67108859, 134217689, 268435399, 536870909, 1073741789, 2147483647],
      noSuchkey = "no such key",
      duplicatekey = "duplicate key";

    function isPrime(candidate) {
      if ((candidate & 1) === 0) { return candidate === 2; }
      var num1 = Math.sqrt(candidate),
        num2 = 3;
      while (num2 <= num1) {
        if (candidate % num2 === 0) { return false; }
        num2 += 2;
      }
      return true;
    }

    function getPrime(min) {
      var index, num, candidate;
      for (index = 0; index < primes.length; ++index) {
        num = primes[index];
        if (num >= min) { return num; }
      }
      candidate = min | 1;
      while (candidate < primes[primes.length - 1]) {
        if (isPrime(candidate)) { return candidate; }
        candidate += 2;
      }
      return min;
    }

log(isPrime(3));

import {CarimboScale} from "abletonClip_CarimboScale";
import {extendScaleToFullRange,getPitches,scaleToPitch} from "scaleTools";

var scale = extendScaleToFullRange(getPitches(CarimboScale));
log(scale);
log("hey")

function* fibonacci() {
  let a = 0, b = 1;

  while(true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
var fib2 = m().note()

.set({fib:m(fibonacci()).take(64).toArray()}).simpleMap(n => n.set({fibMod3: n.fib % 7}))
.set({count: m().count(0,1)})
.metro(1/4)
// .filter(n => isPrime(n.count))

// .filter(n=> n.fibMod3 ===0)
.simpleMap(n => n.set({pitch:30+n.fibMod3}))

.simpleMap(n => {
    // log(n);
    return n;
})
.swing(1/4,0.15)
.pitch(scaleToPitch(scale))
.automate("pitchBend", n=> Math.sin((n.target.time+n.time)*Math.PI/32)/2+0.5)
;




export var fib = fib2.filter(n => !isPrime(n.count)).bjorklund(16,9,2);

export var fib3 = fib2.filter(n => isPrime(n.count));



log(m(fibonacci()).simpleMap(n=>n%7).take(32).toArray());
