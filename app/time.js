
import {generatorize} from "./utils";

var Bacon = require("baconjs");

export var t = {
  beatsPerBar: 4,
  beats: generatorize((n) => n * 480),
  bars: generatorize((n) => t.beats(n*t.beatsPerBar)),
  nth: generatorize((n) => t.beats(1.0/n))
}
