const express = require('express');
var router = express.Router();
const passport = require('passport');
const helpers = require(app_root +'/routes/helpers/helpers');
const fs   = require('fs-extra');
const path  = require('path');
const spawn = require('child_process').spawn;
const C		  = require(app_root + '/public/constants');

/* GET Search page. */
router.get('/search_index', helpers.isLoggedIn, (req, res) => {

    //console.log(metadata_fields)
    res.render('search/search_index', { title: 'VAMPS:Search',
        user:            req.user,hostname: req.CONFIG.hostname,
    		});
});
//
//
//
router.get('/users', helpers.isLoggedIn, (req, res) => {

    res.render('search/users', { title: 'VAMPS:Search',
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/names', helpers.isLoggedIn, (req, res) => {

    res.render('search/names', { title: 'VAMPS:Search',
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/blast', helpers.isLoggedIn, (req, res) => {
    var blast_dbs = C.blast_dbs;
    //var misc_blast_dbs_test = path.join('public','blast', C.misc_blast_dbs+'.nhr')
    // check if blast database exists:
    // separate dbs
    var db_collector = []
    for(n in blast_dbs){
        var blast_db_test1 = path.join(req.CONFIG.PATH_TO_BLAST_DBS, blast_dbs[n], blast_dbs[n]+'.nhr');
        var blast_db_test2 = path.join(req.CONFIG.PATH_TO_BLAST_DBS, blast_dbs[n], blast_dbs[n]+'.00.nhr');
        if(helpers.fileExists(blast_db_test1)){
            db_collector.push(blast_dbs[n])
        }
        if(helpers.fileExists(blast_db_test2)){
            db_collector.push(blast_dbs[n])
        }      
    }
    
    res.render('search/blast', { title: 'VAMPS:Search',
        blast_dbs : JSON.stringify(db_collector),
        user: req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/geo_by_tax', helpers.isLoggedIn, (req, res) => {
    var phyla = []
    var ranks_without_domain = C.RANKS.slice(1,-2)  // remove domain (too numerous), species and strain
    var qSelect = "select phylum from phylum order by phylum"
    var query = connection.query(qSelect, (err, rows, fields) => {
        
        for(i in rows){
            //console.log(rows[i])
            phyla.push(rows[i].phylum)
        }
       
        res.render('search/geo_by_tax', { title: 'VAMPS:Search',
            user  :     req.user,hostname: req.CONFIG.hostname,
            ranks :   JSON.stringify(ranks_without_domain),
            //domains : JSON.stringify(C.DOMAINS.domains),
            phyla :  JSON.stringify(phyla),
        
        });
    });
});
//
//
//
router.get('/geo', helpers.isLoggedIn, (req, res) => {

    res.render('search/geo_area', { title: 'VAMPS:Search',
        user:     req.user,hostname: req.CONFIG.hostname,
        token :   req.CONFIG.MAPBOX_TOKEN
    });
});
//
//
//
router.post('/geo_by_meta_search', helpers.isLoggedIn, (req, res) => {
    console.log('in geo_by_meta_values');
    console.log('req.body-->>');
    console.log(req.body);
    console.log('<<--req.body');
   
    var searches = JSON.parse(req.body.searches)
    var dataset_ids = searches.dataset_ids
    var latlon_datasets = {}
    latlon_datasets.points = {}
    
    for(n in dataset_ids){
        var did = dataset_ids[n]
        var project = C.PROJECT_INFORMATION_BY_PID[C.PROJECT_ID_BY_DID[did]].project
        var pid     = C.PROJECT_INFORMATION_BY_PID[C.PROJECT_ID_BY_DID[did]].pid
        var ds      = C.DATASET_NAME_BY_DID[did]
        var pjds = project +'--'+ds
        if(did in C.DatasetsWithLatLong){
            latlon_datasets.points[did] = {}
            latlon_datasets.points[did].proj_dset = pjds
            latlon_datasets.points[did].pid = pid
            latlon_datasets.points[did].latitude = C.DatasetsWithLatLong[did].latitude
            latlon_datasets.points[did].longitude = C.DatasetsWithLatLong[did].longitude
            latlon_datasets.points[did].tax = '' 
        }
    }
    
    if(Object.keys(latlon_datasets.points).length == 0){
        console.log('NO LAT LON DATA')
        res.end('<p>No Lat/Lon Data Found (use the Back Button to return).</p>');
        return
    }
    res.render('search/geo_map', { title: 'VAMPS:Search',
                        user  :     req.user,hostname: req.CONFIG.hostname,
                        data :   JSON.stringify(latlon_datasets),
                        tax_name : 'noTax',
                        rank : 'noRank',
                        metadata : '',
                        md_range : '',
                        searches : JSON.stringify(searches),
                        token :   req.CONFIG.MAPBOX_TOKEN,
                        search_type : 'metadata',
                        sub_title : 'Datasets by Metadata Value'
    })
    return
});
//
//
//

router.post('/geo_by_tax_search', helpers.isLoggedIn, (req, res) => {
    console.log('in geo_by_tax_search');
    console.log('req.body-->>');
    console.log(req.body);
    console.log('<<--req.body');
    var rank = req.body.rank
    var tax = req.body.tax
    function finish_no_data(){
        
        var phyla = []
        var ranks_without_domain = C.RANKS.slice(1,-2)  // remove domain (too numerous), species and strain
        var qSelect = "select phylum from phylum order by phylum"
        var query = connection.query(qSelect, (err, rows, fields) => {
        
            for(i in rows){
                //console.log(rows[i])
                phyla.push(rows[i].phylum)
            }
       
            res.render('search/geo_by_tax', { title: 'VAMPS:Search',
                user  :     req.user,hostname: req.CONFIG.hostname,
                ranks :   JSON.stringify(ranks_without_domain),
                //domains : JSON.stringify(C.DOMAINS.domains),
                phyla :  JSON.stringify(phyla),
        
            });
        });
    }
    var qSelect = "select DISTINCT project,project_id,dataset,dataset_id,latitude,longitude,\n"
    qSelect += " concat_ws(';',domain,phylum,klass,`order`,family,genus,species) as tax\n"
    qSelect += " FROM sequence_pdr_info\n"
    qSelect += " JOIN sequence_uniq_info using (sequence_id)\n"
    qSelect += " JOIN silva_taxonomy_info_per_seq using(silva_taxonomy_info_per_seq_id)\n"
    qSelect += " JOIN silva_taxonomy using(silva_taxonomy_id)\n"
    qSelect += " JOIN dataset using(dataset_id)\n"
    qSelect += " JOIN project using(project_id)\n"
    qSelect += " JOIN required_metadata_info using(dataset_id)\n"
    qSelect += " JOIN domain on(domain.domain_id=silva_taxonomy.domain_id)\n"
    qSelect += " JOIN phylum using(phylum_id)\n"
    qSelect += " JOIN klass using(klass_id)\n"
    qSelect += " JOIN `order` using(order_id)\n"
    qSelect += " JOIN family using(family_id)\n"
    qSelect += " JOIN genus using(genus_id)\n"
    qSelect += " JOIN species using(species_id)\n"
    qSelect += " WHERE `"+rank+"`='"+tax+"'"
    console.log(qSelect)
    var latlon_datasets = {}
    latlon_datasets.points = {}
    taxa_collector = {}
    var query = connection.query(qSelect, (err, rows, fields) => {
            if (err) return(err);
            console.log('Long Query Finished')
            if(rows.length == 0){
                req.flash('fail', 'No Lat-Lon Data Found');
                //console.log('No Data Found')
                finish_no_data() 
                return;   
            }else{
                var null_counter = 0
                for(i in rows){
                    
                    if(rows[i].latitude == null || rows[i].longitude == null){                        
                        null_counter += 1
                    }else{
                      var pjds = rows[i].project+'--'+rows[i].dataset
                      var did = rows[i].dataset_id
                      if(!taxa_collector.hasOwnProperty(did)){
                        
                        taxa_collector[did] = {}
                      }
                      
                      if(taxa_collector[did].hasOwnProperty('tax')){
                        
                        taxa_collector[did]['tax'].push(rows[i].tax)
                      }else{
                        
                        taxa_collector[did]['tax'] = [rows[i].tax] 
                      }
                      latlon_datasets.points[did] = {}
                    
                      latlon_datasets.points[did].proj_dset = pjds
                      latlon_datasets.points[did].pid = rows[i].project_id
                      latlon_datasets.points[did].latitude = rows[i].latitude
                      latlon_datasets.points[did].longitude = rows[i].longitude  
                    }
                    
                }
                // add tax array
                for(did in latlon_datasets.points){
                    latlon_datasets.points[did].tax = taxa_collector[did].tax
                }
                
                if(null_counter == rows.length){  // ie all the data is null
                    req.flash('fail', 'No Lat-Lon Data Found');
                    
                    finish_no_data() 
                    return;   
                      
                }else{
                    //`console.log(latlon_datasets)
                    
                    res.render('search/geo_map', { title: 'VAMPS:Search',
                        user  :     req.user,hostname: req.CONFIG.hostname,
                        data :   JSON.stringify(latlon_datasets),
                        tax_name : tax,
                        rank: rank,
                        metadata:'noMD',
                        md_range: 'noRange',
                        searches : JSON.stringify({}),
                        token :   req.CONFIG.MAPBOX_TOKEN,
                        search_type : 'tax',
                        sub_title : 'Datasets by Selected Taxon'
                    })
                    return
                }
                
                
            }
    }) 
})
router.post('/all_taxa_by_rank', helpers.isLoggedIn, (req, res) => {
	console.log('in all_taxa_by_rank');
    console.log('req.body-->>');
    console.log(req.body);
    console.log('<<--req.body');
    function finish(result){
        res.json(result)
    }
    var rank = req.body.rank
    var result = []
    if(rank == 'domain'){
        
        for(i in C.DOMAINS.domains){
            result.push(C.DOMAINS.domains[i].name)
        }
        
        finish(result)
    }else{
        var qSelect = "SELECT `"+rank+"` FROM `"+rank+"`"
        console.log(qSelect)
       
        var query = connection.query(qSelect, (err, rows, fields) => {
            if (err) return(err);
            for(i in rows){
                if(rows[i][rank]){
                    result.push(rows[i][rank])
                }
            }
            result.sort( (a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            finish(result)
        })
    }
    
});
router.post('/geo_search', helpers.isLoggedIn, (req, res) => {
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

    for(did in C.DatasetsWithLatLong){
      obj = C.DatasetsWithLatLong[did]
      if(  +obj.latitude  >= +dids_in_range.boundry.lat_min
        && +obj.latitude  <= +dids_in_range.boundry.lat_max
        && +obj.longitude >= +dids_in_range.boundry.lon_min
        && +obj.longitude <= +dids_in_range.boundry.lon_max)
      {
        dids_in_range.points[did] = obj
        dids_in_range.points[did].project = C.PROJECT_INFORMATION_BY_PID[obj.pid].project
        dids_in_range.points[did].dataset = C.DATASET_NAME_BY_DID[did]
      }
    }

    res.json(dids_in_range)

});
//
//

//
// router.get('/geo_by_meta_values', helpers.isLoggedIn, (req, res) => {
//     // var phyla = []
// //     var ranks_without_domain = C.RANKS.slice(1,-2)  // remove domain (too numerous), species and strain
// //     var qSelect = "select phylum from phylum order by phylum"
//        console.log('in search/geo_by_meta_values');
//        var if_in = C.REQ_METADATA_FIELDS_wIDs
//        var temp =[]
//        for(i in C.AllMetadataNames){
//         
//         if(C.REQ_METADATA_FIELDS_wIDs.indexOf(C.AllMetadataNames[i].slice(0,-3)) == -1){
//             temp.push(C.AllMetadataNames[i])
//         }else{
//             temp.push(C.AllMetadataNames[i].slice(0,-3))
//             console.log(C.AllMetadataNames[i].slice(0,-3))
//         }
//        }
//        
//         XX = get_metadata_values()
//         res.render('search/geo_by_meta_values', { title: 'VAMPS:Search',
//             user  :  req.user,hostname: req.CONFIG.hostname,
//             metadata_items:       JSON.stringify(XX.metadata_fields),
//             mkeys:                XX.metadata_fields_array,
//             md    :  JSON.stringify(temp),
//         });
//     
// });
//
//
//
// router.post('/all_md_vals_by_name', helpers.isLoggedIn, (req, res) => {
// 	console.log('in search/all_md_vals_by_name');
// 	// Find Geographic Range of Datasets by Metadata Values (not ready yet)
//     console.log('req.body-->>');
//     console.log(req.body);
//     console.log(C.PROJECT_INFORMATION_BY_PID[44]);  // SPO
//     console.log(C.MD_CUSTOM_UNITS[44]);
//     console.log(C.AllMetadata[44]);
//     console.log('<<--req.body');
//     var search_name = req.body.name
//     if(search_name == 'domain'){
//         
//     }
//     
//     
// });


router.post('/accept_latlon_datasets', helpers.isLoggedIn, (req, res) => {
  console.log('in accept_latlon_datasets');
  console.log('req.body-->>');
  console.log(req.body);
  console.log('<<--req.body');
});
//
//
//
router.get('/taxonomy', helpers.isLoggedIn, (req, res) => {

    res.render('search/taxonomy', { title: 'VAMPS:Search',
        user:                 req.user,hostname: req.CONFIG.hostname,
    });
});
//
//
//
router.get('/metadata/:type', helpers.isLoggedIn, (req, res) => {

      console.log('in by '+req.params.type);
      let XX = get_metadata_values();
      let metadata_items = helpers.clean_escape(JSON.stringify(XX.metadata_fields));

      //console.log(JSON.stringify(metadata_fields))
      res.render('search/metadata', { title: 'VAMPS:Search',
        metadata_items:       metadata_items,
        metadata_search_type: req.params.type,
        mkeys:                XX.metadata_fields_array,
        user:                 req.user,
        hostname: req.CONFIG.hostname,
      });
})

function get_metadata_values(){
     let MD_items = new Object()
     let tmp_metadata_fields = {};
     MD_items.metadata_fields_array = []
     MD_items.metadata_fields       = {}
      
     for (var did in C.AllMetadata){
        for (let name in C.AllMetadata[did]){
            val = C.AllMetadata[did][name];
            if(name in tmp_metadata_fields){
              tmp_metadata_fields[name].push(val);
            }else{
              if(helpers.IsNumeric(val)){
                tmp_metadata_fields[name]=[];
              }else{
                tmp_metadata_fields[name]=['non-numeric'];
              }
              tmp_metadata_fields[name].push(val);
            }
        }
     }
      
     for (let tmp_name in tmp_metadata_fields){
        MD_items.metadata_fields_array.push(tmp_name);
        if(tmp_metadata_fields[tmp_name][0] == 'non-numeric'){
          tmp_metadata_fields[tmp_name].shift(); //.filter(onlyUnique);
          MD_items.metadata_fields[tmp_name] = tmp_metadata_fields[tmp_name].filter(helpers.onlyUnique);
        }else{
          var min = Math.min.apply(null, tmp_metadata_fields[tmp_name]);
          var max = Math.max.apply(null, tmp_metadata_fields[tmp_name]);
          MD_items.metadata_fields[tmp_name] = {"min":min,"max":max};
        }
     }
     MD_items.metadata_fields_array.sort( (a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
     });
      
     return MD_items;
}
//
//  TAXONOMY SEARCH
//
router.post('/taxonomy_search_for_datasets', helpers.isLoggedIn, (req, res) => {
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
		rank = C.RANKS[n];
		qSelect += ' JOIN `'+rank+ '` using ('+rank+'_id)\n';
		add_where += '`'+rank+"`='"+tax_items[n]+"' and " ;
	}
	qSelect = qSelect + add_where.substring(0, add_where.length - 5);
	console.log(qSelect);
	var query = connection.query(qSelect, (err, rows, fields) => {
    if (err) {
        req.flash('fail', 'SQL Error: '+err);
        res.redirect('search_index#taxonomy');
    } else {
      var datasets = {};
      datasets.ids = [];
      datasets.names = [];
      for(var n in rows){
        did = rows[n]['did'];
        try{
          pid = C.PROJECT_ID_BY_DID[did];
          pname = C.PROJECT_INFORMATION_BY_PID[pid].project;
          datasets.ids.push(did);
          datasets.names.push(pname+'--'+ C.DATASET_NAME_BY_DID[did]);
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
router.post('/metadata_search_result', helpers.isLoggedIn, (req, res) => {
  console.log('IN POST::metadata_search_result');
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
      if (allowed.includes(search)){
        if ( !(search in searches)){
          searches[search] = {};
        }
        searches[search][items[1]] = req.body[name];
      }
    }
  }


  var ds1, ds2, ds3 = [];
  var result = get_search_datasets(req.user, searches.search1);
  
  ds1 = result.datasets;
  searches.search1.datasets = result.datasets;
  searches.search1.dataset_count = searches.search1.datasets.length;
  searches.search1.ds_plus = get_dataset_search_info(result.datasets, searches.search1);
  
  if('search2' in searches){

    result = get_search_datasets(req.user, searches.search2);
    ds2 = result.datasets;
    searches.search2.datasets = result.datasets;
    searches.search2.dataset_count = searches.search2.datasets.length;

    searches.search2.ds_plus = get_dataset_search_info(result.datasets, searches.search2);

  }else{

    searches.search2 = {}
    searches.search2.datasets = []
    searches.search2.ds_plus = []

  }

  if('search3' in searches){

    result = get_search_datasets(req.user, searches.search3);
    ds3 = result.datasets;
    searches.search3.datasets = result.datasets;
    searches.search3.dataset_count = searches.search3.datasets.length;

    searches.search3.ds_plus = get_dataset_search_info(result.datasets, searches.search3);
  }else{

    searches.search3 = {}
    searches.search3.datasets = []
    searches.search3.ds_plus = []

  }
  //
  // Calculate (sum or intersect) final datasets
  //


  //
  //
//   console.log(searches)
//   if(filtered.datasets.length === 0){
//   	console.log('redirecting back -- no data found');
// 	  req.flash('fail', 'No Data Found');
// 	  res.redirect('search_index');
//     return;
//   }else{
          res.render('search/search_result_metadata', {
                    title    : 'VAMPS: Search Datasets',
                    //filtered : JSON.stringify(filtered),
                    searches : JSON.stringify(searches),
                    //join_type: join_type,
                    user     : req.user,hostname: req.CONFIG.hostname,
          });  //
//   }

});
//
//  SEARCH DATASETS
//
router.get('/gethint/:hint', helpers.isLoggedIn, (req, res) => {
	//console.log('in gethint');
	//console.log(req.params.hint);
	var q = req.params.hint;
	var hint = '';
	if (q !== "") {
	    q = q.toLowerCase();
	    len=q.length;
		for(var n in C.AllMetadataNames){
			var name = C.AllMetadataNames[n];

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
	//console.log('result= '+result);
	res.send(result);

});
//
//  LIVESEARCH TAX
//
router.get('/livesearch_taxonomy/:q', helpers.isLoggedIn, (req, res) => {
	console.log('search:in livesearch taxonomy1');
	var q = req.params.q.toLowerCase();
	var hint = '';
	var obj = C.new_taxonomy.taxa_tree_dict_map_by_rank;
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
router.get('/livesearch_user/:q', helpers.isLoggedIn, (req, res) => {

  console.log('search:in livesearch user');
  var q = req.params.q.toLowerCase();
  var hint = '';
  var obj = C.ALL_USERS_BY_UID;
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
router.get('/livesearch_project/:q', helpers.isLoggedIn, (req, res) => {
  console.log('search:in livesearch project');
  var q = req.params.q.toLowerCase();
  var hint = 'Projects:<br>';
  var plist = []
  var p_obj = {}
  var dlist = []
  var d_obj = {}
  if(q !== ''){

      C.ALL_DATASETS.projects.forEach( prj => {

      pid = prj.pid

      pname = prj.name;
      ptitle = C.PROJECT_INFORMATION_BY_PID[pid].title;
      pdesc  = C.PROJECT_INFORMATION_BY_PID[pid].description;
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

      datasets.forEach( dset => {
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
router.get('/livesearch_taxonomy/:rank/:taxon', helpers.isLoggedIn, (req, res) => {
	console.log('search:in livesearch_taxonomy2');
	var selected_taxon = req.params.taxon;
	var selected_rank = req.params.rank;
    var rank_number = C.RANKS.indexOf(selected_rank);
	var this_item = C.new_taxonomy.taxa_tree_dict_map_by_name_n_rank[selected_taxon+'_'+selected_rank];
	var tax_str = selected_taxon;
	var item = this_item;

  // goes up the tree to get taxon parents:
  while(item.parent_id !== 0){
		item  = C.new_taxonomy.taxa_tree_dict_map_by_id[item.parent_id];
		tax_str = item.taxon +';'+tax_str;
		//console.log(item);
	}


  this_item.full_string = tax_str;
  //console.log('sending tax_str',this_item);
  res.json(this_item);

});




// }
//
//  BLAST
//
router.post('/blast_search_result', helpers.isLoggedIn, (req, res) => {
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
    var patt = /[^ATCGUKSYMWRBDHVN]/i   //contains anything other than 'A','T','C' or 'G'
    if( patt.test(req.body.query) ){
        req.flash('fail', 'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes');
        res.redirect('/search/blast');
        return;
    }
    var db_collector = []
    var db_collector_short = []
    for(n in C.blast_dbs){
        if(C.blast_dbs[n] in req.body){
            var db_path = path.join(req.CONFIG.PATH_TO_BLAST_DBS, C.blast_dbs[n], C.blast_dbs[n])
            db_collector.push(db_path)
            db_collector_short.push(C.blast_dbs[n])
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
    var out_file_path = path.join(req.CONFIG.TMP_FILES,out_file);
    var query_file = timestamp+"_blast_query.fa";
    var query_file_path = path.join(req.CONFIG.TMP_FILES,query_file);
    // then run 'blastn' command
    // blastn -db <dbname> -query <query_file> -outfmt 13 -out <outfile_name>
    
    const exec = require('child_process').exec;
    var blast_cmd = req.CONFIG.PATH_TO_BLAST+"/blastn"
    var dbs_string = '"'+db_collector.join(' ')+'"'
    //var echo_cmd = "\""+"echo -e TTTAGAGGGGTTTTGCGCAGCTAACGCG|"
    // Ev9:  ACACGACGACAACCTGAAAGGGAT
    var task = 'blastn'
    if(req.body.query.length >200){
        task = 'megablast'
    }
    if(req.body.query.length < 50){
        task = 'blastn-short'
    }
    fs.writeFile(query_file_path,req.body.query+"\n", err => {
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
                const obj = require(out_file_path);
    
                res.render('search/search_result_blast', {
                        title    : 'VAMPS: BLAST Result',
                        data     : JSON.stringify(obj),
                        show     : 'blast_result',
                        dbs      : JSON.stringify(db_collector_short),
                        query    : req.body.query,
                        user     : req.user,hostname: req.CONFIG.hostname,
                });
            });
        
    }
    });


});
//
//
//

//
//
//
router.get('/seqs_hit/:seqid/:ds', helpers.isLoggedIn, (req, res) => {
  console.log('in /seqs_hit/:seqid/:ds');
  console.log(req.params);
  var seqid = req.params.seqid;
  var ds    = req.params.ds;

 //  q_tax = "SELECT domain,phylum,klass,`order`,family,genus";
//   q_tax += " from silva_taxonomy_info_per_seq";
//   q_tax += " JOIN silva_taxonomy using (silva_taxonomy_id)";
//   q_tax += " JOIN domain using (domain_id)";
//   q_tax += " JOIN phylum using (phylum_id)";
//   q_tax += " JOIN klass using (klass_id)";
//   q_tax += " JOIN `order` using (order_id)";
//   q_tax += " JOIN family using (family_id)";
//   q_tax += " JOIN genus using (genus_id)";
//   q_tax += " WHERE sequence_id='"+seqid+"'";
    var q = "SELECT project_id, project, dataset, UNCOMPRESS(sequence_comp) as seq, seq_count, public from sequence_pdr_info"
    q += " JOIN dataset using(dataset_id)"
    q += " JOIN sequence using(sequence_id)"
    q += " JOIN project using(project_id)"
    q += " WHERE sequence_id='"+seqid+"'"
    q += " AND seq_count > 0"
  
  console.log(q);
  connection.query(q, (err, rows, fields) => {
    if(err){
      console.log(err);
    }else{
      var obj = {};

      for(var i in rows){
        p = rows[i].project
        d = rows[i].dataset
        pjds = p+'--'+d
        cnt = rows[i].seq_count;
        pub = rows[i].public;
        seq = rows[i].seq
        pid = rows[i].project_id
               
        if(!obj.hasOwnProperty('pjds')){
          obj[pjds] = {};          
        }
        obj[pjds]['count'] = cnt;
        obj[pjds]['public'] = pub;
        obj[pjds]['pid'] = pid;

      }
      //console.log(obj);
      //console.log(JSON.stringify(obj));
      // AAGTCTTGACATCCCGATGAAAGATCCTTAACCAGATTCCCTCTTCGGAGCATTGGAGAC
      res.render('search/search_result_blast_seq', {
                    title    : 'VAMPS: BLAST Result',        
                    seqid    : seqid,
                    seq      : seq.toString(),
                    obj      : JSON.stringify(obj),
                    user     : req.user,hostname: req.CONFIG.hostname,
                });  //
      }
  });

});

router.get('/make_a_blast_db', helpers.isLoggedIn, (req, res) => {
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
    var datasets1 = [];
    //var tmp_metadata = {};
   //console.log(C.AllMetadata)

    for (var did in C.AllMetadata){
      // search only if did allowed by permissions
      var pid = C.PROJECT_ID_BY_DID[did];

      try{

          if(user.security_level <= 10 || C.PROJECT_INFORMATION_BY_PID[pid].permissions.length === 0 || C.PROJECT_INFORMATION_BY_PID[pid].permissions.indexOf(user.user_id) !=-1 ){
            for (var mdname in C.AllMetadata[did]){
              if(mdname === search['metadata-item']){
                mdvalue = C.AllMetadata[did][mdname];
                get_search_datasets_did(datasets1, search, did, mdname, mdvalue)
                //console.log('res')
                //console.log(res)
                //datasets1.append(get_search_datasets_did(datasets1, search, did, mdname, mdvalue))
              }
            }
          }
        }
        catch(e){
            console.log('skipping pid,did',pid,did,e)
        }
    }

    console.log('ds',datasets1)

    return {datasets:datasets1}//, mdv:tmp_metadata};
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
        var dname = C.DATASET_NAME_BY_DID[did];
        var pid = C.PROJECT_ID_BY_DID[did];
        var pname = C.PROJECT_INFORMATION_BY_PID[pid].project;
        //var ds_req = did+'--'+pname+'--'+dname;
        if(search == {}){
          ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname });
        }else{
          ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname, value: C.AllMetadata[did][search["metadata-item"]] });
        }
      }
      return ds_plus;
  }

 
  module.exports = router;
