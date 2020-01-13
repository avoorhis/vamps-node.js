var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var path = require('path');
var fs   = require('fs-extra');
var IMAGES  = require('./routes_images');
//
// API LOGIN
//  {'username':conn['user'], 'password':conn['passwd']}
//  https://vamps2.mbl.edu/users/login
//   Once logged in you can access the functions below
//   <<add link here to github jupyter notebook>>
//

router.post('/logmein', function(req, res){
    console.log('in log-me-in')
    console.log(req.body)
    res.redirect(307, '/users/login')
});
router.post('/validate_login', function(req, res){
    console.log('in validate_login')
    if(req.isAuthenticated()){
        res.send('Login Success')
    }else{
        res.send('Failed Authentication')
    }
});
//
// API: GET DIDS FROM PROJECT NAME
//          Must be logged in through API!
//      'project': Gets dataset IDs from the projects that the user has permissions to access.
//
router.post('/get_dids_from_project', function(req, res){
    console.log('HERE in routes_api.js --> get_dids_from_project ')
    if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'))
        return
    }
    console.log(req.body)
    var return_type;
    var dids;
    if(req.body.hasOwnProperty("ds_order") ){  // takes precedence
        var dids = req.body.ds_order
    }else if(req.body.hasOwnProperty("project")){
        var project = req.body.project
        if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
            var pid = PROJECT_INFORMATION_BY_PNAME[project].pid
            var dids = DATASET_IDS_BY_PID[pid]
        }else{
            res.send(JSON.stringify('Project Not Found'))
            return
        }
    }else{
        res.send(JSON.stringify('Project Not Found'))
        return
    }
    
    if(req.body.hasOwnProperty("return_type") ){
        if(["json_list","did_list",'text_list'].indexOf(req.body.return_type) == -1){
            return_type = "did_list"
        }else{
            return_type = req.body.return_type
        }
    }else{
        return_type = "did_list"
    }
    
    var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
    
    if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
        console.log('No Datasets Found')
        res.send(JSON.stringify('No Datasets Found - (do you have the correct access permissions?)'))
        return
    }else{
          //console.log(new_dataset_ids)
          if(return_type == 'text_list'){
            var txt = ''
            for(n in new_dataset_ids){
                did = new_dataset_ids[n]
                dataset_name = DATASET_NAME_BY_DID[did]
                project = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[did]].project
                
                txt += project +','+ dataset_name +','+ALL_DCOUNTS_BY_DID[did].toString()+"\n"              
            }
            res.send(JSON.stringify(txt))
          }else if(return_type == 'json_list'){
            var json_list = []
            for(n in new_dataset_ids){
                var obj = {}
                obj.dataset_id = new_dataset_ids[n]
                obj.dataset_name = DATASET_NAME_BY_DID[obj.dataset_id]
                obj.project = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[obj.dataset_id]].project               
                obj.project_id = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[obj.dataset_id]].pid
                obj.seq_count    = ALL_DCOUNTS_BY_DID[obj.dataset_id]
                json_list.push(obj)
            }
            res.send(JSON.stringify(json_list))
          }else{  // this is default: returns the did_list
            res.send(JSON.stringify(new_dataset_ids))
          }
    }
   //  }else{
