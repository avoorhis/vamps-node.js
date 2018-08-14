



function create_geospatial() {
     
      var mapCanvas = document.getElementById('map-canvas');
	  mapCanvas.innerHTML = '';
      mapCanvas.style.display = 'block';
	  mapCanvas.style.height = '900px';
      
      var loc_data = [];
      var lat_lon_collector = {};
      var pid_collector = {};
      var latlon;
      
      for (var ds in md_local) {
      		//ds = md_local[ds]
          pid_collector[ds] = md_local[ds].pid
          var lat = '';
          var lon = '';
          for (var k in md_local[ds]) {
            md_item = k;
            if(md_item == 'latitude' && md_local[ds][k] != 'None') {
              lat = Number(md_local[ds][k]);
              //alert(md_local[ds][k]+' - '+lat)
            }
            if(md_item == 'longitude' && md_local[ds][k] != 'None'){              
              lon = Number(md_local[ds][k]);
            }    
          } 
          
          if(typeof lat == 'number' && typeof lon == 'number'){
            latlon = lat.toString() +';'+ lon.toString();
            if (latlon in lat_lon_collector) {
              newds = lat_lon_collector[latlon] + ":::" + ds;
              lat_lon_collector[latlon] = newds;
            }else{
              lat_lon_collector[latlon] = ds;
            }            
          }
      }
      var z = 1;

      for(latlon in lat_lon_collector){
        //alert(lat_lon_collector[latlon])
        ds = lat_lon_collector[latlon];
        var latlons =  latlon.split(';');
        loc_data.push([ds, latlons[0], latlons[1], z]);
        z+=1; 

      }

      if (loc_data.length === 0){
          mapCanvas.innerHTML='No Lat-Lon Data Found';

      }else{
        var mapOptions = {       
          id: 'mapbox.streets-basic',
          accessToken: token
        };
        var mymap = L.map('map-canvas').setView([41.5257, -70.672], 3)  // centered on Cape Cod
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',mapOptions).addTo(mymap); 
        
        setMarkers(mymap, loc_data, pid_collector);
      }  
}
//
//
//
function setMarkers(map, loc_data, pid_collector) {
  for (var i = 0; i < loc_data.length; i++) {
    
    var data = loc_data[i];
    var marker = L.marker([data[1],data[2]],{}).addTo(map);
    
    lines = data[0].split(':::')
    if(lines.length > 10){
      var html = "<div style='height:200px;width:300px;overflow:auto;'>";
    }else{
      var html = "<div>";
    }
    
    for(l in lines){
    	var pid = pid_collector[lines[l]];    	
    	html += "<a href='/projects/"+pid+"'>" + lines[l] + "</a><br>"
    }
    html += "</div>";
    marker.bindPopup(html);
    marker.on('mouseover', function (e) {
        this.openPopup();
    });

  }

}

