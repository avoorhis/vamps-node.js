/*jslint node: true */
// "use strict" ;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path = require('path');
var fs = require('fs-extra');
var queries = require('./queries');
var config = require('../config/config');
var mysql = require('mysql2');
var url = require('url');
var iniparser = require('iniparser');
var COMMON = require('./visuals/routes_common');
var MTX     = require('./visuals/routes_counts_matrix');
var Readable = require('readable-stream').Readable;
//var chokidar = require('chokidar');
var spawn = require('child_process').spawn;
var extend = require('util')._extend;
//var USER_DATA  = require('./routes_user_data');

//
// POST ENTROPY
//
router.post('/method_selection', helpers.isLoggedIn, function (req, res) {
  console.log('in method_selection -->>')
  console.log(req.body);
  console.log('<<--in method_selection')

  dataset_ids = JSON.parse(req.body.dataset_ids);
  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
      console.log('chosen_id_name_hash-->');
      console.log(chosen_id_name_hash);
      console.log(chosen_id_name_hash.ids.length);
      console.log('<--chosen_id_name_hash');

  res.render('otus/otus_method_selection', {
          title: 'VAMPS:OTUs',
          referer: 'otus',
          chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
          user: req.user, hostname: req.CONFIG.hostname
  });

});
 router.get('/otus_index', helpers.isLoggedIn, function (req, res) {
    console.log('In otus_index')
    
    res.render('otus/otus_index', {
                                  title       : 'VAMPS: Select OTUs',
                                  subtitle    : 'OTU Selection Page',
                                  proj_info   : JSON.stringify(PROJECT_INFORMATION_BY_PID),
                                  constants   : JSON.stringify(req.CONSTS),
                                  md_env_package : JSON.stringify(MD_ENV_PACKAGE),
                                  md_names    : AllMetadataNames,
                                  filtering   : 0,
                                  portal_to_show : '',
                                  data_to_open: JSON.stringify(DATA_TO_OPEN),
                                  user        : req.user,
                                  hostname    : req.CONFIG.hostname,
                                  
                              });
 });
 //
 //
 //
 // router.get('/otu_tree_dhtmlx', function(req, res) {
//     console.log('IN otu_tree_dhtmlx - routes_otus')
//     var myurl = url.parse(req.url, true);
//     var id = myurl.query.id
//     console.log('id='+id)
//     var json = {}
//     json.id = id;
//     json.item = []
//     //PROJECT_TREE_OBJ = []
//     //console.log('PROJECT_TREE_PIDS2',PROJECT_TREE_PIDS)
// 
//     if(id==0){
//         
//         var q = 'SELECT otu_project, otu_project_id,title,project_description,owner_user_id from otu_project'
//         connection.query(q, function otu_projects(err, rows, fields){
//             if(err){
//                 console.log(err)
//             }else{
//                 
//                 for(n in rows){
//                     console.log(rows[n])
//                     pid = rows[n]['otu_project_id'].toString()
//                     prj = rows[n]['otu_project']
//                     title =  rows[n]['title']
//                     desc =  rows[n]['project_description']
//                     oid =  rows[n]['owner_user_id']
//                     
//                     itemtext = "<span id='"+ prj +"' class='tooltip_pjds_list'>"+prj+"</span>";
//                     json.item.push({id:'p'+pid, text:itemtext, checked:false,  child:1, item:[]});
//                     
//                 }
//                 
//             }
//             console.log('json')
//             console.log(json)
//             res.send(json)
//         })
// 
// 
//     }else{
//         var this_project = {}
//         id = id.substring(1);  // id = pxx
//         var q = "SELECT otu_dataset, otu_dataset_id from otu_dataset where otu_project_id='"+id+"'"
//         console.log(q)
//         connection.query(q , function otu_datasets(err, rows, fields){
//             if(err){
//                 console.log(err)
//             }else{
//                 for(n in rows){
//                     console.log(rows[n])
//                     ds =  rows[n]['otu_dataset']
//                     did =  rows[n]['otu_dataset_id']
//                     
//                     itemtext = "<span id='"+ ds +"' class='tooltip_pjds_list'>"+ds+"</span>";
//                     json.item.push({id:did, text:itemtext, checked:'1',  child:0});
//                 }
//             }
//             console.log('json')
//             console.log(json)
//             res.send(json)
//         })
//     }
 
    
//});

