// bar_charts.js
var path = require('path');
var fs = require('fs');
var http = require('http');
var d3 = require("d3");
var jsdom = require('jsdom');

module.exports = {

		//
		//  CREATE BARCHARTS HTML
		//
		create_barcharts_html: function( ts, matrix, body ) {
			var file = '../../tmp/'+ts+'_barcharts.html';
			var html = '<h3>TEST</h3>';
			htmlStub = '<html><head></head><body><div id="dataviz-container"></div><script src="http://d3js.org/d3.v3.min.js"></script></body></html>';
			// http://mango-is.com/blog/engineering/pre-render-d3-js-charts-at-server-side.html
			var csv_file = path.resolve(__dirname, '../../tmp/'+ts+'_text_matrix.csv');
			jsdom.env({ features : { QuerySelector : true }, html : htmlStub, done : function(errors, window) {
					// process the html document, like if we were at client side
					// code to generate the dataviz and process the resulting html file to be added here



				var el = window.document.querySelector('#dataviz-container');
				var body = window.document.querySelector('body');
				// append the svg to the container selector
//				var circleId = 'a2324'  // say, this value was dynamically retrieved from a database

				// append the svg to the selector
				d3.select(el)
					.append('svg:svg')
						.attr('width', 600).attr('height', 300)
						.append('circle')
							.attr('cx', 300).attr('cy', 150).attr('r', 30).attr('fill', '#26963c')
//							.attr('id', circleId) // we assign the circle to an Id here

				// write the client-side script manipulating the circle
//				var clientScript = "d3.select('#" + circleId + "').transition().delay(1000).attr('fill', '#f9af26')"

				// append the script to page's body
//				d3.select(body)
//					.append('script')
//						.html(clientScript)


						svgsrc = window.document.innerHTML





				// fs.readFile(csv_file, 'utf8', function (err, data) {
				// 	if(err) {
				// 		console.log(err)
				// 	}else{


				// 	}
				// });









				fs.writeFile(path.resolve(__dirname, file), svgsrc, function(err) {
			      if(err) {
			        console.log('Could not write file: '+file+' Here is the error: '+err);
			      } else {
			        console.log("The file ("+file+") was saved!");
			      }
			    });






				}
			})
		
		}

}
