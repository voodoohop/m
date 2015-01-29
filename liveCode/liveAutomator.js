
    // playingClip.onValue(v => log(v));



    export var automato2Rr=m().note().metro(1);


    var getSmoothed=function(param) {
      //    return
      return param.sample(100).scan(null, (prev,next) => {
        //  log(prev);
        // return next;
        if (prev ===null)
          return next;

          //console.log("smooth9nghey");
          //   return next;
          var smoothed=prev;
          var dest = next;

          var diff = dest-smoothed;
          var smoothing = 0.95;

          var newVal = smoothing*smoothed + ((1-smoothing) * dest);
          return newVal;
        }).skip(1).map(v => v/127);
      };




      export var paramSmooth = m()
      .continuousAutomate("param1",(n, params, time) => {
        log("hey");
        return getSmoothed(params("1"))
      }
    )
    .continuousAutomate("param2",(n, params, time) => {
      //   log("hey");
      return getSmoothed(params("2"))
    })
    .continuousAutomate("param3",(n, params, time) => {
      //   log("hey");
      return getSmoothed(params("3"))
    })
    .continuousAutomate("param4",(n, params, time) => {
      //   log("hey");
      return getSmoothed(params("4"))
    })
    ;


      export var oneKnob = m()
      .continuousAutomate("param1",(n, params, time) => {
        // log("hey");
        var p1 = params("1").filter(v => v < 64).map(v => v/127).map(v => v*2);
        var p2 = params("2").filter(v => v >= 64).map(v => v/127).map(v => (v-0.5)*2);
        return p1;
      })
      .continuousAutomate("param2",(n, params, time) => {
        // log("hey");
        var p1 = params("3").filter(v => v < 64).map(v => v/127).map(v => v*2);
        var p2 = params("4").filter(v => v >= 64).map(v => v/127).map(v => (v-0.5)*2);
        return p1;
      });
    //   )
    //   ;


    // log(paramSmooth.toArray());
