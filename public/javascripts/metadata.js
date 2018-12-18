toggle_metadata = document.getElementById('toggle_metadata') || null;
if (toggle_metadata !== null) {
  toggle_metadata.addEventListener('click', function () {
    toggle_metadata_view();
  });
}

//
// TOGGLE_METADATA_VIEW
//
function toggle_metadata_view() {
  // page: metadata_table
  // toggles all/selected metadata

  var ckbx = document.getElementById('toggle_metadata');
  var load;
  if (ckbx.checked === true) {
    ckbx.checked                                           = true;
    document.getElementById('md_select_phrase1').innerHTML = "Showing All Metadata";
    document.getElementById('md_select_phrase2').innerHTML = "Show Selected Metadata Only?";
    load                                                   = 'all';
  } else {
    ckbx.checked                                           = false;
    document.getElementById('md_select_phrase1').innerHTML = "Showing Selected Metadata Only";
    document.getElementById('md_select_phrase2').innerHTML = "Show All Metadata?";
    load                                                   = 'selected';
  }

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", '/visuals/partials/load_metadata?load=' + load);
  xmlhttp.onreadystatechange = function () {

    if (xmlhttp.readyState === 4) {
      var string                                              = xmlhttp.responseText;
      document.getElementById('metadata_table_div').innerHTML = string;
      new Tablesort(document.getElementById('metadata_table'));
    }
  };
  xmlhttp.send();

}


function create_geospatial() {
  console.log('IN metadata.js:create_geospatial()')
  var mapCanvas = document.getElementById('map-canvas');
  mapCanvas.innerHTML = '';
  mapCanvas.style.display = 'block';
  mapCanvas.style.height  = '900px';

  var loc_data          = [];
  var lat_lon_collector = {};
  var pid_collector     = {};
  var latlon;

  for (var ds in md_local) {
    pid_collector[ds]       = {};
    pid_collector[ds].pid   = md_local[ds].pid;
    pid_collector[ds].value = md_local[ds].value;
    var lat                 = '';
    var lon                 = '';
    for (var k in md_local[ds]) {
      md_item = k;
      if (md_item === 'latitude') {
        lat = Number(md_local[ds][k]);
      }
      if (md_item === 'longitude') {
        lon = Number(md_local[ds][k]);
      }
    }

    if (typeof lat === 'number' && typeof lon === 'number') {
      latlon = lat.toString() + ';' + lon.toString();
      if (latlon in lat_lon_collector) {
        var newds                 = lat_lon_collector[latlon] + ":::" + ds;
        lat_lon_collector[latlon] = newds;
      } else {
        lat_lon_collector[latlon] = ds;
      }
    }
  }
  var z = 1;

  for(latlon in lat_lon_collector){
    ds = lat_lon_collector[latlon];
    var latlons =  latlon.split(';');
    loc_data.push([ds, latlons[0], latlons[1], z]);
    z += 1;

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
    var lines = data[0].split(':::');
    if(lines.length > 10){
      var html = "<div style='height:200px;width:300px;overflow:auto;'>";
    }else{
      var html = "<div style='width:300px;'>";
    }
    html += "<table  class='table table_striped' >";
    html += '<tr><th>Dataset</th><th>'+mditem+'</th></tr>';
    for(l in lines){
      var pid = pid_collector[lines[l]].pid;
      var val = pid_collector[lines[l]].value;
      html += "<tr><td><a href='/projects/"+pid+"'>" + lines[l] + "</a></td><td>"+val+"</td></tr>";
    }
    html += '</table>';
    html += "</div>";
    marker.bindPopup(html);
    marker.on('mouseover', function (e) {
      this.openPopup();
    });
  }

};


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
    "batch culture",
    "bioreactor",
    "continuous culture",
    "fed batch culture",
    "mesocosm",
    "microcosm",
    "organic matter fall",
    "whale fall"],

  "geological fracture": ["none",
    "active geological fault",
    "aquifer",
    "geological joint",
    "intrusion",
    "microfracture",
    "shear fracture"],

  "ocean trench": ["none",
    "accretionary",
    "inner trench wall",
    "non-accretionary",
    "outer trench wall"],

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
    "anaerobic",
    "biogenous",
    "carbon dioxide-reducing",
    "clay",
    "colloidal",
    "contaminated",
    "granular",
    "hydrogenous",
    "hyperthermophilic",
    "inorganically contaminated",
    "iron-reducing",
    "manganese-reducing",
    "mesophilic",
    "nitrate-reducing",
    "organically contaminated",
    "petroleum contaminated",
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
    "mesophilic",
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
  var id_base     = arguments[0][0];
  var sec_options = arguments[0][1];

  var did = this.id.replace("env_" + id_base, '');

  var id2 = id_base + "_secondary";

  var B = document.getElementById(id2 + did);


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
    var op   = document.createElement('option');
    //set its value
    op.value = sec_options[_val][i];
    // .setAttribute('selected','selected');

    if (op.value === sel_val) {
      op.setAttribute('selected', 'selected');
    }

    //set the display label
    op.text = sec_options[_val][i];

    //append it to B
    B.appendChild(op);
  }
}

