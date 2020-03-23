/*jslint node: true */
const express = require('express');
var router = express.Router();
//const passport = require('passport');
const helpers = require('./helpers/helpers');
const path = require('path');
const fs = require('fs-extra');
//const queries = require('./queries');
const CFG = require('../config/config');
//const mysql = require('mysql2');
const url = require('url');
const iniparser = require('iniparser');
const COMMON = require('./visuals/routes_common');
//const Readable = require('readable-stream').Readable;
//const spawn = require('child_process').spawn;
const extend = require('util')._extend;
const C = require(app_root + '/public/constants');
const visualization_controller = require(app_root + '/controllers/visualizationController');
const file_controller = require(app_root + '/controllers/fileController');

const viz_files_obj = new file_controller.visualizationFiles();
const file_path_obj = new file_controller.FilePath();
//
// POST ENTROPY
//
router.post('/method_selection', helpers.isLoggedIn, (req, res) => {
  console.log('in method_selection -->>')
  console.log(req.body);
  console.log('<<--in method_selection')

  dataset_ids = JSON.parse(req.body.dataset_ids);
  req.session.otus.chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
  
  console.log('chosen_id_name_hash-->');
  console.log(req.session.otus.chosen_id_name_hash);
  console.log(req.session.otus.chosen_id_name_hash.ids.length);
  
  console.log('<--chosen_id_name_hash');

  res.render('otus/otus_method_selection', {
          title: 'VAMPS:OTUs',
          referer: 'otus',
          chosen_id_name_hash: JSON.stringify(req.session.otus.chosen_id_name_hash),
          user: req.user, hostname: CFG.hostname
  });

});
 router.get('/otus_index', helpers.isLoggedIn, (req, res) => {
    console.log('In otus_index')
    
    res.render('otus/otus_index', {
                                  title       : 'Select OTUs',
                                  subtitle    : 'OTU Selection Page',
                                  proj_info   : JSON.stringify(C.PROJECT_INFORMATION_BY_PID),
                                  constants   : JSON.stringify(C),
                                  md_env_package : JSON.stringify(C.MD_ENV_PACKAGE),
                                  md_names    : C.AllMetadataNames,
                                  filtering   : 0,
                                  portal_to_show : '',
                                  data_to_open: JSON.stringify(req.session.DATA_TO_OPEN),
                                  user        : req.user,
                                  hostname    : CFG.hostname,
                                  
                              });
 });
 //
 //
 //

 
    
