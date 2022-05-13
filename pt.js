require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
// const morgan = require('morgan');


const publicFolder = path.join(__dirname, 'public');
const node_modules = path.join(__dirname, 'node_modules');

const app = express();
app.set('port', process.env.PORT || 3014);
app.set('views', __dirname + '/views');
app.set('view_engine', 'ejs');


// app.use(morgan('dev'))
app.use(express.static(publicFolder));
app.use(express.static(node_modules));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const routes = require('./routes/routes');


app.use(routes);

if (process.env.NODE_ENV == "DEV") {
  const reload = require('reload');
//  var server = http.createServer(app);
  reload(app).then(function (reloadReturned) {
    var server = app.listen(app.get('port'), function(){
      console.info('Express node_env: ' + process.env.NODE_ENV  + " Port: "+server.address().port);
      server.on('connection', () =>{server.setTimeout(20*60*1000)})
    })
  }).catch((err) => { console.error('Reload could not start', err) });
}else{
  var server = app.listen(app.get('port'), function(){
    console.info('Express node_env: ' + process.env.NODE_ENV  + " Port: "+server.address().port);
    server.on('connection', () =>{server.setTimeout(20*60*1000)})
  });
}