fnAdjustTable = function () {

  var colCount = $('#firstTr').find('td').length; //get total number of column
  // var colCount = $('#fixed_table_base').find('tr:first').find('td.header_divider').length; //get total number of column
  var m            = 0;
  var n            = 0;
  var brow         = 'mozilla';
  var table_div_el = $('#table_div');

  jQuery.each(jQuery.browser, function (i, val) {
    if (val === true) {
      brow = i.toString();
    }
  });

  $('.tableHeader').each(function (i) {
    if (m < colCount) {

      var td_el = table_div_el.find('td:eq(' + m + ')');
      if (brow === 'mozilla') {
        $('#firstTd').css("width", $('.tableFirstCol').innerWidth());//for adjusting first td
        $(this).css('width', td_el.innerWidth());//for assigning width to table Header div
      }
      else if (brow === 'msie') {
        $('#firstTd').css("width", $('.tableFirstCol').width());
        $(this).css('width', td_el.width() - 2);//In IE there is difference of 2 px
      }
      else if (brow === 'safari') {
        $('#firstTd').css("width", $('.tableFirstCol').width());
        $(this).css('width', td_el.width());
      }
      else {
        $('#firstTd').css("width", $('.tableFirstCol').width());
        $(this).css('width', td_el.innerWidth());
      }
    }
    m++;
  });

  $('.tableFirstCol').each(function (i) {
    var cur_td_colCount_el = table_div_el.find('td:eq(' + colCount * n + ')');
    if (brow === 'mozilla') {
      $(this).css('height', cur_td_colCount_el.outerHeight());//for providing height using scrollable table column height
    }
    else if (brow === 'msie') {
      $(this).css('height', cur_td_colCount_el.innerHeight() - 2);
    }
    else {
      $(this).css('height', cur_td_colCount_el.height());
    }
    n++;
  });

};

//function to support scrolling of title and first column
fnScroll = function () {
  var table_div_el = $('#table_div');
  $('#divHeader').scrollLeft(table_div_el.scrollLeft());
  $('#firstcol_div').scrollTop(table_div_el.scrollTop());
};

// ---
var rowIndex = 0;

function firstColTableAddRow(args) {
  var currRowIndex = arguments[0][0];
  var row_id_base  = arguments[0][1];

  // alert(row_id_base);

  var newRow1 = '<tr id="' + row_id_base + '_first_col_table"><td><input id="Column Name' + currRowIndex + '" name="Column Name' +
    currRowIndex + '" type="text" placeholder="Column Name"/></td>"' + '<td><input id="Units' + currRowIndex +
    '" name="Units' + currRowIndex + '" type="text" placeholder="Units"/></td>"';

  // $('#first_col_table > tbody > tr:last').after(newRow1);
  $('#first_col_table').find('tbody').find('tr:last').after(newRow1);

}

function fixedTableBaseAddRow(args) {
  var currRowIndex        = arguments[0][0];
  var row_id_base         = arguments[0][1];
  var fixed_table_base_el = $('#fixed_table_base');

  var rowLength = fixed_table_base_el.find('tbody').find('tr:last').children('td').length;

  var cells = "";
  for (var i = 0; i < rowLength; i++) {
    cells += '<td style="background-color:powderblue;"><input type="text" name="new_row' + currRowIndex + 'cell' + i + '" id="new_row' + currRowIndex + 'cell' + i + '" value=""/></td>';
  }

  var newRow2 = '<tr id="' + row_id_base + '_fixed_table_base">' + cells + '</tr>';

  fixed_table_base_el.find('tbody').find('tr:last').after(newRow2);
  $('#new_row_length').val(rowLength);

}

$("#addrow").on('click', function () {
  rowIndex++;

  var row_id_base = 'new_row' + rowIndex;
  firstColTableAddRow.call(this, [rowIndex, row_id_base]);
  fixedTableBaseAddRow.call(this, [rowIndex, row_id_base]);

  $('#new_row_num').val(rowIndex);

  $("#" + row_id_base + "_fixed_table_base")[0].scrollIntoView();
  $("#" + row_id_base + "_first_col_table")[0].scrollIntoView();
  window.scrollBy(-100, 0);

});


