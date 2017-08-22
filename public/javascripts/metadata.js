toggle_metadata = document.getElementById('toggle_metadata') || null;
if (toggle_metadata !== null) {
  toggle_metadata.addEventListener('click', function () {
      toggle_metadata_view();
  });
}

//
// TOGGLE_METADATA_VIEW
//
function toggle_metadata_view()
{
  // page: metadata_table
  // toggles all/selected metadata

  var ckbx = document.getElementById('toggle_metadata');
  var load;
  if (ckbx.checked === true) {
          ckbx.checked = true;
          document.getElementById('md_select_phrase1').innerHTML = "Showing All Metadata";
          document.getElementById('md_select_phrase2').innerHTML = "Show Selected Metadata Only?";
          load = 'all';
  } else {
          ckbx.checked = false;
          document.getElementById('md_select_phrase1').innerHTML = "Showing Selected Metadata Only";
          document.getElementById('md_select_phrase2').innerHTML = "Show All Metadata?";
          load = 'selected';
  }

	var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", '/visuals/partials/load_metadata?load='+load);
  xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4 ) {
           var string = xmlhttp.responseText;
           document.getElementById('metadata_table_div').innerHTML = string;
           new Tablesort(document.getElementById('metadata_table'));
        }
  };
  xmlhttp.send();

}





