var fs = require('fs');
var http = require('http');
var PORT = process.env.PORT || 3303;

var server = http.createServer(function(req, res) {
  var fileStream = fs.createReadStream('index.html');
  fileStream.pipe(res);
});
server.listen(PORT, '0.0.0.0'); // start
