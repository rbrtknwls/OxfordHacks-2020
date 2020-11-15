
var socket = io.connect();
socket.on('connect', () => {
  //API INITIAL
  var platform = new H.service.Platform({
    'apikey': 'IbG53sHTYaARLs7f0i9qHEchQPMwQd8QoKUzYSlxC8M'
  });
  const service = platform.getXYZService({
    token: 'AOJw_eE1TdWCkyF1ZXJHPAA'
  });
  var serv = platform.getSearchService();
    var publicTransitService = platform.getPublicTransitService();

  locs = []
  geos = []
  lista = []
  summary = []
  var totalWalk = 0.0;
  var totalTransit = 0.0;
  var data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

  socket.on('postloc', function(loc1, loc2){
    locs = []
    geos = []
    lista = []
    summary = []
    var data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

    var totalWalk = 0.0;
    var totalTransit = 0.0;
     console.log(loc1)
      console.log(loc2)
    get_summary(loc1,loc2);
    get_hist(loc1, loc2);
    makerouts([loc1,loc2])

  });

  socket.on('postallloc', function(loc){
    locs = []
    geos = []
    lista = []
    summary = []
    var data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    var totalWalk = 0.0;
    var totalTransit = 0.0;

    console.log(loc)
    makerouts(loc);
    get_summary_wrap(loc);
    get_hist_wrap(loc);

  });

  function getloc(Tabnum){
    socket.emit('getloc', parseInt(Tabnum), parseInt(Tabnum)+1, socket.id);
  }

  function getallloc(){
    socket.emit('getallloc', socket.id);
  }


  function getGeoData() {
    socket.emit("getgeodata", socket.id)

    socket.on("postgeodata", function (dict) {
      locs = dict[0]
      geos = dict[1]
    });

    setTimeout(function () {
      makerouts(geos);

    }, 3000);

  }


  function storeGeoData(lop) {
    socket.emit('clearloccash');

    let promises = [];

    for (var i = 0; i < lop.length; i++) {
      promises.push(
        serv.geocode({
          q: lop[i],
        }));
    }

    Promise.all(promises)
      .then((results) => {
        for (var i = 0; i < lop.length; i++) {
          socket.emit('storeloc', lop[i]);
          socket.emit('storegeocode', results[i].items[0].position);
        }
      })
  }




  var targetElement = document.getElementById('mapContainer');
  var defaultLayers = platform.createDefaultLayers();

  function makerouts(loclist) {
   map.removeObjects(map.getObjects ())
    for (var i = 0; i < (loclist.length - 1); i++) {
      summary[i] = []
      var randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
      makeroute(loclist[i], loclist[i + 1], randomColor, i);
    }
  }

  function makeroute(loc1, loc2, col, tab) {

    var stringloc1 = loc1.lat + ',' + loc1.lng
    var stringloc2 = loc2.lat + ',' + loc2.lng


    var routingParameters = {
      // The start point of the route:
      'origin': stringloc1,
      // The end point of the route:
      'destination': stringloc2,
      // Include the route shape in the response
      'return': 'polyline'
    };

    var defaultLayers = platform.createDefaultLayers();

    var onResult = function (result) {

      for (var i = 0; i < result.routes[0].sections.length; i++) {
         section = result.routes[0].sections[i]
         let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
         let routeLine = new H.map.Polyline(linestring, {
           style: { strokeColor: col, lineWidth: 3 }
         });
         // Create a marker for the start point:
         if (i == 0){
            let startMarker = new H.map.Marker(section.departure.place.location);
            map.addObjects([startMarker]);
         }
         if (i == result.routes[0].sections.length-1){
            let endMarker = new H.map.Marker(section.arrival.place.location);
            map.addObjects([endMarker]);
         }


         // Create a marker for the end point:
         let endMarker = new H.map.Marker(section.arrival.place.location);

         // Add the route polyline and the two markers to the map:
         map.addObjects([routeLine]);


      }

      getzoom(loc1,loc2);

      // ensure that at least one route was found

    };



    // Get an instance of the routing service version 8:
    var publicTransitService = platform.getPublicTransitService();

    // Call calculateRoute() with the routing parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    publicTransitService.getRoutes(routingParameters, onResult,
      function (error) {
        alert(error.message);
      });
  }

  function getzoom (loc1, loc2){

    var stringloc1 = loc1.lat + ',' +  loc1.lng
    var stringloc2 = loc2.lat + ',' +  loc2.lng

    var routingParameters = {
      'routingMode': 'fast',
      'transportMode': 'car',
      // The start point of the route:
      'origin': stringloc1,
      // The end point of the route:
      'destination': stringloc2,
      // Include the route shape in the response
      'return': 'polyline'
    };

    var onResult = function(result) {
      // ensure that at least one route was found
      if (result.routes.length) {
        result.routes[0].sections.forEach((section) => {
          let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

          // Create a polyline to display the route:
          let routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'blue', lineWidth: 3 }
          });
            map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
        });
      }
    };

    var router = platform.getRoutingService(null, 8);
    router.calculateRoute(routingParameters, onResult,
      function(error) {
        alert(error.message);
      });

  }



  function setStyle(map) {
    // get the vector provider from the base layer
    var provider = map.getBaseLayer().getProvider();
    // Create the style object from the YAML configuration.
    // First argument is the style path and the second is the base URL to use for
    // resolving relative URLs in the style like textures, fonts.
    // all referenced resources relative to the base path https://js.api.here.com/v3/3.1/styles/omv.
    var style = new H.map.Style('darkstyle.yaml',
      'https://js.api.here.com/v3/3.1/styles/omv/');
    // set the style on the existing layer
    provider.setStyle(style);
  }


  var serva = platform.getPlatformDataService();

  style = new H.map.SpatialStyle();
  // create tile provider and layer that displays postcode boundaries
  var boundariesProvider = new H.service.extension.platformData.TileProvider(serva,
    {
      layer: 'PSTLCB_GEN', level: 12
    }, {
      resultType: H.service.extension.platformData.TileProvider.ResultType.POLYLINE,
      styleCallback: function (data) { return style }
    });
  var boundaries = new H.map.layer.TileLayer(boundariesProvider);


  var map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.vector.normal.map,
    {
      zoom: 8,
      center: { lat: 43.6, lng: -79.3 }
    });

  //map.addLayer(buildingsSpaceLayer);
  // Enable the event system on the map instance:
  var mapEvents = new H.mapevents.MapEvents(map);

  // Add event listeners:
  map.addEventListener('tap', function (evt) {
    // Log 'tap' and 'mouse' events:
    console.log(evt.type, evt.currentPointer.type);
  });
  map.addLayer(boundaries);

  // Instantiate the default behavior, providing the mapEvents object:
  var behavior = new H.mapevents.Behavior(mapEvents);
  // Define a callback function to process the routing response:
  setStyle(map);



