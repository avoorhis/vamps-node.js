// common.js
var path = require('path');
var fs = require('fs');
var extend = require('util')._extend;
var COMMON  = require('./routes_common');
var C = require('../../public/constants');
var HMAP    = require('./routes_distance_heatmap');
var DEND    = require('./routes_dendrogram');
var PCOA    = require('./routes_pcoa');

module.exports = {

  start_visuals_html: function(visual) {
    var html = '<table border="1" class="single_border center_table"><tr><td>';
    html += this.get_selection_markup(visual, visual_post_items); // block for listing prior selections: domains,include_NAs ...
    html += '</td><td>';
    html += this.get_choices_markup(visual, visual_post_items);      // block for controls to normalize, change tax percentages or distance
    html += '</td></tr></table>';
    return html;
  },

  get_selection_markup: function( visual, obj ) {
    
    // obj is visual_post_items
    var html = "<div id='' class='selection_info'>";
    if(visual === 'heatmap' ||visual === 'dendrogram' || visual === 'pcoa' ) {
      html += '<li>Selected Distance Metric: ' + obj.selected_distance + '</li>';
    }
    html += '<li>Maximum Dataset Count (raw): ' + obj.max_ds_count.toString() + '</li>';
    if(obj.unit_choice.indexOf('tax') === 0 ) {
      html += '<li>Included Domains: ' + obj.domains     + '</li>';
      html += '<li>Include NAs?: '     + obj.include_nas + '</li>';
      html += '<li>Taxonomic Depth: '  + obj.tax_depth   + '</li>';
    }
    if(obj.normalization === 'none') {
      html += '<li>Normalization: ' + obj.normalization + ' (raw counts)</li>';
    }else{
      html += '<li>Normalization: ' + obj.normalization + '</li>';
    }
    html += '</div>';
    return html;
  },
  //
  //
  //
  get_choices_markup: function( visual, obj ) {
    var html = "<div id='' class='choices_info'>";
    //title: req.params.title   || 'default_title',
    //  timestamp: myurl.query.ts || 'default_timestamp',
    //  html : html,
    //  user: req.user
    html += "<form name='' method='GET'>";
    if( visual === 'heatmap' || visual === 'dendrogram' || visual === 'pcoa' ) {
      //console.log(C.DISTANCECHOICES)
      var viz_page = 'selected_distance';
      var distrows = C.DISTANCECHOICES.choices;
      html += '<li>Change Distance Metric: ';
      html += "<select name='selected_distance' class='small_font'>";
      for (var d in distrows ) {
        if (obj[viz_page] === distrows[d].id) {
          html += "<option value='"+distrows[d].id+"' selected='selected' >"+distrows[d].show+"</option>";
        }else{
          html += "<option value='"+distrows[d].id+"'>"+distrows[d].show+"</option>";
        }
      } 
      html += "</select></li>";
      html += '<hr>';
    }
  // unit_choice: 'tax_silva108_simple',
  // max_ds_count: 3609,
  // no_of_datasets: 232,
  // normalization: 'none',
  // visuals: [ 'barcharts' ],
  // selected_heatmap_distance: 'morisita_horn',
  // selected_dendrogram_distance: 'morisita_horn',
  // tax_depth: 'phylum',
  // domains: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
  // include_nas: 'yes' }



    html += '<li>Normalization: ';
    if(obj.normalization === 'frequency' || obj.normalization === 'freq') {
      html += '<input type="radio" name="norm" value="none" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max"  >To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" checked="checked">To Frequency';
    } else if (obj.normalization === 'maximum' || obj.normalization === 'max') {
      html += '<input type="radio" name="norm" value="none" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max"  checked="checked">To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" >To Frequency';
    } else {
      html += '<input type="radio" name="norm" value="none" checked="checked" >None &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="max"  >To Maximum Count &nbsp;&nbsp;&nbsp;';
      html += '<input type="radio" name="norm" value="freq" >To Frequency';
    }
    html += '</li>';
    html += '<hr>';
    html += '<li>Limit view based on count percentage: &nbsp;&nbsp;&nbsp;';
     
     html += "MIN <select name='min_range' class='small_font'>";
     for( var n=0;n < C.PCT_RANGE.length-1;n++ ) {
       if(obj.min_range.toString() === C.PCT_RANGE[n].toString()) {
         html += "<option value='"+C.PCT_RANGE[n]+"' selected='selected'>"+C.PCT_RANGE[n]+" %</option>";
       }else{
         html += "<option value='"+C.PCT_RANGE[n]+"'>"+C.PCT_RANGE[n]+" %</option>";
       }       
     }
    html += "</select>";
    html += "&nbsp;&nbsp;&nbsp; MAX <select name='max_range' class='small_font'>";
    // TODO: "'n' is already defined."
     for (var n1=1; n1 < C.PCT_RANGE.length; n1++ ) {
       
       if(obj.max_range.toString() === C.PCT_RANGE[n1].toString()) {
         html += "<option value='"+C.PCT_RANGE[n1]+"' selected='selected'>"+C.PCT_RANGE[n1]+" %</option>";
       }else{
         html += "<option value='"+C.PCT_RANGE[n1]+"'>"+C.PCT_RANGE[n1]+" %</option>";
       }
     }
    html += "</select></li>";
    html += '<hr>';
    html += "<li>Make your selections then press: ";
    html += "<input type='submit' value='Change View' ></li>";
    html += '<input type="hidden" name="ts" value="'+obj.ts+'">';
    html += '</form>';
    html += '</div>';
    return html;
  },

  //
  //
  //
  save_post_items: function(req) {
    // GLOBAL Variable
    var post_hash = {};

    if(req.body.ds_order === undefined) {
          
          post_hash.unit_choice                  = req.body.unit_choice;
          //visual_post_items.max_ds_count                 = COMMON.get_max_dataset_count(selection_obj);
          post_hash.no_of_datasets               = chosen_id_name_hash.ids.length;
          post_hash.normalization                = req.body.normalization || 'none';
          post_hash.visuals                      = req.body.visuals;
          post_hash.selected_distance            = req.body.selected_distance || 'morisita_horn';
          post_hash.tax_depth                    = req.body.tax_depth    || 'custom';
          post_hash.domains                      = req.body.domains      || ['NA'];
          if(typeof post_hash.domains == 'string') {
            post_hash.domains = post_hash.domains.split(',');
          }
          post_hash.custom_taxa                  = req.body.custom_taxa  || ['NA'];
          // in the unusual event that a single custom checkbox is selected --> must change from string to list:
          if(typeof post_hash.custom_taxa !== 'object') {post_hash.custom_taxa = [post_hash.custom_taxa]; }
          post_hash.include_nas                  = req.body.include_nas  || 'yes';
          post_hash.min_range                    = req.body.min_range || 0;
          post_hash.max_range                    = req.body.max_range || 100;
          if(typeof req.body.selected_metadata == 'string'){
            post_hash.metadata                     = req.body.selected_metadata.split(',') || [];
          }else{
            post_hash.metadata                     = req.body.selected_metadata  || [];
          }
          
          post_hash.update_data                  = req.body.update_data  || false;  // zer
          

    }else {
        chosen_id_name_hash = this.create_chosen_id_name_hash(req.body.ds_order);   
        post_hash = visual_post_items;       
    }
    return post_hash;
  },

  //
  //
  //
  get_otus_query: function() {

  },

  //
  //
  //
  get_med_query: function() {

  },
  //
  // write file
  //
  write_file: function(filename, txt) {

    fs.writeFile(path.resolve(__dirname, filename), txt, function(err) {
      if(err) {
        console.log('Could not write file: '+filename+' Here is the error: '+err);
      } else {
        console.log("The file ("+filename+") was saved!");
      }
    });

  },
  //
  // NORMALIZATION
  //
  normalize_counts: function(norm_type, selection_obj, max_count) {
    
    // get max dataset count
    //var selection_obj = JSON.parse(obj);
    //var max_count = post_items.max_ds_count;
    //selection_obj.max_ds_count = max_count;
    console.log('in normalization: '+norm_type+' max: '+max_count.toString());

    var new_counts_obj = [];
    for (var n=0; n < selection_obj.seq_freqs.length; n++) {
      var sum=0;
      for (var i = 0; i < selection_obj.seq_freqs[n].length; i++ ) {
        sum += selection_obj.seq_freqs[n][i];
      }
      var temp = [];
      for (i=0; i < selection_obj.seq_freqs[n].length; i++) {

        if (norm_type === 'max') {
          temp.push( parseInt( ( selection_obj.seq_freqs[n][i] * max_count ) / sum, 10) );
        } else {  // freq
          temp.push( parseFloat( ( selection_obj.seq_freqs[n][i]  / sum ).toFixed(8) ) );
        }

      }
      new_counts_obj.push(temp);
    }
    
    return new_counts_obj;
  },

  //
  //  MAX DS COUNT
  //
  get_max_dataset_count: function(obj) {
    // Gets the maximum dataset count from the 'seq_freqs' in selection_obj
    var max_count = 0;
    for (var n=0; n < obj.seq_freqs.length; n++) {
      var sum=0;
      for (var i = 0; i < obj.seq_freqs[n].length; i++) {  
        sum += parseInt(obj.seq_freqs[n][i]);
        //console.log(obj.seq_freqs[n][i]);
      }
      
      if (sum > max_count) {
        max_count = sum;
      }
    }
    //console.log(max_count);
    return max_count;
  },

  //
  // STRING to COLOR CODE
  //
  string_to_color_code2: function(str) {
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    // int/hash to hex
    // TODO: "'i' is already defined."
    for (var i1 = 0, colour = "#"; i1 < 3; colour += ("00" + ((hash >> i1++ * 8) & 0xFF).toString(16)).slice(-2));
    return colour;
  },
  string_to_color_code: function (str){
    var hash = 0;
    for(var i=0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 3) - hash);
    }
    var color = Math.abs(hash).toString(16).substring(0, 6);
    return "#" + '000000'.substring(0, 6 - color.length) + color;
  },
  
 //
