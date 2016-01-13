
    
	
var loadMap = function() 
{
        
		var myOptions = {
          center: new google.maps.LatLng(41.5, -70.66), // Woods Hole, MA
          zoom: 3,
          mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
            myOptions);
			//var site = 'http://maps.google.com/mapfiles/ms/icons/' // 5 basic colors
			//var marker_colors = ['red','purple','green','yellow','blue'];
			
		var pngsite = 'http://labs.google.com/ridefinder/images/mm_20_' //  10 colors + lots others
		var marker_colors = ['red','purple','green','yellow','blue','gray','orange','white','black','brown'];
			
		for(p in data){
				//if( p % 5 == 5 ){
				color = marker_colors[Math.floor(p % marker_colors.length)];
				//alert(Math.floor(p % marker_colors.length).toString()+' - '+color)
				//	}
				var myLatlng = new google.maps.LatLng(data[p].latitude,data[p].longitude);	
				var marker = new google.maps.Marker({
			      position : myLatlng,
			      map : map,
				  	icon : pngsite+color+".png",
				  	shadow : pngsite+"shadow.png",
			      title : data[p].proj_dset
			  });
		}
};

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
      var pid_collector = {};
      var latlon;
      
      for (var did in md_local) {
      //for(p in data){
      		//ds = md_local[ds]
          //alert(did)
          ds =  md_local[did].proj_dset;
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
          mapCanvas.innerHTML='No Lat-Lon Data Found';

      }else{
        var center = new google.maps.LatLng(loc_data[0][1],loc_data[0][2]); 
        //alert(center)
        //var mapCanvas = document.getElementById('map-canvas');
        var mapOptions = {
          center : center,
          zoom   : 3,
          //zoom: 2, for world view far out
          //zoom 13 for marsh
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(mapCanvas, mapOptions);
        var infowindow =  new google.maps.InfoWindow({
          content: ''
        });

        setMarkers(map, loc_data, pid_collector, infowindow);
      }  
}
//
//
//
function setMarkers(map, loc_data, pid_collector, infowindow) {
  for (var i = 0; i < loc_data.length; i++) {
    // create a marker
	 // alert(locations[0])
    var data = loc_data[i];
	
    var myLatLng = new google.maps.LatLng(data[1],data[2]); 
    var marker = new google.maps.Marker({
      //title: data[0],
      position: myLatLng,
      map: map
    });
    
    // add an event listener for this marker
    lines = data[0].split(':::')
    var html = '';
    for(l in lines){
    	var pid = pid_collector[lines[l]];
    	html += "<a href='/projects/"+pid+"'>" + lines[l] + "</a><br>"
    }
    bindInfoWindow(marker, map, infowindow, "<p>"+html+"</p>"); 

  }

}
//
//
//
function bindInfoWindow(marker, map, infowindow, html) { 
  google.maps.event.addListener(marker, 'mouseover', function() { 
    infowindow.setContent(html); 
    infowindow.open(map, marker); 
  }); 
} 


