var lib = require('./twitter.js');
var client = new lib.Twitter();
var http = require("http");
var site = http.createClient(80, "stream.twitter.com");

client.on('tweet',function(tweet){
	console.log(tweet);
});

client.readStream(site, 0);