//
//
run_pyscript_cmd: function (req, res, ts, biom_file, visual_name, metric) {
    var exec = require('child_process').exec;
    var PythonShell = require('python-shell');
    var html = this.start_visuals_html(visual_name);
    
    var title = 'VAMPS';
    
    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(__dirname, '../../tmp/'+distmtx_file_name);
    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '-fxn', visual_name, '-out',  distmtx_file], 
    };
    console.log('options:', options);
    PythonShell.run('distance.py', options, function (err, mtx) {
      if (err) throw err;
      console.log(JSON.parse(mtx));
      return mtx;
 
      
    });   
},
//
//
//
run_script_cmd: function (req,res, ts, command, visual_name) {
     var exec = require('child_process').exec;

    console.log(command);
    exec(command, {maxBuffer:16000*1024}, function (error, stdout, stderr) {  // currently 16000*1024 handles 232 datasets
        if(visual_name == 'fheatmap'){
            var image = '/tmp_images/'+ts+'_heatmap.pdf';
            var html = "<div id='pdf'>";
            html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='900' />";
            html += " <p>ERROR in loading pdf file</p>";
            html += "</object></div>";
            //var html = "<img alt='alt_freq-heatmap-fig' src='"+image+"' />"
            console.log(html);
            res.send(html);  
        }    

    });
 },