router.post('/view_selection', helpers.isLoggedIn, function(req, res) {
    console.log('in GET OTU view_selection')
    console.log(req.body);
    console.log('<<--in OTU view_selection')
    opid= req.body.otu_id
    var timestamp = +new Date();
    timestamp = req.user.username+'-'+timestamp
    chosen_id_name_hash = {}  // GLOBAL
    

 
    var otudata = {}
    //visual_post_items = COMMON.save_post_items(req);
    //console.log(visual_post_items)
    var q = "SELECT otu_project.otu_project, otu_dataset.otu_dataset, otu_dataset.otu_dataset_id, otu_pdr_info.otu_label, otu_pdr_info.count,\n"
    q += " (\n"
    q += "   CASE\n"
	q += "      WHEN otu_taxonomy_id IS NULL\n"
	q += "      THEN ''\n"
	q += "      ELSE concat_ws(';', domain, phylum, klass, `order`, family, genus, species)\n"
    q += "   END\n"
    q += " ) as taxonomy\n"
    q += " FROM otu_pdr_info\n" 
    q += " JOIN otu_dataset using(otu_dataset_id)\n" 
    q += " JOIN otu_project using(otu_project_id)\n"
    q += " LEFT JOIN otu_taxonomy  using(otu_taxonomy_id)\n"
    q += " LEFT  JOIN domain using(domain_id)\n" 
    q += " LEFT JOIN phylum using(phylum_id)\n" 
    q += " LEFT JOIN klass using(klass_id)\n" 
    q += " LEFT JOIN `order` using(order_id)\n" 
    q += " LEFT JOIN family using(family_id)\n" 
    q += " LEFT JOIN genus using(genus_id)\n"
    q += " LEFT JOIN species using(species_id)\n"    
    q += " WHERE otu_project_id='"+opid+"'" 
    //console.log(q)
    connection.query(q, function otu_data(err, rows, fields){
        if(err){
            console.log(err)
        }else{
            
            prj = rows[0]['otu_project']
            
            visual_post_items = get_post_items(req)
            visual_post_items.ts = timestamp;
            
            
            //console.log('otu post items:')
            //console.log(visual_post_items)
            
            
			chosen_id_name_hash.ids = []
			chosen_id_name_hash.names = []
		
            //BIOM_MATRIX = get_otu_matrix(req, rows);
            //BIOM_MATRIX2 = MTX.get_biom_matrix(chosen_id_name_hash, visual_post_items);
            BIOM_MATRIX = get_otu_matrix(rows, visual_post_items);
            
            //console.log(chosen_id_name_hash)
            visual_post_items.no_of_datasets = chosen_id_name_hash.ids.length;
            visual_post_items.max_ds_count   = BIOM_MATRIX.max_ds_count;
            // console.log('chosen_id_name_hash')
//             console.log(chosen_id_name_hash)
//             console.log('visual_post_items')
//             console.log(visual_post_items)
//             console.log('BIOM_MATRIX')
//             console.log(BIOM_MATRIX)
            //console.log('BIOM_MATRIX2')
            //console.log(BIOM_MATRIX2)
            
            
 
            
            
            res.render('otus/visuals/view_selection', {
                                title           : 'VAMPS: OTU Visuals', 
                                referer         : 'otu_index',                                
                                matrix          : JSON.stringify(BIOM_MATRIX), 
                                project         : prj,
                                pid             : opid,  
                                post_items      : JSON.stringify(visual_post_items), 
                                chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),                                                
                                constants       : JSON.stringify(req.CONSTS),                                
                                user            : req.user,
                                hostname        : req.CONFIG.hostname 
            });
        }
    });        

});
function get_post_items(req){
    var post_items = {
        "unit_choice"       : "OTUs",
        //"no_of_datasets"    : BIOM_MATRIX.shape[1],
        "normalization"     : req.body.normalization || 'none',
        "visuals"           : req.body.visuals || '',
        "selected_distance" : req.body.selected_distance || "morisita_horn",
        "tax_depth"         : 'custom',
        "domains"           : req.body.domains || [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
        "custom_taxa"       : [ 'NA' ],
        "include_nas"       : req.body.include_nas  || 'yes',
        "min_range"         : req.body.min_range || 0,
        "max_range"         : req.body.max_range || 100,
        "metadata"          : [],
        "update_data"       : req.body.update_data  || false,
        //"max_ds_count"      : BIOM_MATRIX.max_ds_count
        }          // GLOBAL
     if(typeof post_items.domains == 'string') {
              post_items.domains = post_items.domains.split(',');
     }
     return post_items   
}
function get_otu_matrix(rows, post_items){
        console.log('get_otu_matrix')
        var date = new Date();
        var otu_matrix = {}
        var ds_order = {}
        var otu_tax = {}
        var otudata = {}
        ds_totals = {}
        var did,rank,db_tax_id,node_id,cnt,matrix_file;
        otu_matrix = {
                id: post_items.ts,
                format: "Biological Observation Matrix 0.9.1-dev",
                format_url:"http://biom-format.org/documentation/format_versions/biom-1.0.html",
                type: "OTU table",
                units: post_items.unit_choice,
                generated_by:"VAMPS-NodeJS Version 2.0",
                date: date.toISOString(),
                rows:[],												// taxonomy (or OTUs, MED nodes) names
                columns:[],											// ORDERED dataset names
                column_totals:[],								// ORDERED datasets count sums
                matrix_type: 'dense',
            matrix_element_type: 'int',
            shape: [],									// [row_count, col_count]
            data:  []										// ORDERED list of lists of counts: [ [],[],[] ... ]
            };
        //GLOBAL.boim_matrix;
        var ukeys = [];
        var unit_name_lookup = {};
        var unit_name_lookup_per_dataset = {};
        var unit_name_counts = {};

		db_tax_id_list = {};
		
		for (var n in rows) { // has correct order
			ds = rows[n]['otu_dataset']
            did = rows[n]['otu_dataset_id']
            otu = rows[n]['otu_label']
            cnt = rows[n]['count']
            tax = rows[n]['taxonomy']
            //console.log('oldtax')
            //console.log(tax)
            tax = clean_tax_string(tax)
            //console.log('newtax')
            //console.log(tax)
            ds_order[ds] = did
			if(tax == '' || tax == 'n/a' || tax == 'none'){
                otu_tax[otu] = ''
                otu_matrix.taxonomy = 0
            }else{
                otu_tax[otu] = tax  // lookup
                otu_matrix.taxonomy = 1
            }
        
            if(ds_totals.hasOwnProperty(ds)){
                ds_totals[ds] += cnt
            }else{
                ds_totals[ds] = cnt
            }
            if(otudata.hasOwnProperty(otu)){
                otudata[otu][ds] = cnt
            }else{
                otudata[otu] = {}
                otudata[otu][ds] = cnt                    
            }	  

				  
				  		

					
		}
		otu_matrix.shape[0] = Object.keys(otu_tax).length
        otu_matrix.shape[1] = Object.keys(ds_order).length
    
        for(ds in ds_order){
            otu_matrix.columns.push({"did":ds_order[ds],"id":ds,"metadata":null})
            otu_matrix.column_totals.push(ds_totals[ds])
            chosen_id_name_hash.ids.push(ds_order[ds])
            chosen_id_name_hash.names.push(ds)
        }
        otu_matrix.max_ds_count = Math.max.apply(null, otu_matrix.column_totals)
        n=0
        for(otu in otu_tax){
            otu_matrix.rows.push({"id":otu,"metadata":{"taxonomy":otu_tax[otu]}})   
            otu_matrix.data[n] = []
            for(ds in ds_order){            
                otu_matrix.data[n].push(otudata[otu][ds])
            }
            n += 1
        }
        
		if(post_items.update_data === true || post_items.update_data === 1 || post_items.update_data === '1'){
                
				otu_matrix = get_custom_biom_matrix( post_items, otu_matrix );

		}else{
			// nothing here for the time being.....
		}

			
            
        matrix_file = '../../tmp/'+post_items.ts+'_count_matrix.biom';
        //COMMON.write_file( matrix_file, JSON.stringify(biom_matrix) );
        COMMON.write_file( matrix_file, JSON.stringify(otu_matrix,null,2) );

        return otu_matrix	

        // function onlyUnique(value, index, self) {
//             return self.indexOf(value) === index;
//         }

}
//
//
//
function clean_tax_string(tax){
    var taxlist = tax.split(';')
    var newlist = []
    for(n in taxlist){
        ln = taxlist[n].length
        if(taxlist[n].substring(ln - 3) != '_NA'){
            newlist.push(taxlist[n])
        }
    }
    return newlist.join(';')
}
//
//
//
function get_custom_biom_matrix( post_items, mtx) {
    var custom_count_matrix = extend({},mtx);  // this clones count_matrix which keeps original intact.

    var max_cnt = mtx.max_dataset_count,
        min     = post_items.min_range,
        max     = post_items.max_range,
        norm    = post_items.normalization;

    //console.log('in custom biom '+max_cnt.toString());

        // Adjust for percent limit change
        var new_counts = [];
        var new_units = [];
        for(var c in custom_count_matrix.data) {

          var got_one = false;
          for(var k in custom_count_matrix.data[c]) {
            var thispct = (custom_count_matrix.data[c][k]*100)/custom_count_matrix.column_totals[k];
            if(thispct > min && thispct < max){
              got_one = true;
            }
          }

          if(got_one){
            new_counts.push(custom_count_matrix.data[c]);
            new_units.push(custom_count_matrix.rows[c]);
          }else{
            console.log('rejecting '+custom_count_matrix.rows[c].name);
          }
        }
        custom_count_matrix.data = new_counts;
        custom_count_matrix.rows = new_units;


        // Adjust for normalization
        var tmp1 = [];
        if (norm === 'maximum'|| norm === 'max') {
            console.log('calculating norm MAX')
						for(var cc in custom_count_matrix.data) {
              new_counts = [];
              for (var kc in custom_count_matrix.data[cc]) {
                  new_counts.push(parseInt( ( custom_count_matrix.data[cc][kc] * max_cnt ) / custom_count_matrix.column_totals[kc], 10) );

              }
              tmp1.push(new_counts);
            }
            custom_count_matrix.data = tmp1;
        }else if(norm === 'frequency' || norm === 'freq'){
            console.log('calculating norm FREQ')
						for (var cc1 in custom_count_matrix.data) {
              new_counts = [];
              for (var kc1 in custom_count_matrix.data[cc1]) {
                  new_counts.push(parseFloat( (custom_count_matrix.data[cc1][kc1] / custom_count_matrix.column_totals[kc1]).toFixed(6) ) );
              }
              tmp1.push(new_counts);
            }
            custom_count_matrix.data = tmp1;
        }else{
          // nothing here
					console.log('no-calculating norm NORM')
        }

        // re-calculate totals
        var tots = [];
        // TODO: "'tmp' is already defined."
	        var tmp2 = {};
        for(var cc2 in custom_count_matrix.data) {
          for(var kc2 in custom_count_matrix.data[cc2]) {
            if(kc2 in tmp2){
              tmp2[kc2] += custom_count_matrix.data[cc2][kc2];
            }else{
              tmp2[kc2] = custom_count_matrix.data[cc2][kc2];
            }
          }
        }
        for (var kc3 in custom_count_matrix.columns){
          tots.push(tmp2[kc3]);
        }
        custom_count_matrix.column_totals = tots;
        custom_count_matrix.shape = [ custom_count_matrix.rows.length, custom_count_matrix.columns.length ];

    //console.log('returning custom_count_matrix');
    return custom_count_matrix;
  }




// function get_otu_matrix2(req, rows){
//     otu_matrix = {}
//     var date = new Date();
//     var rando = Math.floor((Math.random() * 100000) + 1);
//     otu_matrix.id = req.user.username+'_'+rando
//     otu_matrix.format = "Biological Observation Matrix 0.9.1-dev"
//     otu_matrix.format_url = "http://biom-format.org/documentation/format_versions/biom-1.0.html"
//     otu_matrix.type = "OTU table"
//     otu_matrix.units = "OTU names" //# or no taxonomy
//     otu_matrix.generated_by = "VAMPS-NodeJS Version 2.0"
//     otu_matrix.date = date.toISOString()
//     otu_matrix.column_totals = []
//     otu_matrix.matrix_type = "dense"
//     otu_matrix.matrix_element_type = "int"
//     otu_matrix.shape = []
//     otu_matrix.rows = []
//     otu_matrix.columns = []
//     otu_matrix.data = []
//     otu_matrix.taxonomy = 0
//     var ds_order = {}
//     var otu_tax = {}
//     var otudata = {}
//     ds_totals = {}
//     
//     for(n in rows){
//         ds = rows[n]['otu_dataset']
//         did = rows[n]['otu_dataset_id']
//         otu = rows[n]['otu_label']
//         cnt = rows[n]['count']
//         tax = rows[n]['taxonomy']
//         ds_order[ds] = did
//         if(tax == '' || tax == 'n/a' || tax == 'none'){
//             otu_tax[otu] = ''
//             otu_matrix.taxonomy = 0
//         }else{
//             otu_tax[otu] = tax  // lookup
//             otu_matrix.taxonomy = 1
//         }
//         
//         if(ds_totals.hasOwnProperty(ds)){
//             ds_totals[ds] += cnt
//         }else{
//             ds_totals[ds] = cnt
//         }
//         if(otudata.hasOwnProperty(otu)){
//             otudata[otu][ds] = cnt
//         }else{
//             otudata[otu] = {}
//             otudata[otu][ds] = cnt                    
//         }
//     }
//     otu_matrix.shape[0] = Object.keys(otu_tax).length
//     otu_matrix.shape[1] = Object.keys(ds_order).length
//     
//     for(ds in ds_order){
//         otu_matrix.columns.push({"did":ds_order[ds],"id":ds,"metadata":null})
//         otu_matrix.column_totals.push(ds_totals[ds])
//     }
//     otu_matrix.max_ds_count = Math.max.apply(null, otu_matrix.column_totals)
//     n=0
//     for(otu in otu_tax){
//         otu_matrix.rows.push({"id":otu,"metadata":{"taxonomy":otu_tax[otu]}})   
//         otu_matrix.data[n] = []
//         for(ds in ds_order){            
//             otu_matrix.data[n].push(otudata[otu][ds])
//         }
//         n += 1
//     }
//     return otu_matrix
// }
// router.post('/otu_heatmap', helpers.isLoggedIn, function (req, res) {
//     console.log('in otu_heatmap')
//     console.log(req.body);
//     var ts = req.body.ts;  // ie avoorhis-1495119485990
//     var metric = req.body.metric;
//     var biom_file_name = ts+'_count_matrix.biom';
//     var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
//     var biom_file = path.join(pwd,'tmp', biom_file_name);
//     console.log(biom_file) 
//     var html = '';
//     var title = 'VAMPS';
// 
//     var distmtx_file_name = ts+'_distance.csv';
//     var distmtx_file = path.join(pwd,'tmp',distmtx_file_name);
//     var dist_json_file = path.join(pwd,'tmp', ts+'_distance.json')
//     var options = {
//      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
//        args :       [ '-in', biom_file, '-metric', metric, '--function', 'dheatmap', '--outdir', path.join(pwd,'tmp'), '--prefix', ts],
//      };
// 
//     var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
// 
//     console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
//     var heatmap_process = spawn( options.scriptPath+'/distance.py', options.args, {
//             env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
//             detached: true,
//             //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
//             stdio: 'pipe' // stdin, stdout, stderr
//         });
// 
// 
//     var stdout = '';
//     heatmap_process.stdout.on('data', function heatmapProcessStdout(data) {
//         //console.log('stdout: ' + data);
//         //data = data.toString().replace(/^\s+|\s+$/g, '');
//         data = data.toString();
//         stdout += data;
//     });
//     var stderr = '';
//     heatmap_process.stderr.on('data', function heatmapProcessStderr(data) {
// 
//         console.log('stderr: ' + data);
//         //data = data.toString().replace(/^\s+|\s+$/g, '');
//         data = data.toString();
//         stderr += data;
//     });
// 
//     heatmap_process.on('close', function heatmapProcessOnClose(code) {
//         console.log('heatmap_process process exited with code ' + code);
// 
//         //var last_line = ary[ary.length - 1];
//         if(code === 0){   // SUCCESS
//           try{
//             console.log(dist_json_file)
//             fs.readFile(dist_json_file, 'utf8', function (err, distance_matrix) {
//                 if (err) throw err;
//                 //distance_matrix = JSON.parse(data);
//                 res.render('visuals/partials/create_distance_heatmap',{
//                   dm        : distance_matrix,
//                   hash      : JSON.stringify(chosen_id_name_hash),
//                   constants : JSON.stringify(req.CONSTS),
//                   mt        : metric,
//                   ts        : ts
//                 });
//             });
//             if(req.CONFIG.site == 'vamps' ){
//               console.log('VAMPS PRODUCTION -- no print to log');
//             }else{
//               console.log(stdout)
//             }
//             //distance_matrix = JSON.parse(stdout);
//             distance_matrix = stdout;
//           }
//           catch(err){
//             distance_matrix = JSON.stringify({'ERROR':err});
//           }
//         }else{
//           console.log('output: '+stderr);
//           res.send(stderr);
//         }
//     });   
//         
// });
//
//
//
router.get('/load_otu_list', helpers.isLoggedIn, function (req, res) {
    console.log('in load_otu_list')
    var q = 'SELECT otu_project, otu_project_id, title, otu_size, method, project_description, owner_user_id, ds_count, otu_count'
    q += ' from  otu_project'
    //q += ' JOIN otu_dataset using(otu_project_id)' 
    //q += ' group by otu_project_id'
    q += ' order by otu_project'
    html = ''
    otu_project_list = {}
    connection.query(q, function otu_projects(err, rows, fields){
        if(err){
            console.log(err)
        }else{
            html += "<table border='1'>"
            html += "<tr><td></td><td>OTU</td><td>DS Count</td><td>OTU Count</td><td>OTU Size</td><td>Method</td></tr>"
            for(n in rows){
                //console.log(rows[n])
                
                opid = rows[n]['otu_project_id'].toString()
                prj = rows[n]['otu_project']
                title =  rows[n]['title']
                size  =  rows[n]['otu_size']
                method = rows[n]['method'] 
                desc =  rows[n]['project_description']
                oid =  rows[n]['owner_user_id']
                ds_count = rows[n]['ds_count'].toString()
                otu_count = rows[n]['otu_count'].toString()
                otu_project_list[prj] = {"ds_count":ds_count,"title":title,"opid":opid,"otu_count":otu_count,"method":method}
                html += "<tr>"
                html += "<td><input type='radio' id='"+ opid +"' name='otu'></td><td> "+prj+' ('+title+')</td>'
                html += "<td>"+ds_count+"</td>"
                html += "<td>"+otu_count+"</td>"
                html += "<td>"+size+"</td>"
                html += "<td>"+method+"</td>"
                //json.item.push({id:'p'+pid, text:itemtext, checked:false,  child:1, item:[]});
                html += "</tr>"   
            }
            html += "</table>"
        }
        //console.log('json')
        //console.log(json)
        res.send(html)
    })
    
});
//
//
// router.get('/create_otus_fasta', helpers.isLoggedIn, function (req, res) {
//   console.log('in create_otus_fasta')
//   console.log(req.body);
//   console.log('<<--in create_otus_fasta')
//   var dataset_lookup = {}
//   var html='';
//   var timestamp = +new Date();  // millisecs since the epoch!
//   //var method = req.body.otu_method
//   var otu_size;
//   
// 
//     var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
//     console.log(process.env.PWD)
//     console.log(req.CONFIG.PROCESS_DIR)
//     var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
//     //var otu_dir = req.user.username+'-'+otu_method+'-otus-'+timestamp;
//     var otus_dir = 'otus-'+timestamp
//     var data_repo_path = path.join(user_dir_path, otus_dir);
//     var fasta_file = 'fasta.fa'
//     var fasta_file_path = path.join(data_repo_path, fasta_file);
//     var config_file = 'config.ini'
//     var config_file_path = path.join(data_repo_path, config_file);
//     var log = path.join(data_repo_path, 'qsub.log');
//     var site = req.CONFIG.site
// 
//     var script_name = 'fasta_script.sh';
//     var script_path = path.join(data_repo_path, script_name);
//     //var FASTA_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-FASTA')
//     console.log(data_repo_path)
// 
//     fs.ensureDir(data_repo_path, function (err) {
//           if(err){ return console.log(err) } // => null
//           fs.chmod(data_repo_path, '0775', function chmodFile(err) {
//               if(err){ return console.log(err) } // => null
//               script_commands =[]
//               args = ['--site',req.CONFIG.site,
//                       '-r',timestamp,
//                       '-u',req.user.username,
//                       '-dids',(chosen_id_name_hash.ids).join(","),
//                       '-base',data_repo_path,
//                       '-fxn','otus',
//                       '-fasta_file'
//               ]
//               script_commands.push(req.CONFIG.PATH_TO_NODE_SCRIPTS+"/vamps_export_data.py " + args.join(' '))
// 
//               if(site.substring(0,5) == 'local'){
//                   var script_text = helpers.get_local_script_text(timestamp, script_commands)
//               }else{
//                   var script_text = helpers.get_qsub_script_text(log, pwd, req.CONFIG.site, 'vmps_fasta', script_commands)
//               }
//               var mode = 0775; // executable
//               var oldmask = process.umask(0);
//               console.log("script_path = " + script_path);
//               fs.writeFile(script_path,
//                 script_text,
//                 {
//                   mode: mode
//                 },
//                 function(err) {
//                   if(err) {
//                       return console.log(err);
//                   }
//                   else
//                   {
//                     console.log("The Fasta file script was saved!");
//                     helpers.run_external_command(script_path)
//                     //fs.closeSync(fs.openSync(FASTA_SUCCESS_FILE, 'w'));
//                   }
//               });
//               var config_text = '\n[MAIN]\npath='+data_repo_path+"\n";
//               config_text += 'directory='+otus_dir+"\n";
//               //config_text += 'taxonomy='+tax_obj.full_string+"\n";
//               config_text += 'otu_method=NOT_DETERMINED_YET'+"\n";
//               config_text += 'otu_size='+"\n";
//               config_text += '\n[DATASETS]'+"\n";
//               for(i in chosen_id_name_hash.names){
//                  config_text += chosen_id_name_hash.names[i]+"\n";
//               }
//               //
//               fs.writeFile(config_file_path, config_text, function writeConfigFile(err) {
//                    if(err) { return console.log(err); }
//                    console.log("The Config file was saved!");
//               });
//             });
//       });
// 
//   res.redirect('project_list')  // may not see .well yet as fasta needs to be completed
// })
router.post('/create_otus_fasta', helpers.isLoggedIn, function (req, res) {
  console.log('in create_otus_fasta')
  console.log(req.body);
  console.log('<<--in create_otus_fasta')
  var dataset_lookup = {}
  var html='';
  var timestamp = +new Date();  // millisecs since the epoch!
  var method = req.body.otu_method
  var otu_size;
  switch(method){
      case 'closed_ref':
            otu_size = req.body.ref_otu_size;
            break;
      case 'uclust':
            otu_size = req.body.ucl_otu_size;
            break;
      case 'slp':
            otu_size = req.body.slp_otu_size;
            break;
      case 'crop':
            otu_size = req.body.crp_otu_size;
            break;
      default:
            method = 'uclust'
            otu_size = '3'
  }

    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    console.log(process.env.PWD)
    console.log(req.CONFIG.PROCESS_DIR)
    var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
    //var otu_dir = req.user.username+'-'+otu_method+'-otus-'+timestamp;
    var otus_dir = 'otus-'+timestamp
    var data_repo_path = path.join(user_dir_path, otus_dir);
    var fasta_file = 'fasta.fa'
    var fasta_file_path = path.join(data_repo_path, fasta_file);
    var unique_file = 'fasta.unique.fa'
    var unique_file_path = path.join(data_repo_path, unique_file);
    var config_file = 'config.ini'
    var config_file_path = path.join(data_repo_path, config_file);
    var log = path.join(data_repo_path, 'qsub.log');
    var site = req.CONFIG.site

    var script_name = 'fasta_script.sh';
    var script_path = path.join(data_repo_path, script_name);
    var FASTA_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-FASTA')
    console.log(data_repo_path)

    fs.ensureDir(data_repo_path, function (err) {
          if(err){ return console.log(err) } // => null
          fs.chmod(data_repo_path, '0775', function chmodFile(err) {
              if(err){ return console.log(err) } // => null
              script_commands =[]
              args = ['--site',req.CONFIG.site,
                      '-r',timestamp,
                      '-u',req.user.username,
                      '-dids',(chosen_id_name_hash.ids).join(","),
                      '-base',data_repo_path,
                      '-fxn','otus',
                      '-fasta_file'
              ]
              script_commands.push(req.CONFIG.PATH_TO_NODE_SCRIPTS+"/vamps_export_data.py " + args.join(' '))
              script_commands.push(req.CONFIG.PATH_TO_MOTHUR+" \"#unique.seqs(fasta="+fasta_file_path+")\"")
              script_commands.push("val1=`grep '>' "+fasta_file_path+" | wc -l | xargs`")   // xargs trims the result
              script_commands.push("sed -i -e \"s/seq_count=/seq_count=\${val1}/\" "+config_file_path)
              script_commands.push("val2=`grep '>' "+unique_file_path+" | wc -l | xargs`")   // xargs trims the result
              script_commands.push("sed -i -e \"s/seq_count_uniques=/seq_count_uniques=\${val2}/\" "+config_file_path)
              script_commands.push('touch '+path.join(data_repo_path,'COMPLETED-FASTA'))
              
              if(site.substring(0,5) == 'local'){
                  var script_text = helpers.get_local_script_text(timestamp, script_commands)
              }else{
                  var script_text = helpers.get_qsub_script_text(log, pwd, req.CONFIG.site, 'vmps_fasta', script_commands)
              }
              var mode = 0775; // executable
              var oldmask = process.umask(0);
              console.log("script_path = " + script_path);
              fs.writeFile(script_path,
                script_text,
                {
                  mode: mode
                },
                function(err) {
                  if(err) {
                      return console.log(err);
                  }
                  else
                  {
                    console.log("The Fasta file script was saved!");
                    helpers.run_external_command(script_path)
                    //fs.closeSync(fs.openSync(FASTA_SUCCESS_FILE, 'w'));
                  }
              });
              var config_text = '\n[MAIN]\npath='+data_repo_path+"\n";
              config_text += 'directory='+otus_dir+"\n";
              //config_text += 'taxonomy='+tax_obj.full_string+"\n";
              config_text += 'code='+timestamp+"\n";
              config_text += 'otu_method='+method+"\n";
              config_text += 'otu_size='+otu_size+"\n";
              config_text += 'seq_count='+"\n";
              config_text += 'seq_count_uniques='+"\n";
              config_text += '\n[DATASETS]'+"\n";
              for(i in chosen_id_name_hash.names){
                 config_text += chosen_id_name_hash.names[i]+"\n";
              }
              //
              fs.writeFile(config_file_path, config_text, function writeConfigFile(err) {
                   if(err) { return console.log(err); }
                   console.log("The Config file was saved!");
              });
            });
      });

  res.redirect('project_list')  // may not see .well yet as fasta needs to be completed

});
//
//
//
router.post('/create_otus_step2/:code', helpers.isLoggedIn, function (req, res) {
  console.log("in create_otus_step2");
  //var method = req.params.method
  var otus_code = req.params.code
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
  var otus_dir = 'otus-'+otus_code;
  var data_repo_path = path.join(user_dir_path, otus_dir);
  var config_file = path.join(data_repo_path, 'config.ini');
  var config = iniparser.parseSync(config_file);
  var size = config['MAIN']['otu_size'];
  var method = config['MAIN']['otu_method']
  if(size == '3'){
    dec_size_str = '0.97'
  }else if(size == '6'){
    dec_size_str = '0.94'
  }else if(size == '9'){
    dec_size_str = '0.91'
  }
  var script_name = method+'_script.sh';
  var script_path = path.join(data_repo_path, script_name);
  var fasta_file = 'fasta.fa'
  var fasta_file_path = path.join(data_repo_path, fasta_file);
  var log = path.join(data_repo_path, 'qsub.log');
  var site = req.CONFIG.site
  // var cmd_options = {
  //     exec : 'otu_create_fasta.py',
  //     scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
  //     args :       [       ],
  // };
  script_commands = []
  switch(method){
      case 'closed_ref':
            script_commands.push(req.CONFIG.PATH_TO_MOTHUR+" \"#unique.seqs(fasta="+fasta_file_path+")\"")
            // otu_usearch_ref.py -i usearch_ref.unique.fa -n usearch_ref.names -p avoorhis_23618455 -u avoorhis -db /groups/vampsweb/vampsdev/seqinfobin/greengenes/v10-2012/rep_set/97_otus.fasta -tax /groups/vampsweb/vampsdev/seqinfobin/greengenes/v10-2012/taxonomy/97_otu_taxonomy.txt -size 0.97 -site vampsdev --use_cluster
            args = ['-i', path.join(data_repo_path,'fasta.unique.fa'),
                    '-n', path.join(data_repo_path,'fasta.names'),
                    '-u', req.user.username,
                    '-db',  path.join(req.CONFIG.PATH_TO_GG_DATABASE,'rep_set','97_otus.fasta'),
                    '-tax', path.join(req.CONFIG.PATH_TO_GG_DATABASE,'taxonomy','97_otu_taxonomy.txt'),
                    '-size',dec_size_str,
                    '-p',otus_dir,
                    '-site',req.CONFIG.site
                  ]
            if(site.substring(0,5) != 'local'){
              args.push('--use_cluster')
            }
            script_commands.push(req.CONFIG.PATH_TO_NODE_SCRIPTS+"/otu_usearch_ref.py " + args.join(' '))
            break;
      case 'uclust':
            //otus_uc2mtx_vamps  -i /groups/vampsweb/vampsdev/otus/avoorhis_83898848//uclust.fa -p 0.97 -site vampsdev -dbsource bpc -tax 1 -base /groups/vampsweb/vampsdev/otus/avoorhis_83898848/
            // vsearch --cluster_fast fasta.fa --sizeout --iddef 3 --id 0.97 --consout fasta.cons.97.fa --uc fasta.otus.97.uc
            
            args_vsearch = [ '--cluster_size', fasta_file_path,  // clusters after sort by abundance
                            '--sizeout',  // export size to fasta file
                            '--iddef', '3',
                            '--id', dec_size_str,
                            '--consout', path.join(data_repo_path,method+'.cons.'+dec_size_str+'.fa'),
                            '--uc', path.join(data_repo_path,method+'.otus.'+dec_size_str+'.uc')
                            ]
            args_uc2mtxPY = [ '-site',req.CONFIG.site,
                            '-i', fasta_file_path,
                            '-p',dec_size_str,
                            '-base',data_repo_path,
            ]
            args_uc2mtxPERL = [ '-uc', path.join(data_repo_path,method+'.otus.'+dec_size_str+'.uc'),
                                '>',   path.join(data_repo_path,method+'.otus.'+dec_size_str+'.mtx')                
            ]
            args_2tax   = [ '-site',req.CONFIG.site
            ]
            script_commands.push(req.CONFIG.PATH_TO_VSEARCH+' '+args_vsearch.join(' '))
            script_commands.push(req.CONFIG.PATH_TO_NODE_SCRIPTS+'/'+'otus_uc2mtx2.pl'+' '+args_uc2mtxPERL.join(' '))
            //script_commands.push(req.CONFIG.PATH_TO_NODE_SCRIPTS+"/otus_uc2mtx.pl" + args_uc2mtx.join(' '))
            //script_commands.push(req.CONFIG.PATH_TO_NODE_SCRIPTS+"/otus2tax.pl" + args_2tax.join(' '))
            break;
      case 'slp':
            // slp commands
            //    /groups/vampsweb/vampsdev/apps/db2fasta_otus_vamps
            //    /groups/vampsweb/vampsdev/apps/otus_slp2mtx_vamps
            script_commands.push("otus_slp2mtx_vamps")
            script_commands.push('cmd2')
            break;
      case 'crop':
            script_commands.push('cmd1')
            script_commands.push('cmd2')
            break;
      default:
  }
  if(site.substring(0,5) == 'local'){
    var script_text = helpers.get_local_script_text(otus_code, script_commands)
  }else{
    var script_text = helpers.get_qsub_script_text(log, pwd, req.CONFIG.site, 'vmps_otus', script_commands)
  }
  var mode = 0775;
  var oldmask = process.umask(0);
  console.log("script_path2 = " + script_path);
  fs.writeFile(script_path,
    script_text,
    {
      mode: mode
    },
    function(err) {
      if(err) {
          return console.log(err);
      }
      else
      {
        // RunAndCheck(script_path, nodelog, req, project, res, checkPid, ok_code_options);
        // status_params.status = status_params.statusSUCCESS;
        // status_params.msg = status_params.msgSUCCESS;
        // helpers.update_status(status_params);
       
        // res.redirect("/user_data/your_projects");
        // process.umask(oldmask);
        console.log("The file was saved!");
        helpers.run_external_command(script_path)
      }
  });

});
//
//
// YOUR PROJECTS
//
router.get('/project_list', helpers.isLoggedIn, function (req, res) {
    //console.log(PROJECT_INFORMATION_BY_PNAME);

    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');


    var project_info = {};
    var file_info = [];

     fs.readdir(user_dir_path, function readProjectsDir(err, items) {
            if (err) { return console.log(err); }
            project_info = {}
            for (var d in items) {
                // andy-uclust-otus-1481290684543
                var pts = items[d].split('-');
                if (pts[0] === 'otus') {
                  console.log('got dir', items[d])
                    //var method = pts[1];  // ie uclust
                    var otus_code = pts[1];  // ie 1481290684543
                    project_info[otus_code] = {};
                    var stat = fs.statSync(path.join(user_dir_path, items[d]));

                    if (stat.isDirectory()) {
                        // stat.mtime.getTime() is for sorting to list in oreder

                        // need to read config file
                        // check status?? dir strcture: analisis/gast/<ds>
                        var data_repo_path = path.join(user_dir_path, items[d]);
                        var config_file = path.join(data_repo_path, 'config.ini');

                        project_info[otus_code].fasta_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
                        //project_info[oligo_code].entropy_status = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
                        //project_info[oligo_code].oligo_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''

                        try{
                            var config = iniparser.parseSync(config_file);

                            file_info.push({ 'otus_code':otus_code, 'time':stat.mtime});

                            project_info[otus_code].method = config['MAIN']['otu_method'];
                            project_info[otus_code].size = config['MAIN']['otu_size'];
                            
                            project_info[otus_code].start_date = stat.mtime.toISOString().substring(0,10);

                        }
                        catch(e){
                          console.log('Config file not found (ERROR): ',data_repo_path)
                        }

                    }

                  }
            }
            file_info.sort(function sortByTime(a, b) {
              //reverse sort: recent-->oldest
              return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
            });
            //console.log(project_info)
            //console.log(file_info)
            res.render('otus/otus_project_list',
                { title: 'OTU Projects',
                  pinfo: JSON.stringify(project_info),
                  finfo: JSON.stringify(file_info),
                  
                  user: req.user, hostname: req.CONFIG.hostname
            });

    });  // readder
});
//
//   DELETE
//
router.get('/delete/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in otus delete')
  var otus_code = req.params.code
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
  var otus_dir = 'otus-'+otus_code
  var data_repo_path = path.join(user_dir_path, otus_dir);
  console.log(data_repo_path)
  helpers.deleteFolderRecursive(data_repo_path)
  res.send('OK')
});