//});
router.post('/view_selection', helpers.isLoggedIn, (req, res) => {
    console.log('in GET OTU view_selection')
    const zlib     = require('zlib');
    const readline = require('readline');
    console.log(req.body);
    console.log('<<--in OTU view_selection')
    // { otu_id: 'AB_SAND_Bv6.Bacteria.slp.otus.03.mtx.gz' }
    let opid = req.body.otu_id  // filename
    let otu_name_split = opid.split('.');
    req.session.otus = {};

    req.session.otus.otu_project = otu_name_split[0];
    req.session.otus.otu_domain = otu_name_split[1];
    req.session.otus.otu_size = otu_name_split[4];
    req.session.project_dataset_vars = {}
    req.session.chosen_id_order = []
    req.session.otus.chosen_id_name_hash = {}
    req.session.otus.chosen_id_name_hash.ids = []
    req.session.otus.chosen_id_name_hash.names = []

    console.log('req.session ==>>');
    console.log(req.session);
    console.log('<<--req.body: req.session -- don"t pollute the session');
    //let prj = req.body.otu_id  // filename
    var timestamp = +new Date();
    timestamp = req.user.username+'-'+timestamp;
    let visual_post_items = get_post_items(req);
    visual_post_items.ts = viz_files_obj.get_user_timestamp(req);

    
    //console.log(chosen_id_name_hash)
    //visual_post_items.no_of_datasets = req.session.otus.chosen_id_name_hash.ids.length;
    
    const parse = require('csv-parse');
    
    var file_path = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,'clusters',opid)
    //console.log(req.session.otus.chosen_id_name_hash)
    req.session.otus.otu_datasets = []
    let otudata = []
    let lineReader = readline.createInterface({
      input: fs.createReadStream(file_path).pipe(zlib.createGunzip())
    });

    let n = 0;
    lineReader.on('line', (line) => {
      n += 1
      line_ary = line.split('\t')
      if(n == 1){
        headers = line_ary
        for(n=7;n<=headers.length-1;n++){
            req.session.otus.otu_datasets.push(headers[n].split(';')[1])
        }
      }else{
      //console.log("line: " + n);
      //console.log(line);
      // WS3_03_1625	Bacteria;WS3	phylum	0.0968	0.0968	1	1	0	0	0	0	0	0	0	1	0
        
        otudata[line_ary[0]] = {
            "taxonomy":line_ary[1],
            "rank":line_ary[2],
            "min_gdist":line_ary[3],
            "avg_gdist":line_ary[4],
            "total":line_ary[5],
            "counts":{}
        } 
        for(n=7;n<=line_ary.length-1;n++){
            if(parseInt(line_ary[n]) > 0){
                otudata[line_ary[0]].counts[headers[n].split(';')[1]] = line_ary[n]
            }
        }
      }
    
    }).on('close', () => {
        req.session.otus.otu_datasets.sort()
    
        req.session.biom_matrix = get_otu_matrix(req, otudata, req.session.otus.otu_datasets, visual_post_items);
        //console.log(req.session.biom_matrix)
        //visual_post_items.chosen_datasets = req.session.biom_matrix.columns
        // did and name
        
        visual_post_items.chosen_datasets = []
        for(n in req.session.biom_matrix.columns) {
        	visual_post_items.chosen_datasets[n] = {}
        	visual_post_items.chosen_datasets[n].did = req.session.biom_matrix.columns[n].did
        	visual_post_items.chosen_datasets[n].name = req.session.biom_matrix.columns[n].id
        	
    
        	
        }
    	visual_post_items.no_of_datasets = req.session.biom_matrix.columns.length
        //console.log('visual_post_items')
        //console.log(visual_post_items)
        //console.log(req.session.otus.chosen_id_name_hash)
        req.session.chosen_id_order = req.session.otus.chosen_id_name_hash.ids
        req.session.selected_distance = visual_post_items.selected_distance
        visual_post_items.max_ds_count   = req.session.biom_matrix.max_ds_count;
        let needed_constants = helpers.retrieve_needed_constants(C,'view_selection');
        //console.log('needed_constants')
        //console.log(needed_constants)
        res.render('otus/visuals/view_selection', {
                    title           : 'OTU Visuals', 
                    referer         : 'otu_index',                                
                    matrix          : JSON.stringify(req.session.biom_matrix),
                    project         : opid,
                    pid             : opid,
                    post_items      : JSON.stringify(visual_post_items),
                    chosen_id_name_hash : JSON.stringify(req.session.otus.chosen_id_name_hash),
                    constants : JSON.stringify(needed_constants),
                    user            : req.user,
                    hostname        : CFG.hostname
        });
    });
   
     
    
});


