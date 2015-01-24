export var carimboKick = m().evt({pitch:60, velocity:0.8, duration:0.1}).metro(1).bjorklund(16,9,2).automate("param1",n=> {
return Math.sin((n.time+n.target.time)*8)/2+0.5; 

});

export var carimboHat = m().evt({pitch:60, velocity:0.8, duration:0.1}).metro(1).bjorklund(8,5,0).automate("param1",n=> {
return Math.sin((n.time+n.target.time/8))/2+0.5; 

}).automate("param2",n=> {
return Math.sin(((n.time+n.target.time)/8))/2+0.5; 

});