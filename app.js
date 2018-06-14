// note run "node app.js" to start web service

// testing git
var express = require('express');
var path = require('path');
var db = require('ibm_db');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cors = require('cors');

process.env.UV_THREADPOOL_SIZE = 20;
console.log('Starting applicaton');
console.log('Opening connections to the database.');

var app = express();
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(require('./get_db'));
app.use(require('./ad'));

var port = process.env.PORT || 1338;

app.listen(port, function () {
    console.log('ready on port 1338');
});
