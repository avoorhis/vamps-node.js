var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var fs   = require('fs-extra');
var path  = require('path');

/* GET Search page. */
router.get('/search_index', helpers.isLoggedIn, function(req, res) {

    AllMetadata_names = ''
    
    //console.log(metadata_fields)
    res.render('search/search_index', { title: 'VAMPS:Search',
        message:         req.flash('message'),
        user:            req.user,hostname: req.CONFIG.hostname,
    		});
});
//
//
//
router.get('/users', helpers.isLoggedIn, function(req, res) {

    res.render('search/users', { title: 'VAMPS:Search',
        
        message:              req.flash('message'),
        
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/names', helpers.isLoggedIn, function(req, res) {

    res.render('search/names', { title: 'VAMPS:Search',
        
        message:              req.flash('message'),
        
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/blast', helpers.isLoggedIn, function(req, res) {
    var blast_db = req.CONSTS.blast_db;
    // check if blast database exists:
    var blast_nin = path.join('public','blast', NODE_DATABASE, blast_db+'.nin');
    console.log(blast_nin);
    try{
      stats = fs.lstatSync(blast_nin);
      if (stats.isFile()) {
        var blast_db_path = path.join('public','blast', NODE_DATABASE, blast_db);
      }else{
        var blast_db_path = false;
      }
    }
    catch (e){
      console.log(e);
    }
    res.render('search/blast', { title: 'VAMPS:Search',
        blast_db_path:blast_db_path,
        message:              req.flash('message'),
        
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/taxonomy', helpers.isLoggedIn, function(req, res) {

    res.render('search/taxonomy', { title: 'VAMPS:Search',
        
        message:              req.flash('message'),
        
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/metadata/:type', helpers.isLoggedIn, function(req, res) {
      
      console.log('in by '+req.params.type)

      var tmp_metadata_fields = {};
      var metadata_fields = {};
      var metadata_fields_array = [];
      //var group = HDF5_DATA.openGroup("/");

      // for(did in DATASET_NAME_BY_DID){
      //   var group = HDF5_DATA.openGroup(did+"/metadata");
      //   group.refresh()
      //   Object.getOwnPropertyNames(group).forEach(function(mdname, idx, array) {
      //     if(mdname == 'id'){
      //       //console.log('Skipping [ID]',mdname,group[mdname])
      //     }else{
      //       val = group[mdname]
      //       if(mdname in tmp_metadata_fields){
      //         tmp_metadata_fields[mdname].push(val);
      //       }else{
      //         if(IsNumeric(val)){
      //           tmp_metadata_fields[mdname]=[];
      //         }else{
      //           tmp_metadata_fields[mdname]=['non-numeric'];
      //         }
      //         tmp_metadata_fields[mdname].push(val);
      //       }
      //     }        
      //   });
      // }
      for (var did in AllMetadata){
        for (var name in AllMetadata[did]){
            val = AllMetadata[did][name];
            if(name in tmp_metadata_fields){
              tmp_metadata_fields[name].push(val);
            }else{
              if(IsNumeric(val)){
                tmp_metadata_fields[name]=[];
              }else{
                tmp_metadata_fields[name]=['non-numeric'];
              }
              tmp_metadata_fields[name].push(val);
            }
        }
      }
      //console.log(tmp_metadata_fields)
    
      for (var tmp_name in tmp_metadata_fields){
        metadata_fields_array.push(tmp_name);
        if(tmp_metadata_fields[tmp_name][0] == 'non-numeric'){
          tmp_metadata_fields[tmp_name].shift(); //.filter(onlyUnique);
          metadata_fields[tmp_name] = tmp_metadata_fields[tmp_name].filter(onlyUnique);
        }else{
          var min = Math.min.apply(null, tmp_metadata_fields[tmp_name]);
          var max = Math.max.apply(null, tmp_metadata_fields[tmp_name]);
          metadata_fields[tmp_name] = {"min":min,"max":max};
        }
      }
      //console.log(metadata_fields)
      metadata_fields_array.sort();


      res.render('search/metadata', { title: 'VAMPS:Search',
        metadata_items:       JSON.stringify(metadata_fields),
        metadata_search_type: req.params.type,
        message:              req.flash('message'),
        mkeys:                metadata_fields_array,
        user:                 req.user,hostname: req.CONFIG.hostname,
      });
})
//
//  TAXONOMY SEARCH
//
router.post('/taxonomy_search_for_datasets', helpers.isLoggedIn, function(req, res) {
	console.log('in tax search result');
    console.log('req.body-->>');
    console.log(req.body);
    console.log('<<--req.body');
	

  if(! req.body.tax_string){
		req.flash('tax_message', 'Error');
		res.redirect('search_index#taxonomy');
    return;
	}
	var tax_string = req.body.tax_string;
	tax_items = tax_string.split(';');
	if(req.body.selection == 'custom_taxonomy'){		
		qSelect = "SELECT distinct dataset_id as did from sequence_pdr_info\n";
	}else{
		// ERROR
	}
	
	qSelect += " JOIN silva_taxonomy_info_per_seq using (sequence_id)\n";
	qSelect += " JOIN silva_taxonomy using (silva_taxonomy_id)\n";
	add_where = ' WHERE ';
	for(var n in tax_items){
		rank = req.CONSTS.RANKS[n];
		qSelect += ' JOIN `'+rank+ '` using ('+rank+'_id)\n';
		add_where += '`'+rank+"`='"+tax_items[n]+"' and " ;
	}
	qSelect = qSelect + add_where.substring(0, add_where.length - 5);
	console.log(qSelect);
	var query = req.db.query(qSelect, function (err, rows, fields){
    if (err) {
        req.flash('tax_message', 'SQL Error: '+err);
        res.redirect('search_index#taxonomy');
    } else {
      var datasets = {};
      datasets.ids = [];
      datasets.names = [];
      for(var n in rows){
        console.log(rows[n]);
        did = rows[n]['did'];
        pid = PROJECT_ID_BY_DID[did];
        pname = PROJECT_INFORMATION_BY_PID[pid].project;
        datasets.ids.push(did);
        datasets.names.push(pname+'--'+DATASET_NAME_BY_DID[did]);
      }
      console.log(datasets);
      var timestamp = +new Date();  // millisecs since the epoch!
      var filename = 'datasets:'+timestamp+'.json';
      var filename_path = path.join(req.CONFIG.USER_FILES_BASE,req.user.username,filename);
      helpers.mkdirSync(req.CONFIG.USER_FILES_BASE);  // create dir if not present
      helpers.mkdirSync(path.join(req.CONFIG.USER_FILES_BASE,req.user.username)); // create dir if not present
      //console.log(filename);
      helpers.write_to_file(filename_path,JSON.stringify(datasets));
      msg = "<a href='/visuals/saved_datasets'>"+filename+"</a>";
      req.flash('tax_message', 'Saved as: '+msg);
      res.redirect('search_index#taxonomy');
    }
  });
	
	
	
});
//
//  METADATA SEARCH
//
router.post('/metadata_search_result', helpers.isLoggedIn, function(req, res) {
  console.log('req.body-->>');
  console.log(req.body);
  console.log('<<--req.body');

  var search_function = req.body.search_function;
  var searches = {};
  var allowed = [ 'search1', 'search2', 'search3' ];
  if (search_function === 'search_metadata_all_datasets'){
    for (var name in req.body){
      items = name.split('_');
      var search = items[0];
      if(allowed.indexOf(search) != -1){
        if( !(search  in searches)){
          searches[search] = {};
        }
        searches[search][items[1]] = req.body[name];
      }
    }
  }
  var join_type = req.body.join_type;
  console.log(searches);

  // search datasets
  //console.log(AllMetadata);
  // This assumes that ALL datasets are in AllMetadata.
  //var datasets = [];
   // use for posting to unit_selection
  //
  //

  //
  var ds1, ds2, ds3 = [];
  var result = get_search_datasets(req.user, searches.search1, AllMetadata);
  ds1 = result.datasets;
  searches.search1.datasets = result.datasets;
  searches.search1.dataset_count = searches.search1.datasets.length;
  searches.search1.ds_plus = get_dataset_search_info(result.datasets, searches.search1);

  var md_hash =  AllMetadata;

  if('search2' in searches){
    //if(join_type == 'intersect'){
    //  var md_hash = result.mdv
    //}else{  // summation
    // var md_hash =  AllMetadata;
    //}
    result = get_search_datasets(req.user, searches.search2, md_hash);
    ds2 = result.datasets;
    searches.search2.datasets = result.datasets;
    searches.search2.dataset_count = searches.search2.datasets.length;
    //console.log('result.mdv2')
    //console.log(result.mdv)
    searches.search2.ds_plus = get_dataset_search_info(result.datasets, searches.search2);

  }

  if('search3' in searches){
    //if(join_type == 'intersect'){
    //  var md_hash = result.mdv
    //}else{
      // var md_hash =  AllMetadata;
    //}
    result = get_search_datasets(req.user, searches.search3, md_hash);
    ds3 = result.datasets;
    searches.search3.datasets = result.datasets;
    searches.search3.dataset_count = searches.search3.datasets.length;
    //console.log('result.mdv3')
    //console.log(result.mdv)
    searches.search3.ds_plus = get_dataset_search_info(result.datasets, searches.search3);
  }
  //
  // Calculate (sum or intersect) final datasets
  //
  var filtered = {};
  if(join_type == 'combination'){
    filtered.datasets = ds1.concat(ds2, ds3);
    filtered.datasets = filtered.datasets.filter(onlyUnique);
  }else{   // intersection
    filtered.datasets = ds1;
    if('search2' in searches) {
      filtered.datasets = ds1.filter(function(n) {
          return ds2.indexOf(n) != -1;
      });
    }
    if('search3' in searches) {
      filtered.datasets = filtered.datasets.filter(function(n) {
          return ds3.indexOf(n) != -1;
      });
    }
  }
  filtered.ds_plus = get_dataset_search_info(filtered.datasets, {});
  //
  //
  //searches.search1.dataset_count = ds.dataset_ids.length;


  //console.log('searches')
  //console.log(searches)

  //console.log('final');
  //console.log(filtered.datasets);
  if(filtered.datasets.length === 0){
  	console.log('redirecting back -- no data found');
	  req.flash('message', 'No Data Found');
	  res.redirect('search_index');
    return;
  }else{
          res.render('search/search_result_metadata', {
                    title    : 'VAMPS: Search Datasets',
                    filtered : JSON.stringify(filtered),
                    searches : JSON.stringify(searches),
                    join_type: join_type,
                    user     : req.user,hostname: req.CONFIG.hostname,
          });  //
   }

});
//
//  SEARCH DATASETS
//
router.get('/gethint/:hint', helpers.isLoggedIn, function(req, res) {
	//console.log('in gethint');
	//console.log(req.params.hint);
	var q = req.params.hint;
	var hint = '';
	if (q !== "") {
	    q = q.toLowerCase();
	    len=q.length;
		for(var n in AllMetadataNames){
			var name = AllMetadataNames[n];
			
				if(name.substring(0,len) === q){
          console.log('name= '+name);
				  if (hint === "") {
      	              hint = name;
      	            } else {
     	                hint += "--"+name;
      	            }
	        }
	    }
	}
	//AllMetadataNames
	console.log('hint= '+hint);
	var result = (hint === "") ? ("No Suggestions") : (hint);
	console.log('result= '+result);
	res.send(result);
	
});
//
//  LIVESEARCH TAX
//
router.get('/livesearch_taxonomy/:q', helpers.isLoggedIn, function(req, res) {
	//console.log('params>>');
	//console.log(req.params);
	//console.log('<<params');
	console.log('in livesearch taxonomy');
	var q = req.params.q.toLowerCase();
	var hint = '';
	var obj = new_taxonomy.taxa_tree_dict_map_by_rank;
	var taxon;
	if(q !== ''){
		for(var n in obj["domain"]){
			taxon = obj["domain"][n].taxon;
			if(taxon.toLowerCase() != 'domain_na' && taxon.toLowerCase().indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','domain');return false;\" >"+taxon + "</a> <small>(domain)</small><br>";
			}
		}
		for(var n in obj["phylum"]){
			taxon = obj["phylum"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'phylum_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','phylum');return false;\" >"+taxon + "</a> <small>(phylum)</small><br>";
			}
		}
		for(var n in obj["klass"]){
			taxon = obj["klass"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'klass_na' && t_lower.indexOf(q) != -1 ){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','klass');return false;\" >"+taxon + "</a> <small>(class)</small><br>";
			}
		}
		for(var n in obj["order"]){
			taxon = obj["order"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'order_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','order');return false;\" >"+taxon + "</a> <small>(order)</small><br>";
			}
		}
		for(var n in obj["family"]){
			taxon = obj["family"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'family_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','family');return false;\" >"+taxon + "</a> <small>(family)</small><br>";
			}
		}
		for(var n in obj["genus"]){
			taxon = obj["genus"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'genus_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','genus');return false;\" >"+taxon + "</a> <small>(genus)</small><br>";
			}
		}
		for(var n in obj["species"]){
			taxon = obj["species"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'species_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','species');return false;\" >"+taxon + " </a> <small>(species)</small><br>";
			}
		}
		
	}
	var result = (hint === "") ? ("No Suggestions") : (hint);
	res.send(result);
});
//
//  LIVESEARCH USER
//
router.get('/livesearch_user/:q', helpers.isLoggedIn, function(req, res) {
  //console.log('params>>');
  //console.log(req.params);
  //console.log('<<params');
  console.log('in livesearch user');
  var q = req.params.q.toLowerCase();
  var hint = '';
  var obj = ALL_USERS_BY_UID;
  var taxon;
  if(q !== ''){
    for(var uid in obj){
      user  = obj[uid].username;
      last  = obj[uid].last_name;
      first = obj[uid].first_name;

      if(last.toLowerCase().indexOf(q) != -1 || first.toLowerCase().indexOf(q) != -1){
        //hint += "<a href='' onclick=\"get_user_str('"+taxon+"','domain');return false;\" >"+taxon + "</a> <small>(domain)</small><br>";
        //hint += "<a href='#'>"+last+', '+first+' ('+user+")</a><br>";
        hint += "<form method='GET' action='/users/"+uid+"'>";
        hint += "<button type='submit' id='"+uid+"' class='btn btn-xs btn-link' >"+last+', '+first+' ('+user+")</button>";
        hint += "</form>";
      }
    }
  }
  var result = (hint === "") ? ("No Suggestions") : (hint);
  res.send(result);
});
//
//  LIVESEARCH PROJECT
//
router.get('/livesearch_project/:q', helpers.isLoggedIn, function(req, res) {
  //console.log('params>>');
  //console.log(req.params);
  //console.log('<<params');
  console.log('in livesearch project');
  var q = req.params.q.toLowerCase();
  console.log('q',q);
  var hint = 'Projects:<br>';
  var plist = []
  var p_obj = {}
  var dlist = []
  var d_obj = {}
  if(q !== ''){


    //hint += 'projects:<br>'
    // for(var pid in PROJECT_INFORMATION_BY_PID){

    //   pname  = PROJECT_INFORMATION_BY_PID[pid].project;
    //   ptitle = PROJECT_INFORMATION_BY_PID[pid].title;
    //   pdesc  = PROJECT_INFORMATION_BY_PID[pid].description;

      
    //   if(      pname.toLowerCase().indexOf(q) != -1 
    //         || ptitle.toLowerCase().indexOf(q) != -1 
    //         || pdesc.toLowerCase().indexOf(q) != -1
    //     ){
    //     //hint += "<a href='' onclick=\"get_user_str('"+taxon+"','domain');return false;\" >"+taxon + "</a> <small>(domain)</small><br>";
    //     //hint += "&nbsp;&nbsp;<a id='"+pid+"' href='#'>"+pname+"</a><br>";
    //     hint += "<form method='GET' action='/projects/"+pid+"'>";
    //     hint += "<button type='submit' id='"+pid+"' class='btn btn-xs btn-link' >"+pname+"</button>"+ptitle;
    //     hint += "</form>";
    //   }

      
    // }

    // hint += 'Datasets:<br>';
    // //hint += 'datasets:<br>';
    // console.log(DATASET_NAME_BY_DID);
    // for(var n in DATASET_NAME_BY_DID){
    //   dname = DATASET_NAME_BY_DID[n];
    //   pid = PROJECT_ID_BY_DID[n];
    //   pname = PROJECT_INFORMATION_BY_PID[pid].project;
    //   // dataset descriptition??

    //   //console.log(dname);
    //   if(dname.toLowerCase().indexOf(q) != -1){
    //     //hint += "<a href='' onclick=\"get_user_str('"+taxon+"','domain');return false;\" >"+taxon + "</a> <small>(domain)</small><br>";
    //     //hint += "&nbsp;&nbsp;<a id='"+pid+"' href='#'>"+dname+" (in project: "+pname+")</a><br>";
    //     hint += "<form method='GET' action='/projects/"+pid+"'>";
    //     hint += "<button type='submit' id='"+pid+"' class='btn btn-xs btn-link' >"+dname+" (in project: "+pname+")</button>";
    //     hint += "</form>";
    //   }
    //   //ALL_DATASETS.projects.forEach(function(prj) {
    // }
    
    
    ALL_DATASETS.projects.forEach(function(prj) {
      
      pid = prj.pid
      
      pname = prj.name;
      ptitle = PROJECT_INFORMATION_BY_PID[pid].title;
      pdesc  = PROJECT_INFORMATION_BY_PID[pid].description;
      datasets = prj.datasets;
      
      if(      pname.toLowerCase().indexOf(q) != -1 
            || ptitle.toLowerCase().indexOf(q) != -1 
            || pdesc.toLowerCase().indexOf(q) != -1
        ){
        console.log(pid)
        plist.push(pname)
        p_obj[pname] = {}
        p_obj[pname].pid   = pid
        p_obj[pname].title = ptitle
        p_obj[pname].desc  = pdesc
      }

      datasets.forEach(function(dset) {
        did = dset.did
        dname = dset.dname;
        ddesc = dset.ddesc;
        
        if(    dname.toLowerCase().indexOf(q) != -1 
            || ddesc.toLowerCase().indexOf(q) != -1 
          ){
          console.log(dname)
        dlist.push(dname)
        d_obj[dname] = {}
        d_obj[dname].did = did
        d_obj[dname].desc = ddesc
        d_obj[dname].project = pname
        }

      })


    })
    console.log(plist)
    console.log('a')
    dlist.sort()
    plist.sort()
console.log('b',plist.length)
    for(i = 0; i < plist.length; i++){
        pname = plist[i]
        //console.log(p_obj.pname.pid)
        console.log(plist[i])
        hint += "<form method='GET' action='/projects/"+p_obj[pname].pid+"'>";
        hint += "<button type='submit' id='"+p_obj[pname].pid+"' class='btn btn-xs btn-link' >"+pname+"</button> (title: "+p_obj[pname].title+')'
        hint += "</form>";
    }
    console.log('c',dlist.length)

    hint += 'Datasets:<br>';
    for(i = 0; i < dlist.length; i++){
        console.log('ca')
        dname = dlist[i]
        hint += "<form method='GET' action='/projects/"+d_obj[dname].did+"'>";
        console.log('cb')
        hint += "<button type='submit' id='"+d_obj[dname].did+"' class='btn btn-xs btn-link' >"+dname+"</button> (desc: "+d_obj[dname].desc+')'
        console.log('cc')
        hint += "</form>";
    }
     console.log('d')
      //if(dname.toLowerCase().indexOf(q) != -1){

      //}
    //})
// { name: 'CMP_JJ_ApD1',
//   pid: 53,
//   title: 'Title',
//   datasets: [ { did: 86, dname: 'ApD1', ddesc: 'ApD1_description' } ] }


  }

  console.log(q,'hint',hint)
  var result = (hint == 'Projects:<br>Datasets:<br>') ? ("No Suggestions") : (hint);
  res.send(result);
});
//
//
//
router.get('/livesearch_taxonomy/:rank/:taxon', helpers.isLoggedIn, function(req, res) {
	var selected_taxon = req.params.taxon;
	var selected_rank = req.params.rank;
  var rank_number = req.CONSTS.RANKS.indexOf(selected_rank);
	console.log(req.params);
	var this_item = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[selected_taxon+'_'+selected_rank];
	var tax_str = selected_taxon;

	var item = this_item;
	console.log(item);
  // goes up the tree to get taxon parents:
  while(item.parent_id !== 0){
		item  = new_taxonomy.taxa_tree_dict_map_by_id[item.parent_id];
		tax_str = item.taxon +';'+tax_str;
		//console.log(item);
	}

  // Would like to get list of all children for user selection
  // console.log('children of selection ::')
  // var item = this_item
  // //while(item.children_ids != []){
  // base_taxon = tax_str
  // tax_list = [];
  // for(i in item.children_ids){
  //   console.log('inloop');
  //   item  = new_taxonomy.taxa_tree_dict_map_by_id[item.children_ids[i]]
  //   new_tax_str = base_taxon+';'+item.taxon;
  //   t = tax(new_tax_str, item)
  //   //if()
  //   console.log('t')
  //   console.log(t)
  //   //tax_str = item.taxon +';'+tax_str
  //   //console.log(item)



  // }
	



  //console.log(base_taxon);
	console.log('sending tax_str');
	res.send(tax_str);
	
});
// function tax(tax, item){
//   console.log('inloopfxn');
//   new_tax_str = tax
//   console.log(item)
//   if(item.children_ids != []){
//     for(i in item.children_ids){
//       new_item = new_taxonomy.taxa_tree_dict_map_by_id[item.children_ids[i]]
//       new_tax_str = new_tax_str+';'+new_item.taxon;
//       console.log(new_item)
//       console.log('new tax '+new_tax_str)
//       tax(new_tax_str, new_item)
//     }
//   }
//   console.log('returning');
//   return new_tax_str;



// }
//
//  BLAST
//
router.post('/blast_search_result', helpers.isLoggedIn, function(req, res) {
    console.log('in blast res');
    console.log(req.body);
    if(req.body.query === ''){
      //req.flash('message', 'No Query Sequence Found');
      res.redirect('search_index#blast');
      return;
    }
    var blast_db = req.body.blast_db_path;
    // got query now put it in a file (where?)
    var timestamp = +new Date();  // millisecs since the epoch!
    timestamp = req.user.username + '_' + timestamp;
    var query_file = timestamp+"_blast_query.fa";
    var query_file_path = path.join('tmp',query_file);

    // using blastn with -outfmt 13 option produces 2 files
    var out_file0 = timestamp+"_blast_result.json";
    var out_file_path0 = path.join('tmp',out_file0);
    var out_file1 = timestamp+"_blast_result_1.json";
    var out_file_path1 = path.join('tmp',out_file1);
    // then run 'blastn' command
    // blastn -db <dbname> -query <query_file> -outfmt 13 -out <outfile_name>
    fs.writeFile(query_file_path,req.body.query+"\n",function(err){
      if(err){
        req.flash('message', 'ERROR - Could not write query file');
        res.redirect('search_index');
      }else{
        var spawn = require('child_process').spawn;
        var log = fs.openSync(path.join(process.env.PWD,'logs','blast.log'), 'a');
        var blast_options = {
          scriptPath : req.CONFIG.PATH_TO_BLAST,
          args :       [ '-db', blast_db, '-query', query_file_path, '-outfmt','13','-out',out_file_path0 ],
        };
        //var blastn_cmd = 'blastn -db '+blast_db+' -query '+query_file_path+' -outfmt 13 -out '+out_file_path0
        var blast_process = spawn( blast_options.scriptPath+'/blastn', blast_options.args, {detached: true, stdio: [ 'ignore', null, log ]} );

        blast_process.stdout.on('data', function (data) {
          //console.log('stdout: ' + data);
          data = data.toString().replace(/^\s+|\s+$/g, '');
          var lines = data.split('\n');
          for(var n in lines){
            console.log('blastn line '+lines[n]);
          }
        });
        // AAGTCTTGACATCCCGATGAAAGATCCTTAACCAGATTCCCTCTTCGGAGCATTGGAGAC
        blast_process.on('close', function (code) {
         console.log('blast_process process exited with code ' + code);
         if(code === 0){
           console.log('BLAST SUCCESS');
           // now read file
           fs.readFile(out_file_path1,'utf8', function(err, data){
              if(err){
                req.flash('message', 'ERROR - Could not read blast outfile');
                res.redirect('search_index');
              }else{
                var obj = JSON.parse(data);
                console.log(out_file_path1);
                console.log(data);
                res.render('search/search_result_blast', {
                    title    : 'VAMPS: BLAST Result',
                    data     : data,
                    show     : 'blast_result',
                    user     : req.user,hostname: req.CONFIG.hostname,
                });  //

              }
           });

         }else{
            req.flash('message', 'ERROR - BLAST command exit code: '+code);
            res.redirect('search_index');
         }
        });

      }

    });

  });
//
//
//
router.get('/seqs/:id', helpers.isLoggedIn, function(req, res) {
  console.log(req.params);
  var seqid = req.params.id;

  q_tax = "SELECT domain,phylum,klass,`order`,family,genus";
  q_tax += " from silva_taxonomy_info_per_seq";
  q_tax += " JOIN silva_taxonomy using (silva_taxonomy_id)";
  q_tax += " JOIN domain using (domain_id)";
  q_tax += " JOIN phylum using (phylum_id)";
  q_tax += " JOIN klass using (klass_id)";
  q_tax += " JOIN `order` using (order_id)";
  q_tax += " JOIN family using (family_id)";
  q_tax += " JOIN genus using (genus_id)";
  q_tax += " WHERE sequence_id='"+seqid+"'";

  //we want to know the taxonomy AND which projects
  q_ds = "SELECT dataset_id, seq_count from sequence_pdr_info";
  q_ds += " WHERE sequence_id='"+seqid+"'";
  console.log(q_ds);
  connection.query(q_ds, function(err, rows, fields){
    if(err){
      console.log(err);
    }else{
      var obj = {};

      for(var i in rows){
        did = rows[i].dataset_id;
        cnt = rows[i].seq_count;
        ds  = DATASET_NAME_BY_DID[did];
        pid = PROJECT_ID_BY_DID[did];
        pj  = PROJECT_INFORMATION_BY_PID[pid].project;
        //console.log(did)
        //console.log(ds)
        //console.log(pj)
        if(pj in obj){
          obj[pj][ds] = cnt;
        }else{
          obj[pj] = {};
          obj[pj][ds] = cnt;

        }

      }
      //console.log(obj);
      //console.log(JSON.stringify(obj));
      // AAGTCTTGACATCCCGATGAAAGATCCTTAACCAGATTCCCTCTTCGGAGCATTGGAGAC
      res.render('search/search_result_blast', {
                    title    : 'VAMPS: BLAST Result',
                    show     : 'datasets',
                    seqid    : seqid,
                    obj      : JSON.stringify(obj),
                    user     : req.user,hostname: req.CONFIG.hostname,
                });  //
      }
  });

});

router.get('/make_a_blast_db', helpers.isLoggedIn, function(req, res) {
  var txt = "<br><br>";
  txt += "<li>Install local ncbi-blast from: http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastDocs&DOC_TYPE=Download<br>";
  txt += "<li>Make a fasta file of all seqs to be included in blast db using the db2fasta.py script in the public/scripts directory<br>";
  txt += "The 'makeblastdb' command is part of the ncbi-blast suite of commands<br>";
  txt += "Run the 'makeblastdb' command as shown:<br>";
  txt += "/>makeblastdb -in new_fasta.fa -parse_seqids -dbtype nucl -out ALL_SEQS<br><br>";
  txt += "<li>Then move the newly created files into the directory /public/blast/&lt;NODE_DATABASE_NAME&gt;<br>";
  txt += "<li>The name of the new blast database should match the name in the public/constants.js file.";
  res.send(txt);
});
//
//
//
//  REGULAR FXNS
//

  //
  // GET SEARCH DATASETS
  //
  function get_search_datasets(user, search, metadata){
    //var datasets_plus = [];
    var datasets = [];  // use for posting to unit_selection
    var tmp_metadata = {};
    for (var did in metadata){

      // search only if did allowed by permissions
      var pid = PROJECT_ID_BY_DID[did];
      if(user.security_level === 1 || PROJECT_INFORMATION_BY_PID[pid].permissions  === 0 || PROJECT_INFORMATION_BY_PID[pid].permissions === user.user_id ){
        //console.log('IN METADATA');
        for (var mdname in metadata[did]){
          if(mdname === search['metadata-item']){

            mdvalue = metadata[did][mdname];

            if(('comparison' in search) && (search['comparison'] === 'equal_to')){
              search_value = Number(search['single-comparison-value']);
              if( Number(mdvalue) ===  search_value ){
                console.log('equal-to: val '+mdname+' - '+mdvalue);
                datasets.push(did);
                //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
                //ds.dataset_ids.push(ds_req);
                if(did in tmp_metadata){
                  tmp_metadata[did] = metadata[did];
                }else{
                  tmp_metadata[did] = {};
                  tmp_metadata[did] = metadata[did];
                }
              }
            }else if('comparison' in search && search['comparison'] === 'less_than'){
              search_value = Number(search['single-comparison-value']);
              if(Number(mdvalue) <= search_value){
                console.log('less_than: val '+mdname+' - '+mdvalue);
                datasets.push(did);
                //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
                //ds.dataset_ids.push(ds_req);
                if(did in tmp_metadata){
                  tmp_metadata[did] = metadata[did];
                }else{
                  tmp_metadata[did] = {};
                  tmp_metadata[did] = metadata[did];
                }
              }
            }else if('comparison' in search && search['comparison'] === 'greater_than'){
              search_value = Number(search['single-comparison-value']);
              if(Number(mdvalue) >= search_value){
                console.log('greater_than: val '+mdname+' - '+mdvalue);
                datasets.push(did);
                //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
                //ds.dataset_ids.push(ds_req);
                if(did in tmp_metadata){
                  tmp_metadata[did] = metadata[did];
                }else{
                  tmp_metadata[did] = {};
                  tmp_metadata[did] = metadata[did];
                }
              }
            }else if('comparison' in search && search['comparison'] === 'not_equal_to'){
              search_value = Number(search['single-comparison-value']);
              if(Number(mdvalue) !== search_value){
                console.log('not_equal_to: val '+mdname+' - '+mdvalue);
                datasets.push(did);
                //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
                //ds.dataset_ids.push(ds_req);
                if(did in tmp_metadata){
                  tmp_metadata[did] = metadata[did];
                }else{
                  tmp_metadata[did] = {};
                  tmp_metadata[did] = metadata[did];
                }
              }
            }else if('comparison' in search && search['comparison'] === 'between_range'){
              min_search_value = Number(search['min-comparison-value']);
              max_search_value = Number(search['max-comparison-value']);
              if(min_search_value > max_search_value){
                var tmp = max_search_value;
                max_search_value = min_search_value;
                min_search_value = tmp;
                //search['max-comparison-value'] = min_search_value;
                //search['min-comparison-value'] = max_search_value;
              }
              if(Number(mdvalue) > min_search_value && Number(mdvalue) < max_search_value){
                console.log('outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
                datasets.push(did);
                //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
                //ds.dataset_ids.push(ds_req);
                if(did in tmp_metadata){
                  tmp_metadata[did] = metadata[did];
                }else{
                  tmp_metadata[did] = {};
                  tmp_metadata[did] = metadata[did];
                }
              }

            }else if('comparison' in search && search['comparison'] === 'outside_range'){
              min_search_value = Number(search['min-comparison-value']);
              max_search_value = Number(search['max-comparison-value']);
              if(min_search_value > max_search_value){
                var tmp = max_search_value;
                max_search_value = min_search_value;
                min_search_value = tmp;
                //search['max-comparison-value'] = min_search_value;
                //search['min-comparison-value'] = max_search_value;
              }
              if(Number(mdvalue) < min_search_value || Number(mdvalue) > max_search_value){
                console.log('outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
                datasets.push(did);
                //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
                //ds.dataset_ids.push(ds_req);
                if(did in tmp_metadata){
                  tmp_metadata[did] = metadata[did];
                }else{
                  tmp_metadata[did] = {};
                  tmp_metadata[did] = metadata[did];
                }
              }

            }else if('data' in search){
              list = search['data'];
              if(list.indexOf(mdvalue) != -1){
                console.log('DATA: val '+did+' - '+mdname+' - '+mdvalue);
                datasets.push(did);
                //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
                //ds.dataset_ids.push(ds_req);
                if(did in tmp_metadata){
                  tmp_metadata[did] = metadata[did];
                }else{
                  tmp_metadata[did]={};
                  tmp_metadata[did] = metadata[did];
                }
              }
            }
          }
        }
      }
    }
    return {datasets:datasets, mdv:tmp_metadata};
  }
  //
  // GET DATASET SEARCH ORDER
  //
  function get_dataset_search_info(ds, search){
      var ds_plus = [];
      for(var i in ds){
        var did = ds[i];
        var dname = DATASET_NAME_BY_DID[did];
        var pid = PROJECT_ID_BY_DID[did];
        var pname = PROJECT_INFORMATION_BY_PID[pid].project;
        //var ds_req = did+'--'+pname+'--'+dname;
        if(search == {}){
          ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname });
        }else{
          ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname, value:AllMetadata[did][search["metadata-item"]] });
        }
      }
      return ds_plus;
  }

  function IsNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  module.exports = router;