//       res.send(JSON.stringify('Project Not Found'))
//     }
});
//
// API: GET DATASETS and COUNTS from PROJECT NAME
//          Must be logged in through API!
//      'project': Gets dataset IDs from the projects that the user has permissions to access.
//
// router.post('/get_datasets_and_counts', function(req, res){
//     console.log('HERE in routes_api.js --> get_datasets_and_counts ')
//     if( ! req.isAuthenticated() ){
//         res.send(JSON.stringify('Failed Authentication -- Please login first'))
//         return
//     }
//     console.log(req.body)
//     var project = req.body.project
//     
//     if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
//       var pid = PROJECT_INFORMATION_BY_PNAME[project].pid
//       var dids = DATASET_IDS_BY_PID[pid]
//       var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
//       if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
//         console.log('No Datasets Found')
//         res.send(JSON.stringify('No Datasets Found - (do you have the correct access permissions?)'))
//         return;
//       }else{
//           //console.log(new_dataset_ids)
//           outfile_name = ts+'_counts.txt'
//           
//           outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
//           var txt = ''
//           for(n in new_dataset_ids){
//             did = new_dataset_ids[n]
//             dname = DATASET_NAME_BY_DID[did]
//             tot_dcount = ALL_DCOUNTS_BY_DID[did]
//             console.log('dataset= '+dname+' (count='+tot_dcount.toString()+')')
//             txt += dname+' = '+tot_dcount.toString()+"\n"
//             console.log('txt-'+txt)
//             
//           }
//     
//           result = save_file(txt, outfile_path) // this saved file should now be downloadable from jupyter notebook
//           console.log(result)
//           res.send(JSON.stringify({'filename':outfile_name}))
//           
//           
//           
//       }
//     }else{
//       res.send(JSON.stringify('Project Not Found'))
//     }
// });
//
// API: GET METADATA FROM PROJECT NAME
//
router.post('/get_metadata_from_project', function(req, res){
    console.log('HERE in routes_api.js --> get_metadata_from_project ')
    if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'))
        return
    }
    //console.log(req.body)
    var project = req.body.project
    // if((req.body).hasOwnProperty(return_type) && ['csv','json'].indexOf(req.body.return_type) != -1){
//         var rtype = req.body.return_type
//     }else{
//         var rtype = 'csv'
//     }
    if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
      var pid = PROJECT_INFORMATION_BY_PNAME[project].pid
      var dids = DATASET_IDS_BY_PID[pid]
      var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
      if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
        console.log('No Datasets Found')
        res.send(JSON.stringify('No Datasets Found - (do you have permissions to access this data?)'))
      }else{
          mdobj = helpers.get_metadata_obj_from_dids(new_dataset_ids)          
          var item_obj = {}
          for(did in mdobj){
            var ds = DATASET_NAME_BY_DID[did]
            //console.log(ds)            
            item_obj[ds] = mdobj[did]
          }
          console.log('Success: found '+item_obj.length.toString()+' datasests' )
          res.send(JSON.stringify(item_obj))
          
      }
    }else{
      res.send(JSON.stringify('Project Not Found'))
    }
});
//
// API: GET PROJECT INFORMATION
//
router.post('/get_project_information', function(req, res){
    console.log('HERE in routes_api.js --> get_project_information ')
    if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'))
        return
    }
    //console.log(req.body)
    var project = req.body.project
    
    if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
      var pid = PROJECT_INFORMATION_BY_PNAME[project].pid
      var dids = DATASET_IDS_BY_PID[pid]
      var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
      if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
        console.log('No Datasets Found')
        res.send(JSON.stringify('No Datasets Found - (do you have permissions to access this data?)'))
      }else{
          pjobj = PROJECT_INFORMATION_BY_PNAME[project]
          pjobj.env_package = MD_ENV_PACKAGE[pjobj.env_package_id]  
          pjobj.owner = ALL_USERS_BY_UID[pjobj.oid]        
          res.send(JSON.stringify(pjobj))
      }
    }else{
      res.send(JSON.stringify('Project Not Found'))
    }
});
//
// API ERROR
//
router.post('/', helpers.isLoggedIn, function(req, res){
    console.log('ERROR in router.post(/')
    res.send(JSON.stringify('Function not found'))
})
router.get('/', helpers.isLoggedIn, function(req, res){
    console.log('ERROR in router.get(/')
    res.send(('Function not found'))
})
//
// API: CREATE IMAGE
//
// test: view selection heatmap
// TODO: JSHint: This function's cyclomatic complexity is too high. (15)(W074)
router.post('/create_image',  function(req, res){
  console.log('in API/create_image');
  console.time("TIME: API/create_image");
  if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'));
        return;
  }
  console.log(req.body);
  
  let allowed_images = ["dheatmap", "piecharts", "barcharts", "counts_matrix","metadata_csv",
                "metadata_table", "fheatmap", "dendrogram01", "dendrogram03","dendrogram",
                "pcoa", "pcoa3d", "geospatial", "adiversity", "testpie", "phyloseq",
                "taxon_color_legend"
              ];
  let allowed_file_types = ["fasta", "metadata-csv", "metadata-table"];
  let image = false;
  let file  = false;
  
  //metadata = get_metadata(JSON.parse(req.body.ds_order))
  if (req.body.hasOwnProperty('image') && allowed_images.includes(req.body.image)){
    image = req.body.image;
    console.log("Success: Image = ", image);
  }
  else if(req.body.hasOwnProperty('file') && allowed_file_types.includes(req.body.file)){
    file = req.body.file;
    console.log("Success: File = ", file);
  }
  else {
    console.log("Error -- Could not find Image or File");
    res.sendJSON.stringify(("Error -- Could not find Image or File"));
    return;
  }
  
  console.time("TIME: if(image)");
  if(image){
      switch(image) {
        case 'dheatmap':            // Distance Heatmap
          IMAGES.dheatmap(req, res);
          break;
        case 'fheatmap':            // Frequency Heatmap
          IMAGES.fheatmap(req, res);
          break;
        case 'barcharts':
          IMAGES.barcharts(req, res);
          break;
        case 'piecharts':
          IMAGES.piecharts(req, res);
          break;
        case 'counts_matrix':
          IMAGES.counts_matrix(req, res);
          break;
        case 'metadata_csv':
          IMAGES.metadata_csv(req, res);
          break;
        case 'adiversity':          // Alpha Diversity
          IMAGES.adiversity(req, res);
          break;
        case 'dendrogram':
          IMAGES.dendrogram(req, res);
          break;
        case 'phyloseq':
          IMAGES.phyloseq(req, res);
          break;
        case 'taxon_color_legend':
          IMAGES.taxon_color_legend(req, res);
          break;
        default:
          test_piecharts(req,res);
          console.log(image, '- Not Implemented Yet!');
      }
  }
  console.timeEnd("TIME: if(image)");

  console.timeEnd("TIME: API/create_image");

});
//
//  API: FIND USER PROJECTS
//          Must be logged in through API!
//      'search_string': Enter a string to find projects containing that string,
//                       Or enter an empty string to get all projects that the user
//                       has permissions to access.
//       'include_info': If present the project information will be included for each project                   
//
router.post('/find_user_projects',  function(req, res){
    console.log('in find_user_projects')
    if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'))
        return
    }
    console.log(req.body)
    if(req.body.hasOwnProperty('search_string')){
        str = (req.body.search_string).toUpperCase()
    }else{
        // get all projects (a potentially long list)
        str = ''
    }
    var availible_projects = {}
    // all pid list == 
    //console.log(PROJECT_INFORMATION_BY_PID)
    var all_pids = Object.keys(PROJECT_INFORMATION_BY_PID)
    var new_pid_list = helpers.screen_pids_for_permissions(req, all_pids)
    for(n in new_pid_list){
        pname = PROJECT_INFORMATION_BY_PID[new_pid_list[n]].project
        title = PROJECT_INFORMATION_BY_PID[new_pid_list[n]].title
        desc = PROJECT_INFORMATION_BY_PID[new_pid_list[n]].description
        if(str == ''){
            availible_projects[pname] = PROJECT_INFORMATION_BY_PID[new_pid_list[n]]
        }else{
            if((pname.toUpperCase()).indexOf(str) !== -1){
                availible_projects[pname] = PROJECT_INFORMATION_BY_PID[new_pid_list[n]]
            }
            if((title.toUpperCase()).indexOf(str) !== -1){
                availible_projects[pname] = PROJECT_INFORMATION_BY_PID[new_pid_list[n]]
            }
            if((desc.toUpperCase()).indexOf(str) !== -1){
                availible_projects[pname] = PROJECT_INFORMATION_BY_PID[new_pid_list[n]]
            }
        }
    }
    if(req.body.hasOwnProperty('include_info')){
        res.send(JSON.stringify(availible_projects))
    }else{
        res.send(JSON.stringify(Object.keys(availible_projects)))
    }

});
//
//  API: FIND PROJECTS in GEOGRAPHIC AREA
//          Must be logged in through API!
//      'nw_lat': REQ:: Decimal latitude    range: -90 <-> 90
//      'nw_lon': REQ:: Decimal longitude   range -180 <-> 180
//      'se_lat': REQ: Decimal latitude     range: -90 <-> 90
//      'se_lon': REQ: Decimal longitude    range -180 <-> 180
//     ie:   {'nw_lat':'','nw_lon':'','se_lat':'','se_lon':''}
//       'include_info': If present the project information will be included for each project                   
//
router.post('/find_projects_in_geo_area',  function(req, res){
    console.log('in find_projects_in_geo_area')
    if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'))
        return
    }
    console.log(req.body)
    // validation
    if(! req.body.hasOwnProperty('nw_lat') || ! req.body.hasOwnProperty('nw_lon') || ! req.body.hasOwnProperty('se_lat') || ! req.body.hasOwnProperty('se_lon')){
        res.send(JSON.stringify('You must include two geo map points specified by these four data items: nw_lat, nw_lon, se_lat and se_lon. All in decimal degrees.'))
        return
    }
    var nw_lat = parseFloat(req.body.nw_lat) || 0.0  // if empty string convert to zero
    var nw_lon = parseFloat(req.body.nw_lon) || 0.0
    var se_lat = parseFloat(req.body.se_lat) || 0.0
    var se_lon = parseFloat(req.body.se_lon) || 0.0
    var tmp
    if(nw_lat < se_lat){
        tmp = nw_lat
        nw_lat = se_lat
        se_lat = tmp
    }
    if(nw_lon > se_lon){
        tmp = nw_lon
        nw_lon = se_lon
        se_lon = tmp
    }
    
    if(nw_lat < -90.0 || nw_lat > 90.0 || se_lat < -90.0 || se_lat > 90.0){
        res.send(JSON.stringify('Latitude must be decimal between -90.0 and 90.0'))
        return    
    }
    if(nw_lon < -180.0 || nw_lon > 180.0 || se_lon < -180.0 || se_lon > 180.0){
        res.send(JSON.stringify('Longitude must be decimal between -180.0 and 180.0'))
        return    
    }
    var dids = []
    var project_list = {}
    //console.log(DatasetsWithLatLong)
    //console.log(parseInt(nw_lat),parseInt(nw_lon),parseInt(se_lat),parseInt(se_lon))
    console.log(nw_lat,nw_lon,se_lat,se_lon)
    for(did in DatasetsWithLatLong){
    // helpers.screen_dids_for_permissions(req, dids)
        if(DatasetsWithLatLong[did].latitude <= nw_lat
            &&  DatasetsWithLatLong[did].latitude >= se_lat
            &&  DatasetsWithLatLong[did].longitude >= nw_lon
            &&  DatasetsWithLatLong[did].longitude <= se_lon
        )
        {
            dids.push(did)
        }
    }
    //console.log('old dids',dids)
    var new_did_list =  helpers.screen_dids_for_permissions(req, dids)
    //console.log('new dids',new_did_list)
    for(n in new_did_list){
        var did = new_did_list[n]
        var pid = PROJECT_ID_BY_DID[did]
        //console.log('pid',pid)
        var pname = PROJECT_INFORMATION_BY_PID[pid].project
        //console.log('pname',pname)
        //console.log('pname2',DatasetsWithLatLong[did].latitude)
        
        project_list[pname] = {"latitude":DatasetsWithLatLong[did].latitude, "longitude":DatasetsWithLatLong[did].longitude}
    
    }
    //console.log('project_list')
    //console.log(JSON.stringify(project_list))
    //console.log('two')
    //res.send(JSON.stringify(Object.keys(project_list)))
    res.send(JSON.stringify(project_list))
    
});
//
//  API:: FIND PROJECTS BY METADATA STRING
//   Finds project/datasets that have a certain metadata item name
//   
//
router.post('/find_projects_by_metadata_str',  function(req, res){
    console.log('in find_projects_by_metadata_str')
    if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'))
        return
    }
    console.log(req.body)
    //console.log(AllMetadata)
    
    var str = req.body.substring
    var return_projects = {};
    var new_dids = {}
    for(pid in PROJECT_INFORMATION_BY_PID){
      
      var dids = DATASET_IDS_BY_PID[pid]
      //console.log('dids',dids)
      for(n in dids){
        var did = dids[n]
        var mdobj = AllMetadata[did]
        for(mditem in mdobj){
           console.log('mditem',mditem,str)
           if(mditem.includes(str)){
             console.log('    GOTONE',mditem)
             new_dids[did] = 1  // lookup
           }
        }
      } 
    }
    console.log(Object.keys(new_dids))
    var new_dataset_ids = helpers.screen_dids_for_permissions(req, Object.keys(new_dids))
    if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
         console.log('No Datasets Found')
         res.send(JSON.stringify('No Datasets Found - (do you have permissions to access this data?)'))
         return
    }else{
        for(n in new_dataset_ids){
            var pid = PROJECT_ID_BY_DID[new_dataset_ids[n]]
            var p = PROJECT_INFORMATION_BY_PID[pid].project
            return_projects[p] = 1
        }
    }
    console.log(return_projects)
    res.send(JSON.stringify(return_projects))
    
});
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


