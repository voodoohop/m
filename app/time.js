
import {generatorize} from "./lib/utils";

var Bacon = require("baconjs");

export var t = {
  beatsPerBar: 4,
  beats: generatorize((n) => n * 480),
  bars: generatorize((n) => n*t.beatsPerBar),
  nth: generatorize((n) => 1.0/n)
}
