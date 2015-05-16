
    
	
	var loadMap = function() 
    {
        
		var myOptions = {
          center: new google.maps.LatLng(50, -37),
          zoom: 3,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            myOptions);
		for(p in data){
			
			var myLatlng = new google.maps.LatLng(data[p].latitude,data[p].longitude);	
			var marker = new google.maps.Marker({
			      position: myLatlng,
			      map: map,
			      title: data[p].proj_dset
			  });
		  }
    };
    window.onload= loadMap;
