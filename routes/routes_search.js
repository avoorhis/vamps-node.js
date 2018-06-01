var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var fs   = require('fs-extra');
var path  = require('path');
var spawn = require('child_process').spawn;

/* GET Search page. */
router.get('/search_index', helpers.isLoggedIn, function(req, res) {

    //console.log(metadata_fields)
    res.render('search/search_index', { title: 'VAMPS:Search',
        user:            req.user,hostname: req.CONFIG.hostname,
    		});
});
//
//
//
router.get('/users', helpers.isLoggedIn, function(req, res) {

    res.render('search/users', { title: 'VAMPS:Search',
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/names', helpers.isLoggedIn, function(req, res) {

    res.render('search/names', { title: 'VAMPS:Search',
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/blast', helpers.isLoggedIn, function(req, res) {
    var blast_dbs = req.CONSTS.blast_dbs;
    var misc_blast_dbs_test = path.join('public','blast', req.CONSTS.misc_blast_dbs+'.nhr')
    // check if blast database exists:
    // separate dbs
    var db_collector = []
    for(n in blast_dbs){
        var blast_db_test1 = path.join('public','blast', blast_dbs[n]+'.nhr');
        var blast_db_test2 = path.join('public','blast', blast_dbs[n]+'.00.nhr');
        if(helpers.fileExists(blast_db_test1)){
            db_collector.push(blast_dbs[n])
        }
        if(helpers.fileExists(blast_db_test2)){
            db_collector.push(blast_dbs[n])
        }      
    }
    
    // if(helpers.fileExists(misc_blast_dbs_test)){
//             db_collector.push(req.CONSTS.misc_blast_dbs)
//     } 
    
    
    res.render('search/blast', { title: 'VAMPS:Search',
        blast_dbs : JSON.stringify(db_collector),
        user: req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/geo', helpers.isLoggedIn, function(req, res) {


    res.render('search/geo_area', { title: 'VAMPS:Search',
        gekey :   req.CONFIG.GOOGLE_EARTH_KEY,
        user:     req.user,hostname: req.CONFIG.hostname,
    });
});
router.post('/geo_search', helpers.isLoggedIn, function(req, res) {
    console.log('in geo_search result');
    console.log('req.body-->>');
    console.log(req.body);
    console.log('<<--req.body');

    var latmin = +req.body.lat_min
    var latmax = +req.body.lat_max
    var lonmin = +req.body.lon_min
    var lonmax = +req.body.lon_max
    if(latmin > latmax){
      tmp = latmin
      latmin = latmax
      latmax = tmp
    }
    if(lonmin > lonmax){
      tmp = lonmin
      lonmin = lonmax
      lonmax = tmp
    }

    dids_in_range = {}
    dids_in_range.points = {}
    dids_in_range.boundry = {}
    dids_in_range.boundry.lat_min = latmin
    dids_in_range.boundry.lat_max = latmax
    dids_in_range.boundry.lon_min = lonmin
    dids_in_range.boundry.lon_max = lonmax
    // validate input numbers -- should be client side

    for(did in DatasetsWithLatLong){
      obj = DatasetsWithLatLong[did]
      if(  +obj.latitude  >= +dids_in_range.boundry.lat_min
        && +obj.latitude  <= +dids_in_range.boundry.lat_max
        && +obj.longitude >= +dids_in_range.boundry.lon_min
        && +obj.longitude <= +dids_in_range.boundry.lon_max)
      {
        dids_in_range.points[did] = obj
        dids_in_range.points[did].project = PROJECT_INFORMATION_BY_PID[obj.pid].project
        dids_in_range.points[did].dataset = DATASET_NAME_BY_DID[did]
      }
    }

    res.json(dids_in_range)

});
router.post('/accept_latlon_datasets', helpers.isLoggedIn, function(req, res) {
  console.log('in accept_latlon_datasets');
  console.log('req.body-->>');
  console.log(req.body);
  console.log('<<--req.body');
});
//
//
//
router.get('/taxonomy', helpers.isLoggedIn, function(req, res) {

    res.render('search/taxonomy', { title: 'VAMPS:Search',
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

      if(HDF5_MDATA == ''){
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
      }else{

          for(did in DATASET_NAME_BY_DID){
            var group = HDF5_MDATA.openGroup(did+"/metadata");
            group.refresh()
            Object.getOwnPropertyNames(group).forEach(function(mdname, idx, array) {
              if(mdname != 'id'){
                if(mdname in tmp_metadata_fields){
                  tmp_metadata_fields[mdname].push(group[mdname]);
                }else{
                  if(IsNumeric(group[mdname])){
                    tmp_metadata_fields[mdname]=[];
                  }else{
                    tmp_metadata_fields[mdname]=['non-numeric'];
                  }
                  tmp_metadata_fields[mdname].push(group[mdname]);
                }
              }
            });
          }
      }



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

      //console.log(JSON.stringify(metadata_fields))
      res.render('search/metadata', { title: 'VAMPS:Search',
        metadata_items:       JSON.stringify(metadata_fields),
        metadata_search_type: req.params.type,
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
		req.flash('fail', 'Error: no tax found');
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
        req.flash('fail', 'SQL Error: '+err);
        res.redirect('search_index#taxonomy');
    } else {
      var datasets = {};
      datasets.ids = [];
      datasets.names = [];
      for(var n in rows){
        console.log(rows[n]);
        did = rows[n]['did'];
        try{
          pid = PROJECT_ID_BY_DID[did];
          pname = PROJECT_INFORMATION_BY_PID[pid].project;
          datasets.ids.push(did);
          datasets.names.push(pname+'--'+DATASET_NAME_BY_DID[did]);
        }catch(e){
          console.log('Skipping did:'+did+'; No project found')
        }


      }


      res.render('search/search_result_taxonomy', {
                    title    : 'VAMPS: Search Datasets',
                    datasets : JSON.stringify(datasets),
                    tax_string : tax_string,
                    user     : req.user, hostname: req.CONFIG.hostname,
          });


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

  var ds1, ds2, ds3 = [];
  var result = get_search_datasets(req.user, searches.search1);
  ds1 = result.datasets;
  searches.search1.datasets = result.datasets;
  searches.search1.dataset_count = searches.search1.datasets.length;
  searches.search1.ds_plus = get_dataset_search_info(result.datasets, searches.search1);
  console.log('result1',result)


  if('search2' in searches){

    result = get_search_datasets(req.user, searches.search2);
    ds2 = result.datasets;
    searches.search2.datasets = result.datasets;
    searches.search2.dataset_count = searches.search2.datasets.length;

    searches.search2.ds_plus = get_dataset_search_info(result.datasets, searches.search2);

  }

  if('search3' in searches){

    result = get_search_datasets(req.user, searches.search3);
    ds3 = result.datasets;
    searches.search3.datasets = result.datasets;
    searches.search3.dataset_count = searches.search3.datasets.length;

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

  if(filtered.datasets.length === 0){
  	console.log('redirecting back -- no data found');
	  req.flash('fail', 'No Data Found');
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
                //console.log('name= '+name);
				  if (hint === "") {
      	              hint = name;
      	            } else {
     	                hint += "--"+name;
      	            }
	        }
	    }
	}

	var result = (hint === "") ? ("No Suggestions") : (hint);
	console.log('result= '+result);
	res.send(result);

});
//
//  LIVESEARCH TAX
//
router.get('/livesearch_taxonomy/:q', helpers.isLoggedIn, function(req, res) {
	console.log('search:in livesearch taxonomy1');
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

  console.log('search:in livesearch user');
  var q = req.params.q.toLowerCase();
  var hint = '';
  var obj = ALL_USERS_BY_UID;
  var taxon;
  if(q !== ''){
    for(var uid in obj){
      user  = obj[uid].username;
      last  = obj[uid].last_name;
      first = obj[uid].first_name;

      if(last.toLowerCase().indexOf(q) != -1 || first.toLowerCase().indexOf(q) != -1 || user.toLowerCase().indexOf(q) != -1){
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
  console.log('search:in livesearch project');
  var q = req.params.q.toLowerCase();
  var hint = 'Projects:<br>';
  var plist = []
  var p_obj = {}
  var dlist = []
  var d_obj = {}
  if(q !== ''){

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
            dlist.push(dname)
            d_obj[did] = {}
            d_obj[did].dname = dname
            d_obj[did].did = did
            d_obj[did].desc = ddesc
            d_obj[did].project = pname
            d_obj[did].pid = pid
          }

      })

    })
    dlist.sort()
    plist.sort()
    for(i = 0; i < plist.length; i++){
        pname = plist[i]
        hint += "<form method='GET' action='/projects/"+p_obj[pname].pid+"'>";
        hint += "<button type='submit' id='"+p_obj[pname].pid+"' class='btn btn-xs btn-link' >"+pname+"</button> (title: "+p_obj[pname].title+')'
        hint += "</form>";
    }

    hint += 'Datasets:<br>';
    for(did in d_obj){
        hint += "<form method='GET' action='/projects/"+d_obj[did].pid+"'>";
        hint += "<button type='submit' id='"+d_obj[did].did+"' class='btn btn-xs btn-link' >"+d_obj[did].dname+"</button> (desc: "+d_obj[did].desc+')'
        hint += "</form>";
    }

  }

  var result = (hint == 'Projects:<br>Datasets:<br>') ? ("No Suggestions") : (hint);
  res.send(result);
});
//
// LIVESEARCH TAX
//
router.get('/livesearch_taxonomy/:rank/:taxon', helpers.isLoggedIn, function(req, res) {
	console.log('search:in livesearch_taxonomy2');
	var selected_taxon = req.params.taxon;
	var selected_rank = req.params.rank;
    var rank_number = req.CONSTS.RANKS.indexOf(selected_rank);
	var this_item = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[selected_taxon+'_'+selected_rank];
	var tax_str = selected_taxon;
	var item = this_item;

  // goes up the tree to get taxon parents:
  while(item.parent_id !== 0){
		item  = new_taxonomy.taxa_tree_dict_map_by_id[item.parent_id];
		tax_str = item.taxon +';'+tax_str;
		//console.log(item);
	}


  this_item.full_string = tax_str;
  console.log('sending tax_str',this_item);
  res.json(this_item);

});




// }
//
//  BLAST
//
router.post('/blast_search_result', helpers.isLoggedIn, function(req, res) {
    console.log('search:in blast res');
    console.log(req.body);
    if(req.body.query === ''){
        req.flash('fail', 'No Query Sequence Found');
        res.redirect('/search/blast');
        return;
    }
    if(req.body.query.length <10 || req.body.query.length > 500){
        req.flash('fail', 'Query length needs to be between 10 and 500 base pairs');
        res.redirect('/search/blast');
        return;
    }
    var patt = /[^ATCGUKSYMWRBDHV]/i   //contains anything other than 'A','T','C' or 'G'
    if( patt.test(req.body.query) ){
        req.flash('fail', 'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes');
        res.redirect('/search/blast');
        return;
    }
    var db_collector = []
    var db_collector_short = []
    for(n in req.CONSTS.blast_dbs){
        if(req.CONSTS.blast_dbs[n] in req.body){
            var db_path = path.join(req.CONFIG.PROCESS_DIR,'public','blast',req.CONSTS.blast_dbs[n])
            db_collector.push(db_path)
            db_collector_short.push(req.CONSTS.blast_dbs[n])
        }
    }
    if(db_collector.length == 0){
        req.flash('fail', 'No Databases Selected');
        res.redirect('/search/blast');
        return;
    }
    
    
    // got query now put it in a file (where?)
    var timestamp = +new Date();  // millisecs since the epoch!
    timestamp = req.user.username + '_' + timestamp;
    

    // using blastn with -outfmt 13 option produces 2 files
    var out_file = timestamp+"_blast_result.json";
    var out_file_path = path.join(req.CONFIG.PROCESS_DIR,'tmp',out_file);
    var query_file = timestamp+"_blast_query.fa";
    var query_file_path = path.join(req.CONFIG.PROCESS_DIR,'tmp',query_file);
    // then run 'blastn' command
    // blastn -db <dbname> -query <query_file> -outfmt 13 -out <outfile_name>
    
    var exec = require('child_process').exec;
    //var log = fs.openSync(path.join(process.env.PWD,'logs','blast.log'), 'a');
    var blast_cmd = req.CONFIG.PATH_TO_BLAST+"/blastn"
    var dbs_string = '"'+db_collector.join(' ')+'"'
    //var echo_cmd = "\""+"echo -e TTTAGAGGGGTTTTGCGCAGCTAACGCG|"
    // Ev9:  ACACGACGACAACCTGAAAGGGAT
    var task = 'blastn'
    if(req.body.query.length < 50){
        task = 'blastn-short'
    }
    fs.writeFile(query_file_path,req.body.query+"\n",function(err){
      if(err){
        req.flash('fail', 'ERROR - Could not write query file');
        res.redirect('search_index');
      }else{
            var blast_options = {
              scriptPath : req.CONFIG.PATH_TO_BLAST,
              //args :       [ "-c",echo_cmd+blast_cmd,"-db ",dbs_string,"-outfmt","15","-out",out_file_path+"\"" ],
              args :       [ blast_cmd,"-db ",dbs_string,"-outfmt","15","-query",query_file_path,"-out",out_file_path,'-task',task ],
            };
            //var blastn_cmd = 'blastn -db '+blast_db+' -query '+query_file_path+' -outfmt 13 -out '+out_file_path0
            console.log(blast_options.args.join(' '))
            //return   TTTAGAGGGGTTTTGCGCAGCTAACGCG
           //  var blast_process = exec( "sh",blast_options.args, {
        //             env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
        //             detached: true,
        //             //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
        //             stdio: 'pipe'  // stdin, stdout, stderr
        //     } );
            var blast_process = exec( blast_options.args.join(' '), (e, stdout, stderr)=> {
            if (e) {
                console.error(e);
                return
            }
            var obj = require(out_file_path);
    
            res.render('search/search_result_blast', {
                    title    : 'VAMPS: BLAST Result',
                    data     : JSON.stringify(obj),
                    show     : 'blast_result',
                    dbs      : JSON.stringify(db_collector_short),
                    query    : req.body.query,
                    user     : req.user,hostname: req.CONFIG.hostname,
            });
        });
        console.log('1')
    }
    });
return
//sh -c "echo -e TTTAGAGGGGTTTTGCGCAGCTAACGCG|/usr/local/ncbi/blast/bin//blastn -db \\"/Users/avoorhis/programming/vamps-node.js/public/blast/Bv6 /Users/avoorhis/programming/vamps-node.js/public/blast/Ev9\\" -outfmt 13 -out /Users/avoorhis/programming/vamps-node.js/tmp/avoorhis_1527702469368_blast_result.json"
    blast_process.stdout.on('data', function (data) {
        //console.log('stdout: ' + data);
        data = data.toString().replace(/^\s+|\s+$/g, '');
        var lines = data.split('\n');
        for(var n in lines){
            console.log('blastn line '+lines[n]);
        }
    });
    blast_process.stderr.on('data', function (data) {
        //console.log('stdout: ' + data);
        console.log('stderr: ' + data);
    });
console.log('2')
    // AAGTCTTGACATCCCGATGAAAGATCCTTAACCAGATTCCCTCTTCGGAGCATTGGAGAC
    blast_process.on('close', function (code) {
         console.log('blast_process process exited with code ' + code);
         if(code === 0){
           console.log('BLAST SUCCESS');
           // now read file
           fs.readFile(out_file_path1,'utf8', function(err, data){
              if(err){
                req.flash('fail', 'ERROR - Could not read blast outfile');
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
            req.flash('fail', 'ERROR - BLAST command exit code: '+code);
            res.redirect('search_index');
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
function get_search_datasets(user, search){
    //var datasets_plus = [];
    var datasets = [];
    //var tmp_metadata = {};
    if(HDF5_MDATA == ''){

        for (var did in AllMetadata){
          // search only if did allowed by permissions
          var pid = PROJECT_ID_BY_DID[did];

          try{

              if(user.security_level <= 10 || PROJECT_INFORMATION_BY_PID[pid].permissions.length === 0 || PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(user.user_id) !=-1 ){
                for (var mdname in AllMetadata[did]){
                  if(mdname === search['metadata-item']){
                    mdvalue = AllMetadata[did][mdname];
                    datasets.append(get_search_datasets_did(datasets, search, did, mdname, mdvalue))
                  }
                }
              }
            }
            catch(e){
                console.log('skipping pid,did',pid,did,e)
            }
        }

    }else{
        for (var did in DATASET_NAME_BY_DID){
          //console.log('did',did)
          // search only if did allowed by permissions
          var pid = PROJECT_ID_BY_DID[did];
          try{
              if(user.security_level <= 10 || PROJECT_INFORMATION_BY_PID[pid].permissions.length === 0 || PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(user.user_id) !=-1 ){
                var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
                mdgroup.refresh()
                var mdname = search['metadata-item']
                if(mdgroup.hasOwnProperty(mdname)){
                      mdvalue = mdgroup[mdname];
                      datasets.append(get_search_datasets_did(datasets, search, did, mdname, mdvalue))
                }
              }
           }
           catch(e){
                console.log('skipping pid,did',pid,did,e)
           }
        }

    }


    //console.log('ds',datasets)

    return {datasets:datasets}//, mdv:tmp_metadata};
}
function get_search_datasets_did(datasets, search, did, mdname, mdvalue){

        if(search.hasOwnProperty('comparison') && search.comparison === 'equal_to'){
            search_value = Number(search['single-comparison-value']);
            if( Number(mdvalue) ===  search_value ){
              //console.log('equal-to: val '+mdname+' - '+mdvalue);
              datasets.push(did);
            }
          }else if(search.hasOwnProperty('comparison') && search.comparison === 'less_than'){
            search_value = Number(search['single-comparison-value']);
            if(Number(mdvalue) <= search_value){
              //console.log('less_than: val '+mdname+' - '+mdvalue);
              datasets.push(did);
            }
          }else if(search.hasOwnProperty('comparison') && search.comparison === 'greater_than'){
            console.log('in gt')
            search_value = Number(search['single-comparison-value']);
            if(Number(mdvalue) >= search_value){
              //console.log('greater_than: val '+mdname+' - '+mdvalue);
              datasets.push(did);
            }
          }else if(search.hasOwnProperty('comparison') && search.comparison === 'not_equal_to'){
            search_value = Number(search['single-comparison-value']);
            if(Number(mdvalue) !== search_value){
              //console.log('not_equal_to: val '+mdname+' - '+mdvalue);
              datasets.push(did);
            }
          }else if(search.hasOwnProperty('comparison') && search.comparison === 'between_range'){
            min_search_value = Number(search['min-comparison-value']);
            max_search_value = Number(search['max-comparison-value']);
            if(min_search_value > max_search_value){
              var tmp = max_search_value;
              max_search_value = min_search_value;
              min_search_value = tmp;
            }
            if(Number(mdvalue) > min_search_value && Number(mdvalue) < max_search_value){
              //console.log('outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
              datasets.push(did);
            }
          }else if(search.hasOwnProperty('comparison') && search['comparison'] === 'outside_range'){
            min_search_value = Number(search['min-comparison-value']);
            max_search_value = Number(search['max-comparison-value']);
            if(min_search_value > max_search_value){
              var tmp = max_search_value;
              max_search_value = min_search_value;
              min_search_value = tmp;
            }
            if(Number(mdvalue) < min_search_value || Number(mdvalue) > max_search_value){
              //console.log('outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
              datasets.push(did);
            }
          }else if('data' in search){
            list = search['data'];
            if(list.indexOf(mdvalue) != -1){
              //console.log('DATA: val '+did+' - '+mdname+' - '+mdvalue);
              datasets.push(did);
            }
          }else{
            console.log('Search ERROR')
          }
        return datasets
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
          if(HDF5_MDATA == ''){
            ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname, value:AllMetadata[did][search["metadata-item"]] });
          }else{
            var mdgroup = HDF5_MDATA.openGroup(did+"/metadata");
            mdgroup.refresh()
            ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname, value:mdgroup[search["metadata-item"]] });
          }

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