$("#removerow").on('click', function () {

  if (rowIndex > 0) {

    var last_row_id_base = "new_row" + rowIndex;
    // alert(last_row_id + " was removed");
    // alert("One user-added row was removed");

    $('table#first_col_table tr#' + last_row_id_base + "_first_col_table").remove();
    $('table#fixed_table_base tr#' + last_row_id_base + "_fixed_table_base").remove();

    rowIndex--;
    $('#new_row_num').val(rowIndex);

  }
  else {
    alert('There is no rows to remove');
  }
});

copyFirst = function () {
  $('a.td_clone_add').on('click', function () {
    var first_input_value;
    var input_row;
    var first_td;

    var trIndex = $(this).closest('tr').eq(0).index();

    input_row = $('table#fixed_table_base tr').eq(trIndex);
    first_td  = input_row.find('td:first');

    first_input_value = first_td.children(':input').val();

    // alert(first_input_value);

    input_row.find('td').each(function () {
      $(this).children(':input').val(first_input_value).change();
      // .css('background-color','blue');
    });

    return (false);
  });
};


$('.env_biome').change(function () {
  populate_secondary_select.call(this, ['biome', biome_seq_options]);
}).each(function () {

  if ($(this).val() !== "Please choose one") {
    populate_secondary_select.call(this, ['biome', biome_seq_options]);
  }

});


$('.env_feature').change(function () {
  populate_secondary_select.call(this, ['feature', feature_seq_options]);
}).each(function () {

  if ($(this).val() !== "Please choose one") {
    populate_secondary_select.call(this, ['feature', feature_seq_options]);
  }

});

$('.env_material').change(function () {
  // alert("On change");
  populate_secondary_select.call(this, ['material', material_seq_options]);
}).each(function () {
  // alert("on each")

  if ($(this).val() !== "Please choose one") {
    // this.style.backgroundColor = "green";

    populate_secondary_select.call(this, ['material', material_seq_options]);
  }
  // else {
  //   this.style.backgroundColor = "blue";
  // }
});

$('#table_div').scroll(function () {
  fnScroll();
});

var metadata_dropdown_fields = ["biome_secondary",
  "dna_extraction_meth",
  "dna_quantitation",
  "env_biome",
  "env_feature",
  "env_material",
  "env_package",
  "feature_secondary",
  "investigation_type",
  "material_secondary",
  "sample_type",
  "target_gene"
];

