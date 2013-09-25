// global setting should appear in my_config.js file

var express = require('express')
var app = express();
var sprintf = require('util').format;

function hello(req, res){
	res.send('Hello World, Jobs Manager');
}

app.use(express.bodyParser());
app.get('/hello', hello);

app.listen(8080);