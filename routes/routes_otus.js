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
var Readable = require('readable-stream').Readable;
//var chokidar = require('chokidar');
var spawn = require('child_process').spawn;
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
 router.get('/otu_tree_dhtmlx', function(req, res) {
    console.log('IN otu_tree_dhtmlx - routes_otus')
    var myurl = url.parse(req.url, true);
    var id = myurl.query.id
    console.log('id='+id)
    var json = {}
    json.id = id;
    json.item = []
    //PROJECT_TREE_OBJ = []
    //console.log('PROJECT_TREE_PIDS2',PROJECT_TREE_PIDS)

    if(id==0){
        
        var q = 'SELECT otu_project, otu_project_id,title,project_description,owner_user_id from otu_project'
        connection.query(q, function otu_projects(err, rows, fields){
            if(err){
                console.log(err)
            }else{
                
                for(n in rows){
                    console.log(rows[n])
                    pid = rows[n]['otu_project_id'].toString()
                    prj = rows[n]['otu_project']
                    title =  rows[n]['title']
                    desc =  rows[n]['project_description']
                    oid =  rows[n]['owner_user_id']
                    
                    itemtext = "<span id='"+ prj +"' class='tooltip_pjds_list'>"+prj+"</span>";
                    json.item.push({id:'p'+pid, text:itemtext, checked:false,  child:1, item:[]});
                    
                }
                
            }
            console.log('json')
            console.log(json)
            res.send(json)
        })
        // for( i=0;i<PROJECT_TREE_PIDS.length;i++ ){
// 
//             var pid = PROJECT_TREE_PIDS[i];
//             var node = PROJECT_INFORMATION_BY_PID[pid];
//             //console.log('node',node)
//             var tt_pj_id = 'project/'+node.project+'/'+node.title;
//             if(node.public) {
//               tt_pj_id += '/public';
//             }else{
//               tt_pj_id += '/private';
//             }
//             var pid_str = pid.toString()
//             var itemtext = "<span id='"+ tt_pj_id +"' class='tooltip_pjds_list'>"+node.project+"</span>";
//             itemtext    += " <a href='/projects/"+pid_str+"'><span title='profile' class='glyphicon glyphicon-question-sign'></span></a>";
//             if(node.public) {
//                 itemtext += "<small> <i>(public)</i></small>"
//             }else{
//                 itemtext += "<a href='/users/"+ node.oid+"'><small> <i>(PI: "+node.username +")</i></small></a>"
//             }
// 
//             if(Object.keys(DATA_TO_OPEN).indexOf(pid_str) >= 0){
//               json.item.push({id:'p'+pid_str, text:itemtext, checked:false, open:'1',child:1, item:[]});
//             }else{
//               json.item.push({id:'p'+pid_str, text:itemtext, checked:false,  child:1, item:[]});
//             }
// 
// 
//         }
        //console.log(JSON.stringify(json, null, 4))

    }else{
        var this_project = {}
        id = id.substring(1);  // id = pxx
        var q = "SELECT otu_dataset, otu_dataset_id from otu_dataset where otu_project_id='"+id+"'"
        console.log(q)
        connection.query(q , function otu_datasets(err, rows, fields){
            if(err){
                console.log(err)
            }else{
                for(n in rows){
                    console.log(rows[n])
                    ds =  rows[n]['otu_dataset']
                    did =  rows[n]['otu_dataset_id']
                    
                    itemtext = "<span id='"+ ds +"' class='tooltip_pjds_list'>"+ds+"</span>";
                    json.item.push({id:did, text:itemtext, checked:'1',  child:0});
                }
            }
            console.log('json')
            console.log(json)
            res.send(json)
        })
    }
    // json.item.sort(function sortByAlpha(a, b){
//           return helpers.compareStrings_alpha(a.text, b.text);
//     });
    
});
//
//
//
router.post('/visuals/view_selection', helpers.isLoggedIn, function(req, res) {
    console.log('in POST OTU view_selection')
    console.log(req.body);
    console.log('<<--in OTU view_selection')
    opid= req.body.otu_id
    var rando = Math.floor((Math.random() * 100000) + 1);
    var date = new Date();
    var otudata = {}
    //visual_post_items = COMMON.save_post_items(req);
    //console.log(visual_post_items)
    var q = "SELECT otu_project, otu_dataset, otu_label, count,"
    q += " ("
    q += "  CASE"
	q += "    WHEN otu_taxonomy_id IS NULL"
	q += "    THEN '0'"
	q += "    ELSE concat_ws(';',domain,phylum,klass,`order`,family,genus)"
    q += "  END"
    q += " ) as taxonomy"
    q += " FROM otu_pdr_info"
    q += " JOIN otu_dataset using(otu_dataset_id)"
    q += " JOIN otu_project using(otu_project_id)"
    q += " LEFT JOIN otu_taxonomy using(otu_taxonomy_id)"
    q += " LEFT JOIN domain using(domain_id)"
    q += " LEFT JOIN phylum using(phylum_id)"
    q += " LEFT JOIN klass using(klass_id)"
    q += " LEFT JOIN `order` using(order_id)"
    q += " LEFT JOIN family using(family_id)"
    q += " LEFT JOIN genus using(genus_id)"
    
     q += " WHERE otu_project_id='"+opid+"'" 
     console.log(q)
    connection.query(q, function otu_data(err, rows, fields){
        if(err){
            console.log(err)
        }else{
            otu_matrix = {}
            otu_matrix.id = req.user.username+'_'+rando
            otu_matrix.format = "Biological Observation Matrix 0.9.1-dev"
            otu_matrix.format_url = "http://biom-format.org/documentation/format_versions/biom-1.0.html"
            otu_matrix.type = "OTU table"
            otu_matrix.units = "OTU Taxonomy" //# or no taxonomy
            otu_matrix.generated_by = "VAMPS-NodeJS Version 2.0"
            otu_matrix.date = date.toISOString()
            otu_matrix.column_totals = 
            otu_matrix.max_dataset_count = 
            otu_matrix.matrix_type = "dense"
            otu_matrix.matrix_element_type = "int"
            otu_matrix.shape = []
            otu_matrix.rows = {}
            otu_matrix.columns = {}
            otu_matrix.data = {}
            
             
            prj = rows[0]['otu_project']
            
            var ds_order = {}
            var otu_tax = {}
            var otudata = {}
            for(n in rows){
                
                ds = rows[n]['otu_dataset']
                otu = rows[n]['otu_label']
                cnt = rows[n]['count']
                tax = rows[n]['taxonomy']
                ds_order[ds] = 1
                otu_tax[otu] = tax
                if(otudata.hasOwnProperty(otu)){
                    otudata[otu][ds] = cnt
                }else{
                    otudata[otu] = {}
                    otudata[otu][ds] = cnt                    
                }

            }
            
            
            res.render('otus/visuals/view_selection', {
                                title           : 'VAMPS: OTU Visuals',                                 
                                data            : JSON.stringify(otudata), 
                                project         : prj,
                                ds_order        : JSON.stringify(ds_order), 
                                otu_tax         : JSON.stringify(otu_tax),                         
                                constants       : JSON.stringify(req.CONSTS),                                
                                user            : req.user,
                                hostname        : req.CONFIG.hostname 
            });
        }
    });        

});

