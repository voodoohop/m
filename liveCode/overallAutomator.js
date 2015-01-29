

export var songUnit=4*4;
export var songStructureUnit=songUnit*1;

export var periodicEaser = function(time,easeType, period) { 
    var easingFunc = easer().using(easeType );
    var x = (time % (period))/(period);
    var prop = easingFunc(x); 
    return prop;
}

export var break1=songStructureUnit;

export var  growToBreak = function(breakMoment) {   
    return n => periodicEaser(n.time+n.target.time, "in-cubic", breakMoment);
};
 
export var growToBreak1 = growToBreak(break1);

export var songUnitEaser = n => (n.time+n.target.time) % songUnit <songUnit/2 ? periodicEaser(n.time+n.target.time,"in-cubic", songUnit/2) :
                                                           1-periodicEaser(n.time+n.target.time,"in-cubic", songUnit/2) ;
                                                           
                                                           
export var songUnitEaser4 = n => (n.time+n.target.time) % songUnit*4 <songUnit/2*4 ? periodicEaser(n.time+n.target.time,"in-cubic", songUnit/2*4) :
                                                           1-periodicEaser(n.time+n.target.time,"in-cubic", songUnit/2*4) ;                                                
                                                           
                                                           

export var chorusFilter = (node) => node.filter(n => n.time>songUnit*6 && n.time % songStructureUnit < songStructureUnit*0.75);


export var kickFilter = (node) => node.filter(n => n.time>songUnit*6 && n.time%(songUnit*4) < songUnit*4-2  );

export var hatFilter = (node) => node.filter(n => n.time>songUnit*8 && n.time%(songUnit*8) < songUnit*8-3  );

