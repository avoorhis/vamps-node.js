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
  "marine biome": ["none",
    "abyssal zone",
    "bathyal",
    "benthic",
    "continental margin",
    "endolithic",
    "estuarine",
    "hadal zone",
    "marine aquatic",
    "neritic zone",
    "pelagic",
    "polar",
    "subseafloor aquatic",
    "subseafloor"
  ],

  "terrestrial biome": ["none",
    "desert",
    "endolithic",
    "forest",
    "grassland",
    "montane",
    "permafrost",
    "polar",
    "subterrestrial aquatic",
    "subterrestrial",
    "temperate",
    "terrestrial aquatic",
    "tropical",
    "tundra"]

  // "subterrestrial": ["none",
  //     "aquatic",
  //     "polar",
  //     "endolithic",
  //     "desert",
  //     "grassland",
  //     "tundra",
  //     "forest",
  //     "montane",
  //     "tropical",
  //     "temperate",
  //     "permafrost"],
  //
  // "subseafloor": ["none",
  //     "benthic",
  //     "bathyal",
  //     "abyssal",
  //     "hadal",
  //     "neritic",
  //     "continental margin",
  //     "estuarine",
  //     "polar",
  //     "endolithic"]
};

var feature_seq_options = {
  "well": ["none",
    "oil well",
    "water well"],

  "aquifer": ["none",
    "confined",
    "geological fracture",
    "microfracture",
    "shear fracture",
    "spring",
    "sub-continental aquifer",
    "sub-seafloor aquifer",
    "unconfined",
    "water well"],

  "borehole": ["none",
    "CORK",
    "casing",
    "oil well",
    "research borehole",
    "water well",
    "wellhead"],

  "cave": ["none",
    "cave wall",
    "erosional cave",
    "fault cave",
    "fissure cave",
    "glacier cave",
    "joint-plane cave",
    "karst cave"],

  "seep": ["none",
    "brine pool",
    "cold seep",
    "hydrothermal seep",
    "mound",
    "mud volcano",
    "oil seep",
    "sea floor",
    "seamount",
    "vent-field associated seep",
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
    "geological joint",
    "intrusion",
    "microfracture",
    "ocean trench",
    "shear fracture"],

  "geyser": ["none",
    "hydrothermal",
    "mineral deposit"],

  "spring": ["none",
    "acid hot spring",
    "alkaline hot spring",
    "hot spring",
    "mineral deposit",
    "mineral spring"],

  "hydrothermal vent": ["none",
    "black smoker",
    "marine hydrothermal plume",
    "marine hydrothermal vent",
    "marine hydrothermal vent chimney",
    "mid-ocean ridge",
    "mineral deposit",
    "white smoker"],

  "mine": ["none",
    "cave",
    "mine drainage",
    "mine tailing",
    "mine wall"],

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
    "crater floor",
    "crater wall",
    "mud volcano",
    "ridge",
    "seamount",
    "volcanic crater",
    "volcanic seep"],

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
    "anaerobic ",
    "biogenous",
    "carbon dioxide-reducing ",
    "clay",
    "colloidal ",
    "contaminated ",
    "granular ",
    "hydrogenous",
    "hyperthermophilic",
    "inorganically contaminated ",
    "iron-reducing  ",
    "manganese-reducing ",
    "mesophilic",
    "nitrate-reducing ",
    "organically contaminated",
    "petroleum contaminated ",
    "radioactive",
    "saline lake sediment",
    "silt",
    "sulphate-reducing",
    "terrigenous"],

  "water": ["none",
    "acidic water",
    "alkaline water",
    "anoxic water",
    "brackish water",
    "fresh groundwater",
    "fresh water",
    "groundwater",
    "groundwater flowcell biofilm",
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
    "waste material"],

// algae
// archaea
// bacteria
// fungi
// glacial biofilm
// protozoa
// thermophilic biofilm


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
    "groundwater flowcell biofilm",
    "hypersaline",
    "submerged",
    "terrestrial",
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

  "rock": ["none",
    "andesite",
    "basalt",
    "biogeneous sedimentary",
    "clastic sedimentary",
    "dolomite",
    "granite",
    "igneous",
    "limestone",
    "metamorphic",
    "plutonic",
    "pumice",
    "sandstone",
    "sedimentary",
    "shale",
    "volcanic"],

// "anaerobic mud",
// "colloidal sediment",
// "estuarine mud",
// "glacial mud",
// "hyperthermophilic mud",
// "lake bottom mud",
// "marine mud",
// "mesothermophilic mud",
// "soil",


  "mud": ["none",
    "anaerobic",
    "colloidal sediment",
    "estuarine",
    "glacial",
    "hyperthermophilic",
    "lake bottom",
    "marine",
    "mesothermophilic",
    "soil"],

// clay soil
// colloidal soil
// permafrost
// contaminated soil
// muddy soil

  "soil": ["none",
    "clay",
    "colloidal",
    "contaminated",
    "muddy",
    "permafrost"],

  "oil": ["none",
    // "asphalt",
    // "petroleum contamination",
    // "seep",
    // "spill",
    "tar"],
  // ,
  //     "well"],

