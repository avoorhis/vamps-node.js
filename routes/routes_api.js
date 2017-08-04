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
    project = req.body.project
    
    if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
      pid = PROJECT_INFORMATION_BY_PNAME[project].pid
      dids = DATASET_IDS_BY_PID[pid]
      var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
      if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
        console.log('No Datasets Found')
        res.send(JSON.stringify('No Datasets Found - (do you have permissions to access this data?)'))
      }else{
          console.log(new_dataset_ids)
          res.send(JSON.stringify(new_dataset_ids))
      }
    }else{
      res.send(JSON.stringify('Project Not Found'))
    }
});
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
    project = req.body.project
    
    if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
      pid = PROJECT_INFORMATION_BY_PNAME[project].pid
      dids = DATASET_IDS_BY_PID[pid]
      var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
      if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
        console.log('No Datasets Found')
        res.send(JSON.stringify('No Datasets Found - (do you have permissions to access this data?)'))
      }else{
          mdobj = helpers.get_metadata_obj_from_dids(new_dataset_ids)
          
          res.send(JSON.stringify(mdobj))
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
    project = req.body.project
    
    if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
      pid = PROJECT_INFORMATION_BY_PNAME[project].pid
      dids = DATASET_IDS_BY_PID[pid]
      var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
      if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
        console.log('No Datasets Found')
        res.send(JSON.stringify('No Datasets Found - (do you have permissions to access this data?)'))
      }else{
          pjobj = PROJECT_INFORMATION_BY_PNAME[project]
          pjobj.env_package = MD_ENV_PACKAGE[pjobj.env_package_id]          
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
router.post('/create_image',  function(req, res){
  console.log('in API/create_image')
  if( ! req.isAuthenticated() ){
        res.send(JSON.stringify('Failed Authentication -- Please login first'))
        return
  }
  console.log(req.body)
  
  allowed_images = ["dheatmap", "piecharts", "barcharts", "counts_matrix","metadata_csv",
                "metadata_table", "fheatmap", "dendrogram01", "dendrogram03","dendrogram",
                "pcoa", "pcoa3d", "geospatial", "adiversity", "testpie", "phyloseq"
              ]
  allowed_file_types = ["fasta", "metadata-csv", "metadata-table"]
  image = false
  file  = false
  
  //metadata = get_metadata(JSON.parse(req.body.ds_order))
  
  if(req.body.hasOwnProperty('image') && allowed_images.indexOf(req.body.image) != -1){
    image = req.body.image
    console.log("Success: Image =",image)
  }else if(req.body.hasOwnProperty('file') && allowed_file_types.indexOf(req.body.file) != -1){
    file = req.body.file
    console.log("Success: File =",file)
  }else{
    console.log("Error -- Could not find Image or File")
    res.sendJSON.stringify(("Error -- Could not find Image or File"))
    return
  }
  if(image){
      switch(image) {
        case 'dheatmap':            // Distance Heatmap
          IMAGES.dheatmap(req, res)
          break;
        case 'fheatmap':            // Frequency Heatmap
          IMAGES.fheatmap(req, res)
          break;
        case 'barcharts':
          IMAGES.barcharts(req, res)
          break;
        case 'piecharts':
          IMAGES.piecharts(req, res)
          break;
        case 'counts_matrix':
          IMAGES.counts_matrix(req, res)       
          break;
        case 'metadata_csv':
          IMAGES.metadata_csv(req, res)       
          break;
        case 'adiversity':          // Alpha Diversity
          IMAGES.adiversity(req, res)       
          break;
        case 'dendrogram':
          IMAGES.dendrogram(req, res)       
          break;
        case 'phyloseq':
          IMAGES.phyloseq(req, res)       
          break;
        default:
          test_piecharts(req,res)
          console.log(image,'- Not Implemented Yet!')
      }
  }
 

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
    var availible_projects = []
    // all pid list == 
    var all_pids = Object.keys(PROJECT_INFORMATION_BY_PID)
    var new_pid_list = helpers.screen_pids_for_permissions(req, all_pids)
    for(n in new_pid_list){
        pname = PROJECT_INFORMATION_BY_PID[new_pid_list[n]].project
        if(str == ''){
            availible_projects.push(pname)
        }else if((pname.toUpperCase()).indexOf(str) !== -1){
            availible_projects.push(pname)
        }
    }

    res.send(JSON.stringify(availible_projects))

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
        res.send(JSON.stringify('You must include four data items: nw_lat, nw_lon, se_lat, se_lon. All in decimal degrees.'))
        return
    }
    var nw_lat = parseInt(req.body.nw_lat) || 0  // if empty string convert to zero
    var nw_lon = parseInt(req.body.nw_lon) || 0
    var se_lat = parseInt(req.body.se_lat) || 0
    var se_lon = parseInt(req.body.se_lon) || 0
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
    
    if(nw_lat < -90 || nw_lat > 90 || se_lat < -90 || se_lat > 90){
        res.send(JSON.stringify('Latitude must be between -90 and 90'))
        return    
    }
    if(nw_lon < -180 || nw_lon > 180 || se_lon < -180 || se_lon > 180){
        res.send(JSON.stringify('Longitude must be between -180 and 180'))
        return    
    }
    var dids = []
    var project_list = {}
    console.log(DatasetsWithLatLong)
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
    var new_did_list =  helpers.screen_dids_for_permissions(req, dids)
    for(n in new_did_list){
        console.log('did',new_did_list[n])
        console.log('PROJECT_ID_BY_DID[new_did_list[n]]',PROJECT_ID_BY_DID[new_did_list[n]])
        console.log('PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[new_did_list[n]]]',PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[new_did_list[n]]])
        project_list[PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[new_did_list[n]]].project] = 1
    
    }
    res.send(JSON.stringify(Object.keys(project_list)))
});
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

//
//
//
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
  console.log('1')
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
      console.log('inwin ')
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
      console.log('inwin2 ',window.d3.select('.container').html())
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