function create_geospatial() {
      //alert('zoom_level')
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

      for (var ds in md_local) {
          //ds = md_local[ds]
          //alert(ds)
          pid_collector[ds]       = {};
          pid_collector[ds].pid   = md_local[ds].pid;
          pid_collector[ds].value = md_local[ds].value;
          var lat = '';
          var lon = '';
          for (var k in md_local[ds]) {
            md_item = k;
            if(md_item === 'latitude') {
              lat = Number(md_local[ds][k]);
              //alert(lat)
            }
            if(md_item === 'longitude'){
              lon = Number(md_local[ds][k]);
            }
          }

          if(typeof lat === 'number' && typeof lon === 'number'){
            latlon = lat.toString() +';'+ lon.toString();
            if (latlon in lat_lon_collector) {
              var newds = lat_lon_collector[latlon] + ":::" + ds;
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
      //alert(loc_data[0][2])
      if (loc_data.length === 0){
          mapCanvas.innerHTML='No Lat-Lon Data Found';

      }else{
        //var center = new google.maps.LatLng(loc_data[0][1],loc_data[0][2]);
        //alert(center)
        //var mapCanvas = document.getElementById('map-canvas');
        var mapOptions = {
          center : new google.maps.LatLng(0,0),
          zoom   : parseInt(3),
          //zoom: 3, for world view far out
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
  //alert(data)
    var myLatLng = new google.maps.LatLng(data[1],data[2]);
    var marker = new google.maps.Marker({
      //title: data[0],
      position: myLatLng,
      map: map
    });

    // add an event listener for this marker
    var lines = data[0].split(':::');

    // if(lines.length > 10){
    //   var html = "<div style='height:200px;width:300px;overflow:auto;'>";
    // }else{
    //   var html = "<div style='width:300px;'>";
    // }
    // for(l in lines){
    //   var pid = pid_collector[lines[l]].pid;
    //   var val = pid_collector[lines[l]].value;
    //   html += "<a href='/projects/"+pid+"'>" + lines[l] + "</a>"+val.toString()+"<br>"
    // }
    // html += "</div>";


    var html = '';
    html += "<table  class='table table_striped' >";
    html += '<tr><th>Dataset</th><th>'+mditem+'</th></tr>';
    for(var l in lines){
      var pid = pid_collector[lines[l]].pid;
      var val = pid_collector[lines[l]].value;
      html += "<tr><td><a href='/projects/"+pid+"'>" + lines[l] + "</a></td><td>"+val+"</td></tr>";
    }
    html += '</table>';

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

//
// works:
// $(document).ready(function(){
//   event = "E";
//   $('.biome_1').change(function(){
//     custChange.call(this, event);
//   });

var biome_seq_options = {
    "marine biome": ["none','','Entered 2017-08-18 AAV'),
        "abyssal zone','','Entered 2017-08-18 AAV'),
        "bathyal','','Entered 2017-08-18 AAV'),
        "benthic','','Entered 2017-08-18 AAV'),
        "continental margin','','Entered 2017-08-18 AAV'),
        "endolithic','','Entered 2017-08-18 AAV'),
        "estuarine','','Entered 2017-08-18 AAV'),
        "hadal zone','','Entered 2017-08-18 AAV'),
        "marine aquatic','','Entered 2017-08-18 AAV'),
        "neritic zone','','Entered 2017-08-18 AAV'),
        "pelagic','','Entered 2017-08-18 AAV'),
        "polar','','Entered 2017-08-18 AAV'),
        "subseafloor aquatic','','Entered 2017-08-18 AAV'),
        "subseafloor"
    ],

    "terrestrial biome": ["none','','Entered 2017-08-18 AAV'),
        "desert','','Entered 2017-08-18 AAV'),
        "endolithic','','Entered 2017-08-18 AAV'),
        "forest','','Entered 2017-08-18 AAV'),
        "grassland','','Entered 2017-08-18 AAV'),
        "montane','','Entered 2017-08-18 AAV'),
        "permafrost','','Entered 2017-08-18 AAV'),
        "polar','','Entered 2017-08-18 AAV'),
        "subterrestrial aquatic','','Entered 2017-08-18 AAV'),
        "subterrestrial','','Entered 2017-08-18 AAV'),
        "temperate','','Entered 2017-08-18 AAV'),
        "terrestrial aquatic','','Entered 2017-08-18 AAV'),
        "tropical','','Entered 2017-08-18 AAV'),
        "tundra"]

    // "subterrestrial": ["none','','Entered 2017-08-18 AAV'),
    //     "aquatic','','Entered 2017-08-18 AAV'),
    //     "polar','','Entered 2017-08-18 AAV'),
    //     "endolithic','','Entered 2017-08-18 AAV'),
    //     "desert','','Entered 2017-08-18 AAV'),
    //     "grassland','','Entered 2017-08-18 AAV'),
    //     "tundra','','Entered 2017-08-18 AAV'),
    //     "forest','','Entered 2017-08-18 AAV'),
    //     "montane','','Entered 2017-08-18 AAV'),
    //     "tropical','','Entered 2017-08-18 AAV'),
    //     "temperate','','Entered 2017-08-18 AAV'),
    //     "permafrost"],
    //
    // "subseafloor": ["none','','Entered 2017-08-18 AAV'),
    //     "benthic','','Entered 2017-08-18 AAV'),
    //     "bathyal','','Entered 2017-08-18 AAV'),
    //     "abyssal','','Entered 2017-08-18 AAV'),
    //     "hadal','','Entered 2017-08-18 AAV'),
    //     "neritic','','Entered 2017-08-18 AAV'),
    //     "continental margin','','Entered 2017-08-18 AAV'),
    //     "estuarine','','Entered 2017-08-18 AAV'),
    //     "polar','','Entered 2017-08-18 AAV'),
    //     "endolithic"]
  };

  var feature_seq_options = {
    "well": ["none','','Entered 2017-08-18 AAV'),
        "oil well','','Entered 2017-08-18 AAV'),
        "water well"],

    "aquifer": ["none','','Entered 2017-08-18 AAV'),
        "confined','','Entered 2017-08-18 AAV'),
        "geological fracture','','Entered 2017-08-18 AAV'),
        "microfracture','','Entered 2017-08-18 AAV'),
        "shear fracture','','Entered 2017-08-18 AAV'),
        "spring','','Entered 2017-08-18 AAV'),
        "sub-continental aquifer','','Entered 2017-08-18 AAV'),
        "sub-seafloor aquifer','','Entered 2017-08-18 AAV'),
        "unconfined','','Entered 2017-08-18 AAV'),
        "water well"],

    "borehole": ["none','','Entered 2017-08-18 AAV'),
        "CORK','','Entered 2017-08-18 AAV'),
        "casing','','Entered 2017-08-18 AAV'),
        "oil well','','Entered 2017-08-18 AAV'),
        "research borehole','','Entered 2017-08-18 AAV'),
        "water well','','Entered 2017-08-18 AAV'),
        "wellhead"],

    "cave": ["none','','Entered 2017-08-18 AAV'),
        "cave wall','','Entered 2017-08-18 AAV'),
        "erosional cave','','Entered 2017-08-18 AAV'),
        "fault cave','','Entered 2017-08-18 AAV'),
        "fissure cave','','Entered 2017-08-18 AAV'),
        "glacier cave','','Entered 2017-08-18 AAV'),
        "joint-plane cave','','Entered 2017-08-18 AAV'),
        "karst cave"],

  "seep": ["none','','Entered 2017-08-18 AAV'),
      "brine pool','','Entered 2017-08-18 AAV'),
      "cold seep','','Entered 2017-08-18 AAV'),
      "hydrothermal seep','','Entered 2017-08-18 AAV'),
      "mound','','Entered 2017-08-18 AAV'),
      "mud volcano','','Entered 2017-08-18 AAV'),
      "oil seep','','Entered 2017-08-18 AAV'),
      "sea floor','','Entered 2017-08-18 AAV'),
      "seamount','','Entered 2017-08-18 AAV'),
      "vent-field associated seep','','Entered 2017-08-18 AAV'),
      "warm seep"],

  "enrichment": ["none','','Entered 2017-08-18 AAV'),
      "animal carcass fall','','Entered 2017-08-18 AAV'),
      "batch culture ','','Entered 2017-08-18 AAV'),
      "bioreactor','','Entered 2017-08-18 AAV'),
      "continuous culture','','Entered 2017-08-18 AAV'),
      "fed batch culture','','Entered 2017-08-18 AAV'),
      "mesocosm','','Entered 2017-08-18 AAV'),
      "microcosm','','Entered 2017-08-18 AAV'),
      "organic matter fall','','Entered 2017-08-18 AAV'),
      "whale fall"],
    
  "fracture": ["none','','Entered 2017-08-18 AAV'),
      "active geological fault','','Entered 2017-08-18 AAV'),
      "aquifer','','Entered 2017-08-18 AAV'),
      "geological joint','','Entered 2017-08-18 AAV'),
      "intrusion','','Entered 2017-08-18 AAV'),
      "microfracture','','Entered 2017-08-18 AAV'),
      "ocean trench','','Entered 2017-08-18 AAV'),
      "shear fracture"],

  "geyser": ["none','','Entered 2017-08-18 AAV'),
      "hydrothermal','','Entered 2017-08-18 AAV'),
      "mineral deposit"],

  "spring": ["none','','Entered 2017-08-18 AAV'),
      "acid hot spring','','Entered 2017-08-18 AAV'),
      "alkaline hot spring','','Entered 2017-08-18 AAV'),
      "hot spring','','Entered 2017-08-18 AAV'),
      "mineral deposit','','Entered 2017-08-18 AAV'),
      "mineral spring"],

  "hydrothermal vent": ["none','','Entered 2017-08-18 AAV'),
      "black smoker','','Entered 2017-08-18 AAV'),
      "marine hydrothermal plume','','Entered 2017-08-18 AAV'),
      "marine hydrothermal vent','','Entered 2017-08-18 AAV'),
      "marine hydrothermal vent chimney','','Entered 2017-08-18 AAV'),
      "mid-ocean ridge','','Entered 2017-08-18 AAV'),
      "mineral deposit','','Entered 2017-08-18 AAV'),
      "white smoker"],

  "mine": ["none','','Entered 2017-08-18 AAV'),
      "cave','','Entered 2017-08-18 AAV'),
      "mine drainage','','Entered 2017-08-18 AAV'),
      "mine tailing','','Entered 2017-08-18 AAV'),
      "mine wall"],

  "lake": ["none','','Entered 2017-08-18 AAV'),
      "acidic hot','','Entered 2017-08-18 AAV'),
      "alkaline salt','','Entered 2017-08-18 AAV'),
      "glacial','','Entered 2017-08-18 AAV'),
      "holomictic - fully mixed','','Entered 2017-08-18 AAV'),
      "lake bed','','Entered 2017-08-18 AAV'),
      "meromictic - non-mixing','','Entered 2017-08-18 AAV'),
      "periglacial','','Entered 2017-08-18 AAV'),
      "subglacial','','Entered 2017-08-18 AAV'),
      "underground"],

  "volcano": ["none','','Entered 2017-08-18 AAV'),
      "caldera','','Entered 2017-08-18 AAV'),
      "crater floor','','Entered 2017-08-18 AAV'),
      "crater wall','','Entered 2017-08-18 AAV'),
      "mud volcano','','Entered 2017-08-18 AAV'),
      "ridge','','Entered 2017-08-18 AAV'),
      "seamount','','Entered 2017-08-18 AAV'),
      "volcanic crater','','Entered 2017-08-18 AAV'),
      "volcanic seep"],

  "reservoir": ["none','','Entered 2017-08-18 AAV'),
      "aquifer','','Entered 2017-08-18 AAV'),
      "confined','','Entered 2017-08-18 AAV'),
      "freshwater','','Entered 2017-08-18 AAV'),
      "saline','','Entered 2017-08-18 AAV'),
      "subsurface','','Entered 2017-08-18 AAV'),
      "unconfined"]
  };
  


  var material_seq_options = {
    "sediment": ["none','','Entered 2017-08-18 AAV'),
        "anaerobic ','','Entered 2017-08-18 AAV'),
        "biogenous','','Entered 2017-08-18 AAV'),
        "carbon dioxide-reducing ','','Entered 2017-08-18 AAV'),
        "clay','','Entered 2017-08-18 AAV'),
        "colloidal ','','Entered 2017-08-18 AAV'),
        "contaminated ','','Entered 2017-08-18 AAV'),
        "granular ','','Entered 2017-08-18 AAV'),
        "hydrogenous','','Entered 2017-08-18 AAV'),
        "hyperthermophilic','','Entered 2017-08-18 AAV'),
        "inorganically contaminated ','','Entered 2017-08-18 AAV'),
        "iron-reducing  ','','Entered 2017-08-18 AAV'),
        "manganese-reducing ','','Entered 2017-08-18 AAV'),
        "mesophilic','','Entered 2017-08-18 AAV'),
        "nitrate-reducing ','','Entered 2017-08-18 AAV'),
        "organically contaminated','','Entered 2017-08-18 AAV'),
        "petroleum contaminated ','','Entered 2017-08-18 AAV'),
        "radioactive','','Entered 2017-08-18 AAV'),
        "saline lake sediment','','Entered 2017-08-18 AAV'),
        "silt','','Entered 2017-08-18 AAV'),
        "sulphate-reducing','','Entered 2017-08-18 AAV'),
        "terrigenous"],

<<<<<<< HEAD
    "water": ["none','','Entered 2017-08-18 AAV'),
        "acidic water','','Entered 2017-08-18 AAV'),
        "alkaline water','','Entered 2017-08-18 AAV'),
        "anoxic water','','Entered 2017-08-18 AAV'),
        "brackish water','','Entered 2017-08-18 AAV'),
        "fresh groundwater','','Entered 2017-08-18 AAV'),
        "fresh water','','Entered 2017-08-18 AAV'),
        "groundwater','','Entered 2017-08-18 AAV'),
        "hypersaline water','','Entered 2017-08-18 AAV'),
        "saline groundwater','','Entered 2017-08-18 AAV'),
        "saline water','','Entered 2017-08-18 AAV'),
        "sea water"],



    "fluid": ["none','','Entered 2017-08-18 AAV'),
        "drilling bore water','','Entered 2017-08-18 AAV'),
        "drilling fluid','','Entered 2017-08-18 AAV'),
        "hydrothermal fluid','','Entered 2017-08-18 AAV'),
        "meltwater','','Entered 2017-08-18 AAV'),
        "oil','','Entered 2017-08-18 AAV'),
        "pore fluid','','Entered 2017-08-18 AAV'),
        "seep fluid','','Entered 2017-08-18 AAV'),
        "underground water','','Entered 2017-08-18 AAV'),
        "vent fluid','','Entered 2017-08-18 AAV'),
=======
    "water": ["none",
      "acidic water",
      "alkaline water",
      "anoxic water",
      "brackish water",
      "fresh groundwater",
      "fresh water",
      "groundwater",
      "hypersaline water",
      "saline groundwater",
      "saline water",
      "sea water",
      "underground water"
    ],



    "fluid": ["none",
        "drilling bore water",
        "drilling fluid",
        "hydrothermal fluid",
        "meltwater",
        "oil",
        "pore fluid",
        "seep fluid",
        "vent fluid",
>>>>>>> 3dfc50b9bb8e4b6007e2e259e28120010e4559fc
        "waste material"],

// algae
// archaea
// bacteria
// fungi
// glacial biofilm
// protozoa
// thermophilic biofilm


    "biofilm": ["none','','Entered 2017-08-18 AAV'),
        "algae','','Entered 2017-08-18 AAV'),
        "archaea','','Entered 2017-08-18 AAV'),
        "bacteria','','Entered 2017-08-18 AAV'),
        "fungi','','Entered 2017-08-18 AAV'),
        "glacial','','Entered 2017-08-18 AAV'),
        "protozoa','','Entered 2017-08-18 AAV'),
        "thermophilic"],

    "microbial mat material": ["none','','Entered 2017-08-18 AAV'),
        "archaea','','Entered 2017-08-18 AAV'),
        "bacteria','','Entered 2017-08-18 AAV'),
        "groundwater flowcell biofilm','','Entered 2017-08-18 AAV'),
        "hypersaline','','Entered 2017-08-18 AAV'),
        "submerged','','Entered 2017-08-18 AAV'),
        "terrestrial','','Entered 2017-08-18 AAV'),
        "tidal"],
    
// andesite
// basalt
// biogeneous sedimentary rock
// clastic sedimentary rock
// dolomite
// granite
// igneous rock
// limestone
// metamorphic rock
// plutonic rock
// pumice
// sandstone
// sedimentary rock
// shale
// volcanic rock

    "rock": ["none','','Entered 2017-08-18 AAV'),
        "andesite','','Entered 2017-08-18 AAV'),
        "basalt','','Entered 2017-08-18 AAV'),
        "biogeneous sedimentary','','Entered 2017-08-18 AAV'),
        "clastic sedimentary','','Entered 2017-08-18 AAV'),
        "dolomite','','Entered 2017-08-18 AAV'),
        "granite','','Entered 2017-08-18 AAV'),
        "igneous','','Entered 2017-08-18 AAV'),
        "limestone','','Entered 2017-08-18 AAV'),
        "metamorphic','','Entered 2017-08-18 AAV'),
        "plutonic','','Entered 2017-08-18 AAV'),
        "pumice','','Entered 2017-08-18 AAV'),
        "sandstone','','Entered 2017-08-18 AAV'),
        "sedimentary','','Entered 2017-08-18 AAV'),
        "shale','','Entered 2017-08-18 AAV'),
        "volcanic"],

// "anaerobic mud','','Entered 2017-08-18 AAV'),
// "colloidal sediment','','Entered 2017-08-18 AAV'),
// "estuarine mud','','Entered 2017-08-18 AAV'),
// "glacial mud','','Entered 2017-08-18 AAV'),
// "hyperthermophilic mud','','Entered 2017-08-18 AAV'),
// "lake bottom mud','','Entered 2017-08-18 AAV'),
// "marine mud','','Entered 2017-08-18 AAV'),
// "mesothermophilic mud','','Entered 2017-08-18 AAV'),
// "soil','','Entered 2017-08-18 AAV'),


    "mud": ["none','','Entered 2017-08-18 AAV'),
        "anaerobic','','Entered 2017-08-18 AAV'),
        "colloidal sediment','','Entered 2017-08-18 AAV'),
        "estuarine','','Entered 2017-08-18 AAV'),
        "glacial','','Entered 2017-08-18 AAV'),
        "hyperthermophilic','','Entered 2017-08-18 AAV'),
        "lake bottom','','Entered 2017-08-18 AAV'),
        "marine','','Entered 2017-08-18 AAV'),
        "mesothermophilic','','Entered 2017-08-18 AAV'),
        "soil"],
    
// clay soil
// colloidal soil
// permafrost
// contaminated soil
// muddy soil

    "soil": ["none','','Entered 2017-08-18 AAV'),
        "clay','','Entered 2017-08-18 AAV'),
        "colloidal','','Entered 2017-08-18 AAV'),
        "contaminated','','Entered 2017-08-18 AAV'),
        "muddy','','Entered 2017-08-18 AAV'),
        "permafrost"],

    "oil": ["none','','Entered 2017-08-18 AAV'),
        // "asphalt','','Entered 2017-08-18 AAV'),
        // "petroleum contamination','','Entered 2017-08-18 AAV'),
        // "seep','','Entered 2017-08-18 AAV'),
        // "spill','','Entered 2017-08-18 AAV'),
        "tar"],
    // ,
    //     "well"],

// quartz sand
// calcium carbonate sand
// basaltic sand
// desert sand
// beach sand
// sea sand


    "sand": ["none','','Entered 2017-08-18 AAV'),
        "basaltic','','Entered 2017-08-18 AAV'),
        "beach','','Entered 2017-08-18 AAV'),
        "calcium carbonate','','Entered 2017-08-18 AAV'),
        "desert','','Entered 2017-08-18 AAV'),
        "quartz','','Entered 2017-08-18 AAV'),
        "sea"]

  };

function populate_secondary_select(args) {
  var id_base = arguments[0][0];
  var sec_options = arguments[0][1];

  var did = this.id.replace("env_" + id_base, '');

  var id2 = id_base + "_secondary";

  var B = document.getElementById(id2+did);


  //---

  var sel_val = $(B).find(":selected").val();

  // alert("sel_val");
  // alert(sel_val);

  //---

  //clear out B
  B.length = 0;

  //get the selected value from A
  var _val = this.options[this.selectedIndex].value;


  //loop through bOption at the selected value
  for (var i in sec_options[_val]) {

    //create option tag
    var op = document.createElement('option');
    //set its value
    op.value = sec_options[_val][i];
  // .setAttribute('selected','selected');

    if (op.value === sel_val)
    {
      op.setAttribute('selected','selected');
    }

    //set the display label
    op.text = sec_options[_val][i];

    //append it to B
    B.appendChild(op);
  }
}

fnAdjustTable = function(){

    var colCount = $('#firstTr').find('td').length; //get total number of column

    var m = 0;
    var n = 0;
    var brow = 'mozilla';
    var table_div_el = $('#table_div');

    jQuery.each(jQuery.browser, function(i, val) {
        if(val === true){
            brow = i.toString();
        }
    });

    $('.tableHeader').each(function(i){
        if (m < colCount){

          var td_el = table_div_el.find('td:eq('+m+')');
            if (brow === 'mozilla'){
                $('#firstTd').css("width",$('.tableFirstCol').innerWidth());//for adjusting first td
                $(this).css('width', td_el.innerWidth());//for assigning width to table Header div
            }
            else if (brow === 'msie'){
                $('#firstTd').css("width",$('.tableFirstCol').width());
                $(this).css('width', td_el.width()-2);//In IE there is difference of 2 px
            }
            else if (brow === 'safari'){
                $('#firstTd').css("width",$('.tableFirstCol').width());
                $(this).css('width', td_el.width());
            }
            else {
                $('#firstTd').css("width",$('.tableFirstCol').width());
                $(this).css('width', td_el.innerWidth());
            }
        }
        m++;
    });

    $('.tableFirstCol').each(function(i){
      var cur_td_colCount_el = table_div_el.find('td:eq('+colCount*n+')');
        if(brow === 'mozilla'){
            $(this).css('height',cur_td_colCount_el.outerHeight());//for providing height using scrollable table column height
        }
        else if(brow === 'msie'){
            $(this).css('height',cur_td_colCount_el.innerHeight()-2);
        }
        else {
            $(this).css('height',cur_td_colCount_el.height());
        }
        n++;
    });

};

//function to support scrolling of title and first column
fnScroll = function(){
  var table_div_el = $('#table_div');
    $('#divHeader').scrollLeft(table_div_el.scrollLeft());
    $('#firstcol_div').scrollTop(table_div_el.scrollTop());
};

// ---
var rowIndex = 0;

function firstColTableAddRow(args) {
  var currRowIndex = arguments[0][0];
  var row_id_base = arguments[0][1];

  // alert(row_id_base);

  var newRow1 = '<tr id="' + row_id_base + '_first_col_table"><td><input id="Column Name' + currRowIndex + '" name="Column Name' +
    currRowIndex + '" type="text" placeholder="Column Name"/></td>"' + '<td><input id="Units' + currRowIndex +
    '" name="Units' + currRowIndex + '" type="text" placeholder="Units"/></td>"';

  // $('#first_col_table > tbody > tr:last').after(newRow1);
  $('#first_col_table').find('tbody').find('tr:last').after(newRow1);

}

function fixedTableBaseAddRow(args) {
  var currRowIndex = arguments[0][0];
  var row_id_base = arguments[0][1];
  var fixed_table_base_el = $('#fixed_table_base');
  
  var rowLength = fixed_table_base_el.find('tbody').find('tr:last').children('td').length;

  var cells = "";
  for (var i = 0; i < rowLength; i++) {
    cells += '<td style="background-color:powderblue;"><input type="text" name="new_row' + currRowIndex + 'cell' + i + '" id="new_row' + currRowIndex + 'cell' + i + '" value=""/></td>';
  }

  var newRow2 = '<tr id="' + row_id_base + '_fixed_table_base">' + cells + '</tr>';

  fixed_table_base_el.find('tbody').find('tr:last').after(newRow2);
  $('#new_row_length').val( rowLength );

}

$("#addrow").on('click', function() {
  rowIndex++;

  var row_id_base = 'new_row' + rowIndex;
  firstColTableAddRow.call(this, [rowIndex, row_id_base]);
  fixedTableBaseAddRow.call(this, [rowIndex, row_id_base]);

  $('#new_row_num').val( rowIndex );

  $("#" + row_id_base + "_fixed_table_base" )[0].scrollIntoView();
  $( "#" + row_id_base + "_first_col_table" )[0].scrollIntoView();
  window.scrollBy(-100, 0);

});


$("#removerow").on('click', function() {

  if (rowIndex > 0){

    var last_row_id_base = "new_row" + rowIndex;
    // alert(last_row_id + " was removed");
    // alert("One user-added row was removed");

    $('table#first_col_table tr#' + last_row_id_base + "_first_col_table").remove();
    $('table#fixed_table_base tr#' + last_row_id_base + "_fixed_table_base").remove();

    rowIndex--;
    $('#new_row_num').val( rowIndex );

  }
  else {
    alert('There is no rows to remove');
  }
});

copyFirst = function() {
  $('a.td_clone_add').on('click', function() {
    var first_input_value;
    var input_row;
    var first_td;

    var trIndex = $(this).closest('tr').eq(0).index();

    input_row = $('table#fixed_table_base tr').eq(trIndex);
    first_td  = input_row.find('td:first');

    first_input_value = first_td.children( ':input' ).val();

    // alert(first_input_value);

    input_row.find('td').each(function() {
      $(this).children(':input').val(first_input_value).change();
      // .css('background-color','blue');
    });

    return(false);
  });
};


$('.env_biome').change(function(){
  populate_secondary_select.call(this, ['biome', biome_seq_options]);
}).each(function(){

  if($(this).val() !== "Please choose one") {
    populate_secondary_select.call(this, ['biome', biome_seq_options]);
  }

});

$('.env_feature').change(function(){
  populate_secondary_select.call(this, ['feature', feature_seq_options]);
}).each(function(){

  if($(this).val() !== "Please choose one") {
    populate_secondary_select.call(this, ['feature', feature_seq_options]);
  }

});
$('.env_material').change(function(){
  // alert("On change");
  populate_secondary_select.call(this, ['material', material_seq_options]);
}).each(function(){
  // alert("on each")

  if($(this).val() !== "Please choose one") {
    // this.style.backgroundColor = "green";

    populate_secondary_select.call(this, ['material', material_seq_options]);
  }
  // else {
  //   this.style.backgroundColor = "blue";
  // }
});

$('#table_div').scroll(function(){
  fnScroll();
});

var metadata_dropdown_fields = ["biome_secondary/','','Entered 2017-08-18 AAV'),
  "dna_extraction_meth/','','Entered 2017-08-18 AAV'),
  "dna_quantitation/','','Entered 2017-08-18 AAV'),
  "env_biome/','','Entered 2017-08-18 AAV'),
  "env_feature/','','Entered 2017-08-18 AAV'),
  "env_material/','','Entered 2017-08-18 AAV'),
  "env_package/','','Entered 2017-08-18 AAV'),
  "feature_secondary/','','Entered 2017-08-18 AAV'),
  "investigation_type/','','Entered 2017-08-18 AAV'),
  "material_secondary/','','Entered 2017-08-18 AAV'),
  "sample_type/"
];

addCopyFirst = function () {
  var columnNo = 0;
  var this_tbl = $('table#first_col_table');

  var $tdsInColumnCurrent = this_tbl
    .find("tr td:nth-child(" + (columnNo + 1) + "):not('.header_divider')");

  $tdsInColumnCurrent.each(function () {
    var $label = $(this).find("label[for]");
    var $forAttr = $label.attr('for');
    if (jQuery.inArray($forAttr, metadata_dropdown_fields) !== -1)
    {
      $(this).wrapInner('<span class="makeLeft"></span>')
        .append('<span class="makeRight"><a href="#" class="td_clone_add">Copy 1st</a></span>');
    }
  });

  $(".makeRight").hover(function(){
    $(this).css('cursor','pointer').attr('title', 'Copy the first column value to all the following columns in this row.');
  }, function() {
    $(this).css('cursor','auto');
  });


  //
  // $tdsInColumnCurrent.each(function () {
  //   var next_text = $(this).parent().find('td').eq(columnNo + 1).text();
  //
  //   if (next_text !== "MBL Supplied") {
  //     // $(this).css('background-color','Aqua');
  //
  //     $(this).wrapInner('<span class="makeLeft"></span>')
  //       .append('<span class="makeRight"><a href="#" class="td_clone_add">Copy 1st</a></span>');
  //   }
  //
  // });
};

// addCopyFirst = function () {
//   var columnNo = 0;
//   var this_tbl = $('table#first_col_table');
//   var $tdsInColumnCurrent = this_tbl
//     .find("tr td:nth-child(" + (columnNo + 1) + "):not('.header_divider')");
//
//
//   $tdsInColumnCurrent.each(function () {
//     var next_text = $(this).parent().find('td').eq(columnNo + 1).text();
//
//     if (next_text !== "MBL Supplied") {
//       // $(this).css('background-color','Aqua');
//
//       $(this).wrapInner('<span class="makeLeft"></span>')
//         .append('<span class="makeRight"><a href="#" class="td_clone_add">Copy 1st</a></span>');
//     }
//
//   });
// };

addCopyBtns = function() {
  $('table#fixed_table_base').find('tr').eq(1).find('td').each(function() {
    $(this).append('<input type="button" value="Copy to next" class="cp_clmn"/>');
  });
  $(".cp_clmn").hover(function(){
    $(this).css('cursor','pointer').attr('title', 'Copies the values from this column to the next column only if the next column is empty.');
  }, function() {
    $(this).css('cursor','auto');
  });
};

$not_exist = ["None", "none", "undefined", "Please choose one", ""];

CopyColumn = function() {
  $(".cp_clmn").click(function(){
    var $columnNo = $(this).closest('td').index();
    var $this_tbl = $('table#fixed_table_base');
    var $tdsInColumnCurrent = $this_tbl
      .find("tr td:nth-child(" + ($columnNo + 1) + ")");

    $tdsInColumnCurrent.each(function () {
      var $current_val = $(this).children( ':input' ).val();
      var $next_cell = $(this).siblings().not('.readonly_td').eq($columnNo).children( ':input' );
      if (($current_val) && (jQuery.inArray($next_cell.val(), $not_exist) !== -1)) {
        // alert("current_val = " + $current_val);
        // alert("next_cell_val = " + $next_cell_val);
        $next_cell.val($current_val).change();
      }
    });
  });
};

showDatasets = function() {
  $('#table_div_header').hide();
  $('#firstTd').hide();

  $('#table_div').on('scroll', function () {
    if ($('#table_div').scrollTop() > 0) {
      $('#table_div_header').show();
      $('#firstTd').html('VAMPS dataset name').show();
    }
    $('#table_div_header').scrollLeft($('#table_div').scrollLeft());
    if ($('#table_div').scrollTop() === 0) {
      $('#table_div_header').hide();
      $('#firstTd').hide();
    }

  });
};

// ---

$(document).ready(function(){
  showDatasets();
  addCopyBtns();
  CopyColumn();
  addCopyFirst();
  copyFirst();
  fnAdjustTable();

});
