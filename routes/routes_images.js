// common.js
var path = require('path');
var fs = require('fs-extra');
var extend = require('util')._extend;
var spawn = require('child_process').spawn;
var CONSTS = require('../public/constants');
var config  = require(app_root + '/config/config');
var helpers = require('./helpers/helpers');
let d3 = require('d3');

module.exports = {
taxon_color_legend: function(req, res) {
    console.log('In routes_images/function: images/taxon_color_legend')
    var ts = req.session.ts
    matrix_file_path = path.join(req.CONFIG.TMP_FILES,ts+'_count_matrix.biom')
    fs.readFile(matrix_file_path, 'utf8', function(err, data){
      if (err) {
          var msg = 'ERROR Message '+err;
          console.log(msg)
      }else{
        var biom_data = JSON.parse(data)
        html = '<table>'
        for (var i in biom_data.rows){
            n = parseInt(i)+1;
            longtax = biom_data.rows[i].id

            color = string_to_color_code(longtax)
            html += '<tr>'

            html += "<td style=''>"+longtax+"</td>"
            html += "<td width='30' style='background:"+color+";width:30px;'>"+color+"</td>"
            html += '</tr>'

        }
        html += '</table>'
        var outfile_name = ts + '-color_legend-api.html'
        outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
        console.log('outfile_path:',outfile_path)
        result = save_file(html, outfile_path)
        console.log('result',result)
        data = {}
        data.html = html
        data.filename = outfile_name
        console.log('data.filename',data.filename)
        //return data
        res.json(data)
      }

    });


}, // end color_legend
counts_matrix: function(req, res) {
    console.log('In routes_images/function: images/counts_matrix')
    
    //console.log('req session')
    //console.log(req.session)
    
    var ts = req.session.ts
    matrix_file_path = path.join(req.CONFIG.TMP_FILES,ts+'_count_matrix.biom')
    fs.readFile(matrix_file_path, 'utf8', function(err, data){
      if (err) {
          var msg = 'ERROR Message '+err;
          console.log(msg)
      }else{

            var biom_data = JSON.parse(data)
            var html = '';
            // need the max ranks
            maxrank = 0;
            for (var i in biom_data.rows){
              taxitems = biom_data.rows[i].id.split(';');
              if(maxrank < taxitems.length){
                maxrank = taxitems.length;
              }
            }
            if(req.body.source == 'website'){
                html += "<div id='tax_counts_graph_div' style='background-color:white;width:600px;height:400px;display:none;'></div>";
                html += "<br><br><br><br><br>"
            }

            html += "<table id='counts_matrix_id' border='0' class='' >";
            html += "<tr><td class='no_border'></td>"
            for (t = 0; t < maxrank; t++) {
                if(t==2){
                  html += "<th class='' valign='bottom'><small>Class</small></th>";
                }else{
                  html += "<th class='' valign='bottom'><small>"+req.CONSTS.RANKS[t].toUpperCase().charAt(0)+req.CONSTS.RANKS[t].slice(1)+"</small></th>";
                }
            }
      
            if(req.body.source == 'website'){
                html += "<th class='right_justify' valign='bottom'><small>Graph</small></th>";
            }

            for (var n in biom_data.columns) {
                if(req.body.source == 'website'){
                    html += "<th class='rotate'><div><span>"
                    html += "<a href='/visuals/bar_single?did="+biom_data.columns[n].did+"&ts="+ts+"&orderby=alpha&val=z' target='_blank' >"+(parseInt(n)+1).toString()+') '
                    html += biom_data.columns[n].id+"</a></span></div></th>";
                }else{
                    html += "<th class=''><div><span>"+ (parseInt(n)+1).toString()+') '+ biom_data.columns[n].id+"</span></div></th>";
                }
            }
            html += "<th class='center' valign='bottom'><small>Total</small></th>";
            html += "<th class='center' valign='bottom'><small>Avg</small></th>";
            html += "<th class='center' valign='bottom'><small>Min</small></th>";
            html += "<th class='center' valign='bottom'><small>Max</small></th>";
            html += "<th class='center' valign='bottom'><small>Std Dev</small></th>";

            html += "</tr>";
            // END OF TITLE ROW
            for (var i in biom_data.rows){
                
                longtax = biom_data.rows[i].id
                taxitems = longtax.split(';');
                html += "<tr class='chart_row'>"
                if(req.body.source == 'website'){
                    html += "<td><a href='taxa_piechart?tax="+longtax+"' title='Link to Taxa PieChart' target='_blank'>"+(parseInt(i)+1).toString()+"</a></td>";
                }else{
                    color = string_to_color_code(longtax)
                    console.log('color',color)
                    html += "<td style='background:"+color+"'>"+(parseInt(i)+1).toString()+"</td>"
                }
                for (t = 0; t < maxrank; t++) {
                  ttip = ''
                  ttip2 = ''

                  if(taxitems.length > t){
                    if(req.body.source == 'website'){
                        if(taxitems[t].substring(taxitems[t].length-2,taxitems[t].length) != 'NA'
                                && taxitems[t].substring(1,6) != 'mpty_'
                                && taxitems[t] != 'Unknown'
                                && taxitems[t] != 'Unassigned'){
                          ttip = '<span class="taxa">External "'+taxitems[t]+'" Links:'
                          ttip += '<li><a href="https://en.wikipedia.org/wiki/'+taxitems[t]+'" target="_blank">Wikipedia</a></li>'
                          ttip += '<li><a href="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name='+taxitems[t]+'" target="_blank">NCBI</a></li>'
                          ttip += '<li><a href="http://www.eol.org/search?q='+taxitems[t]+'" target="_blank">EOL</a></li>'
                          ttip += '</span>'
                          ttip2 = taxitems[t]
                        }
                    }
                    if(taxitems[t].substring(taxitems[t].length-3, taxitems[t].length) == '_NA'){
                      if(req.session.include_nas == 'yes'){
                        html += "<td id='' >"+taxitems[t]+"</td>";
                      }else{
                        html += "<td class='center' id='' ></td>";
                      }
                    }else{
                      html += "<td class='left_justify' id='"+ttip2+"' ><div class='taxa_name'>"+taxitems[t]
                      html += "<span class='taxa_tooltip' >"+ttip+"</span>";
                      html += "</div></td>";
                    }
                  }else{
                    html += "<td class='left_justify' id=''>--</td>";
                  }
                }
                if(req.body.source == 'website'){
                    counts_string = JSON.stringify(biom_data.data[i])
                    graph_link_id = 'flot_graph_link'+i.toString()
                    html += "<td align='center' style='cursor:pointer;'>"
                    html += "<img width='25' id='"+graph_link_id+"' src='/images/visuals/graph.png' onclick=\"graph_counts('"+i.toString()+"','"+longtax+"','"+counts_string+"')\">"
                    html += "</td>";
                }

                var tot   = 0;
                var avg   = 0;
                var min   = biom_data.data[i][0];
                var max   = 0;
                var sd    = 0;
                for (var da in biom_data.data[i]) {
                  var cnt = biom_data.data[i][da];
                  var ds_num = (parseInt(da)+1).toString()
                  var pct =  (cnt * 100 / biom_data.column_totals[da]).toFixed(2);
                  var id = 'fq/' + biom_data.rows[i].id + '/' + ds_num + ') ' + biom_data.columns[da].id + '/' + cnt.toString() + '/' + pct.toString();


                  html += "<td id='" + id + "' class='tooltip_viz right_justify tax_data'>" + cnt.toString() + '</td>';
                  tot += cnt;
                  if (cnt > max){
                    max = cnt;
                  }
                  if(cnt < min){
                    min = cnt;
                  }
                }
            
                avg = (tot/(biom_data.columns).length).toFixed(2)
                sd = standardDeviation(biom_data.data[i]).toFixed(2)
                html += "<td title='Total' class='right_justify tax_result'><small>"+tot.toString()+'</small></td>';
                html += "<td title='Average' class='right_justify tax_result'><small>"+avg.toString()+"</small></td>";
                html += "<td title='Minimum' class='right_justify tax_result'><small>"+min.toString()+"</small></td>";
                html += "<td title='Maximum' class='right_justify tax_result'><small>"+max.toString()+"</small></td>";
                html += "<td title='Standard Deviation' class='right_justify tax_result'><small>"+sd.toString()+"</small></td>";
                html += "</tr>";
            }
            
            // TOTALS
            html += "<tr>";
            for (t = 0; t < maxrank; t++) {
                html += "<td></td>";
            }
            html += "<td class='right_justify'><strong>Sums:</strong></td>";
            if(req.body.source == 'website'){
                html += "<td></td>"
            }
            for (var m in biom_data.column_totals){
            if((req.session).normalization == 'frequency'){
                var total = biom_data.column_totals[m].toFixed(6);
            }else{
                var total = biom_data.column_totals[m];
            }
            html += "<td title='Column Sum' class='right_justify'>" + total.toString() + "</td>";
            }

            html += "<td></td><td></td><td></td><td></td><td></td>"
            html += "</tr>";
            html += "</table>";
      
            var outfile_name = ts + '-counts_table-api.html'
            outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
        
            result = save_file(html, outfile_path)
            data = {}
            data.html = html
            data.filename = outfile_name
            //return data
            res.json(data)

      }

    })

},  // end counts_matrix
//
//   DISTANCE HEATMAP
//
dheatmap: function(req, res){
    console.log('In routes_images/function: images/dheatmap')
    //console.log(req.session)
    var ts = req.session.ts
    matrix_file_path = path.join(req.CONFIG.TMP_FILES,ts+'_count_matrix.biom')
    console.log(matrix_file_path)

    //var pwd = req.CONFIG.TMP_FILES;
    

    var html = '';
    var title = 'VAMPS';

    //var distmtx_file_name = ts+'_distance.csv';
    //var distmtx_file = path.join(req.CONFIG.TMP_FILES, distmtx_file_name);
    var dist_json_file_path = path.join(req.CONFIG.TMP_FILES, ts+'_distance.json')
    console.log(dist_json_file_path)
    var options = {
     scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
       args :       [ '-in', matrix_file_path, '-metric', req.session.selected_distance, '--function', 'dheatmap', '--basedir', req.CONFIG.TMP_FILES, '--prefix', ts],
     };
    
    console.log(options.scriptPath+'/distance_and_ordination.py '+options.args.join(' '));
    var heatmap_process = spawn( options.scriptPath+'/distance_and_ordination.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, null ] // stdin, stdout, stderr
            stdio: 'pipe' // stdin, stdout, stderr
        });


    var stdout = '';
    heatmap_process.stdout.on('data', function heatmapProcessStdout(data) {
        //console.log('stdout: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stdout += data;
    });
    var stderr = '';
    heatmap_process.stderr.on('data', function heatmapProcessStderr(data) {

        console.log('stderr: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });
    
    heatmap_process.on('close', function heatmapProcessOnClose(code) {
        console.log('heatmap_process process exited with code ' + code);

        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS
          try{
            console.log('dist_json_file_path',dist_json_file_path)
             
            fs.readFile(dist_json_file_path, 'utf8', function (err, distance_matrix) {
                if (err) throw err;
                //distance_matrix = JSON.parse(data);
                metadata = {}
                metadata.numbers_or_colors = 'colors'
                metadata.split = false
                metadata.metric = req.session.selected_distance
                var html = module.exports.create_hm_table(req, JSON.parse(distance_matrix), metadata )
                
                var outfile_name = ts + '-dheatmap-api.html'
                outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
                console.log('outfile_path:',outfile_path)
                result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
                //console.log(result)
                //res.send(outfile_name)
                var data = {}
                data.html = html
                data.numbers_or_colors = ''
                data.filename = outfile_name
                //res.send(outfile_name)
                res.json(data)

            });
            if(req.CONFIG.site == 'vamps' ){
              console.log('VAMPS PRODUCTION -- no print to log');
            }else{
              console.log(stdout)
            }
            //distance_matrix = JSON.parse(stdout);
            distance_matrix = stdout;
          }
          catch(err){
            distance_matrix = JSON.stringify({'ERROR':err});
          }

        }else{
          console.log('output: '+stderr);
          res.send(stderr);
        }
    });


},  // end DISTANCE HEATMAP

//
//
//
fheatmap: function(req, res){
    console.log('In routes_images/function: images/fheatmap')
    var ts = req.session.ts
    matrix_file_path = path.join(req.CONFIG.TMP_FILES,ts+'_count_matrix.biom')
    console.log(matrix_file_path)

    
    var options = {
        scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
        args :       [ req.CONFIG.TMP_FILES, req.session.selected_distance, ts, req.session.tax_depth],
    };
    console.log(options.scriptPath+'/fheatmap2.R '+options.args.join(' '));
    var fheatmap_process = spawn( options.scriptPath+'/fheatmap2.R', options.args, {
          env:{'PATH':req.CONFIG.PATH},
          detached: true,
          //stdio: [ 'ignore', null, log ]
          stdio: 'pipe'  // stdin, stdout, stderr
    });
    stdout = '';
    fheatmap_process.stdout.on('data', function fheatmapProcessStdout(data) {
          stdout += data;
          //console.log('stdout-data:')
          //console.log(data.toString())
    });
    stderr = '';
    fheatmap_process.stderr.on('data', function fheatmapProcessStderr(data) {
          stderr += data;
          console.log('stderr-data:')
          console.log(data.toString())
    });

    fheatmap_process.on('close', function fheatmapProcessOnClose(code) {
        console.log('fheatmap_process process exited with code ' + code);
        //distance_matrix = JSON.parse(output);
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS
            var svgfile_name  = ts + '_fheatmap.svg'  // must match file name written in R script: dendrogram.R
            svgfile_path = path.join(req.CONFIG.TMP_FILES, svgfile_name);  // file name save to user_location
            fs.readFile(svgfile_path, 'utf8', function(err, contents){
                if(err){ res.send('ERROR reading file')}

                //console.log(contents)
                var data = {}
                data.html = contents
                data.filename = svgfile_name   // returns data and local file_name to be written to
                res.json(data)
                return

            })


        }else{
          console.log('ERROR');
          res.send('Frequency Heatmap R Script Error:'+stderr);
        }
  });
},
//
//   PIE CHARTS
//
piecharts: function(req, res) {
  console.log('In routes_images/function: images/piecharts')
  d3 = require('d3');
  // see: https://bl.ocks.org/tomgp/c99a699587b5c5465228
  var jsdom = require('jsdom');
  const { JSDOM } = jsdom;
  var ts = req.session.ts

  var imagetype = 'group'

  matrix_file_path = path.join(req.CONFIG.TMP_FILES,ts+'_count_matrix.biom')
  fs.readFile(matrix_file_path, 'utf8', function(err, data){
    if (err) {
        var msg = 'ERROR Message '+err;
        console.log(msg)
    }else{

        var biom_data = JSON.parse(data)
        matrix = biom_data
        // parse data remove data less than 1%
        if(req.body.hasOwnProperty('type') && req.body.type == 'otus'){
            console.log('calling thin_out_data_for_display: length= '+biom_data.rows.length.toString())
            matrix = thin_out_data_for_display(biom_data)
        }

        var unit_list = [];
        for (var n in matrix.rows){
            unit_list.push(matrix.rows[n].id);
        }
        var total = 0
        for(n in matrix.rows){
          if(imagetype == 'single'){
            total +=  parseInt(matrix.data[n])
          }else{
            //pass
          }
        }
        var ds_count = matrix.shape[1];
        var tmp={};
        var tmp_names={};
        for (var d in matrix.columns){
            tmp[matrix.columns[d].id]=[]; // data
        }
        for (var x in matrix.data){
            for (var y in matrix.columns){
            tmp[matrix.columns[y].id].push(matrix.data[x][y]);
            }
        }
        var mtxdata={};
        mtxdata.names=[];
        mtxdata.values=[];

        for (var z in tmp) {
            mtxdata.names.push(z);
            mtxdata.values.push(tmp[z]);
        }
        if(imagetype == 'single'){
            var pies_per_row = 1;
            var m = 20; // margin
            var r = 120; // five pies per row
        }else{
            var pies_per_row = 4;
            var m = 15; // margin
            var r = 320/pies_per_row; // four pies per row
        }
        // image start in upper left corner
        var image_w = 1200
        var no_of_rows =  Math.ceil(ds_count/pies_per_row)
        var image_h = no_of_rows * ((r * 2)+40)
        console.log('image_h',image_h)
        var arc = d3.arc()
          .innerRadius(0)
          .outerRadius(r);
          
        const fakeDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        let body = d3.select(fakeDom.window.document).select('body');
        let svgContainer = body.append('div').attr('class', 'container')
            .append('svg')
                .attr("xmlns", 'http://www.w3.org/2000/svg')
                .attr("xmlns:xlink", 'http://www.w3.org/2000/xlink')
                .attr("width", image_w)
                .attr("height", image_h)
            .append('g')
              .attr("transform", "translate(" + 0 + "," + 0 + ")");
        // axis legends -- would like to rotate dataset names
        if(req.body.source == 'website'){
            var pies = svgContainer.selectAll("svg")
              .data(mtxdata.values)
              .enter().append("g")
              .attr("transform", function(d, i){
                  var diam = (r)+m;
                  var h_spacer = diam * 2* (i % pies_per_row);
                  var v_spacer = diam * 2 * Math.floor(i / pies_per_row);
                  //console.log('diam',diam,'h_spacer',h_spacer,'v_spacer',v_spacer)
                  return "translate(" + (diam + h_spacer) + "," + (diam + v_spacer) + ")";
              })
            .append("a")
            .attr("xlink:xlink:href", function(d, i) {
              return '/visuals/bar_single?did='+matrix.columns[i].did+'&ts='+ts+'&orderby=alpha&val=z';
            })
            .attr("target", '_blank' );
        }else{
            var pies = svgContainer.selectAll("svg")
              .data(mtxdata.values)
              .enter().append("g")
              .attr("transform", function(d, i){
                  var diam = (r)+m;
                  var h_spacer = diam * 2* (i % pies_per_row);
                  var v_spacer = diam * 2 * Math.floor(i / pies_per_row);
                  return "translate(" + (diam + h_spacer) + "," + (diam + v_spacer) + ")";
              })
        }



        pies.append("text")
            .attr("dx", -(r+m))
            .attr("dy", r+m)
            .attr("text-anchor", "center")
            .attr("font-size","10px")
            .text(function(d, i) {
                if(imagetype == 'single'){
                  return 'SumCount: '+total.toString()
                }else{
                  return matrix.columns[i].id;
                }
            });
        if(req.body.source == 'website'){
            pies.selectAll("path")
              .data(d3.pie().sort(null))
              .enter()
              .append("path")
              .attr("class", "arc")
              .attr("d", arc)
              .attr("id",function(d, i) {
                var cnt = d.value;
                var total = 0;
                for (var k in this.parentNode.__data__){
                  total += this.parentNode.__data__[k];
                }
                var ds = ''; // PLACEHOLDER for TT
                var pct = (cnt * 100 / total).toFixed(2);
                var id = 'pc/'+unit_list[i]+'/'+cnt.toString()+'/'+pct;
                return id;
              })
              .attr("class","tooltip_viz")
              .attr("fill", function(d, i) {
                  return string_to_color_code(unit_list[i])
              });
        }else{
            pies.selectAll("path")
              .data(d3.pie().sort(null))
              .enter()
              .append("path")
              .attr("class", "arc")
              .attr("d", arc)

              .attr("fill", function(d, i) {
                  return string_to_color_code(unit_list[i])
              })
              .append("title")
                .text(function(d, i) {
                  return unit_list[i]+' -- '+d.value;
                })
        }


        var html = body.select('.container').html()
        var outfile_name = ts + '-piecharts-api.svg'
        outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
        console.log('outfile_path:',outfile_path)
        result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
        data = {}
        data.html = html
        data.filename = outfile_name
        res.json(data)

      } // end else
    }); // end readFile matrix

},  // end piecharts
//
//   BAR CHARTS
//
barcharts: function(req, res){
  console.log('In routes_images/function: images/barcharts')
  // see: https://bl.ocks.org/tomgp/c99a699587b5c5465228
  let jsdom = require('jsdom');  // NEED version <10 for jsdom.env
  const { JSDOM } = jsdom;

  let ts = req.session.ts;

  let imagetype = 'group';

  let matrix_file_path = path.join(req.CONFIG.TMP_FILES, ts + '_count_matrix.biom');
  fs.readFile(matrix_file_path, 'utf8', function(err, data){
    console.time("TIME: readFile(matrix_file_path");

    if (err) {
        let msg = 'ERROR Message ' + err;
        console.log(msg);
    }
    else {
      let biom_data = JSON.parse(data);
      let matrix = biom_data;

      console.time("TIME: otus");
      if (req.body.hasOwnProperty('type') && req.body.type === 'otus') {
        matrix = barcharts_otus(req, biom_data);
      }
      console.timeEnd("TIME: otus");

      let ds_count = matrix.shape[1];
      let props = get_image_properties(imagetype, ds_count);

      console.time("TIME: make_mtxdata");
      let mtxdata = make_mtxdata(matrix);
      console.timeEnd("TIME: make_mtxdata");

      console.time("TIME: scaler");
      let scaler = get_scaler(mtxdata, matrix);
      console.timeEnd("TIME: scaler");

      console.time("TIME: mtxdata.forEach1");
      mtxdata.forEach(function(pr_did_taxa_obj) {
        let x0 = 0;
        pr_did_taxa_obj.unitObj = scaler
          .domain()
          .map(function(name) {
          return {
            tax: name,
            x0: x0,
            x1: x0 += +pr_did_taxa_obj[name],
            did: pr_did_taxa_obj.did,
            pjds: pr_did_taxa_obj.pjds,
            cnt: pr_did_taxa_obj[name]
          };
        });
        pr_did_taxa_obj.total = pr_did_taxa_obj.unitObj[pr_did_taxa_obj.unitObj.length - 1].x1;
      });
      console.timeEnd("TIME: mtxdata.forEach1");

      console.time("TIME: make_mtxdata + add_unitObj1");
      let mtxdata1 = add_unitObj1(matrix);
      console.timeEnd("TIME: make_mtxdata + add_unitObj1");

      console.time("TIME: mtxdata.forEach2");
      mtxdata.forEach(function(pr_did_taxa_unit_obj) {
        // normalize to 100%
        let tot = pr_did_taxa_unit_obj.total;
        pr_did_taxa_unit_obj.unitObj.forEach(function(unit_obj) {

            unit_obj.total = tot;
            unit_obj.x0 = (unit_obj.x0*100)/tot;
            unit_obj.x1 = (unit_obj.x1*100)/tot;
          });
      });
      console.timeEnd("TIME: mtxdata.forEach2");

      console.time("TIME: svgContainer");
      const fakeDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      let body = d3.select(fakeDom.window.document).select('body');
      let svgContainer = body.append('div').attr('class', 'container')
      .append('svg')
          .attr("xmlns", 'http://www.w3.org/2000/svg')
          .attr("xmlns:xlink", 'http://www.w3.org/2000/xlink')
          .attr("width", props.width)
          .attr("height", props.height)
      .append('g')
        .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
      // axis legends -- would like to rotate dataset names
      props.y.domain(matrix.columns.map(c => c.id));
      props.x.domain([0, 100]);
      console.timeEnd("TIME: svgContainer");

      console.time("TIME: if (imagetype");
      switch (imagetype) {
        case 'single':
          create_singlebar_svg_object(req, svgContainer, props, mtxdata, ts);
          break;
        case 'double':
          create_doublebar_svg_object(req, svgContainer, props, mtxdata, ts);
          break;
        default:
          try {
            create_bars_svg_object(req, svgContainer, props, mtxdata, ts);
          }
          catch(err){
            console.log('Error in create_bars_svg_object() '+err.toString())
          }
          break;
      }
      console.timeEnd("TIME: if (imagetype");

      let html = body.select('.container').html();

      let outfile_name = ts + '-barcharts-api.svg';
      let outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
      console.log('outfile_path:', outfile_path);
      save_file(html, outfile_path); // this saved file should now be downloadable from jupyter notebook
      data = {};
      data.html = html;
      data.filename = outfile_name;
      res.json(data);
    } // end else
    console.timeEnd("TIME: readFile(matrix_file_path");

  }); // end fs.readFile

},  // end barcharts

metadata_csv: function(req, res){
    console.log('in routes_images/metadata_csv')
    var ts = req.session.ts
    try{
        var ds_order = JSON.parse(req.body.ds_order)
    }catch(e){
        var ds_order = req.body.ds_order
    }
    mdobj = helpers.get_metadata_obj_from_dids(ds_order)
    //console.log(ds_order)
    var html = 'VAMPS Metadata\n'
    var item_obj = {}
    var sep = '\t'
    for(var i = 0; i < ds_order.length; i++){
        did = ds_order[i].toString()
        dname = DATASET_NAME_BY_DID[did]
        html += sep + dname
        //console.log('did',did)
        //console.log(AllMetadata[did])
        for(item in mdobj[did]){
            item_obj[item] = 1
        }
    }
    html += '\n\r'
    // sort
    //console.log('item_obj',item_obj)

    item_list = Object.keys(item_obj)

    item_list.sort()
    //console.log(item_list)
    // make a csv table
    for(var i = 0; i < item_list.length; i++){
        item = item_list[i]
        html += item
        for(var n = 0; n < ds_order.length; n++){
            did = ds_order[n].toString()

            if(mdobj[did].hasOwnProperty(item)){
                html += sep + mdobj[did][item].replace(',',' ')  // replace commas with space
            }else{
                html += sep
            }

        }
        html += '\n\r'
    }

    //console.log(html)
    var outfile_name = ts + '-metadata-api.csv'
    outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
    console.log('outfile_path:',outfile_path)
    result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
    //console.log(result)
    data = {}
    data.html = html
    data.filename = outfile_name
    res.json(data)


},

adiversity: function(req, res){
    console.log('in routes_images/adiversity')
    var ts = req.session.ts
    matrix_file_path = path.join(req.CONFIG.TMP_FILES, ts+'_count_matrix.biom')
    console.log(matrix_file_path)

    var pwd = req.CONFIG.PROCESS_DIR;
    

    var html = '';
    var title = 'VAMPS';

    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', matrix_file_path, '--site_base', req.CONFIG.PROCESS_DIR, '--prefix', ts],
    };


    console.log(options.scriptPath+'alpha_diversity.py '+options.args.join(' '));
    var alphadiv_process = spawn( options.scriptPath+'/alpha_diversity.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, null ] // stdin, stdout, stderr
            stdio: 'pipe' // stdin, stdout, stderr
        });

    var output = '';

    alphadiv_process.stdout.on('data', function adiversityProcessStdout(data) {
          data = data.toString().trim();
          //console.log(data)
          output += data;

    });

    stderr = '';
    alphadiv_process.stderr.on('data', function adiversityProcessStderr(data) {
        data = data.toString();
        //console.log(data)
        stderr += data;

    });
    alphadiv_process.on('close', function adiversityProcessOnClose(code) {
        console.log('alphadiv_process process exited with code ' + code);
        if(code == 0){

           var lines = output.split('\n');
           //alert(lines[0])
           var headers = lines.shift();
           //var line2 = lines.pop();
           //alert(headers)
           html = "<table class='table'>";
           html += '<tr>';
           //alert(line2)
           var header_items = headers.split('\t')
           for(i in header_items){
             html += '<td>'+header_items[i]+'</td>';
           }
           html +=  '</tr>';
           for(i in lines){
              html +=  '<tr>';
              items = lines[i].split('\t');
              for(j in items){
                html += '<td>'+items[j]+'</td>';
              }
              html +=  '</tr>';
           }
           html += '</table>';

            var outfile_name = ts + '-adiversity-api.csv'
            outfile_path = path.join(req.CONFIG.TMP_FILES, outfile_name);  // file name save to user_location
            console.log('outfile_path:',outfile_path)
            result = save_file(output, outfile_path) // this saved file should now be downloadable from jupyter notebook
            //console.log(result)
            data = {}
            data.html = html
            data.filename = outfile_name
            res.json(data)

        }else{
          console.log('python script error: '+stderr);
          res.send(stderr);
        }
    });

},
dendrogram: function(req, res){
    console.log('in routes_images/dendrogram2')
    ///groups/vampsweb/vampsdev/seqinfobin/bin/Rscript --no-save --slave --no-restore tree_create.R avoorhis_4742180_normalized.mtx horn avoorhis_4742180 trees
    //console.log(phylo)
    var ts = req.session.ts
    matrix_file_path = path.join(req.CONFIG.TMP_FILES,ts+'_count_matrix.biom')
    console.log(matrix_file_path)

    var pwd = req.CONFIG.PROCESS_DIR;

    var metric = req.session.selected_distance;
    var html = '';
    var title = 'VAMPS';
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ req.CONFIG.PROCESS_DIR, metric, ts ],
    };

    
    console.log(options.scriptPath+'/dendrogram2.R '+options.args.join(' '));
    var dendrogram_process = spawn( options.scriptPath+'/dendrogram2.R', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, null ] // stdin, stdout, stderr
            stdio: 'pipe'  // stdin, stdout, stderr
    });

    var output = '';
    dendrogram_process.stdout.on('data', function dendrogramProcessStdout(data) {
        //console.log('stdout: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        output += data;

    });
    var stderr = '';
    dendrogram_process.stderr.on('data', function dendrogramProcessStderr(data) {
        console.log('stderr: ' + data);
        //data = data.toString().replace(/^\s+|\s+$/g, '');
        data = data.toString();
        stderr += data;
    });

    dendrogram_process.on('close', function dendrogramProcessOnClose(code) {
        console.log('dendrogram_process process exited with code ' + code);

        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS
            //console.log('stdout: '+output);
            var svgfile_name  = ts + '_dendrogram.svg'  // must match file name written in R script: dendrogram.R
            svgfile_path = path.join(req.CONFIG.TMP_FILES, svgfile_name);  // file name save to user_location
            fs.readFile(svgfile_path, 'utf8', function(err, contents){
                if(err){ res.send('ERROR reading file');return}

                //console.log(contents)
                var data = {}
                data.html = contents
                data.filename = svgfile_name   // returns data and local file_name to be written to
                res.json(data)
                return

            })
            


        }else{
          console.log('stderr: '+stderr);
          res.send('Script Error');
        }
    });

},
//
//
//
phyloseq: function(req,res){
    console.log('in routes_images/phyloseq')
    var ts = req.session.ts
    //var rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
    var metric = req.session.selected_distance
    var tax_depth = req.session.tax_depth
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ req.CONFIG.PROCESS_DIR, metric, ts, tax_depth ],
    };
    console.log(options.scriptPath+'/phyloseq_test.R'+' '+options.args.join(' '));
    var phyloseq_process = spawn( options.scriptPath+'/phyloseq_test.R', options.args, {
            env:{'PATH':req.CONFIG.PATH},
            detached: true,
            //stdio: [ 'ignore', null, null ]
            stdio: 'pipe'  // stdin, stdout, stderr
    });
    stdout = '';
    phyloseq_process.stdout.on('data', function phyloseqProcessStdout(data) {
        data = data.toString();
        stdout += data;
    });
    stderr = '';
    phyloseq_process.stderr.on('data', function phyloseqProcessStderr(data) {
        stderr += data;
    });
    phyloseq_process.on('close', function phyloseqProcessOnClose(code) {
          console.log('phyloseq_process process exited with code ' + code);
          //distance_matrix = JSON.parse(output);
          //var last_line = ary[ary.length - 1];
          if(code === 0){   // SUCCESS

                var svgfile_name  = ts + '_phyloseq_test.svg'  // must match file name written in R script: dendrogram.R
                svgfile_path = path.join(req.CONFIG.TMP_FILES, svgfile_name);  // file name save to user_location
                fs.readFile(svgfile_path, 'utf8', function(err, contents){
                    if(err){ res.send('ERROR reading file');return}

                    //console.log(contents)
                    var data = {}
                    data.html = contents
                    data.filename = svgfile_name   // returns data and local file_name to be written to
                    res.json(data)
                    return

                })


          }else{
            //console.log('ERROR-2');
            html = "Phyloseq Error: Try selecting more data, deeper taxonomy or excluding 'NA's"
          }


    });
},
//
//
//
create_hm_table_from_csv: function(req, dm, metadata){
    console.log('in create_hm_table_from_csv')
    //for split heatmaps only
    //console.log(metadata)
    
    var choices = {'jc_kz':'Jaccard\\Kulczynski',     'jc_cb':   'Jaccard\\Canberra','jc_mh': 'Jaccard\\Morisita-Horn','jc_bc':'Jaccard\\Bray-Curtis',
                        'kz_cb':'Kulczynski\\Canberra','kz_mh':'Kulczynski\\Morisita-Horn', 'kz_bc':  'Kulczynski\\Bray-Curtis','cb_mh':'Canberra\\Morisita-Horn',
                        'cb_bc':'Canberra\\Bray-Curtis','mh_bc':'Morisita-Horn\\Bray-Curtis'}
    var html = ''
    
    if(req.body.source == 'website'){
        html += "<div class='pull-right'>"
        html += "	<small>"       
        
        if(metadata.numbers_or_colors == 'colors'){
            html += "View: <input id='hm_numbers_radio' type='radio'          name='hm_view' value='nums' onclick=\"change_hm_view('numbers')\"> Numbers&nbsp;&nbsp;&nbsp;&nbsp;"
            html += "<input id='hm_colors_radio' type='radio' checked name='hm_view' value='color' onclick=\"change_hm_view('colors')\"> Colors"
        }else{
            html += "View: <input id='hm_numbers_radio' type='radio'  checked  name='hm_view' value='nums' onclick=\"change_hm_view('numbers')\"> Numbers&nbsp;&nbsp;&nbsp;&nbsp;"
            html += "<input id='hm_colors_radio' type='radio' name='hm_view' value='color' onclick=\"change_hm_view('colors')\"> Colors"
        }
        html += "<br>Split Distance Metric:&nbsp;"
        
        html += "<select onchange=\"get_split_view(this.value,'"+metadata.numbers_or_colors+"')\">"
        html += "<option>Choose Metric Pair</option>"
        for(met in choices){
            if(met == metadata.metric){
                html += "<option selected value='"+met+"'>"+choices[met]+"</option>"
            }else{
                html += "<option value='"+met+"'>"+choices[met]+"</option>"
            }            
        }
        html += "</select>"
        html += "    </small>"
        html += "</div>"
   
        html += "<center>"
        html += "	<small>"
        html += "      <span id='dragInfoArea' > ** Drag a row to change the dataset order. **</span>"
        html += "    </small>"
        html += "</center>"
        
        html += "<span>"+choices[metadata.metric]+"</span>"
        
        html += "<br>"
    }
    
    //html += "<div id='distance_matrix' style='visibility:hidden'><%= dm %></div>"
    html += "<form name='save_ds_order_form' id='' class='' method='POST' action='/visuals/view_selection'>"
    html += "<table border='1' id='drag_table' class='heatmap_table center_table' >"
	if(req.body.source == 'website'){
	    html += "<tr class='nodrag nodrop' ><td></td>"
    }else{
        html += "<tr class='nodrag nodrop' style='line-height:11px;'><td></td>"
    }
	html += "<td><div id='ds_save_order_div'>"
	if(req.body.source == 'website'){
	    html += "<button type='submit' id='ds_save_order_btn' class='btn btn-xs btn-default'>Save Order</button>"
        html += "<span class='label blue' bgcolor='blue'>Similar (0.0)</span> <span class='label red' bgcolor='red'>Dissimilar (1.0)</span>"
    }else{
        html += "<span class='' style='color:white;background:blue' >Similar (0.0)</span> <span class='' style='background:red' >Dissimilar (1.0)</span>"
    }
	html += "		  <imput type='hidden' id='' name='resorted' value='1' >"
	html += "	  </div>"
	html += "</td>"
    
    
    var ds_order = dm[0].trim().split('\t')
    
    for(n in ds_order){
        var did =req.session.chosen_id_order[n]
        var pjds = ds_order[n].split('--')
        var pid = PROJECT_INFORMATION_BY_PNAME[pjds[0]].pid
        if(pjds[1] != DATASET_NAME_BY_DID[did]){
            //errors
            console.log('ERROR1 in create_hm_table_from_csv')
            return
        }
        
       
    }
    for(i=1; i<=ds_order.length; i++) {
        html += "<td><div class='cell'></div></td>"
    }
    html += "</tr>"
    
    
    k=1
    for(var n in ds_order) { //rows
        var row = dm[k]  // k starts at 1 -- first data row
       
        var row_items = row.split('\t') // ds c1 c2 c3 c4 c5
        
        var xdid = req.session.chosen_id_order[n]
        var xpjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[xdid]].project +'--'+DATASET_NAME_BY_DID[xdid]
        var row_pjds = row_items.shift() // leaves only the counts
        
        if(row_pjds != xpjds){
            console.log('ERROR2 in create_hm_table_from_csv')
            return
        }

        if(req.body.source == 'website'){
            html += "<tr id='"+xpjds+"'>"
        }else{
            html += "<tr id='"+xpjds+"' style='line-height:11px;'>"
        }
        html += "<td  id='"+xpjds+"' class='dragHandle ds_cell'>"+k+"</td>"
        html += "<td class='dragHandle ds_cell' ><input type='hidden' name='ds_order[]' value='"+ xdid +"' >"+xpjds+"</td>"
        
        
        for(var m in ds_order) { //cols
            
            var ydid = req.session.chosen_id_order[m]
            var ypjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[ydid]].project +'--'+DATASET_NAME_BY_DID[ydid]
            
            var d = parseFloat(row_items[m]).toFixed(5)
            var sv = Math.round( d * 15 );
            
            split_matrix_elems = choices[metadata.metric].split('\\')
            //console.log(n.toString()+' -- '+m.toString()+' -- '+choices[metadata.metric])
            if(parseInt(n) < parseInt(m)){ // rows < cols
                var metric = split_matrix_elems[1]
                var id = 'dh/'+xpjds+'/'+ypjds+'/'+ metric +'/'+d;
            }else{
                var metric = split_matrix_elems[0]
                var id = 'dh/'+xpjds+'/'+ypjds+'/'+ metric +'/'+d;
            }
            //console.log(id)
            if(metadata.numbers_or_colors == 'numbers'){
                
                if(xdid === ydid){
                    html += "<td id='' class='heat_map_td' align='center' bgcolor='white'>0.0</td>"
                }else{
                    
                    if(req.body.source == 'website'){
                        html += "<td id='"+id+"' class='heat_map_td tooltip_viz' bgcolor='white'"
                        html += " onclick=\"window.open('/visuals/bar_double?did1="+ xdid +"&did2="+ ydid +"&metric="+metric+"&ts="+req.session.ts+"&dist="+ d +"&order=alphaDown', '_blank')\"  >"
                        html += "&nbsp;&nbsp;&nbsp;&nbsp;"  <!-- needed for png image -->
                    }else{
                        var title = xpjds+'&#13;'+ypjds+'&#13;'+ choices[metadata.metric] +' -- '+d;
                        html += "<td title='"+title+"' class='heat_map_td' bgcolor='white'>"
                    }
                    html += d.toString()+"</td>"
                }
                
            }else{        
                var colors   = req.CONSTS.HEATMAP_COLORS
                if(xdid === ydid){
                    html += "<td id='' class='heat_map_td' bgcolor='#000'></td>"
                }else{
                    if(req.body.source == 'website'){
                        html += "<td id='"+id+"' class='heat_map_td tooltip_viz' bgcolor='#"+ colors[sv]+"'"
                        html += " onclick=\"window.open('/visuals/bar_double?did1="+ xdid +"&did2="+ ydid +"&metric="+metric+"&ts="+req.session.ts+"&dist="+ d +"&order=alphaDown', '_blank')\"  >"
                        html += "&nbsp;&nbsp;&nbsp;&nbsp;"  <!-- needed for png image -->
                    }else{
                        var title = xpjds+'&#13;'+ypjds+'&#13;'+ choices[metadata.metric] +' -- '+d;
                        html += "<td title='"+title+"' class='heat_map_td' bgcolor='#"+ colors[sv]+"'>"
                    }
                    html += "</td>"
                }
                
            }

 
        
        
       }  // inner for()
       html += "</tr>"
       k++
    } // outer for()
    html += "</table>"
    html += "<input type='hidden' name='resorted' value='1'>"
    html += "</form>"
    html += "</center>"
    
    return html
},
create_hm_table: function(req, dm, metadata){
    console.log('in create_hm_table2')
    //console.log(metadata)
    var id_order = req.session.chosen_id_order
    
    console.log('dm')
    console.log(dm)
    var choices = {'jc_kz':'Jaccard\\Kulczynski',     'jc_cb':   'Jaccard\\Canberra','jc_mh': 'Jaccard\\Morisita-Horn','jc_bc':'Jaccard\\Bray-Curtis',
                        'kz_cb':'Kulczynski\\Canberra','kz_mh':'Kulczynski\\Morisita-Horn', 'kz_bc':  'Kulczynski\\Bray-Curtis','cb_mh':'Canberra\\Morisita-Horn',
                        'cb_bc':'Canberra\\Bray-Curtis','mh_bc':'Morisita-Horn\\Bray-Curtis'}
    var html = ''
    
    if(req.body.source == 'website'){
        html += "<div class='pull-right'>"
        html += "	<small>"       
        
        if(metadata.numbers_or_colors == 'colors'){
            html += "View: <input id='hm_numbers_radio' type='radio'          name='hm_view' value='nums' onclick=\"change_hm_view('numbers')\"> Numbers&nbsp;&nbsp;&nbsp;&nbsp;"
            html += "<input id='hm_colors_radio' type='radio' checked name='hm_view' value='color' onclick=\"change_hm_view('colors')\"> Colors"
        }else{
            html += "View: <input id='hm_numbers_radio' type='radio'  checked  name='hm_view' value='nums' onclick=\"change_hm_view('numbers')\"> Numbers&nbsp;&nbsp;&nbsp;&nbsp;"
            html += "<input id='hm_colors_radio' type='radio' name='hm_view' value='color' onclick=\"change_hm_view('colors')\"> Colors"
        }
        html += "<br>Split Distance Metric:&nbsp;"
        
        html += "<select onchange=\"get_split_view(this.value,'"+metadata.numbers_or_colors+"')\">"
        html += "<option>Choose Metric Pair</option>"
        for(met in choices){
            if(met == metadata.metric){
                html += "<option selected value='"+met+"'>"+choices[met]+"</option>"
            }else{
                html += "<option value='"+met+"'>"+choices[met]+"</option>"
            }            
        }
        html += "</select>"
        html += "    </small>"
        html += "</div>"
   
        html += "<center>"
        html += "	<small>"
        html += "      <span id='dragInfoArea' > ** Drag a row to change the dataset order. **</span>"
        html += "    </small>"
        html += "</center>"
        
        html += "<span>"+req.session.selected_distance+"</span>"
        
        html += "<br>"
    }
    
    
 
    html += "<form name='save_ds_order_form' id='' class='' method='POST' action='/visuals/view_selection'>"
    html += "<table border='1' id='drag_table' class='heatmap_table center_table' >"
	if(req.body.source == 'website'){
	    html += "<tr class='nodrag nodrop' ><td></td>"
    }else{
        html += "<tr class='nodrag nodrop' style='line-height:11px;'><td></td>"
    }
	html += "<td><div id='ds_save_order_div'>"
	if(req.body.source == 'website'){
	    html += "<button type='submit' id='ds_save_order_btn' class='btn btn-xs btn-default'>Save Order</button>"
        html += "<span class='label blue' bgcolor='blue'>Similar (0.0)</span> <span class='label red' bgcolor='red'>Dissimilar (1.0)</span>"
    }else{
        html += "<span class='' style='color:white;background:blue' >Similar (0.0)</span> <span class='' style='background:red' >Dissimilar (1.0)</span>"
    }
	html += "		  <imput type='hidden' id='' name='resorted' value='1' >"
	html += "	  </div>"
	html += "</td>"
    for(i=1; i<=id_order.length; i++) {
        html += "<td><div class='cell'></div></td>"
    }
        html += "</tr>"
    k=1
    for(var n in id_order) { // rows
        var xdid = id_order[n]
        var xpjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[xdid]].project +'--'+DATASET_NAME_BY_DID[xdid]
        //var x = id_order[n]
        if(req.body.source == 'website'){
            html += "<tr id='"+xpjds+"'>"
        }else{
            html += "<tr id='"+xpjds+"' style='line-height:11px;'>"
        }
        html += "<td  id='"+xpjds+"' class='dragHandle ds_cell'>"+k+"</td>"
        html += "<td class='dragHandle ds_cell' ><input type='hidden' name='ds_order[]' value='"+ xdid +"' >"+xpjds+"</td>"
        for(var m in id_order) {  // cols
            
            var ydid = id_order[m]
            var ypjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[ydid]].project +'--'+DATASET_NAME_BY_DID[ydid]
            
            if(dm.hasOwnProperty(xpjds) && dm[xpjds].hasOwnProperty(ypjds)){
                var d = dm[xpjds][ypjds].toFixed(5);
                var sv = Math.round( dm[xpjds][ypjds] * 15 );
            }else{
                  var d = 1
                  var sv = 1 * 15
            }
            var metric = req.session.selected_distance
            var id = 'dh/'+xpjds+'/'+ypjds+'/'+ metric +'/'+d;
            
            
            
            if(metadata.numbers_or_colors == 'numbers'){
                
                if(xdid === ydid){
                    html += "<td id='' class='heat_map_td' align='center' bgcolor='white'>0.0</td>"
                }else{
                    
                    if(req.body.source == 'website'){
                        html += "<td id='"+id+"' class='heat_map_td tooltip_viz' bgcolor='white'"
                        html += " onclick=\"window.open('/visuals/bar_double?did1="+ xdid +"&did2="+ ydid +"&metric="+metric+"&ts="+req.session.ts+"&dist="+ d +"&order=alphaDown', '_blank')\"  >"
                        html += "&nbsp;&nbsp;&nbsp;&nbsp;"  <!-- needed for png image -->
                    }else{
                        var title = xpjds+'&#13;'+ypjds+'&#13;'+ req.session.selected_distance +' -- '+d;
                        html += "<td title='"+title+"' class='heat_map_td' bgcolor='white'>"
                    }
                    html += d.toString()+"</td>"
                }
                
            }else{        
                var colors   = req.CONSTS.HEATMAP_COLORS
                if(xdid === ydid){
                    html += "<td id='' class='heat_map_td' bgcolor='#000'></td>"
                }else{
                    if(req.body.source == 'website'){
                        html += "<td id='"+id+"' class='heat_map_td tooltip_viz' bgcolor='#"+ colors[sv]+"'"
                        html += " onclick=\"window.open('/visuals/bar_double?did1="+ xdid +"&did2="+ ydid +"&metric="+metric+"&ts="+req.session.ts+"&dist="+ d +"&order=alphaDown', '_blank')\"  >"
                        html += "&nbsp;&nbsp;&nbsp;&nbsp;"  <!-- needed for png image -->
                    }else{
                        var title = xpjds+'&#13;'+ypjds+'&#13;'+ req.session.selected_distance +' -- '+d;
                        html += "<td title='"+title+"' class='heat_map_td' bgcolor='#"+ colors[sv]+"'>"
                    }
                    html += "</td>"
                }
                
            }

        }
        k++
        html += "</tr>"

    }
    html += "</table>"
    html += "<input type='hidden' name='resorted' value='1'>"
    html += "</form>"
    html += "</center>"