addCopyFirst = function () {
  var columnNo = 0;
  var this_tbl = $('table#first_col_table');

  var $tdsInColumnCurrent = this_tbl
    .find("tr td:nth-child(" + (columnNo + 1) + "):not('.header_divider')");

  $tdsInColumnCurrent.each(function () {
    var $label   = $(this).find("label[for]");
    var $forAttr = $label.attr('for').slice(0, -1);
    if (jQuery.inArray($forAttr, metadata_dropdown_fields) !== -1) {
      $(this).wrapInner('<span class="makeLeft"></span>')
        .append('<span class="makeRight"><a href="#" class="td_clone_add">Copy 1st</a></span>');
    }
  });

  $(".makeRight").hover(function () {
    $(this).css('cursor', 'pointer').attr('title', 'Copy the first column value to all the following columns in this row.');
  }, function () {
    $(this).css('cursor', 'auto');
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

addCopyBtns = function () {
  $('table#fixed_table_base').find('tr').eq(1).find('td').each(function () {
    $(this).append('<input type="button" value="Copy to next" class="cp_clmn"/>');
  });
  $(".cp_clmn").hover(function () {
    $(this).css('cursor', 'pointer').attr('title', 'Copies the values from this column to the next column only if the next column is empty.');
  }, function () {
    $(this).css('cursor', 'auto');
  });
};

addAllCopyBtn = function () {
  $('table#fixed_table_base').find('tr').eq(1).find('td').eq(0).append('<input type="button" value="Copy to all" class="cp_clmn"/>');
  $(".cp_clmn").hover(function () {
    $(this).css('cursor', 'pointer').attr('title', 'Copies the values from the first column to all empty columns.');
  }, function () {
    $(this).css('cursor', 'auto');
  });
};

$not_exist = ["None", "none", "undefined", "Please choose one", ""];

CopyColumn = function () {
  $(".cp_clmn").click(function () {
    var $columnNo           = $(this).closest('td').index();
    var $this_tbl           = $('table#fixed_table_base');
    var $tdsInColumnCurrent = $this_tbl
      .find("tr td:nth-child(" + ($columnNo + 1) + ")");

    $tdsInColumnCurrent.each(function () {
      var $current_val = $(this).children(':input').val();
      var $next_cell   = $(this).siblings().not('.readonly_td').eq($columnNo).children(':input');
      if (($current_val) && (jQuery.inArray($next_cell.val(), $not_exist) !== -1)) {
        // alert("current_val = " + $current_val);
        // alert("next_cell_val = " + $next_cell_val);
        $next_cell.val($current_val).change();
      }
    });
  });
};

CopyColumnToAll = function () {
  $(".cp_clmn").click(function () {
    var $column_No     = $(this).closest('td').index();
    var $this_tbl      = $('table#fixed_table_base');
    // get total number of column
    var $total_columns = $this_tbl.find("tr")[0].cells.length;
    // or   var colCount = $('#firstTr').find('td').length;
    var $columns_left  = $total_columns - $column_No;

    for (var $col_cnt = 0; $col_cnt < $columns_left; $col_cnt++) {
      // alert("$col_cnt = " + $col_cnt);

      var $tds_in_column_current = $this_tbl
        .find("tr td:nth-child(" + ($col_cnt + 1) + ")");

      $tds_in_column_current.each(function () {
        copyCellValToNext.call(this, [$col_cnt]);
      });
    } //for columns_left
  });
};

function copyCellValToNext(args) {
  var $col_cnt     = arguments[0][0];
  var $current_val = $(this).children(':input').val();
  var $next_cell   = $(this).siblings().not('.readonly_td').eq($col_cnt).children(':input');
  if (($current_val) && (jQuery.inArray($next_cell.val(), $not_exist) !== -1)) {
    // alert("current_val = " + $current_val);
    $next_cell.val($current_val).change();
  }
}

showDatasets = function () {
  $('#table_div_header').hide();
  $('#firstTd').hide();

  $('#table_div').on('scroll', function () {
    if ($('#table_div').scrollTop() > 0) {
      $('#table_div_header').show();
      $('#firstTd').html('VAMPS dataset').show();
    }
    $('#table_div_header').scrollLeft($('#table_div').scrollLeft());
    if ($('#table_div').scrollTop() === 0) {
      $('#table_div_header').hide();
      $('#firstTd').hide();
    }
  });
};
//
// showSampleNumber = function () {
//   alert("TTT");
//   $('#first_td').html('Sample #').show();
//   var $columnNo = $(this).closest('td').index();
//   $('#header_th_div').html($columnNo).show();
//   // var $this_tbl = $('table#fixed_table_base');
//
// };

//TODO: on text validate - nothing, on text Submit - show
showSubmitMessage = function () {
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

// showUnits = function () {
//   $('label').hover(function () {
//     $field_name = $(this).attr('for').slice(0, -1);
//
//     $unit = all_field_units_js[$field_name];
//     if ($unit) {
//       result = $unit;
//     }
//     else {
//       result = ordered_field_names_obj_js[$field_name][1][3];
//     }
//
//     $(this).css('cursor', 'pointer').attr('title', result);
//   }, function () {
//     $(this).css('cursor', 'auto');
//   });
// };

showUnits = function () {
  $('label').hover(function () {
    var $field_name = $(this).attr('for').slice(0, -1);

    var result = all_field_units_js[$field_name];
    if (!result) {
      result = ordered_field_names_obj_js[$field_name][1][3];
    }

    $(this).css('cursor', 'pointer').attr('title', result);
  }, function () {
    $(this).css('cursor', 'auto');
  });
};

// ---

//164#Amaral Zettler Linda#Amaral Zettler#Linda#amaral@mbl.edu

$('#pi_id_name').change(function () {
  // alert(this.value);
  var last_name     = this.value.split("#")[2];
  var first_name    = this.value.split("#")[3];
  var pi_email      = this.value.split("#")[4];
  var full_name     = first_name + " " + last_name;
  var inits         = full_name.split(" ");
  var inits_len     = inits.length;
  var project_name1 = "";
  for (var i = 0; i < inits_len; i++) {
    project_name1 = project_name1 + inits[i][0];
  }
  // alert(project_name1);
  $('input#project_name1').val(project_name1);
  $('input#pi_email').val(pi_email);

});

$('input:radio[name="d_region"]').change(
  function () {
    if ($(this).is(':checked')) {
      var project_name3 = this.value.split("#")[2];
      $('input#project_name3').val(project_name3);
    }
  });


// ---

$(document).ready(function () {
  // showSubmitMessage();
  showUnits();
  showDatasets();
  // addCopyBtns();
  // CopyColumn();
  addAllCopyBtn();
  CopyColumnToAll();
  // addCopyFirst();
  // copyFirst();
  fnAdjustTable();
});