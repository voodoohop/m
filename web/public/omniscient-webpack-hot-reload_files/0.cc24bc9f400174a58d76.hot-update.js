webpackHotUpdate(0,{

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	

	var component = __webpack_require__(9);
	var React = __webpack_require__(11);

	var noteRect = (function () {
	    var componentReloadable = __webpack_require__(14);
	    var args = [].slice.call(arguments);
	    var c = componentReloadable.apply(null,
	                [__webpack_require__(9)].concat(args));
	    if (true) {
	      module.hot.accept(function (err) {
	        if (err) console.error(err);
	      });
	      module.hot.dispose(function () {
	        setTimeout(c.reload, 0);
	      });
	    }
	    return c;
	  })("noteRect", function(note) {
	  if (note.evt)
	    return noteRect(note.evt);
	  var timeScale=1/16;
	  var col = note.color || "rgba(255,255,255,1)";
	  var opacity=note.velocity/1.25+0.25;
	  return React.createElement("rect", {opacity: opacity, fill: col, x: note.time * timeScale, y: note.pitch/127, width: note.duration * timeScale, height: 1/16})
	});
	//
	var noteLine = (function () {
	    var componentReloadable = __webpack_require__(14);
	    var args = [].slice.call(arguments);
	    var c = componentReloadable.apply(null,
	                [__webpack_require__(9)].concat(args));
	    if (true) {
	      module.hot.accept(function (err) {
	        if (err) console.error(err);
	      });
	      module.hot.dispose(function () {
	        setTimeout(c.reload, 0);
	      });
	    }
	    return c;
	  })("noteAutomation", function(note,index,notes) {
	  if (index == 0)
	    return null;
	  var prevNote=notes[index-1];
	  var timeScale=1/16;
	  var col = note.color || "rgba(255,255,255,1)";
	;
	  var coords = {
	    x1: note.time * timeScale,
	    x2: prevNote.time * timeScale,
	    y1: note.automationVal,
	    y2: prevNote.automationVal
	  };
	  return React.createElement("line", React.__spread({},  coords))
	});

	var evtRender = (function () {
	    var componentReloadable = __webpack_require__(14);
	    var args = [].slice.call(arguments);
	    var c = componentReloadable.apply(null,
	                [__webpack_require__(9)].concat(args));
	    if (true) {
	      module.hot.accept(function (err) {
	        if (err) console.error(err);
	      });
	      module.hot.dispose(function () {
	        setTimeout(c.reload, 0);
	      });
	    }
	    return c;
	  })("evtRender", function(note,index,notes) {
	  if (note.hasOwnProperty("pitch") && note.hasOwnProperty("velocity") && note.velocity)
	   return noteRect(note.evt || note);

	  //  if (note.hasOwnProperty("automationVal"))
	  //    return automationPath;
	  return null;
	});



	module.exports = (function () {
	    var componentReloadable = __webpack_require__(14);
	    var args = [].slice.call(arguments);
	    var c = componentReloadable.apply(null,
	                [__webpack_require__(9)].concat(args));
	    if (true) {
	      module.hot.accept(function (err) {
	        if (err) console.error(err);
	      });
	      module.hot.dispose(function () {
	        setTimeout(c.reload, 0);
	      });
	    }
	    return c;
	  })("generatorPreview", function(gens) {
	  console.log("genPreview",gens);
	  var evts = gens.eventSample;
	  var style={display:"inline-block", width:"220px", height:"80px", border: "1px solid white"};
	  var SIZE = 1;
	  var svgAttrs = {
	    preserveAspectRatio: 'none', // stretch to fill container
	    viewBox: '0 0 ' + SIZE + ' ' + SIZE,
	    style: { height: '100%', width: '100%', display: 'block', padding: "3px"}
	  };
	  var notes = evts.filter(function(event) {
	    return event.hasOwnProperty("pitch") && event.hasOwnProperty("velocity") && event.velocity;
	  });
	  // var automations=evts.filter(function(event) {
	  //   return event.hasOwnProperty("automationVal");
	  // });
	  return React.createElement("div", {style: style}, React.createElement("svg", React.__spread({className: "noteView"},  svgAttrs), evts.map(evtRender)));
	});


/***/ }

})