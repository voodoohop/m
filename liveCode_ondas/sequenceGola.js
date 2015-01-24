



export var gola = m().evt({pitch:[60,52,68], velocity: [0.7,0.3,0.5], duration : [0.1,0.1]})
.metro(2)
.simpleMap(n => n.time % 16 < 2 ? n.set({velocity:0.3, color:"yellow"}): n)
.automate("param1", n => {
    return Math.sin((n.target.time+n.time) * Math.PI*2/32)/2+0.5;
}); 

