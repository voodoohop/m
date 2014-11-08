
var Bacon = require("baconjs");
import {BaconSequencer} from "./tomSequencer";

export default function(sequenceSubscribe, abletonSender, time, resetMessages) {
  //console.log(sequenceSubscribe);
  sequenceSubscribe.log("seqSubsribe");

  var newSequenceBus = new Bacon.Bus();


  var availableSequences = {};

  var playSequencer = (sequencer,inst) => sequencer.onValue((playFunc) => playFunc(inst));
  var playingSequences = {};

  var Sequencer = BaconSequencer(time);

  var instrumentPlayer = function(seq) {

    if (playingSequences[seq.name])
      playingSequences[seq.name].stop();
    console.log("creating instrument for",seq.name);
    var seqInst = abletonSender.instrument(seq.name);

    playingSequences[seq.name] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst), sequence: seq.sequence};
    resetMessages.onValue(() => {
       playingSequences[seq.name].stop();
       playingSequences[seq.name] = {stop: playSequencer(Sequencer(seq.sequence,seq.name),seqInst), sequence: seq.sequence};
    });
  }

  newSequenceBus.onValue(instrumentPlayer);

  return {playingSequences: playingSequences, newSequence: newSequenceBus}
}
