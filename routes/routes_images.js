// common.js
var path = require('path');
var fs = require('fs');
var extend = require('util')._extend;
var spawn = require('child_process').spawn;
var CONSTS = require('../public/constants');
var config  = require(app_root + '/config/config');
var helpers = require('./helpers/helpers');

module.exports = {

counts_matrix: function(req, res) {
    console.log('In function: images/counts_matrix')
    var ts = visual_post_items.ts
    matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')

    fs.readFile(matrix_file_path, 'utf8', function(err, data){
      if (err) {
          var msg = 'ERROR Message '+err;
          console.log(msg)
      }else{

        BIOM_MATRIX = JSON.parse(data)

        var html = '';
        // need the max ranks
        maxrank = 0;
        for (var i in BIOM_MATRIX.rows){
          taxitems = BIOM_MATRIX.rows[i].id.split(';');
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
      for (var n in BIOM_MATRIX.columns) {
        //html += "<th class='verticalTableHeader' >"+BIOM_MATRIX.columns[n].id +"</th>";
        if(req.body.source == 'website'){
            html += "<th class='rotate'><div><span>"
            html += "<a href='/visuals/bar_single?id="+BIOM_MATRIX.columns[n].id+"&ts="+ts+"&orderby=alpha&val=z' target='_blank' >"+(parseInt(n)+1).toString()+') '
            html += BIOM_MATRIX.columns[n].id+"</a></span></div></th>";
        }else{
            html += "<th class=''><div><span>"+ (parseInt(n)+1).toString()+') '+ BIOM_MATRIX.columns[n].id+"</span></div></th>";
        }
      }

      html += "<th class='center' valign='bottom'><small>Total</small></th>";
      html += "<th class='center' valign='bottom'><small>Avg</small></th>";
      html += "<th class='center' valign='bottom'><small>Min</small></th>";
      html += "<th class='center' valign='bottom'><small>Max</small></th>";
      html += "<th class='center' valign='bottom'><small>Std Dev</small></th>";

      html += "</tr>";
      // END OF TITLE ROW
      for (var i in BIOM_MATRIX.rows){
        count = parseInt(i)+1;
        taxitems = BIOM_MATRIX.rows[i].id.split(';');
        html += "<tr class='chart_row'>"
        if(req.body.source == 'website'){
            html += "<td><a href='taxa_piechart?tax="+BIOM_MATRIX.rows[i].id+"' title='Link to Taxa PieChart' target='_blank'>"+count.toString()+"</a></td>";
        }else{
             html += "<td>"+count.toString()+"</td>"
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
              if(visual_post_items.include_nas == 'yes'){
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
            counts_string=JSON.stringify(BIOM_MATRIX.data[i])
            graph_link_id = 'flot_graph_link'+i.toString()
            html += "<td align='center' style='cursor:pointer;'>"
            html += "<img width='25' id='"+graph_link_id+"' src='/images/visuals/graph.png' onclick=\"graph_counts('"+i.toString()+"','"+BIOM_MATRIX.rows[i].id+"','"+counts_string+"')\">"
            html += "</td>";
        }

        var tot   = 0;
        var avg   = 0;
        var min   = BIOM_MATRIX.data[i][0];
        var max   = 0;
        var sd    = 0;
        for (var da in BIOM_MATRIX.data[i]) {
          var cnt = BIOM_MATRIX.data[i][da];
          var ds_num = (parseInt(da)+1).toString()
          var pct =  (cnt * 100 / BIOM_MATRIX.column_totals[da]).toFixed(2);
          var id  = 'fq/'+BIOM_MATRIX.rows[i].id+'/'+ds_num+') '+BIOM_MATRIX.columns[da].id+'/'+cnt.toString()+'/'+pct.toString();
          html += "<td id='"+id+"' class='tooltip_viz right_justify tax_data'>"+cnt.toString()+'</td>';
          tot += cnt;
          if(cnt > max){
            max = cnt
          }
          if(cnt < min){
            min = cnt
          }

        }

        avg = (tot/(BIOM_MATRIX.columns).length).toFixed(2)
        sd = standardDeviation(BIOM_MATRIX.data[i]).toFixed(2)
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
      for (var m in BIOM_MATRIX.column_totals){
        var total;
        if(visual_post_items.normalization == 'frequency'){
          total = BIOM_MATRIX.column_totals[m].toFixed(6);
        }else{
          total = BIOM_MATRIX.column_totals[m];
        }
        html += "<td title='Column Sum' class='right_justify'>" + total + "</td>";
      }
      
      html += "<td></td><td></td><td></td><td></td><td></td>"
      html += "</tr>";
      html += "</table>";
      console.log(html)



        var outfile_name = ts + '-counts_table-api.html'
        outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
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

    })

},  // end counts_matrix
//
//   DISTANCE HEATMAP
//
dheatmap: function(req, res){
    console.log('In function: images/dheatmap')

    var ts = visual_post_items.ts
    matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')
    console.log(matrix_file_path)
    
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    //var biom_file_path = path.join(config.PROCESS_DIR,'tmp', biom_file_name);
    //console.log('mtx1')

    var html = '';
    var title = 'VAMPS';

    var distmtx_file_name = ts+'_distance.csv';
    var distmtx_file = path.join(config.PROCESS_DIR,'tmp',distmtx_file_name);
    var dist_json_file_path = path.join(config.PROCESS_DIR,'tmp', ts+'_distance.json')
    var options = {
     scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
       args :       [ '-in', matrix_file_path, '-metric', visual_post_items.selected_distance, '--function', 'dheatmap', '--outdir', path.join(config.PROCESS_DIR,'tmp'), '--prefix', ts],
     };

    var log = fs.openSync(path.join(config.PROCESS_DIR,'logs','visualization.log'), 'a');

    console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
    var heatmap_process = spawn( options.scriptPath+'/distance.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
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
                var html = create_hm_table(req, JSON.parse(distance_matrix))
                var outfile_name = ts + '-dheatmap-api.html'
                outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
                console.log('outfile_path:',outfile_path)
                result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
                console.log(result)
                //res.send(outfile_name)
                data = {}
                data.html = html
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
    console.log('In function: images/fheatmap')
    var ts = visual_post_items.ts
    matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')
    console.log(matrix_file_path)
    
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    var options = {
        scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
        args :       [ pwd, visual_post_items.selected_distance, ts, visual_post_items.tax_depth],
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
    });
    stderr = '';
    fheatmap_process.stderr.on('data', function fheatmapProcessStderr(data) {
          stderr += data;
    });
    
    fheatmap_process.on('close', function fheatmapProcessOnClose(code) {
        console.log('fheatmap_process process exited with code ' + code);
        //distance_matrix = JSON.parse(output);
        //var last_line = ary[ary.length - 1];
        if(code === 0){   // SUCCESS
            var svgfile_name  = ts + '_fheatmap.svg'  // must match file name written in R script: dendrogram.R
            svgfile_path = path.join(config.PROCESS_DIR,'tmp', svgfile_name);  // file name save to user_location
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
  console.log('In function: images/piecharts')
  d3 = require('d3');
  // see: https://bl.ocks.org/tomgp/c99a699587b5c5465228
  var jsdom = require('jsdom');
  var ts = visual_post_items.ts

  var imagetype = 'group'

  matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')
  fs.readFile(matrix_file_path, 'utf8', function(err, data){
    if (err) {
        var msg = 'ERROR Message '+err;
        console.log(msg)
    }else{

      BIOM_MATRIX = JSON.parse(data)


    var unit_list = [];
    for (var n in BIOM_MATRIX.rows){
        unit_list.push(BIOM_MATRIX.rows[n].id);
    }

    //colorsX = {}
    var total = 0
    for(n in BIOM_MATRIX.rows){
      if(imagetype == 'single'){
        //colorsX[mtx.rows[n].id] = get_random_color()
        total +=  parseInt(BIOM_MATRIX.data[n])
      }else{
        //colorsX[mtx.rows[n].id] = string_to_color_code(mtx.rows[n].id)
      }
    }
    var ds_count = BIOM_MATRIX.shape[1];
    var tmp={};
    var tmp_names={};
      for (var d in BIOM_MATRIX.columns){
        tmp[BIOM_MATRIX.columns[d].id]=[]; // data
        //tmp_names[BIOM_MATRIX.columns[d].id]=mtx_local.columns[d].id; // datasets
      }
      for (var x in BIOM_MATRIX.data){
        for (var y in BIOM_MATRIX.columns){
          tmp[BIOM_MATRIX.columns[y].id].push(BIOM_MATRIX.data[x][y]);
        }
      }
      var mtxdata={};
      mtxdata.names=[];
      mtxdata.values=[];

      for (var z in tmp) {
          mtxdata.names.push(z);
          mtxdata.values.push(tmp[z]);
          //myjson_obj.dids.push(z);
      }
    //alert(myjson_obj.names);
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

    
      jsdom.env({
        html:'',
        features:{ QuerySelector:true },
        done:function(errors, window){
          window.d3 = d3.select(window.document); //get d3 into the dom
          //  <svg><g transform="translate(250,250)"><path></path><path></path></g></svg>
          var svg = window.d3.select('body')
            .append('div').attr('class','container')
            .append('svg')
                .attr("xmlns", 'http://www.w3.org/2000/svg')
                .attr("width", image_w)
                .attr("height", image_h)
            .append('g')
              .attr("transform", "translate(" + 0 + "," + 0 + ")");
          // axis legends -- would like to rotate dataset names
          //props.y.domain(mtxdata.map(function(d) { return d.pjds; }));
          //props.x.domain([0, 100]);
        if(req.body.source == 'website'){
            var pies = svg.selectAll("svg")
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
              return '/visuals/bar_single?id='+BIOM_MATRIX.columns[i].id+'&ts='+ts+'&orderby=alpha&val=z';
            })
            .attr("target", '_blank' );
        }else{
            var pies = svg.selectAll("svg")
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
                          return BIOM_MATRIX.columns[i].id;
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
              
              
              var html = window.d3.select('.container').html()
              var outfile_name = ts + '-piecharts-api.svg'
              outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
              console.log('outfile_path:',outfile_path)
              result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
              console.log(result)
              data = {}
              data.html = html
              data.filename = outfile_name
              //res.send(outfile_name)
              res.json(data)

        }
      })



      } // end else
    }); // end readFile matrix

},  // end piecharts
//
//   BAR CHARTS
//
barcharts: function(req, res){
  console.log('In function: images/barcharts')
  d3 = require('d3');
  // see: https://bl.ocks.org/tomgp/c99a699587b5c5465228
  var jsdom = require('jsdom');
  var ts = visual_post_items.ts

  var imagetype = 'group'


  matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')
  fs.readFile(matrix_file_path, 'utf8', function(err, data){
    if (err) {
        var msg = 'ERROR Message '+err;
        console.log(msg)
    }else{

      BIOM_MATRIX = JSON.parse(data)
      //console.log(BIOM_MATRIX)
      var ds_count = BIOM_MATRIX.shape[1];
      var props = get_image_properties(imagetype, ds_count);
      mtxdata = [];
      for (var p in BIOM_MATRIX.columns){
        tmp={};
        tmp.pjds = BIOM_MATRIX.columns[p].id;
        tmp.did = BIOM_MATRIX.columns[p].did;
        //did_by_names[tmp.pjds]=mtx_local.columns[p].did;
        for (var t in BIOM_MATRIX.rows){
          tmp[BIOM_MATRIX.rows[t].id] = BIOM_MATRIX.data[t][p];
          //tmp[mtx_local.rows[t].id] = mtx_local.data[p][t];
        }
        mtxdata.push(tmp);
      }
      var scaler = d3.scaleOrdinal()
        .range( BIOM_MATRIX.rows );
      scaler.domain(d3.keys(mtxdata[0]).filter(function(key) { return key !== "pjds" && key !== "did"; }));
      mtxdata.forEach(function(d) {
        var x0 = 0;
        d.unitObj = scaler.domain().map(function(name) {
          return { tax: name, x0: x0, x1: x0 += +d[name], did: d.did, pjds: d.pjds, cnt: d[name] };
        });
        //console.log(d.unitObj);
        d.total = d.unitObj[d.unitObj.length - 1].x1;
        //console.log(d.total);
      });
      mtxdata.forEach(function(d) {
        // normalize to 100%
        tot = d.total;
        d.unitObj.forEach(function(o) {
            //console.log(o);
            o.total = tot
            o.x0 = (o.x0*100)/tot;
            o.x1 = (o.x1*100)/tot;
        });
      });

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
                .attr("width", props.width)
                .attr("height", props.height)
            .append('g')
              .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
          // axis legends -- would like to rotate dataset names
          props.y.domain(mtxdata.map(function(d) { return d.pjds; }));
          props.x.domain([0, 100]);

          if(imagetype=='single'){
            create_singlebar_svg_object(req, svg, props, mtxdata, ts);
          }else if(imagetype=='double'){
            create_doublebar_svg_object(req, svg, props, mtxdata, ts);
          }else{  // group
            create_bars_svg_object(req, svg, props, mtxdata, ts);
          }



          //fs.writeFileSync('test.svg', window.d3.select('.container').html()) //using sync to keep the code simple
          //console.log('inwin2 ',window.d3.select('.container').html())
          var html = window.d3.select('.container').html()
          var outfile_name = ts + '-barcharts-api.svg'
          outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
          console.log('outfile_path:',outfile_path)
          result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
          console.log(result)
          data = {}
          data.html = html
          data.filename = outfile_name
          //res.send(outfile_name)
          res.json(data)

        }
      })

} // end else
}) // end fs.readFile

},  // end barcharts

metadata_csv: function(req, res){
    console.log('in metadata_csv')
    var ts = visual_post_items.ts
    try{
        var ds_order = JSON.parse(req.body.ds_order)
    }catch(e){
        var ds_order = req.body.ds_order
    }
    mdobj = helpers.get_metadata_obj_from_dids(ds_order)
    console.log(ds_order)
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
    console.log('item_obj',item_obj)
    
    item_list = Object.keys(item_obj)
    
    item_list.sort()
    console.log(item_list)
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
    outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
    console.log('outfile_path:',outfile_path)
    result = save_file(html, outfile_path) // this saved file should now be downloadable from jupyter notebook
    console.log(result)
    data = {}
    data.html = html
    data.filename = outfile_name
    res.json(data)


},

adiversity: function(req, res){
    console.log('in adiversity')
    var ts = visual_post_items.ts
    matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')
    console.log(matrix_file_path)
    
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    //var biom_file_path = path.join(config.PROCESS_DIR,'tmp', biom_file_name);
    //console.log('mtx1')

    var html = '';
    var title = 'VAMPS';

    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-in', matrix_file_path, '--site_base', process.env.PWD, '--prefix', ts],
    };

    var log = fs.openSync(path.join(config.PROCESS_DIR,'logs','visualization.log'), 'a');

    console.log(options.scriptPath+'alpha_diversity.py '+options.args.join(' '));
    var alphadiv_process = spawn( options.scriptPath+'/alpha_diversity.py', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe' // stdin, stdout, stderr
        });
        
    var output = '';

    alphadiv_process.stdout.on('data', function adiversityProcessStdout(data) {
          data = data.toString().trim();
          console.log(data)
          output += data;

    });

    stderr = '';
    alphadiv_process.stderr.on('data', function adiversityProcessStderr(data) {
        data = data.toString();
        console.log(data)
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
            outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
            console.log('outfile_path:',outfile_path)
            result = save_file(output, outfile_path) // this saved file should now be downloadable from jupyter notebook
            console.log(result)
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
    console.log('in dendrogram2')
    ///groups/vampsweb/vampsdev/seqinfobin/bin/Rscript --no-save --slave --no-restore tree_create.R avoorhis_4742180_normalized.mtx horn avoorhis_4742180 trees
    //console.log(phylo)
    var ts = visual_post_items.ts
    matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')
    console.log(matrix_file_path)
    
    var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
    //var biom_file_path = path.join(config.PROCESS_DIR,'tmp', biom_file_name);
    //console.log('mtx1')
    
    var metric = visual_post_items.selected_distance;
    var html = '';
    var title = 'VAMPS';
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ req.CONFIG.PROCESS_DIR, metric, ts ],
    };

    var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
    console.log(options.scriptPath+'/dendrogram2.R '+options.args.join(' '));
    var dendrogram_process = spawn( options.scriptPath+'/dendrogram2.R', options.args, {
            env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
            detached: true,
            //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
            stdio: 'pipe'  // stdin, stdout, stderr
    });

    var output = '';
    dendrogram_process.stdout.on('data', function dendrogramProcessStdout(data) {
        console.log('stdout: ' + data);
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
            svgfile_path = path.join(config.PROCESS_DIR,'tmp', svgfile_name);  // file name save to user_location
            fs.readFile(svgfile_path, 'utf8', function(err, contents){
                if(err){ res.send('ERROR reading file');return}
                
                //console.log(contents)
                var data = {}
                data.html = contents
                data.filename = svgfile_name   // returns data and local file_name to be written to 
                res.json(data) 
                return         
            
            })
            //outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
            //console.log('outfile_path:',outfile_path)
            //
            //console.log(result)
            
          
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
    console.log('in phyloseq')
    var ts = visual_post_items.ts
    //var rando = Math.floor((Math.random() * 100000) + 1);  // required to prevent image caching
    var metric = visual_post_items.selected_distance
    var tax_depth = visual_post_items.tax_depth
    var options = {
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ req.CONFIG.PROCESS_DIR, metric, ts, tax_depth ],
    };
    console.log(options.scriptPath+'/phyloseq_test.R'+' '+options.args.join(' '));
    var phyloseq_process = spawn( options.scriptPath+'/phyloseq_test.R', options.args, {
            env:{'PATH':req.CONFIG.PATH},
            detached: true,
            //stdio: [ 'ignore', null, log ]
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
                svgfile_path = path.join(config.PROCESS_DIR,'tmp', svgfile_name);  // file name save to user_location
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
            console.log('ERROR-2');
            html = "Phyloseq Error: Try selecting more data, deeper taxonomy or excluding 'NA's"
          }
         

    });
},
// dendrogram: function(req, res){
//     console.log('in dendrogram')
//     //d3 = require('d3');
//     //newick = require('newick.js')
//     //eval(require('fs').readFileSync('./public/javascripts/newick.js', 'utf8'));
//     //eval(require('fs').readFileSync('./public/javascripts/d3.phylogram.js', 'utf8'));
//     //phylo_path = path.join(config.PROCESS_DIR,'public','javascripts','d3.phylogram.js')
//     
//     //console.log(phylo_path)
//     //phylo = require(phylo_path)
//     //console.log(phylo)
//     var ts = visual_post_items.ts
//     matrix_file_path = path.join(config.PROCESS_DIR,'tmp',ts+'_count_matrix.biom')
//     console.log(matrix_file_path)
//     
//     var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
//     //var biom_file_path = path.join(config.PROCESS_DIR,'tmp', biom_file_name);
//     //console.log('mtx1')
//     var image_type = 'd3'
//     var metric = visual_post_items.selected_distance;
//     var html = '';
//     var title = 'VAMPS';
//     var options = {
//       scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
//       args :       [ '-in', matrix_file_path, '-metric', metric, '--function', 'dendrogram', '--outdir', path.join(pwd,'tmp'), '--prefix', ts ],
//     };
// 
//     var log = fs.openSync(path.join(pwd,'logs','visualization.log'), 'a');
//     console.log(options.scriptPath+'/distance.py '+options.args.join(' '));
//     var dendrogram_process = spawn( options.scriptPath+'/distance.py', options.args, {
//             env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
//             detached: true,
//             //stdio: [ 'ignore', null, log ] // stdin, stdout, stderr
//             stdio: 'pipe'  // stdin, stdout, stderr
//     });
// 
//     var stdout = '';
//     dendrogram_process.stdout.on('data', function dendrogramProcessStdout(data) {
//         //
//         //data = data.toString().replace(/^\s+|\s+$/g, '');
//         data = data.toString();
//         stdout += data;
// 
//     });
//     var stderr = '';
//     dendrogram_process.stderr.on('data', function dendrogramProcessStderr(data) {
//         //console.log('stderr: ' + data);
//         //data = data.toString().replace(/^\s+|\s+$/g, '');
//         data = data.toString();
//         stderr += data;
//     });
// 
//     dendrogram_process.on('close', function dendrogramProcessOnClose(code) {
//         console.log('dendrogram_process process exited with code ' + code);
// 
//         //var last_line = ary[ary.length - 1];
//         if(code === 0){   // SUCCESS
//           if(image_type == 'd3'){
//                    console.log(stdout)
//                    //  if(req.CONFIG.site == 'vamps' ){
// //                       console.log('VAMPS PRODUCTION -- no print to log');
// //                     }else{
// //                         console.log('stdout: ' + stdout);
// //                     }
//                     lines = stdout.split('\n')
//                     for(n in lines){
//                       if(lines[n].substring(0,6) == 'NEWICK' ){
//                         tmp = lines[n].split('=')
//                         continue
//                       }
//                     }
// 
// 
//                     try{
//                       newick_json = JSON.parse(tmp[1]);
//                       //var newick = Newick.parse(tmp[1]);
//                       if(req.CONFIG.site == 'vamps' ){
//                         console.log('VAMPS PRODUCTION -- no print to log');
//                       }else{
//                         console.log('newick-01',newick_json)
//                       }
//                     }
//                     catch(err){
//                       newick_json = {"ERROR":err};
//                     }
//                     
//                     
//                     //console.log('newick',newick_json)
//                     var outfile_name = ts + '_newick.tre'
//                     //outfile_path = path.join(config.PROCESS_DIR,'tmp', outfile_name);  // file name save to user_location
//                     //console.log('outfile_path:',outfile_path)
//                     //result = save_file(newick, outfile_path) // this saved file should now be downloadable from jupyter notebook
//                     //console.log(result)
//                     var data = {}
//                     data.html = newick_json
//                     data.filename = outfile_name
//                     res.json(data)
//                     return;
// 
//           }else{  // 'pdf'
// //                     var viz_width = 1200;
// //                     var viz_height = (visual_post_items.no_of_datasets*12)+100;
// //                     var image = '/'+ts+'_dendrogram.pdf';
// //                     //console.log(image)
// //                     html = "<div id='pdf'>";
// //                     html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='100%' height='"+viz_height+"' />";
// //                     html += " <p>ERROR in loading pdf file</p>";
// //                     html += "</object></div>";
// //                     res.send(html);
// //                     return;
//           }
//         }else{
//           console.log('stderr: '+stderr);
//           res.send('Script Error');
//         }
//     });
// 
// }    

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
          .attr("xlink:xlink:href",  function(d) { return '/visuals/bar_single?id='+d.pjds+'&ts='+ts+'&order=alphaDown';} )
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


  }else{
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
function create_hm_table(req, dm){

    var colors   = req.CONSTS.HEATMAP_COLORS
    var no       = chosen_id_name_hash.names
    var id_order = chosen_id_name_hash.ids
    var html = ''
    html += "<center>"
    if(req.body.source == 'website'){
        html += "<center>"
        html += "	<small>"
        html += "      <span id='dragInfoArea' > ** Drag a row to change the dataset order. **</span>"
        html += "    </small>"
        html += "</center>"
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
	
    for(i=1; i<=no.length; i++) {
        html += "<td><div class='cell'></div></td>"
    }
        html += "</tr>"
    k=1
    for(var n in no) {
        var x = no[n] 
        if(req.body.source == 'website'){
            html += "<tr id='"+x+"'>"
        }else{
            html += "<tr id='"+x+"' style='line-height:11px;'>"
        }
        html += "<td  id='"+x+"' class='dragHandle ds_cell'>"+k+"</td>"
        html += "<td class='dragHandle ds_cell' ><input type='hidden' name='ds_order[]' value='"+ id_order[n] +"' >"+x+"</td>"
        for(var m in no) { 
            var y = no[m] 
            if(x in dm && y in dm[x]){ 
                var d = dm[x][y].toFixed(5);  
                var sv = Math.round( dm[x][y] * 15 ); 
            } else{ 
                  var d = 1 
                  var sv = 1 * 15 
            }
            var id = 'dh/'+x+'/'+y+'/'+ visual_post_items.selected_distance +'/'+d; 
            if(x === y){
                html += "<td id='' class='heat_map_td' bgcolor='#000'></td>"
            }else{ 
                if(req.body.source == 'website'){
                    html += "<td id='"+id+"' class='heat_map_td tooltip_viz' bgcolor='#"+ colors[sv]+"'"                
                    html += " onclick=\"window.open('/visuals/bar_double?did1="+ id_order[n] +"&did2="+ id_order[m] +"&ts="+visual_post_items.ts+"&dist="+ d +"&order=alphaDown', '_blank')\"  >"
                    html += "&nbsp;&nbsp;&nbsp;&nbsp;"  <!-- needed for png image -->
                }else{
                    var title = x+'&#13;'+y+'&#13;'+ visual_post_items.selected_distance +' -- '+d;
                    html += "<td title='"+title+"' class='heat_map_td' bgcolor='#"+ colors[sv]+"'"
                }
                html += "</td>"
            }


        }
        k++
        html += "</tr>"

    }
    html += "</table>"
    html += "</form>"
    html += "</center>"
/////////////////////
  return html
  
  
  
  
  
//   html += '<center>'
//   //html = "<div id='distance_matrix' style='visibility:hidden'>"+ dm +"</div>"
// 
//   html += "<table border='1' id='drag_table' class='heatmap_table center_table' style='border-collapse: collapse;' >"
//   	html += "<tr class='nodrag nodrop' ><td></td>"
//   	   html += '<td>'
//   		  html += "<div id='ds_save_order_div'>"
//             html += "<span class='label blue' bgcolor='blue'>Similar (blue-0.0)</span> <span class='label red' bgcolor='red'>Dissimilar (red-1.0)</span>"
//   			  html += "<imput type='hidden' id='' name='resorted' value='1' >"
//   		  html += '</div>'
//   	   html += '</td>'
//   		for(i=1; i<=no.length; i++) {
//   	          html += "<td><div class='cell'></div></td>"
//   		}
//   	  html += '</tr>'
//   		 k=1
//   		 for(var n in no) {
//   		  	  var x = no[n]
//   	        html += "<tr id='"+ x +"'>"
//   	        html += "<td  id='"+ x +"' class='dragHandle ds_cell'>"+ k +"</td>"
//   	        html += "<td class='dragHandle ds_cell' ><input type='hidden' name='ds_order[]' value='"+ id_order[n]+"' >"+ x +"</td>"
//   		      for(var m in no) {
//   		          var y = no[m]
//                 //console.log('x',x,'y',y)
//   		 			    if(dm.hasOwnProperty(x) && dm[x].hasOwnProperty(y)){
//   							      var d = dm[x][y].toFixed(5);
//   		      		      var sv = Math.round( dm[x][y] * 15 );
//   		 			    }else{
//   		                var d = 1
//   		                var sv = 1 * 15
//   					    }
//   		     	    var id = '';
//   		          if(x === y){
//   		        	    	html += "<td id='' class='heat_map_td' bgcolor='#000'></td>"
//   		          }else{
//   	                  html += "<td id='"+id+"' title='Distance: "+d+"' class='heat_map_td tooltip_viz' bgcolor='#"+colors[sv]+"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>"
//   		          }
//   		  	}
//   		  	k++
//   	html += '</tr>'
// 
//   }
//   html += '</table>'
//   html += '</center>'
//   return html
}
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
    fs.writeFileSync(file_path, data)
    return 'Success'
  // fs.writeFileSync(file_path, data, function writeFile(err) {
//     if(err){
//       return err
//     }else{
//       return 'Success'
//     }
//   })
}
