exports.Twitter = function(){};
exports.Twitter.prototype = new process.EventEmitter();
exports.Twitter.prototype.readStream = function(site,delay) {
	var self = this;
	var user = 'username';
	var pass = 'password';

	var auth = 'Basic ' + new Buffer(user + ':' + pass).toString('base64');
	var header = {'Host': 'stream.twitter.com', 'Authorization': auth};
	var request = site.request("GET", "/1/statuses/sample.json", header);

	request.end();
	request.on('response', function(response) {
		response.setEncoding('utf8');
		// back off linearly on tcp error
		response.on('close',function(error) {
			console.log(error);
			if(delay > 0) {
				delay = Math.min(16000,delay + 250)
			} else {
				delay = 250;
			}
			var callback = function() {
				readStream(site,delay)
			}
			var t = setTimeout(callback, delay);
		});
		// back off exponentially on http error
		response.on('end', function() {
			console.log(response.statusCode);
			if(response.statusCode > 400) {
				if(delay > 0) {
					delay = Math.min(240000,2*delay)
				} else {
					delay = 10000;
				}
				var callback = function() {
					readStream(site,delay)
				}
				var t = setTimeout(callback, delay);
			}
		});
		// read the stream and pop each status onto the queue
		var buffer = "";
		var curPosition = 0;
		response.on('data', function(chunk) {
			buffer += chunk;
			delemitedPosition = buffer.indexOf('\n')
			if(delemitedPosition > -1) {
				tweet = buffer.substring(0,delemitedPosition);
				buffer = buffer.substring(delemitedPosition + 1, buffer.length);
				delemitedPosition = buffer.indexOf('\n');
				// ignore extra new lines from the stream
				if(tweet.length > 0) {
					self.emit('tweet',tweet);
				}
			}
		});
	});
}