//
//
//
create_chosen_id_name_hash: function(dataset_ids) {
  
  console.log(dataset_ids);
  var chosen_id_name_hash    = {};
  chosen_id_name_hash.ids    = [];
  chosen_id_name_hash.names  = [];

  for (var i in dataset_ids){
      did   = dataset_ids[i];
      dname = DATASET_NAME_BY_DID[did];
      pid   = PROJECT_ID_BY_DID[did];
      pname = PROJECT_INFORMATION_BY_PID[pid].project;
      //dataset_ids.push(did+'--'+pname+'--'+dname);
      chosen_id_name_hash.ids.push(did);
      chosen_id_name_hash.names.push(pname+'--'+dname);
  }
  
  return chosen_id_name_hash;
},
//
//
//
get_custom_meta_selection: function(dataset_ids) {
    req_metadata = C.REQ_METADATA_FIELDS;
    //console.log('req_metadata '+req_metadata)
    fields_lookup = {};
    for (var i in dataset_ids) {      
      id = dataset_ids[i];
      //console.log('id '+ id)
      if (id in MetadataValues) {
        for (var field in MetadataValues[id]) {
          
          //console.log('field_name '+field)
          if (req_metadata.indexOf(field) === -1) {
            //console.log('PUT IN CUSTOM '+field)
            fields_lookup[field] = 1;
          }else{
            //console.log('IN REQ '+field)
          }
        }
      }

    }
    return fields_lookup;
},
//
//
//
check_initial_status: function(url) {

  var values_updated;
  var min,max,norm,dist;
  // these only seen in url after page first rendered
  if(url.query.min_range === undefined) {
    min   = 0;
    max   = 100;
    norm  = 'none';
    dist  = 'morisita_horn';  // default distance    
    values_updated = false;
  } else {
    min   = url.query.min_range  || 0;
    max   = url.query.max_range  || 100;
    norm  = url.query.norm       ||  'none';
    dist  = url.query.selected_distance || 'morisita_horn';  // default distance    
    values_updated = true;    
  }

  if(Number(max) <= Number(min)) {min=0;max=100;} 
  visual_post_items.min_range = Number(min);
  visual_post_items.max_range = Number(max);
  visual_post_items.normalization = norm;
  visual_post_items.selected_distance = dist;
  
  //console.log('min '+min.toString()+' max '+max.toString()+' norm '+norm)
  if(Number(min)===0 && Number(max)===100 && norm==='none') {
    // 
    values_updated = false;  // return to initial state
  }
  console.log('values_updated: '+values_updated.toString());
  return values_updated;
}

};   // end module.exports