/////////////////////
  return html


},

};   // end module.exports
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function create_bars_svg_object(req, svg, props, data, ts) {

      console.log('In create_svg_object')
      svg.append("g")
          .attr("class", "x axis")
          .style('stroke-width', '2px')
          .call(props.xAxis);

      svg.append("text")
          .attr("x", props.plot_width-40)
          .attr("dx", "50")
          .style("font-size",  "11px")
          .text("Percent");
    if(req.body.source == 'website'){
       var datasetBar = svg.selectAll(".bar")
          .data(data)
        .enter()
        .append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return  "translate(0, " + props.y(d.pjds) + ")"; })
          .append("a")
          .attr("xlink:xlink:href",  function(d) { return '/visuals/bar_single?did='+d.did+'&ts='+ts+'&order=alphaDown';} )
          .attr("target", '_blank' );
    }else{
        var datasetBar = svg.selectAll(".bar")
          .data(data)
        .enter()
        .append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return  "translate(0, " + props.y(d.pjds) + ")"; })

    }
    var labels = datasetBar.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .style("font-size",  "13px")
      .style("font-weight",  "normal")
      .attr("x", "-2")
      .attr("y", props.bar_height*2)
      .text(function(d) { return d.pjds; })
    var labels = datasetBar.append("text")
      .style("text-anchor","start")
      .style("font-size",  "13px")
      .style("font-weight",  "normal" )
      .attr("x", props.plot_width+10)
      .attr("y", props.bar_height*2)
      .text(function(d) { return 'SumCount: '+d.total; })
     if(req.body.source == 'website'){
        var gnodes = datasetBar.selectAll("rect")
              .data(function(d) { return d.unitObj; })
            .enter()


        .append("rect")
              .attr("x", function(d) { return props.x(d.x0); })
              .attr("y", 15)  // adjust where first bar starts on x-axis
              .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
              .attr("height",  18)
             // .attr("title",function(d){
             //     return d.tax
              //})
             .attr("id",function(d,i) {
                //var cnt =  d.tax;
                //var total = d.total;

                //console.log(this._parentNode.__data__['total']);
                var ds = ''; // PLACEHOLDER for TT
                var pct = (d.cnt * 100 / d.total).toFixed(2);
                var id = 'bc/' + d.tax + '/'+ d.cnt.toString() + '/' + pct;
                return id;
              })

              .attr("class","tooltip_viz")
              .style("fill",   function(d,i) {
                //return get_random_color()
                return string_to_color_code(d.tax);
              });
      }else{
        var gnodes = datasetBar.selectAll("rect")
              .data(function(d) { return d.unitObj; })
            .enter()

        .append("rect")
              .attr("x", function(d) { return props.x(d.x0); })
              .attr("y", 15)  // adjust where first bar starts on x-axis
              .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
              .attr("height",  18)
              .style("fill",   function(d,i) {
                //return get_random_color()
                return string_to_color_code(d.tax);
              })
        .append("title")
         .text(function(d) {
           //console.log('this.parentNode.__data__',d.cnt)
           return d.tax+' -- '+d.cnt
         })
      }
}
//
//
//
function string_to_color_code(str){
  for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
  color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
  return '#' + Array(6 - color.length + 1).join('0') + color;
}
//
//
//
function get_image_properties(imagetype, ds_count) {
  var props = {};
  var gap = 2;  // gap on each side of bar
  if(imagetype=='single'){
    // props.bar_height = 20;
    // props.margin = {top: 20, right: 150, bottom: 20, left: 0};
    // props.plot_width = 900;
    // props.width = props.plot_width + props.margin.left + props.margin.right;
    // props.height = (ds_count * (props.bar_height + 2 * gap)) + 125;
    //
    // props.x = d3.scaleLinear().rangeRound([0, props.plot_width]);
    //
    // props.y = d3.scaleOrdinal()
    //     .rangeBands([0, (props.bar_height + 2 * gap) * ds_count]);


  }
  else{
    props.bar_height = 15;
    //props.margin = {top: 20, right: 20, bottom: 300, left: 50};
    props.margin = {top: 40, right: 150, bottom: 20, left: 250};
    props.plot_width = 650;
    props.width = props.plot_width + props.margin.left + props.margin.right;
    props.height = (ds_count * (props.bar_height + (2 * gap))) + 150;

    props.x = d3.scaleLinear().rangeRound([0, props.plot_width]);
    props.y = d3.scaleBand().domain(d3.range( ds_count))
    .rangeRound([0, ((props.bar_height + 5) * ds_count)])
             .paddingInner(0);

    props.xAxis = d3.axisTop(props.x);//d3.select(".axis").call(d3.axisTop(props.x));
    props.yAxis = d3.axisLeft(props.y);  //d3.select(".axis").call(d3.axisLeft(props.y));
  }

  return props;
}
// function create_hm_table(req, dm, numbers_or_colors){
//     console.log('in create_hm_table')
//     
//     var id_order = req.session.chosen_id_order
//     
//     var html = ''
//     html += "<center>"
//     if(req.body.source == 'website'){
//         html += "<center>"
//         html += "	<small>"
//         html += "      <span id='dragInfoArea' > ** Drag a row to change the dataset order. **</span>"
//         html += "    </small>"
//         html += "</center>"
//         html += "<table class='pull-right'><tr>"
//         html += "<td><input type='radio' name='hm_view' value='nums' onclick=\"change_hm_view('numbers')\"> Numbers&nbsp;&nbsp;&nbsp;&nbsp;</td>"
//         html += "<td><input type='radio' name='hm_view' value='color' onclick=\"change_hm_view('colors')\"> Colors </td>"
//         html += "</tr></table>"
//         html += "<br>"
//     }
//     //html += "<div id='distance_matrix' style='visibility:hidden'><%= dm %></div>"
//     html += "<form name='save_ds_order_form' id='' class='' method='POST' action='/visuals/view_selection'>"
//     html += "<table border='1' id='drag_table' class='heatmap_table center_table' >"
// 	if(req.body.source == 'website'){
// 	    html += "<tr class='nodrag nodrop' ><td></td>"
//     }else{
//         html += "<tr class='nodrag nodrop' style='line-height:11px;'><td></td>"
//     }
// 	html += "<td><div id='ds_save_order_div'>"
// 	if(req.body.source == 'website'){
// 	    html += "<button type='submit' id='ds_save_order_btn' class='btn btn-xs btn-default'>Save Order</button>"
//         html += "<span class='label blue' bgcolor='blue'>Similar (0.0)</span> <span class='label red' bgcolor='red'>Dissimilar (1.0)</span>"
//     }else{
//         html += "<span class='' style='color:white;background:blue' >Similar (0.0)</span> <span class='' style='background:red' >Dissimilar (1.0)</span>"
//     }
// 	html += "		  <imput type='hidden' id='' name='resorted' value='1' >"
// 	html += "	  </div>"
// 	html += "</td>"
//     for(i=1; i<=id_order.length; i++) {
//         html += "<td><div class='cell'></div></td>"
//     }
//         html += "</tr>"
//     k=1
//     for(var n in id_order) {
//         var xdid = id_order[n]
//         var xpjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[xdid]].project +'--'+DATASET_NAME_BY_DID[xdid]
//         //var x = id_order[n]
//         if(req.body.source == 'website'){
//             html += "<tr id='"+xpjds+"'>"
//         }else{
//             html += "<tr id='"+xpjds+"' style='line-height:11px;'>"
//         }
//         html += "<td  id='"+xpjds+"' class='dragHandle ds_cell'>"+k+"</td>"
//         html += "<td class='dragHandle ds_cell' ><input type='hidden' name='ds_order[]' value='"+ xdid +"' >"+xpjds+"</td>"
//         for(var m in id_order) {
//             
//             var ydid = id_order[m]
//             var ypjds = PROJECT_INFORMATION_BY_PID[PROJECT_ID_BY_DID[ydid]].project +'--'+DATASET_NAME_BY_DID[ydid]
//             
//             if(dm.hasOwnProperty(xpjds) && dm[xpjds].hasOwnProperty(ypjds)){
//                 var d = dm[xpjds][ypjds].toFixed(5);
//                 var sv = Math.round( dm[xpjds][ypjds] * 15 );
//             }else{
//                   var d = 1
//                   var sv = 1 * 15
//             }
//             var id = 'dh/'+xpjds+'/'+ypjds+'/'+ req.session.selected_distance +'/'+d;
//             
//             if(numbers_or_colors == 'numbers'){
//                 
//                 if(xdid === ydid){
//                     html += "<td id='' class='heat_map_td' align='center'>0.0</td>"
//                 }else{
//                     if(req.body.source == 'website'){
//                         html += "<td id='"+id+"' class='heat_map_td tooltip_viz' "
//                         html += " onclick=\"window.open('/visuals/bar_double?did1="+ xdid +"&did2="+ ydid +"&ts="+req.session.ts+"&dist="+ d +"&order=alphaDown', '_blank')\"  >"
//                         html += "&nbsp;&nbsp;&nbsp;&nbsp;"  <!-- needed for png image -->
//                     }else{
//                         var title = xpjds+'&#13;'+ypjds+'&#13;'+ req.session.selected_distance +' -- '+d;
//                         html += "<td title='"+title+"' class='heat_map_td' >"
//                     }
//                     html += d.toString()+"</td>"
//                 }
//                 
//             }else{        
//                 var colors   = req.CONSTS.HEATMAP_COLORS
//                 if(xdid === ydid){
//                     html += "<td id='' class='heat_map_td' bgcolor='#000'></td>"
//                 }else{
//                     if(req.body.source == 'website'){
//                         html += "<td id='"+id+"' class='heat_map_td tooltip_viz' bgcolor='#"+ colors[sv]+"'"
//                         html += " onclick=\"window.open('/visuals/bar_double?did1="+ xdid +"&did2="+ ydid +"&ts="+req.session.ts+"&dist="+ d +"&order=alphaDown', '_blank')\"  >"
//                         html += "&nbsp;&nbsp;&nbsp;&nbsp;"  <!-- needed for png image -->
//                     }else{
//                         var title = xpjds+'&#13;'+ypjds+'&#13;'+ req.session.selected_distance +' -- '+d;
//                         html += "<td title='"+title+"' class='heat_map_td' bgcolor='#"+ colors[sv]+"'>"
//                     }
//                     html += "</td>"
//                 }
//                 
//             }
// 
//         }
//         k++
//         html += "</tr>"
// 
//     }
//     html += "</table>"
//     html += "<input type='hidden' name='resorted' value='1'>"
//     html += "</form>"
//     html += "</center>"
// /////////////////////
//   return html
// 
// 
// }
function standardDeviation(values){
  var avg = average(values);
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);
  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}
