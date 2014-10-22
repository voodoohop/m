return;
var repl = require("repl");
var envName = process.env.NODE_ENV || "dev";
var replServer = repl.start({
    prompt: "TomMusic (" + envName + ") > ",
      input: process.stdin,
      output: process.stdout
});

replServer.context.m = m;
//replServer.context.play = play;

replServer.context.t = t;
//replServer.context.stop = stop;
