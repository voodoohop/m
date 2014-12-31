


log("hi two and so on ");



export var miniSeq=m()
.evt({pitch:60, velocity:[0.8,0.5,0.7], duration:0.4})
.metro(0.25)
.simpleMap(n => {
    log(""+n.time); 
    
    log(""+n.velocity)
    return n;
})

miniSeq.take(5).toArray().forEach(log); 






log("me too");               



log("hi3 and so on");






log("me to2o");               

log("hi3 and so on");





log("me to4o");               

log("hiasda and so on");








