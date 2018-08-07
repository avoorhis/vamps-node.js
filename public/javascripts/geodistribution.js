function create_geospatial(token){
    

    var loc_data = [];
    var lat_lon_collector = {}
    var pid_collector = {}
    for( did in md_local){
        ds = md_local[did].proj_dset;
        pid_collector[ds] = md_local[did].pid
        var lat = '';
        var lon = '';
        lat = Number(md_local[did].latitude);
        lon = Number(md_local[did].longitude);
        if(typeof lat == 'number' && typeof lon == 'number'){
            //alert(ds)
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
          document.getElementById('mapid').innerHTML='No Lat-Lon Data Found';
    }else{
       
        var mapOptions = {
          //scrollwheel: false,          
          id: 'mapbox.streets-basic',
          accessToken: token
        };
        var mymap = L.map('mapid').setView([41.5257, -70.672], 3)
        //var map = new google.maps.Map(mapCanvas, mapOptions);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',mapOptions).addTo(mymap); 

        setMarkers(mymap, loc_data, pid_collector);
    }
    //marker = L.marker([lat, lon]).addTo(mymap);
   //latlon_lookup[md_local[i].latitude+'&&'+md_local[i].longitude] = marker
    

}

function setMarkers(map, loc_data, pid_collector) {
  for (var i = 0; i < loc_data.length; i++) {
    // create a marker
	//alert(loc_data[i])
    var data = loc_data[i];

    //alert(data[2])
    var marker = L.marker([data[1],data[2]]).addTo(map)

    // add an event listener for this marker
    lines = data[0].split(':::')

    if(lines.length > 10){
      var html = "<div style='height:200px;width:300px;overflow:auto;'>";
    }else{
      var html = "<div style='width:300px;'>";
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
    // marker.on('mouseout', function (e) {
//         this.closePopup();
//     });

  }

}