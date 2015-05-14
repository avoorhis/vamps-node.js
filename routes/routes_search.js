var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');

/* GET Search page. */
router.get('/index_search', helpers.isLoggedIn, function(req, res) {
    
    var tmp_metadata_fields = {};
    var metadata_fields = {};
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
    res.render('search/index_search', { title: 'VAMPS:Search',
                          	metadata_items: JSON.stringify(metadata_fields),
							message: req.flash('nodataMessage'),
    						user: req.user
    											});
});
//
//  SEARCH DATASETS
//
router.post('/search_result', helpers.isLoggedIn, function(req, res) {
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
  //console.log(ALLMetadata);
  // This assumes that ALL datasets are in ALLMetadata. 
  //var datasets = [];
   // use for posting to unit_selection
  //
  //

  //
  var ds1, ds2, ds3 = [];
  var result = get_search_datasets(req.user, searches.search1, ALLMetadata);
  ds1 = result.datasets;
  searches.search1.datasets = result.datasets;
  searches.search1.dataset_count = searches.search1.datasets.length;
  searches.search1.ds_plus = get_dataset_search_info(result.datasets, searches.search1);

  var md_hash =  ALLMetadata;

  if('search2' in searches){
    //if(join_type == 'intersect'){
    //  var md_hash = result.mdv
    //}else{  // summation
    // var md_hash =  ALLMetadata;
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
      // var md_hash =  ALLMetadata;
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
	req.flash('nodataMessage', 'No Data Found');
	res.redirect('search_datasets'); 
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
                  tmp_metadata[did]={};
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
                  tmp_metadata[did]={};
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
                  tmp_metadata[did]={};
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
                  tmp_metadata[did]={};
                  tmp_metadata[did] = metadata[did];
                }
              }
            }else if('comparison' in search && search['comparison'] === 'between_range'){
              min_search_value = Number(search['min-comparison-value']);
              max_search_value = Number(search['max-comparison-value']);
              if(Number(mdvalue) > min_search_value && Number(mdvalue) < max_search_value){
                console.log('outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
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

            }else if('comparison' in search && search['comparison'] === 'outside_range'){
              min_search_value = Number(search['min-comparison-value']);
              max_search_value = Number(search['max-comparison-value']);
              if(Number(mdvalue) < min_search_value || Number(mdvalue) > max_search_value){
                console.log('outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
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
          ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname, value:ALLMetadata[did][search["metadata-item"]] });
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