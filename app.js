/// IMPORTS AND PRE REQS
var express = require('express');
var AWS = require('aws-sdk')
var path = require('path');
var fs = require('fs');
var atob = require('atob')
var im = require('imagemagick');

// CONSTANTS AND API KEYS
const PORT = process.env.PORT || 3000;


const config = {
    accessKeyId: "",
    secretAccessKey: "",
    region: "us-east-2"

};

// Instancate OBJECTS
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


app.use(express.static(__dirname + '/public'));

// PAGE BUILDING STUFF
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})
app.get('/sign-in', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/map.html'));
});
app.get('/profile', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/profile.html'));
});
app.get('/chat', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/chat.html'));
});
app.get('/dashboard', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/dash.html'));
});





server.listen(PORT);
console.log("CHECKING PORT " + PORT)
var RANDUSERSNUM = 10;
var summary = []
var locations = [];
var geocode = [];

io.on('connection', function(socket){

  socket.on('clearloccash', function(){
    locations = [];
    geocode = [];
  });

  socket.on('storesummary', function(sum){
    summary = sum;
  });

  socket.on('storeloc', function(place_loc){
    locations = place_loc;
  });

  socket.on('storegeocode', function(place_geocode){
    geocode = place_geocode;
  });

  socket.on('getgeodata', function(sender){
    console.log("--GeoData Request--");
    console.log(locations);
    console.log(geocode);
    io.to(sender).emit('postgeodata', [locations, geocode]);
  });

  socket.on('getsummary', function(sender){
    console.log("--Summary Request--");
    for (var i = 0; i < summary.length; i++){
        console.log(summary);
    }
    io.to(sender).emit('postsumdata', summary);
  });

});