function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}
function save_file(data, file_path){
    //fs.writeFileSync(file_path, data)
    //fs.chmodSync(file_path, 0o664);
    //return 'Success'
    fs.writeFile(file_path, data, function(err){
        if(err) {
            return console.log(err);
        }
        else{
            fs.chmodSync(file_path, 0o664);
            return 'Success'
        }
    
    })
}
function thin_out_data_for_display(mtx){
    console.log('in thin_out_data_for_display- OTUs only')
    var new_mtx = {}
    new_mtx.columns = mtx.columns
    new_mtx.data = []
    new_mtx.rows = []

    for(m in mtx.data){

        for(n in mtx.data[m]){
            cnt = mtx.data[m][n]
            dstot = mtx.column_totals[n]
            pct = (cnt/dstot)*100
            //console.log('pct->')
            //console.log(cnt)
            //console.log(pct)
            got_one_above_limit = false
            if((cnt/dstot)*100 > 1.0){
                //console.log('greater than 1%')
                got_one_above_limit = true
            }
            if(got_one_above_limit){
                new_mtx.data.push(mtx.data[m])
                new_mtx.rows.push(mtx.rows[m])
            }

        }
    }
    new_mtx.shape = [new_mtx.rows.length, new_mtx.columns.length]
    new_mtx.matrix_type = "dense"
    new_mtx.max_dataset_count = mtx.max_dataset_count
    new_mtx.column_totals = mtx.column_totals
    new_mtx.date = mtx.date
    new_mtx.generated_by = mtx.generated_by
    new_mtx.units = mtx.units
    new_mtx.type = mtx.type
    new_mtx.format_url = mtx.format_url
    new_mtx.format = mtx.format
    new_mtx.id = mtx.id

    return new_mtx

}