//
// POST PROJECT
//
router.get('/project/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in otus - project')
  var otus_code = req.params.code
  console.log(otus_code)
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
  var otus_dir = 'otus-'+otus_code
  var data_repo_path = path.join(user_dir_path, otus_dir);
  var config_file = path.join(data_repo_path, 'config.ini');
  var config_file_data = iniparser.parseSync(config_file);
  

  fasta_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
  //entropy_status = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
  //oligo_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''

  
  res.render('otus/otus_project',
                { title: 'OTU Project',
                  code : otus_code,
                  config: JSON.stringify(config_file_data),                  
                  fasta_status   : fasta_status,            
                  user: req.user, hostname: req.CONFIG.hostname
  });

});

router.get('/otus_method_selection', helpers.isLoggedIn, function (req, res) {
    console.log('in otus - select_otu_method')
    var url_parts = url.parse(req.url, true);
    var otus_code = url_parts.query.code
    console.log(otus_code)
    
    res.render('otus/otus_method_selection',
                { title: 'OTU Select Method',
                  code : otus_code,
                  user: req.user, hostname: req.CONFIG.hostname
    });
});
//
//
//
router.get('/clear_filters', helpers.isLoggedIn, function(req, res) {
    //SHOW_DATA = ALL_DATASETS;
    console.log('GET OTUs: in clear filters')

    var html = ''
    for(prj in otu_project_list){
    opid = otu_project_list[prj].opid
    title = otu_project_list[prj].title
    ds_count = otu_project_list[prj].ds_count
    html += "<input type='radio' id='"+ opid +"' name='otu' value=''> "+prj+' ('+ds_count+' datasets) ('+title+')<br>'
  }
  res.send(html);

});
//
//
//
router.get('/livesearch_projects/:substring', function(req, res) {
  console.log('OTU viz:in livesearch_projects/:substring')
  var substring = req.params.substring.toUpperCase();
  var myurl = url.parse(req.url, true);
  if(substring === '.....'){
    substring = ''
  }
  var html = ''
  for(prj in otu_project_list){
  //otu_project_list.forEach(function(prj) {
    opid = otu_project_list[prj].opid
    title = otu_project_list[prj].title
    ds_count = otu_project_list[prj].ds_count
    if(prj.toUpperCase().indexOf(substring) != -1){
          html += "<input type='radio' id='"+ opid +"' name='otu' value=''> "+prj+' ('+ds_count+' datasets) ('+title+')<br>'
    }
    
  }
 
  res.send(html);

});
router.get('/livesearch_target/:gene_target', function(req, res) {
    console.log('OTU viz:in livesearch_target')
    var gene_target = req.params.gene_target.toUpperCase();
    var myurl = url.parse(req.url, true);
    if(gene_target === '.....'){
        gene_target = ''
    }
    //otu_project_list.forEach(function(prj) {
    console.log(gene_target)
    var html = ''
    for(prj in otu_project_list){
        opid = otu_project_list[prj].opid
        title = otu_project_list[prj].title
        ds_count = otu_project_list[prj].ds_count
        if(prj.toUpperCase().indexOf(gene_target) != -1){
          html += "<input type='radio' id='"+ opid +"' name='otu' value=''> "+prj+' ('+ds_count+' datasets) ('+title+')<br>'
        }
    
    }
  
    res.send(html);
  

});
// router.get('/livesearch_status/:q', function(req, res) {
//   console.log('OTU viz:in livesearch status')
//   var q = req.params.q;
//   var myurl = url.parse(req.url, true);
//   var html = ''
//     
// });
router.get('/livesearch_otu_size/:q', function(req, res) {
  console.log('OTU viz:in livesearch_otu_size')
  var size = req.params.q;   // 3, 6 or 10 percent
  var myurl = url.parse(req.url, true);
  var html = ''
  for(prj in otu_project_list){
        opid = otu_project_list[prj].opid
        title = otu_project_list[prj].title
        ds_count = otu_project_list[prj].ds_count
        if(prj.indexOf(size) != -1){
          html += "<input type='radio' id='"+ opid +"' name='otu' value=''> "+prj+' ('+ds_count+' datasets) ('+title+')<br>'
        }
    
    }
  
    res.send(html);
  

});
module.exports = router;
