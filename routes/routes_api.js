var express = require('express');
var router = express.Router();
var helpers = require('./helpers/helpers');
var path = require('path');
var fs   = require('fs-extra');
var IMAGES  = require('./routes_images');

// API
router.post('/get_dids_from_project', function(req, res){
    console.log('HERE in routes_api.js --> get_dids_from_project ')
    console.log(req.body)
    project = req.body.project
    if(PROJECT_INFORMATION_BY_PNAME.hasOwnProperty(project)){
      pid = PROJECT_INFORMATION_BY_PNAME[project].pid
      dids = DATASET_IDS_BY_PID[pid]
      var new_dataset_ids = helpers.screen_dids_for_permissions(req, dids)
      if (new_dataset_ids === undefined || new_dataset_ids.length === 0){
        console.log('No Datasets Found')
        res.send('No Datasets Found - (do you have permissions to access this data?)')
      }else{
          console.log(new_dataset_ids)
          res.send(JSON.stringify(new_dataset_ids))
      }
    }else{
      res.send('Project Not Found')
    }

});
//
//
//
router.post('/', function(req, res){
  console.log('in API')
  console.log(req.body)
  allowed_images = ["dheatmap", "piecharts", "barcharts", "counts_matrix",
                "metadata_table", "fheatmap", "dendrogram01", "dendrogram03",
                "pcoa", "pcoa3d", "geospatial", "adiversity","testpie"
              ]
  allowed_file_types = ["fasta","metadata-csv","metadata-table"]
  image = false
  file  = false
  if(req.body.hasOwnProperty('image') && allowed_images.indexOf(req.body.image) != -1){
    image = req.body.image
    console.log("Success: Image =",image)
  }else if(req.body.hasOwnProperty('file') && allowed_file_types.indexOf(req.body.file) != -1){
    file = req.body.file
    console.log("Success: File =",file)
  }else{
    console.log("Error -- Could not find Image or File")
    res.send("Error -- Could not find Image or File")
    return
  }
  if(image){
      switch(image) {
        case 'dheatmap':
          IMAGES.dheatmap(req, res)
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
        default:
          test_piecharts(req,res)
          console.log(image,'- Not Implemented Yet!')
      }
  }
 //  if(file){
//     switch(image) {
//         case 'fasta':
//           
//           break;
//         case 'metadata-csv':
//           
//           break;
//         case 'metadata-table':
//           
//           break;
//         default:
//           
//           console.log(file,'- Not Implemented Yet!')
//       }
//   }

});







//
//
//



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
