function re_order(loc,geos,name){
    dict = {}
    for (var i = 0; i < name; i++){
      for (var x = 0; x < name; x++){
        1+1

      }
    }
}


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

  useres = []
  useres[1] = '5150 Upper Middle Rd, Burlington, ON';
  useres[0] = '161 University Ave W, Waterloo, ON';
  useres[2] = '1151 Richmond St, London, ON';

  locs = []
  geos = []
  summary = []

  storeGeoData(useres);

  setTimeout(function(){ getGeoData()}, 2000);


  function getGeoData(){
    socket.emit("getgeodata", socket.id)

    socket.on("postgeodata", function(dict){
      locs = dict[0]
      geos = dict[1]
      for (var i = 0; i < dict[0].length; i++){
        console.log(dict[0][i]);
        console.log(dict[1][i]);
      }
    });

    setTimeout(function(){
      makerouts(geos);
      setTimeout(function(){
        console.log(summary);
        socket.emit("storesummary", summary)
      },200);
    }, 3000);

  }


  function storeGeoData(lop){
    socket.emit('clearloccash');

    let promises = [];

    for (var i = 0; i < lop.length; i++){
      promises.push(
        serv.geocode({
        q: lop[i],
      }));
    }

    Promise.all(promises)
    .then((results) => {
       for (var i = 0; i < lop.length; i++){
         socket.emit('storeloc', lop[i]);
         socket.emit('storegeocode', results[i].items[0].position);
       }
    })
  }





  var targetElement = document.getElementById('mapContainer');
  var defaultLayers = platform.createDefaultLayers();

  function makerouts (loclist){
    console.log(loclist);
    for (var i = 0; i < (loclist.length - 1); i++){
      summary[i] = []
      var randomColor = "#"+Math.floor(Math.random()*16777215).toString(16);
      makeroute(loclist[i],loclist[i+1],randomColor, i);
    }
  }

  function makeroute (loc1, loc2, col, tab){

    var stringloc1 = loc1.lat + ',' +  loc1.lng
    var stringloc2 = loc2.lat + ',' +  loc2.lng

    console.log(stringloc1)

    var routingParameters = {
      'departureTime': "2020-11-13T19:06:00",
      // The start point of the route:
      'origin': stringloc1,
      // The end point of the route:
      'destination': stringloc2,
      // Include the route shape in the response
      'return': 'polyline'
    };

    var defaultLayers = platform.createDefaultLayers();

    var onResult = function(result) {
      // ensure that at least one route was found
      if (result.routes.length) {

        result.routes[0].sections.forEach((section) => {
          summary[tab].push({
            start_place: section.arrival.place,
            start_time: section.arrival.time,
            end_place: section.departure.place,
            end_time: section.departure.time,
            type: section.type
          })
          // Create a linestring to use as a point source for the route line
          let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

          // Create a polyline to display the route:
          let routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: col, lineWidth: 3 }
          });

          // Create a marker for the start point:
          let startMarker = new H.map.Marker(section.departure.place.location);

          // Create a marker for the end point:
          let endMarker = new H.map.Marker(section.arrival.place.location);

          // Add the route polyline and the two markers to the map:
          map.addObjects([routeLine, startMarker, endMarker]);

        });
      }
    };



    // Get an instance of the routing service version 8:
    var publicTransitService = platform.getPublicTransitService();

    // Call calculateRoute() with the routing parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    publicTransitService.getRoutes(routingParameters, onResult,
      function(error) {
        alert(error.message);
      });
    }



    function setStyle(map){
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
      styleCallback: function(data) {return style}
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
      map.addEventListener('tap', function(evt) {
        // Log 'tap' and 'mouse' events:
        console.log(evt.type, evt.currentPointer.type);
      });
          map.addLayer(boundaries);

      // Instantiate the default behavior, providing the mapEvents object:
      var behavior = new H.mapevents.Behavior(mapEvents);
      // Define a callback function to process the routing response:
      setStyle(map);




    });