function test_piecharts(req, res){
  console.log('In function: api/barcharts')
  var d3 = require('d3');
  // see: https://bl.ocks.org/tomgp/c99a699587b5c5465228
  var jsdom = require('jsdom');
  var ts = visual_post_items.ts
  //if(!pieData) pieData = [12,31];
	//if(!outputLocation) outputLocation = 'test.svg';
  var chartWidth = 500
  var chartHeight = 500;
  //console.log('1')
  //console.log(d3.svg)
  var arc = d3.arc()
    .outerRadius(chartWidth/2 - 10)
    .innerRadius(0);
  var colours = ['#F00','#000','#000','#000','#000','#000','#000','#000','#000'];
  data = {"w":500, "h":500, "arc":arc, "c":colours}
  pieData = [12,31];
  jsdom.env({
    html:'',
    features:{ QuerySelector:true },
    done:function(errors, window){
      //console.log('inwin ')
      window.d3 = d3.select(window.document); //get d3 into the dom
      //  <svg><g transform="translate(250,250)"><path></path><path></path></g></svg>
      var svg = window.d3.select('body')
        .append('div').attr('class','container')
        .append('svg')
            .attr("xmlns", 'http://www.w3.org/2000/svg')
            .attr("width", chartWidth)
            .attr("height", chartHeight)
        .append('g')
          .attr('transform','translate(' + chartWidth/2 + ',' + chartWidth/2 + ')');

      svg.selectAll('.arc')
    	    		.data( d3.pie()(pieData) )
    	    			.enter()
    	    		.append('path')
    	    			.attr("class", "arc")
                .attr('d', arc)
                .attr('stroke', '#fff')
                .attr('fill', function(d,i){
                  return colours[i];
                })


      //fs.writeFileSync('test.svg', window.d3.select('.container').html()) //using sync to keep the code simple
      //console.log('inwin2 ',window.d3.select('.container').html())
      var html = window.d3.select('.container').html()
      var outfile_name = ts + '-barcharts-api.html'
      outfile_path = path.join('tmp', outfile_name);  // file name save to user_location
      console.log('outfile_path:',outfile_path)
      result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
      console.log(result)
      res.send(outfile_name)

    }
  })


}


module.exports = router;

function save_file(data, file_path){
    fs.writeFileSync(file_path, data)
    return 'Success'
}