////////////////////////////////


  document.getElementById('send-btn').addEventListener('click', () => {

      destinations = []
      for (i = 0; i < dests.length; i++) {
        destinations.push(dests[i].childNodes[0].value)
      }
      if (destinations.length > 1){
        storeGeoData(destinations);
      }

      Createbut(destinations.length-1);

      setTimeout(function () { eval(destinations) }, 2000);


      document.getElementById('other').style.display = "block";
      document.getElementById('other2').style.display = "block";
      document.getElementById('mapContainer').style.height = "100%";
      document.getElementById('mapContainer').style.width = "100%";



    });
    document.getElementById('home').addEventListener('click', () => {

      destinations = []
      for (i = 0; i < dests.length; i++) {
        destinations.push(dests[i].childNodes[0].value)
      }
      if (destinations.length > 1){
        storeGeoData(destinations);
      }
      setTimeout(function () { eval(destinations) }, 2000);


      document.getElementById('other').style.display = "block";
      document.getElementById('other2').style.display = "block";
      document.getElementById('mapContainer').style.height = "100%";
      document.getElementById('mapContainer').style.width = "100%";



      });
    document.getElementById('0')




  function Createbut(num){
    var list = document.getElementById("other2");
    list.innerHTML = '';
    for (var i = 0; i < num; i++){
      var n = document.createTextNode((i+1).toString())
      var but = document.createElement("button");
      but.classList.add("btn-circle");
      but.classList.add("switch-btn");
      but.appendChild(n)


      but.id = i;

      but.addEventListener('click', function(event){
        console.log(event.path[0].id);
          getloc(event.path[0].id);

      })

      list.appendChild(but);
    }
  }



  function eval(destinations){
     if (destinations.length == 1){
       window.alert("Entermore locations!");
     }
     if (destinations.length == 2){
       getloc(0);
     }
     if (destinations.length > 2){
       getallloc();
     }
  }

  ////////////////////

  var numDestinations = 2;
  var dests = [];
  var destinations = [];

  var inputContainer = document.getElementById("input-container");

  for (i = 0; i < 2; i++) {
    var div = document.createElement("DIV");
    var input = document.createElement("input");

    div.classList.add("add-input");
    input.classList.add("map-input");
    div.id = "inputbox".concat(toString(numDestinations));

    div.appendChild(input);
    dests.push(div)

    inputContainer.appendChild(dests[i]);
  }


  document.getElementById('add-dest').addEventListener('click', function () {

    if (numDestinations <= 8) {
      var div = document.createElement("DIV");
      var input = document.createElement("input");

      div.classList.add("add-input");
      input.classList.add("map-input");

      div.appendChild(input);

      numDestinations += 1
      dests.push(div)

      for (i = 0; i < dests.length; i++) {
        inputContainer.appendChild(dests[i]);

      }


    }



  });


  document.getElementById('sub-dest').addEventListener('click', function () {

    if (numDestinations > 2) {
      numDestinations -= 1;
      var element = dests.pop()

      element.remove();
    }

  });

  ////////////////

  function get_summary (loc1, loc2){

    var stringloc1 = loc1.lat + ',' +  loc1.lng
    var stringloc2 = loc2.lat + ',' +  loc2.lng

    var routingParameters = {
      // The start point of the route:
      'origin': stringloc1,
      // The end point of the route:
      'destination': stringloc2,
      // Include the route shape in the response
      'return': 'polyline'
    };

    var defaultLayers = platform.createDefaultLayers();


    var onResult = function(result) {
      summary = [];
      if (result.routes.length) {
        result.routes[0].sections.forEach((section) => {
          summary.push({
            start_place: section.arrival.place,
            start_time: section.arrival.time,
            end_place: section.departure.place,
            end_time: section.departure.time,
            type: section.type
          })
        });
      }
      time(summary);

          setTimeout(function(){
            circle();
          },1000);
    };
    publicTransitService.getRoutes(routingParameters, onResult,
      function(error) {
        alert(error.message);
      });

  }
  function get_summary_wrap (lop){
    let promises = [];

    for (var i = 0; i < lop.length-1; i++){
      promises.push(
        get_summary_1(lop[i],lop[i+1])
      );
      }

      Promise.all(promises)
      .then((results) => {

        setTimeout(function(){

          circle();
        },5000)
      })

  }
  function get_summary_1 (loc1, loc2){

    var stringloc1 = loc1.lat + ',' +  loc1.lng
    var stringloc2 = loc2.lat + ',' +  loc2.lng

    var routingParameters = {
      // The start point of the route:
      'origin': stringloc1,
      // The end point of the route:
      'destination': stringloc2,
      // Include the route shape in the response
      'return': 'polyline'
    };

    var defaultLayers = platform.createDefaultLayers();


    var onResult = function(result) {
      summary = [];
      if (result.routes.length) {
        result.routes[0].sections.forEach((section) => {
          summary.push({
            start_place: section.arrival.place,
            start_time: section.arrival.time,
            end_place: section.departure.place,
            end_time: section.departure.time,
            type: section.type
          })
        });
      }
      time(summary);

    };
    publicTransitService.getRoutes(routingParameters, onResult,
      function(error) {
        alert(error.message);
      });

  }

  function time(route) {
    for (var i = 0; i < route.length; i++) {
      var end_string = route[i].end_time.substring(8);
      var start_string = route[i].start_time.substring(8);
      if (end_string.substring(0,2) > start_string.substring(0,2)){
        end_string = 24 + parseFloat(end_string.substring(3,5))
        + (parseFloat(end_string.substring(6,8)) / 60.0);
        start_string = parseFloat(start_string.substring(3,5))
        + (parseFloat(start_string.substring(6,8)) / 60.0);
      }else{
        end_string = parseFloat(end_string.substring(3,5))
        + (parseFloat(end_string.substring(6,8)) / 60.0);
        start_string = parseFloat(start_string.substring(3,5))
        + (parseFloat(start_string.substring(6,8)) / 60.0);
      }

      if(route[i].type == "pedestrian") {
        totalWalk +=  Math.abs(end_string - start_string) + 0.01;
      }
      else if (route[i].type == "transit"){
        totalTransit += Math.abs(end_string - start_string) + 0.01;
      }
    }
  }

  function get_hist(loc1, loc2){

    let promises = [];

    var stringloc1 = loc1.lat + ',' +  loc1.lng
    var stringloc2 = loc2.lat + ',' +  loc2.lng

    for (var i = 1; i < 24; i++){

      if (i < 10){
        var time = ("2020-11-14T0"+i+":00:00")
      }else{
        var time = ("2020-11-14T"+i+":00:00")
      }

      promises.push(
        publicTransitService.getRoutes({
          'departureTime': time,
          // The start point of the route:
          'origin': stringloc1,
          // The end point of the route:
          'destination': stringloc2,
          // Include the route shape in the response
          'return': 'polyline'
        }));
      }

      Promise.all(promises).then((results) => {
        var data = []
        for (var i = 0; i < results.length; i++){

          var start = results[i].routes[0].sections[0].departure.time.substring(8)
          var end = (results[i].routes[0].sections.slice(-1)[0]).arrival.time.substring(8)



          if (end.substring(0,2) > start.substring(0,2)){
            end = 24 + parseFloat(end.substring(3,5))
            + (parseFloat(end.substring(6,8)) / 60.0);
            start = parseFloat(start.substring(3,5))
            + (parseFloat(start.substring(6,8)) / 60.0);
          }else{
            end = parseFloat(end.substring(3,5))
            + (parseFloat(end.substring(6,8)) / 60.0);
            start = parseFloat(start.substring(3,5))
            + (parseFloat(start.substring(6,8)) / 60.0);
          }


          data.push(end-start);
        }
        coloursa(data);
        setTimeout(function(){
          line(data);
        }, 1000);
      })


    }

    function get_hist_wrap (lop){
      let promises = [];

      for (var i = 0; i < lop.length-1; i++){
        promises.push(
          get_his1(lop[i],lop[i+1])
        );
        }

        Promise.all(promises)
        .then((results) => {


          setTimeout(function(){
           coloursa(data);
            setTimeout(function(){
              line(data);
            },1000);
          },5000)
        })

    }

    function get_his1(loc1, loc2){

      let promises = [];

      var stringloc1 = loc1.lat + ',' +  loc1.lng
      var stringloc2 = loc2.lat + ',' +  loc2.lng

      for (var i = 1; i < 24; i++){

        if (i < 10){
          var time = ("2020-11-14T0"+i+":00:00")
        }else{
          var time = ("2020-11-14T"+i+":00:00")
        }

        promises.push(
          publicTransitService.getRoutes({
            'departureTime': time,
            // The start point of the route:
            'origin': stringloc1,
            // The end point of the route:
            'destination': stringloc2,
            // Include the route shape in the response
            'return': 'polyline'
          }));
        }

        Promise.all(promises).then((results) => {
          for (var i = 0; i < results.length; i++){

            var start = results[i].routes[0].sections[0].departure.time.substring(8)
            var end = (results[i].routes[0].sections.slice(-1)[0]).arrival.time.substring(8)



            if (end.substring(0,2) > start.substring(0,2)){
              end = 24 + parseFloat(end.substring(3,5))
              + (parseFloat(end.substring(6,8)) / 60.0);
              start = parseFloat(start.substring(3,5))
              + (parseFloat(start.substring(6,8)) / 60.0);
            }else{
              end = parseFloat(end.substring(3,5))
              + (parseFloat(end.substring(6,8)) / 60.0);
              start = parseFloat(start.substring(3,5))
              + (parseFloat(start.substring(6,8)) / 60.0);
            }


            data[i] += end-start +0.01;
          }
        })


      }

    function coloursa(traffic){
      var total = 0;
      for (var i = 0; i < traffic.length; i++) {
        total += traffic[i];
      };
      var mean = total / traffic.length;
      for (var i = 0; i < traffic.length; i++) {
        if(traffic[i] >= ((mean + Math.max.apply(Math, traffic)) / 2)) {
          lista.push('rgba(235, 57, 45, 1)'); //Red
        }
        else if(traffic[i] < ((mean + Math.min.apply(Math, traffic)) / 2)) {
          lista.push('rgba(254, 197, 52, 1)'); //Green
        }
        else {
          lista.push('rgba(176, 221, 73, 1)'); //Orangey Yellow
        }
      }
    }



    function addData(chart, label, data) {
        chart.data.labels.push(label);
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });
        chart.update();
    }


    var ctx = document.getElementById('traffic').getContext('2d');
    var linegraph = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM',
        '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM',
        '5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'],
        datasets: [{
          label: 'People Measure',
          data: traffic,
          backgroundColor: lista,
          borderColor: lista,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });

  function line(traffic){
    linegraph.data.datasets[0].data = traffic;
    linegraph.data.datasets[0].backgroundColor = lista;
    linegraph.data.datasets[0].borderColor = lista;
    linegraph.update();

  }
  var ctx = document.getElementById('time').getContext('2d');
  var piegraph = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Time Spent Walking','Time Spent in Transit'],
      datasets: [{
        label: 'People Measure',
        data: [totalWalk.toFixed(2), totalTransit.toFixed(2)],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1
      }]
    }
  });
  function circle(){
    piegraph.data.datasets[0].data = [totalWalk.toFixed(2), totalTransit.toFixed(2)];
    piegraph.update();

  }
});