function get_post_items(req){
    var post_items = {
        "unit_choice"       : "OTUs",
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
        }
     if(typeof post_items.domains == 'string') {
              post_items.domains = post_items.domains.split(',');
     }
     return post_items   
}
function get_otu_matrix(req, otudata, datasets, post_items){
        console.log('get_otu_matrix')
        //console.log(otudata)
        let date = new Date();
        let otu_matrix = {}
        //var ds_order = {}
        //var otu_tax = {}
       
        //ds_totals = {
        //console.log('otu_label-0')
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
            data:  []									// ORDERED list of lists of counts: [ [],[],[] ... ]
            };
        

       
        for(n in datasets){
			otu_matrix.columns.push({"did":n,"id": req.session.otus.otu_project+'--'+datasets[n],"metadata":null})
            req.session.otus.chosen_id_name_hash.ids.push(n)
            req.session.otus.chosen_id_name_hash.names.push(req.session.otus.otu_project+'--'+ datasets[n])
		}
		otu_matrix.taxonomy = 0
		for(otu_label in otudata) { //"taxonomy"
			//console.log(otu_label)
			//console.log(otudata[otu_label])
		
			if(otudata[otu_label].hasOwnProperty('taxonomy')){
			    otu_matrix.rows.push({"id":otu_label,"metadata":{"taxonomy":otudata[otu_label].taxonomy}})
                otu_matrix.taxonomy = 1
			}else{
			    otu_matrix.rows.push({"id":otu_label,"metadata":null})
                otu_matrix.taxonomy = 0
			}     
			var temp = []
			col_tot = 0
            for(n in datasets){
			    ds= datasets[n]
			    if(otudata[otu_label].counts.hasOwnProperty(ds)){
			        temp.push(parseInt(otudata[otu_label].counts[ds]))
			    }else{
			        temp.push(0)
			    }
			    
			}
			
			otu_matrix.data.push(temp)
		}
        
		otu_matrix.shape[0] = Object.keys(otu_matrix.rows).length
        otu_matrix.shape[1] = Object.keys(otu_matrix.columns).length
        
        for(n in datasets){
            var temp = 0
            for(m in otu_matrix.data){
                temp += otu_matrix.data[m][n]
            }
            otu_matrix.column_totals.push(temp)
        }
        otu_matrix.max_ds_count = Math.max.apply(null, otu_matrix.column_totals)
       
        
		if(post_items.update_data === true || post_items.update_data === 1 || post_items.update_data === '1'){
		    otu_matrix = get_custom_biom_matrix( post_items, otu_matrix );
		}else{
			// nothing here for the time being.....
		}


        let matrix_file = path.join(CFG.TMP_FILES, post_items.ts+'_count_matrix.biom');
        //COMMON.write_file( matrix_file, JSON.stringify(biom_matrix) );
        COMMON.write_file( matrix_file, JSON.stringify(otu_matrix,null,2) );

        return otu_matrix	


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


//
//
//
router.get('/load_otu_list', helpers.isLoggedIn, (req, res) => {
    console.log('in load_otu_list')
    otu_project_list = {}
    var indir = path.join(CFG.PATH_TO_STATIC_DOWNLOADS,'clusters')
    fs.readdir(indir,  (err, list) => {
        if(err){
            console.log(err)
        }else{
            list.forEach( file => {
                 //var pth = path.join(indir, file);
                 
                 var file_items = file.split('.')
                 var project = file_items[0]
                 otu_project_list[file] = {"opid":project}  
                 if(file_items[1] == undefined){
                    otu_project_list[file].domain = 'unknown'
                 }else{
                    otu_project_list[file].domain = file_items[1]
                 }
                 if(file_items[2] == undefined){
                    otu_project_list[file].method = 'unknown'
                 }else{
                    otu_project_list[file].method = file_items[2].toUpperCase()
                 }
                 if(file_items[4] == undefined){
                    otu_project_list[file].size = 'unknown'
                 }else{
                    otu_project_list[file].size = parseInt(file_items[4],10) // base 10   
                 }
                 if(C.PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
                    otu_project_list[file].pid = C.PROJECT_INFORMATION_BY_PNAME[project].pid
                 }else{
                    otu_project_list[file].pid = ''
                 }         
             });
             //console.log(otu_project_list)
             res.json(otu_project_list)
        }
    })
});


