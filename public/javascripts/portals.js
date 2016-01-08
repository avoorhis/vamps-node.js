



function create_geospatial() {
      //alert(zoom_level)
     //  geospatial_created = true;
     //  var geo_div = document.getElementById('map-canvas');
      var mapCanvas = document.getElementById('map-canvas');
	    mapCanvas.innerHTML = '';
      mapCanvas.style.display = 'block';
	    mapCanvas.style.height = '900px';
      
      var loc_data = [];
      var lat_lon_collector = {};
      var latlon;
      
      for (var ds in md_local) {
      		//ds = md_local[ds]
          //alert(ds)
          var lat = '';
          var lon = '';
          for (var k in md_local[ds]) {
            md_item = k;
            if(md_item == 'latitude') {
              lat = Number(md_local[ds][k]);
              //alert(lat)
            }
            if(md_item == 'longitude'){              
              lon = Number(md_local[ds][k]);
            }           
            
          } 
          
          if(typeof lat == 'number' && typeof lon == 'number'){
            latlon = lat.toString() +';'+ lon.toString();
            if (latlon in lat_lon_collector) {
              newds = lat_lon_collector[latlon] + "<br>" + ds;
              lat_lon_collector[latlon] = newds;
            }else{
              lat_lon_collector[latlon] = ds;
            }            
          }
      }
      var z = 1;

      for(latlon in lat_lon_collector){
        //alert(latlon)
        ds = lat_lon_collector[latlon];
        var latlons =  latlon.split(';');
        loc_data.push([ds,latlons[0],latlons[1],z]);
        z+=1; 

      }

      if (loc_data.length === 0){
          mapCanvas.innerHTML='No Lat-Lon Data Found';

      }else{
        var center = new google.maps.LatLng(loc_data[0][1],loc_data[0][2]); 
        //alert(center)
        //var mapCanvas = document.getElementById('map-canvas');
        var mapOptions = {
          center : center,
          zoom   : parseInt(zoom_level),
          //zoom: 2, for world view far out
          //zoom 13 for marsh
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(mapCanvas, mapOptions);
        var infowindow =  new google.maps.InfoWindow({
          content: ''
        });

        setMarkers(map, loc_data, infowindow);
      }  
}
//
//
//
function setMarkers(map, loc_data, infowindow) {
  for (var i = 0; i < loc_data.length; i++) {
    // create a marker
	 // alert(locations[0])
    var data = loc_data[i];
	
    var myLatLng = new google.maps.LatLng(data[1],data[2]); 
    var marker = new google.maps.Marker({
      title: data[0],
      position: myLatLng,
      map: map
    });
    
    // add an event listener for this marker
    bindInfoWindow(marker, map, infowindow, "<p>" + data[0] + "</p>"); 

  }

}
//
//
//
function bindInfoWindow(marker, map, infowindow, html) { 
  google.maps.event.addListener(marker, 'click', function() { 
    infowindow.setContent(html); 
    infowindow.open(map, marker); 
  }); 
} 