// quartz sand
// calcium carbonate sand
// basaltic sand
// desert sand
// beach sand
// sea sand


  "sand": ["none",
    "basaltic",
    "beach",
    "calcium carbonate",
    "desert",
    "quartz",
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

var metadata_dropdown_fields = ["biome_secondary/",
  "dna_extraction_meth/",
  "dna_quantitation/",
  "env_biome/",
  "env_feature/",
  "env_material/",
  "env_package/",
  "feature_secondary/",
  "investigation_type/",
  "material_secondary/",
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

showSubmitMessage = function() {

  $('#add_project_form_submit_btn').click(function () {
    alert('Your information was saved in a csv file, please notify the Site administration if you have finished editing.');
    $('#add_project_form').submit();
  });
};
//  console.log("RRR1 req");
// console.log(req);
// req.flash("success", 'file ' + out_csv_file_name + ' saved.');
// console.log('file ' + out_csv_file_name + ' saved');
// var msg = 'file ' + out_csv_file_name + ' saved, please notify the Site administration if you have finished editing.';
// req.flash("success", 'file  saved.');
// console.log("RRR2 req");
// console.log(req);
// req.flash("fail", msg);

//same as in constants
ORDERED_METADATA_NAMES = [
  ["structured comment name","Parameter","", ""], //MBL Supplied or Optional
  ["","General","", ""],
  // ["project","VAMPS project name","MBL Supplied", ""],
  ["dataset","VAMPS dataset name","MBL Supplied", ""],
  ["geo_loc_name_continental","Country","User Supplied", ""],
  ["geo_loc_name_marine","Longhurst Zone","User Supplied", ""],
  ["","MBL generated laboratory metadata","", ""],
  ["domain","Domain","MBL Supplied", ""],
  ["target_gene","Target gene name","MBL Supplied", "16S rRNA, mcrA, etc"],
  ["dna_region","DNA region","MBL Supplied", ""],
  // was sequencing_meth
  ["sequencing_platform","Sequencing method","MBL Supplied", ""],
  ["forward_primer","Forward PCR Primer","MBL Supplied", ""],
  ["reverse_primer","Reverse PCR Primer","MBL Supplied", ""],
  ["illumina_index","Index sequence (for Illumina)","MBL Supplied", ""],
  ["adapter_sequence","Adapter sequence","MBL Supplied", ""],
  ["run","Sequencing run date","MBL Supplied", "YYYY-MM-DD"],
  ["","User supplied metadata","", ""],
  ["env_package","Environmental Package","User supplied", ""],
  ["sample_name","Sample ID (user sample name)","User supplied", ""],
  ["investigation_type","Investigation Type","User supplied", ""],
  ["sample_type","Sample Type","User supplied", ""],
  ["collection_date","Sample collection date","User supplied", "YYYY-MM-DD"],
  ["latitude","Latitude (±90°)","User supplied", "decimal degrees ±90°"],
  ["longitude","Longitude (±180°)","User supplied", "decimal degrees ±180°"],
  ["env_biome","Environmental Biome - Primary","User supplied", ""],
  ["biome_secondary","Environmental Biome - Secondary","User supplied", ""],
  ["env_feature","Environmental Feature - Primary","User supplied", ""],
  ["feature_secondary","Environmental Feature - Secondary","User supplied", ""],
  ["env_material","Environmental Material - Primary","User supplied", ""],
  ["material_secondary","Environmental Material - Secondary","User supplied", ""],
  ["","Enter depth values in one or more categories","", ""],
  ["depth_subseafloor","Depth below seafloor","User supplied", "mbsf"],
  ["depth_subterrestrial","Depth below terrestrial surface","User supplied", "meter"],
  // ["depth_in_core","Depth within core","User supplied", "cm"],
  ["tot_depth_water_col","Water column depth","User supplied", "meter"],
  ["elevation","Elevation","User supplied", "meter"],
  ["dna_extraction_meth","DNA Extraction","User supplied", ""],
  ["dna_quantitation","DNA Quantitation","User supplied", ""],
  ["","Enter either volume or mass","", ""],
  ["sample_size_vol","Sample Size (volume)","User supplied", "liter"],
  ["sample_size_mass","Sample Size (mass)","User supplied", "gram"],
  ["sample_collection_device","Sample collection device","", ""],
  ["formation_name","Formation name","User supplied", ""],
  ["","Sample handling","", ""],
  ["samp_store_dur","Storage duration","User supplied", "days"],
  ["samp_store_temp","Storage temperature","User supplied", "degrees celsius"],
  ["isol_growth_cond","Isolation and growth condition (reference)","User supplied", "PMID, DOI or URL"],
  ["","Non-biological","", ""],
  ["pH","pH","User supplied", ""],
  ["temperature","Temperature","User supplied", "degrees celsius"],
  ["conductivity","Conductivity","User supplied", "mS/cm"],
  ["resistivity","Resistivity","", "ohm-meter"],
  ["salinity","Salinity","", "PSS-78"],
  //It is measured in unit of PSU (Practical Salinity Unit), which is a unit based on the properties of sea water conductivity. It is equivalent to per thousand or (o/00) or to  g/kg.
  ["pressure","Pressure","", "bar"],
  ["redox_state","Redox state","", ""],
  ["redox_potential","Redox potential","", "millivolt"],
  ["diss_oxygen","Dissolved oxygen","", "µmol/kg"],
  ["diss_hydrogen","Dissolved hydrogen","", "µmol/kg"],
  ["diss_org_carb","Dissolved organic carbon","", "µmol/kg"],
  ["diss_inorg_carb","Dissolved inorganic carbon","", "µmol/kg"],
  ["tot_org_carb","Total organic carbon","", "percent"],
  ["NPOC","Non-purgeable organic carbon","", "percent"],
  ["tot_inorg_carb","Total inorganic carbon","", "percent"],
  ["tot_carb","Total carbon","", "percent"],
  ["carbonate","Carbonate","", "percent"],
  ["bicarbonate","Bicarbonate","", "µmol/kg"],
  ["silicate","Silicate","", "µmol/kg"],
  ["del18O_water","Delta 18O of water","", "parts per mil"],
  ["part_org_carbon_del13C","Delta 13C for particulate organic carbon","", "parts per mil"],
  ["diss_inorg_carbon_del13C","Delta 13C for dissolved inorganic carbon","", "parts per mil"],
  ["methane_del13C","Delta 13C for methane","", "parts per mil"],
  ["alkalinity","Alkalinity","", "meq/L"],
  ["calcium","Calcium","", "µmol/kg"],
  ["sodium","Sodium","", "µmol/kg"],
  ["ammonium","Ammonium","", "µmol/kg"],
  ["nitrate","Nitrate","", "µmol/kg"],
  ["nitrite","Nitrite","", "µmol/kg"],
  ["nitrogen_tot","Total nitrogen","", "µmol/kg"],
  ["org_carb_nitro_ratio","Carbon nitrogen ratio","", ""],
  ["sulfate","Sulfate","", "µmol/kg"],
  ["sulfide","Sulfide","", "µmol/kg"],
  ["sulfur_tot","Total sulfur","", "µmol/kg"],
  ["chloride","Chloride","", "µmol/kg"],
  ["phosphate","Phosphate","", "µmol/kg"],
  ["potassium","Potassium","", "µmol/kg"],
  ["iron","Total iron","", "µmol/kg"],
  ["iron_II","Iron II","", "µmol/kg"],
  ["iron_III","Iron III","", "µmol/kg"],
  ["magnesium","Magnesium","", "µmol/kg"],
  ["manganese","Manganese","", "µmol/kg"],
  ["methane","Methane","", "µmol/kg"],
  ["noble_gas_chemistry","Noble gas chemistry","", ""],
  ["trace_element_geochem","Trace element geochemistry","", ""],
  ["porosity","Porosity","", "percent"],
  ["rock_age","Sediment or rock age","", "millions of years (Ma)"],
  ["water_age","Water age","", "thousands of years (ka)"],
  ["","Biological","", ""],
  ["microbial_biomass_microscopic","Microbial biomass - total cell counts","", "cells/g"],
  ["n_acid_for_cell_cnt","NA dyes used for total cell counts","",""],
  ["microbial_biomass_FISH","FISH-based cell counts","", "cells/g"],
  ["FISH_probe_name","Name of FISH probe","",""],
  ["FISH_probe_seq","Sequence of FISH probe","",""],
  ["intact_polar_lipid","Intact polar lipid","", "pg/g"],
  ["microbial_biomass_qPCR","qPCR and primers used","", "gene copies"],
  // ["microbial_biomass_platecounts","Microbial biomass - plate counts - cell numbers","", ""],
  // ["microbial_biomass_avg_cell_number","Microbial biomass - other","", ""],
  ["biomass_wet_weight","Biomass - wet weight","", "gram"],
  ["biomass_dry_weight","Biomass - dry weight","", "gram"],
  ["plate_counts","Plate counts - colony forming ","", "CFU/ml"],
  ["functional_gene_assays","functional gene assays","", ""],
  ["clone_library_results","clone library results","", ""],
  ["enzyme_activities","enzyme activities","", ""],
  ["","User-added","", ""]
];

showUnits = function() {
    $('label').hover(function () {
      $forAttr = $(this).attr('for').slice(0,-1);

      for( var i = 0, len = ORDERED_METADATA_NAMES.length; i < len; i++ ) {
        if( ORDERED_METADATA_NAMES[i][0] === $forAttr ) {
          result = ORDERED_METADATA_NAMES[i][3];
          break;
        }
      }

      $(this).css('cursor', 'pointer').attr('title', result);
    }, function () {
      $(this).css('cursor', 'auto');
    });
};
// ---

$(document).ready(function(){
  showSubmitMessage();
  showUnits();
  showDatasets();
  // addCopyBtns();
  // CopyColumn();
  addCopyFirst();
  copyFirst();
  fnAdjustTable();
});