function barcharts_otus(req, biom_data) {
  console.log('calling thin_out_data_for_display: length= ' + biom_data.rows.length.toString());
  return thin_out_data_for_display(biom_data);
}

function make_mtxdata(matrix) {
  let mtxdata = [];
  matrix.columns.forEach((column, p_ind) => {
    let tmp = {};
    tmp.pjds = column.id;
    tmp.did = column.did;
    matrix.rows.forEach((row, t_ind) => {
      tmp[row.id] = matrix.data[t_ind][p_ind];
    });
    mtxdata.push(tmp);
  });
  return mtxdata
}

function get_scaler(mtxdata, matrix) {
  let scaler = d3.scaleOrdinal()
    .range( matrix.rows );
  scaler.domain(d3.keys(mtxdata[0])
    .filter(function(key) {
      return key !== "pjds" && key !== "did";
    }));
  return scaler;
}

function add_unitObj1(matrix) {
  let mtxdata = [];
  matrix.columns.forEach((column, p_ind) => {
    let tmp = {};
    let x0 = 0;
    tmp.unitObj = [];
    tmp.pjds = column.id;
    tmp.did = column.did;
    matrix.rows.forEach((row, t_ind) => {
      let name = row.id;
      let cnts = matrix.data[t_ind][p_ind];
      tmp[name] = cnts;
      let tmp_unitObj = {
        tax: name,
        x0: x0,
        x1: x0 += +cnts,
        did: column.did,
        pjds: column.id,
        cnt: cnts
      };
      tmp.unitObj.push(tmp_unitObj);
    });
    tmp.total = matrix.column_totals[p_ind];
    mtxdata.push(tmp);
  });
  return mtxdata;
}