router.post('/create_otus_fasta', helpers.isLoggedIn, (req, res) => {
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

    var pwd = CFG.PROCESS_DIR;
    var user_dir_path = path.join(CFG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
    //var otu_dir = req.user.username+'-'+otu_method+'-otus-'+timestamp;
    var otus_dir = 'otus-'+timestamp
    var data_repo_path = path.join(user_dir_path, otus_dir);
    var fasta_file = 'fasta.fa'
    var fasta_file_path = path.join(data_repo_path, fasta_file);
    var unique_file = 'fasta.fa.unique'
    var unique_file_path = path.join(data_repo_path, unique_file);
    var config_file = 'config.ini'
    var config_file_path = path.join(data_repo_path, config_file);
    var log = path.join(data_repo_path, 'qsub.log');
    var site = CFG.site

    var script_name = 'fasta_script.sh';
    var script_path = path.join(data_repo_path, script_name);
    var FASTA_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-FASTA')
    console.log('path: '+data_repo_path)

    fs.ensureDir(data_repo_path, err => {
          if(err){ return console.log(err) } // => null
          fs.chmod(data_repo_path, 0o775, function chmodFile(err) {
              if(err){ return console.log(err) } // => null
              script_commands =[]
              args = ['--site',CFG.site,
                      '-r',timestamp,
                      '-u',req.user.username,
                      '-dids',(req.session.otus.chosen_id_name_hash.ids).join(","),
                      '-base',data_repo_path,
                      '-fxn','otus',
                      '-fasta_file'
              ]
              script_commands.push(CFG.PATH_TO_NODE_SCRIPTS+"/vamps_export_data.py " + args.join(' '))
              //script_commands.push(CFG.PATH_TO_MOTHUR+" \"#unique.seqs(fasta="+fasta_file_path+")\"")
              script_commands.push(CFG.PATH_TO_NODE_SCRIPTS+"/fastaunique " + fasta_file_path)
              script_commands.push("val1=`grep '>' "+fasta_file_path+" | wc -l | xargs`")   // xargs trims the result
              script_commands.push("sed -i -e \"s/seq_count=/seq_count=\${val1}/\" "+config_file_path)
              script_commands.push("val2=`grep '>' "+unique_file_path+" | wc -l | xargs`")   // xargs trims the result
              script_commands.push("sed -i -e \"s/seq_count_uniques=/seq_count_uniques=\${val2}/\" "+config_file_path)
              script_commands.push('touch '+path.join(data_repo_path,'COMPLETED-FASTA'))
              
              if(site.substring(0,5) == 'local'){
                  var script_text = helpers.get_local_script_text(script_commands)
              }else{
                  var script_text = helpers.get_qsub_script_text(req, log, pwd, 'vmps_fasta', script_commands)
              }
              
              var mode = 0775; // executable
              var oldmask = process.umask(0);
              console.log("script_path = " + script_path);
              console.log("site = " + site.substring(0,5));
              console.log("script_commands = " + script_commands.join(' '));
              console.log("script_text = " + script_text);
              fs.writeFile(script_path,
                script_text,
                {
                  mode: mode
                },
                err => {
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
              for(i in req.session.otus.chosen_id_name_hash.names){
                 config_text += req.session.otus.chosen_id_name_hash.names[i]+"\n";
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
router.post('/create_otus_step2/:code', helpers.isLoggedIn, (req, res) => {
  console.log("in create_otus_step2");
  //var method = req.params.method
  var otus_code = req.params.code
  var pwd = CFG.PROCESS_DIR;
  var user_dir_path = path.join(CFG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
  var otus_dir = 'otus-'+otus_code;
  var data_repo_path = path.join(user_dir_path, otus_dir);
  var config_file = path.join(data_repo_path, 'config.ini');
  var config_obj = iniparser.parseSync(config_file);
  var size = config_obj['MAIN']['otu_size'];
  var method = config_obj['MAIN']['otu_method']
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
  var site = CFG.site
  // var cmd_options = {
  //     exec : 'otu_create_fasta.py',
  //     scriptPath : CFG.PATH_TO_VIZ_SCRIPTS,
  //     args :       [       ],
  // };
  script_commands = []
  switch(method){
      case 'closed_ref':
            script_commands.push(CFG.PATH_TO_MOTHUR+" \"#unique.seqs(fasta="+fasta_file_path+")\"")
            // otu_usearch_ref.py -i usearch_ref.unique.fa -n usearch_ref.names -p avoorhis_23618455 -u avoorhis -db /groups/vampsweb/vampsdev/seqinfobin/greengenes/v10-2012/rep_set/97_otus.fasta -tax /groups/vampsweb/vampsdev/seqinfobin/greengenes/v10-2012/taxonomy/97_otu_taxonomy.txt -size 0.97 -site vampsdev --use_cluster
            args = ['-i', path.join(data_repo_path,'fasta.unique.fa'),
                    '-n', path.join(data_repo_path,'fasta.names'),
                    '-u', req.user.username,
                    '-db',  path.join(CFG.PATH_TO_GG_DATABASE,'rep_set','97_otus.fasta'),
                    '-tax', path.join(CFG.PATH_TO_GG_DATABASE,'taxonomy','97_otu_taxonomy.txt'),
                    '-size',dec_size_str,
                    '-p',otus_dir,
                    '-site',CFG.site
                  ]
            if(site.substring(0,5) != 'local'){
              args.push('--use_cluster')
            }
            script_commands.push(CFG.PATH_TO_NODE_SCRIPTS+"/otu_usearch_ref.py " + args.join(' '))
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
            args_uc2mtxPY = [ '-site',CFG.site,
                            '-i', fasta_file_path,
                            '-p',dec_size_str,
                            '-base',data_repo_path,
            ]
            args_uc2mtxPERL = [ '-uc', path.join(data_repo_path,method+'.otus.'+dec_size_str+'.uc'),
                                '>',   path.join(data_repo_path,method+'.otus.'+dec_size_str+'.mtx')                
            ]
            args_2tax   = [ '-site',CFG.site
            ]
            script_commands.push(CFG.PATH_TO_VSEARCH+' '+args_vsearch.join(' '))
            script_commands.push(CFG.PATH_TO_NODE_SCRIPTS+'/'+'otus_uc2mtx2.pl'+' '+args_uc2mtxPERL.join(' '))
            //script_commands.push(CFG.PATH_TO_NODE_SCRIPTS+"/otus_uc2mtx.pl" + args_uc2mtx.join(' '))
            //script_commands.push(CFG.PATH_TO_NODE_SCRIPTS+"/otus2tax.pl" + args_2tax.join(' '))
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
    var script_text = helpers.get_local_script_text(script_commands)
  }else{
    var script_text = helpers.get_qsub_script_text(req, log, pwd, 'vmps_otus', script_commands)
  }

  var oldmask = process.umask(0);
  console.log("script_path2 = " + script_path);
  fs.writeFile(script_path,
    script_text,
    {
      mode: 0o775
    },
    err => {
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
router.get('/project_list', helpers.isLoggedIn, (req, res) => {
    //console.log(C.PROJECT_INFORMATION_BY_PNAME);

    var pwd = CFG.PROCESS_DIR;
    var user_dir_path = path.join(CFG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');


    var project_info = {};
    var file_info = [];

     fs.readdir(user_dir_path, function readProjectsDir(err, items) {
            if (err) { return console.log(err); }
            project_info = {}
            for (var d in items) {
                // andy-uclust-otus-1481290684543
                var pts = items[d].split('-');
                if (pts[0] === 'otus') {
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
                            var config_obj = iniparser.parseSync(config_file);

                            file_info.push({ 'otus_code':otus_code, 'time':stat.mtime});

                            project_info[otus_code].method = config_obj['MAIN']['otu_method'];
                            project_info[otus_code].size = config_obj['MAIN']['otu_size'];
                            
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
                  
                  user: req.user, hostname: CFG.hostname
            });

    });  // readder
});
//
//   DELETE
//
router.get('/delete/:code', helpers.isLoggedIn, (req, res) => {
  console.log('in otus delete')
  var otus_code = req.params.code
  var pwd = CFG.PROCESS_DIR;
  var user_dir_path = path.join(CFG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
  var otus_dir = 'otus-'+otus_code
  var data_repo_path = path.join(user_dir_path, otus_dir);
  console.log(data_repo_path)
  helpers.deleteFolderRecursive(data_repo_path)
  res.send('OK')
});

//
// POST PROJECT
//
router.get('/project/:code', helpers.isLoggedIn, (req, res) => {
  console.log('in otus - project')
  var otus_code = req.params.code
  console.log(otus_code)
  var pwd = CFG.PROCESS_DIR;
  var user_dir_path = path.join(CFG.USER_FILES_BASE,req.user.username);  //path.join(pwd,'public','user_projects');
  var otus_dir = 'otus-'+otus_code
  var data_repo_path = path.join(user_dir_path, otus_dir);
  var config_file = path.join(data_repo_path, 'config.ini');
  var config_obj = iniparser.parseSync(config_file);
  

  fasta_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
  //entropy_status = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
  //oligo_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''

  
  res.render('otus/otus_project',
                { title: 'OTU Project',
                  code : otus_code,
                  config: JSON.stringify(config_obj),
                  fasta_status   : fasta_status,            
                  user: req.user, hostname: CFG.hostname
  });

});

router.get('/otus_method_selection', helpers.isLoggedIn, (req, res) => {
    console.log('in otus - select_otu_method')
    var url_parts = url.parse(req.url, true);
    var otus_code = url_parts.query.code
    console.log(otus_code)
    
    res.render('otus/otus_method_selection',
                { title: 'OTU Select Method',
                  code : otus_code,
                  user: req.user, hostname: CFG.hostname
    });
});
//
//
//
router.get('/clear_filters', helpers.isLoggedIn, (req, res) => {
    //SHOW_DATA = C.ALL_DATASETS;
    console.log('GET OTUs: in clear filters')

    
    res.json(otu_project_list);

});
//
//
//
router.get('/livesearch_projects/:substring', (req, res) => {
  console.log('OTU viz:in livesearch_projects/:substring')
  var substring = req.params.substring.toUpperCase();
  var myurl = url.parse(req.url, true);
  if(substring === '.....'){
    substring = ''
  }
  var filtered_otu_project_list = {}
  for(file in otu_project_list){    
    prj = otu_project_list[file].opid
    if(prj.toUpperCase().indexOf(substring) != -1){
        filtered_otu_project_list[file] = otu_project_list[file]  
    }
  }
  res.json(filtered_otu_project_list);
  

});
router.get('/livesearch_target/:gene_target', (req, res) => {
    console.log('OTU viz:in livesearch_target')
    var gene_target = req.params.gene_target.toUpperCase();
    var myurl = url.parse(req.url, true);
    if(gene_target === '.....'){
        gene_target = ''
    }
    //otu_project_list.forEach((prj) => {
    console.log(gene_target)
    var filtered_otu_project_list = {}
    for(file in otu_project_list){    
        prj = otu_project_list[file].opid
        if(prj.toUpperCase().indexOf(gene_target) != -1){
            filtered_otu_project_list[file] = otu_project_list[file]
        }
    }
    res.json(filtered_otu_project_list);
    
  

});
// router.get('/livesearch_status/:q', (req, res) => {
//   console.log('OTU viz:in livesearch status')
//   var q = req.params.q;
//   var myurl = url.parse(req.url, true);
//   var html = ''
//     
// });
router.get('/livesearch_otu_size/:q', (req, res) => {
  console.log('OTU viz:in livesearch_otu_size')
  var size = req.params.q;   // 3, 6 or 10 percent
  var myurl = url.parse(req.url, true);
  var filtered_otu_project_list = {}
  for(file in otu_project_list){    
        prjsize = otu_project_list[file].size  
        if(prjsize == size){
          filtered_otu_project_list[file] = otu_project_list[file]
        }
    }
    res.json(filtered_otu_project_list);
});
module.exports = router;
