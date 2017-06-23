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
    "marine": ["none",
        "abyssal",
        "bathyal",
        "benthic",
        "continental margin",
        "endolithic",
        "estuarine",
        "hadal",
        "neritic",
        "pelagic",
        "polar"
    ],

    "terrestrial": ["none",
        "aquatic",
        "polar",
        "endolithic",
        "desert",
        "grassland",
        "tundra",
        "forest",
        "montane",
        "tropical",
        "temperate",
        "permafrost"],

    "subterrestrial": ["none",
        "aquatic",
        "polar",
        "endolithic",
        "desert",
        "grassland",
        "tundra",
        "forest",
        "montane",
        "tropical",
        "temperate",
        "permafrost"],

    "subseafloor": ["none",
        "benthic",
        "bathyal",
        "abyssal",
        "hadal",
        "neritic",
        "continental margin",
        "estuarine",
        "polar",
        "endolithic"]
  };

  var feature_seq_options = {
    "well": ["none",
        "oil well",
        "water well"],

    "aquifer": ["none",
        "confined",
        "fracture - geological",
        "fracture - micro",
        "fracture - shear",
        "spring",
        "sub-continental",
        "unconfined",
        "water well"],

    "borehole": ["none",
        "CORK",
        "casing",
        "oil well",
        "research borehole/well",
        "water well",
        "wellhead"],

  "cave": ["none",
      "erosional cave",
      "fault cave",
      "fissure cave",
      "fracture - geological",
      "glacier cave",
      "karst cave",
      "wall"],

  "seep": ["none",
      "brine pool",
      "cold seep",
      "hydrothermal seep",
      "mound",
      "mud volcano",
      "oil seep",
      "seafloor",
      "seamount",
      "vent-field associated",
      "warm seep"],

  "enrichment": ["none",
      "animal carcass fall",
      "batch culture ",
      "bioreactor",
      "continuous culture",
      "fed batch culture",
      "mesocosm",
      "microcosm",
      "organic matter fall",
      "whale fall"],

  "fracture": ["none",
      "active geological fault",
      "aquifer",
      "fracture - geological",
      "fracture - micro",
      "fracture - shear",
      "intrusion",
      "trench"],

  "geyser": ["none",
    "hydrothermal",
    "mineral deposit"],

  "spring": ["none",
      "acidic hot",
      "alkaline hot",
      "hydrothermal",
      "mineral deposit",
      "mineral spring"],

  "vent": ["none",
      "flank",
      "hydrothermal",
      "magma driven (black smoker)",
      "mineral deposit",
      "ridge",
      "serpentinization driven (white smoker)",
      "vent chimney",
      "vent plume"],

  "mine": ["none",
      "cave",
      "mine drainage",
      "mine tailing",
      "wall"],

  "lake": ["none",
      "acidic hot",
      "alkaline salt",
      "glacial",
      "holomictic - fully mixed",
      "lake bed",
      "meromictic - non-mixing",
      "periglacial",
      "subglacial",
      "underground"],

  "volcano": ["none",
      "caldera",
      "crater",
      "crater floor",
      "crater wall",
      "mud volcano",
      "ridge",
      "seamount",
      "seep"],

  "reservoir": ["none",
      "aquifer",
      "confined",
      "freshwater",
      "saline",
      "subsurface",
      "unconfined"]
  };

  var material_seq_options = {
    "sediment": ["none",
        "anaerobic",
        "biogeneous (ex. forams, diatoms)",
        "carbon dioxide-reducing",
        "chemical precip. (ex. carbonate ooids)",
        "clay",
        "colloidal",
        "contaminated",
        "granular",
        "hydrogenous (ex. metal sulfide, evaporites)",
        "hyperthermophilic (changed from hyperthermal)",
        "inorganically contaminated",
        "iron-reducing",
        "manganese-reducing",
        "mesophilic (changed from mesothermal)",
        "nitrate-reducing",
        "organically contaminated",
        "petroleum contaminated",
        "radioactive",
        "saline lake sediment",
        "silt",
        "sulfate-reducing",
        "terrigeneous (ex. sand, silt, gravel)"],

    "water": ["none",
        "acidic water",
        "alkaline water",
        "anoxic",
        "brackish water",
        "fresh water",
        "ground water",
        "hypersaline water",
        "saline deep groundwater",
        "saline water",
        "sea water"],

    "fluid": ["none",
        "borehole water",
        "drilling fluid",
        "ground water",
        "hydrothermal fluid",
        "meltwater",
        "oil",
        "pore fluid",
        "waste material"],

    "biofilm": ["none",
        "algae",
        "archaea",
        "bacteria",
        "fungi",
        "glacial",
        "protozoa",
        "thermophilic"],

    "microbial mat material": ["none",
        "archaea",
        "bacteria",
        "biofilm-groundwater flowcell",
        "hypersaline",
        "submerged",
        "terrestrial",
        "tidal"],

    "rock": ["none",
        "andesite",
        "conglomerate",
        "dolomite",
        "granite",
        "igneous",
        "igneous - plutonic",
        "limestone",
        "metamorphic",
        "pumice",
        "sandstone",
        "sedimentary",
        "sedimentary - biogeneous (ex. limestone)",
        "sedimentary - clastic",
        "sedimentary - precipitated (ex. chert)",
        "shale",
        "volcanic",
        "volcanic - basalt"],

    "mud": ["none",
        "anaerobic ",
        "colloidal (sediment)",
        "estuarine",
        "glacial",
        "hyperthermal ",
        "lake bottom mud (changed from deep lacustrine)",
        "marine (changed from sea floor)",
        "mesothermal",
        "soil",
        "turbidite"],

    "soil": ["none",
        "clay",
        "colloidal ",
        "contaminated",
        "mud",
        "permafrost"],

    "oil": ["none",
    "asphalt",
    "petroleum contamination",
    "seep",
    "spill",
    "tar",
    "well"],

    "sand": ["none",
        "basaltic",
        "beach sand",
        "calcium carbonate",
        "desert sand",
        "quartz",
        "sea sand"]

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

function first_col_table_add_row(args) {
  var currRowIndex = arguments[0][0];
  var row_id_base = arguments[0][1];

  // alert(row_id_base);

  var newRow1 = '<tr id="' + row_id_base + '_first_col_table"><td><input id="Column Name' + currRowIndex + '" name="Column Name' +
    currRowIndex + '" type="text" placeholder="Column Name"/></td>"' + '<td><input id="Units' + currRowIndex +
    '" name="Units' + currRowIndex + '" type="text" placeholder="Units"/></td>"';

  // $('#first_col_table > tbody > tr:last').after(newRow1);
  $('#first_col_table').find('tbody').find('tr:last').after(newRow1);

}

function fixed_table_base_add_row(args) {
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
  first_col_table_add_row.call(this, [rowIndex, row_id_base]);
  fixed_table_base_add_row.call(this, [rowIndex, row_id_base]);

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

addCopyFirst = function () {
  // .not('.header_divider').not('.required_fields') $('div:not(.a,.b)').empty()
  var columnNo = 0;
  var this_tbl = $('table#first_col_table');
  var $tdsInColumnCurrent = this_tbl
    .find("tr td:nth-child(" + (columnNo + 1) + "):not('.header_divider')");




  $tdsInColumnCurrent.each(function () {
    // alert('JIJIJ');
    // alert($(this).index());
    // $(this).append('<input type="button" value="CNNN" class="cp_first"/>');
    var next_text = $(this).parent().find('td').eq(1).text();
    // $(this).parent().next('td').text();
    // alert(next_text);

    if (next_text !== "MBL Supplied") {
      $(this).css('background-color','Aqua');

    }

    // $( "input:not(:checked) + span" ).css( "background-color", "yellow" );

  });

  //   $('table#first_col_table').find('tr').each(function() {
  //   var curr_td = $(this).find('td').eq(0).not('.header_divider');
  //   alert('JIJIJ');
  //   alert($(this).index());
  //   curr_td.append('<input type="button" value="CNNN" class="cp_first"/>');
  // });
};

addCopyBtns = function() {
  $('table#fixed_table_base').find('tr').eq(1).find('td').each(function() {
    $(this).append('<input type="button" value="Copy to next" class="cp_clmn"/>');
  });
};

CopyColumn = function() {
  $(".cp_clmn").click(function(){
    var columnNo = $(this).closest('td').index();
    var this_tbl = $('table#fixed_table_base');
    var $tdsInColumnCurrent = this_tbl
      .find("tr td:nth-child(" + (columnNo + 1) + ")");

    $tdsInColumnCurrent.each(function () {
      var current_val = $(this).children( ':input' ).val();
      $(this).siblings().not('.readonly_td').eq(columnNo)
        .children( ':input' ).val(current_val).change();
    });
  });
};

// ---

$(document).ready(function(){
  addCopyBtns();
  CopyColumn();
  addCopyFirst();
  fnAdjustTable();

});
