
    
	
	var loadMap = function() 
    {
        
		var myOptions = {
          center: new google.maps.LatLng(41.5, -70.66), // Woods Hole, MA
          zoom: 7,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            myOptions);
			//var site = 'http://maps.google.com/mapfiles/ms/icons/' // 5 basic colors
			//var marker_colors = ['red','purple','green','yellow','blue'];
			
			var site = 'http://labs.google.com/ridefinder/images/mm_20_' //  10 colors + lots others
			var marker_colors = ['red','purple','green','yellow','blue','gray','orange','white','black','brown'];
			
		for(p in data){
			//if( p % 5 == 5 ){
				color = marker_colors[Math.floor(p % marker_colors.length)];
				//alert(Math.floor(p % marker_colors.length).toString()+' - '+color)
		//	}
			var myLatlng = new google.maps.LatLng(data[p].latitude,data[p].longitude);	
			var marker = new google.maps.Marker({
			      position: myLatlng,
			      map: map,
				  icon: site+color+".png",
				  shadow: site+"shadow.png",
			      title: data[p].proj_dset
			  });
		  }
    };
    window.onload= loadMap;