// {
//   "id": "andy_1494878156738",
//   "format": "Biological Observation Matrix 0.9.1-dev",
//   "format_url": "http://biom-format.org/documentation/format_versions/biom-1.0.html",
//   "type": "OTU table",
//   "units": "tax_silva119_simple",
//   "generated_by": "VAMPS-NodeJS Version 2.0",
//   "date": "2017-05-15T19:55:56.739Z",
//   "rows": [
//     {
//       "id": "Bacteria;Acidobacteria",
//       "metadata": null
//     },
//   ...
//     {
//       "id": "Unknown;phylum_NA",
//       "metadata": null
//     }
//   ],
//   "columns": [
//     {
//       "did": "49",
//       "id": "ICM_LCY_Bv6--LCY_0001_2003_05_11",
//       "metadata": null
//     },
//     ...
//     {
//       "did": "52",
//       "id": "ICM_LCY_Bv6--LCY_0007_2003_05_04",
//       "metadata": null
//     }
//   ],
//   "column_totals": [
//     8717,
//     5567,
//     21582,
//     7162
//   ],
//   "max_dataset_count": 21582,
//   "matrix_type": "dense",
//   "matrix_element_type": "int",
//   "shape": [
//     29,
//     4
//   ],
//   "data": [
//     [
//       13,      2,      0,      20
//     ],
//   ...
//     [
//       46,      15, 12,      82
//     ]
//   ]
// }
router.get('/load_otu_list', helpers.isLoggedIn, function (req, res) {
    console.log('in load_otu_list')
    var q = 'SELECT otu_project, otu_project_id, title, project_description, owner_user_id from otu_project order by otu_project'
    html = ''
    connection.query(q, function otu_projects(err, rows, fields){
        if(err){
            console.log(err)
        }else{
            
            for(n in rows){
                //console.log(rows[n])
                opid = rows[n]['otu_project_id'].toString()
                prj = rows[n]['otu_project']
                title =  rows[n]['title']
                desc =  rows[n]['project_description']
                oid =  rows[n]['owner_user_id']
                html += "<input type='radio' id='"+ opid +"' name='otu' value=''> "+prj+' ('+title+')<br>'
                //json.item.push({id:'p'+pid, text:itemtext, checked:false,  child:1, item:[]});   
            }
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
module.exports = router;
