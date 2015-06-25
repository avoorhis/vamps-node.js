var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path  = require('path');

/* GET Search page. */
router.get('/index_search', helpers.isLoggedIn, function(req, res) {
    
    var tmp_metadata_fields = {};
    var metadata_fields = {};
	var metadata_fields_array = [];
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
      metadata_fields_array.push(tmp_name)
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
    res.render('search/index_search', { title: 'VAMPS:Search',
        metadata_items: JSON.stringify(metadata_fields),
        message: req.flash('message'),
        meta_message: req.flash('meta_message'),
        tax_message: req.flash('tax_message'),
        mkeys: metadata_fields_array,
        user: req.user
    		});
});
//
//  TAXONOMY SEARCH
//
router.post('/taxonomy_search_for_datasets', helpers.isLoggedIn, function(req, res) {
	console.log('in tax search result')
    console.log('req.body-->>');
    console.log(req.body);
    console.log('<<--req.body');
	

  if(! req.body.tax_string){
		req.flash('tax_message', 'Error');
		res.redirect('index_search#taxonomy'); 
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
	add_where = ' WHERE '
	for(n in tax_items){
		rank = req.C.RANKS[n]
		qSelect += ' JOIN `'+rank+ '` using ('+rank+'_id)\n'
		add_where += '`'+rank+"`='"+tax_items[n]+"' and " 
	}
	qSelect = qSelect + add_where.substring(0, add_where.length - 5)
	console.log(qSelect)
	var query = req.db.query(qSelect, function (err, rows, fields){
    if (err) {
        req.flash('tax_message', 'SQL Error: '+err);
        res.redirect('index_search#taxonomy'); 
    } else {
      var datasets = {};
      datasets.ids = [];
      datasets.names = [];
      for(n in rows){
        console.log(rows[n])
        did = rows[n]['did'];
        pid = PROJECT_ID_BY_DID[did];
        pname = PROJECT_INFORMATION_BY_PID[pid].project;
        datasets.ids.push(did)
        datasets.names.push(pname+'--'+DATASET_NAME_BY_DID[did])
      }
      console.log(datasets)
      var timestamp = +new Date();  // millisecs since the epoch!
      var filename = 'datasets:'+timestamp+'.json';
      var filename_path = path.join('user_data',NODE_DATABASE,req.user.username,filename);
      helpers.mkdirSync(path.join('user_data',NODE_DATABASE));  // create dir if not present
      helpers.mkdirSync(path.join('user_data',NODE_DATABASE,req.user.username)); // create dir if not present
      //console.log(filename);
      helpers.write_to_file(filename_path,JSON.stringify(datasets));
      msg = "<a href='/visuals/saved_datasets'>"+filename+"</a>"
      req.flash('tax_message', 'Saved as: '+msg);
      res.redirect('index_search#taxonomy'); 
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
	res.redirect('index_search'); 
  }else{
          res.render('search/search_result', {   
                    title    : 'VAMPS: Search Datasets',
                    filtered : JSON.stringify(filtered),
                    searches : JSON.stringify(searches),
                    join_type: join_type,
                    user     : req.user
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
		for(n in AllMetadataNames){
			var name = AllMetadataNames[n];
			
				if(name.substring(0,len) === q){
	              console.log('name= '+name)
				  if (hint === "") {
      	                hint = name;
      	            } else {
     	                hint += "--"+name;
      	            }
	        }
	    }
	}
	//AllMetadataNames
	console.log('hint= '+hint)
	var result = (hint=="") ? ("No Suggestions") : (hint);
	console.log('result= '+result)
	res.send(result)
	
});
//
//  LIVESEARCH TAX
//
router.get('/livesearch/:q', helpers.isLoggedIn, function(req, res) {
	//console.log('params>>');
	//console.log(req.params);
	//console.log('<<params');
	console.log('in livesearch');
	var q = req.params.q.toLowerCase();
	var hint = '';
	var obj = new_taxonomy.taxa_tree_dict_map_by_rank;
	var taxon;
	if(q != ''){
		for(n in obj["domain"]){
			taxon = obj["domain"][n].taxon;
			if(taxon.toLowerCase() != 'domain_na' && taxon.toLowerCase().indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','domain');return false;\" >"+taxon + "</a> <small>(domain)</small><br>";
			}
		}
		for(n in obj["phylum"]){
			taxon = obj["phylum"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'phylum_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','phylum');return false;\" >"+taxon + "</a> <small>(phylum)</small><br>";
			}
		}
		for(n in obj["klass"]){
			taxon = obj["klass"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'klass_na' && t_lower.indexOf(q) != -1 ){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','klass');return false;\" >"+taxon + "</a> <small>(class)</small><br>";
			}
		}
		for(n in obj["order"]){
			taxon = obj["order"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'order_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','order');return false;\" >"+taxon + "</a> <small>(order)</small><br>";
			}
		}
		for(n in obj["family"]){
			taxon = obj["family"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'family_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','family');return false;\" >"+taxon + "</a> <small>(family)</small><br>";
			}
		}
		for(n in obj["genus"]){
			taxon = obj["genus"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'genus_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','genus');return false;\" >"+taxon + "</a> <small>(genus)</small><br>";
			}
		}
		for(n in obj["species"]){
			taxon = obj["species"][n].taxon;
			t_lower = taxon.toLowerCase();
			if(t_lower != 'species_na' && t_lower.indexOf(q) != -1){
				hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','species');return false;\" >"+taxon + " </a> <small>(species)</small><br>";
			}
		}
		
	}
	var result = (hint=="") ? ("No Suggestions") : (hint);
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
  if(q != ''){
    for(uid in obj){
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
  var result = (hint=="") ? ("No Suggestions") : (hint);
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
  var hint = '';
    
  if(q != ''){
    //hint += 'projects:<br>'
    for(pid in PROJECT_INFORMATION_BY_PID){
      
      pname = PROJECT_INFORMATION_BY_PID[pid].project
      
      console.log(PROJECT_INFORMATION_BY_PID);
      if(pname.toLowerCase().indexOf(q) != -1){
        //hint += "<a href='' onclick=\"get_user_str('"+taxon+"','domain');return false;\" >"+taxon + "</a> <small>(domain)</small><br>";
        //hint += "&nbsp;&nbsp;<a id='"+pid+"' href='#'>"+pname+"</a><br>";
        hint += "<form method='GET' action='/projects/"+pid+"'>";
        hint += "<button type='submit' id='"+pid+"' class='btn btn-xs btn-link' >"+pname+"</button>";
        hint += "</form>";
      }
    }
    //hint += 'datasets:<br>';
    for(n in DATASET_NAME_BY_DID){
      dname = DATASET_NAME_BY_DID[n]
      pid = PROJECT_ID_BY_DID[n]
      pname = PROJECT_INFORMATION_BY_PID[pid].project
      //console.log(dname);
      if(dname.toLowerCase().indexOf(q) != -1){
        //hint += "<a href='' onclick=\"get_user_str('"+taxon+"','domain');return false;\" >"+taxon + "</a> <small>(domain)</small><br>";
        //hint += "&nbsp;&nbsp;<a id='"+pid+"' href='#'>"+dname+" (in project: "+pname+")</a><br>";
        hint += "<form method='GET' action='/projects/"+pid+"'>";
        hint += "<button type='submit' id='"+pid+"' class='btn btn-xs btn-link' >"+dname+" (in project: "+pname+")</button>";
        hint += "</form>";
      }
    }
    



  }
  var result = (hint=="") ? ("No Suggestions") : (hint);
  res.send(result);
});
//
//
//
router.get('/livesearch_result/:rank/:taxon', helpers.isLoggedIn, function(req, res) {
	var selected_taxon = req.params.taxon;
	var selected_rank = req.params.rank;
	console.log(req.params);
	var this_item = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[selected_taxon+'_'+selected_rank];
	var tax_str = selected_taxon;
	var item = this_item
	while(item.parent_id != 0){
		item  = new_taxonomy.taxa_tree_dict_map_by_id[item.parent_id]
		tax_str = item.taxon +';'+tax_str
		//console.log(item)
	}
	console.log(tax_str);
	console.log('sending tax_str')
	res.send(tax_str);
	
});
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
        console.log('IN METADATA');
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


