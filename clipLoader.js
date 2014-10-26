function log() {
  for(var i=0,len=arguments.length; i<len; i++) {
    var message = arguments[i];
    if(message && message.toString) {
      var s = message.toString();
      if(s.indexOf("[object ") >= 0) {
        s = JSON.stringify(message);
      }
      post(s);
    }
    else if(message === null) {
      post("<null>");
    }
    else {
      post(message);
    }
  }
  post("\n");
}
 
log("___________________________________________________");
log("Reload:", new Date);


function getclip_content() {
   //fillGlobalVar()
   var api = new LiveAPI("live_set view detail_clip");
   var selected = api.call("select_all_notes");
   var rawNotes = api.call("get_selected_notes");
   var clip = new LiveAPI("live_set view highlighted_clip_slot clip");
   var loopStart = api.get("loop_start")[0];
   var loopEnd = api.get("loop_end")[0];
   var name= api.get("name")[0];

   if (rawNotes[0] !== "notes") {
      return "Unexpected note output!"
   }

   var newclip = []
   var maxNumNotes = rawNotes[1];

   for (var i = 2; i < (maxNumNotes * 6); i += 6) {
      var note = rawNotes[i + 1]
      var tm = rawNotes[i + 2]
      var dur = rawNotes[i + 3]
      var velo = rawNotes[i + 4]
      var muted = rawNotes[i + 5] === 1

      // if this is a valid note
      if (rawNotes[i] === "note") {// && _.isNumber(note) && _.isNumber(tm) && _.isNumber(dur) && _.isNumber(velo)) {
         newclip.push( {time:tm, pitch:note, velocity:velo, duration:dur} )
      } else {
         return "unkown note returned by Live"
      }
   }

   /* Live doesnt return the events in a sorted order. We do: <3 underscore */
   //newclip = __.sortBy(newclip, function(n) { n[0] })

   return {name:name, loopStart:loopStart, loopEnd:loopEnd, notes:newclip};
}

function bang() {
  var clip_content = getclip_content();
  log(clip_content);
  var oscOut = "/abletonClipNotes";
  outlet(0,[oscOut,JSON.stringify(clip_content)]);
}