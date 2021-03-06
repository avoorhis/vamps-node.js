


var save_datasets_btn = document.getElementById('save_datasets_btn') || null;
if (save_datasets_btn !== null) {
  save_datasets_btn.addEventListener('click', function () {
    save_datasets_list(ds_local,user_local);
  });
}

var reorder_datasets_btn = document.getElementById('reorder_datasets_btn') || null;
if (reorder_datasets_btn !== null) {

  reorder_datasets_btn.addEventListener('click', function () {
    //window.location='reorder_datasets';
    // form =
  });
}
// var change_datasets_btn = document.getElementById('change_datasets_btn') || null;
// if (change_datasets_btn !== null) {
//   change_datasets_btn.addEventListener('click', function () {
//    // referer
//     //window.location='visuals_index';
//     window.location=document.referrer;
//   });
// }
//
// TOGGLE_SIMPLE_TAXA
//
toggle_taxa_btn = document.getElementById('toggle_taxa_btn') || null;
if (toggle_taxa_btn !== null) {
  toggle_taxa_btn.addEventListener('click', function () {
      toggle_simple_taxa('simple_taxa_ckbx',toggle_taxa_btn);
  });
} 
function toggle_simple_taxa(ckbxclass, togglebtn)
{
  // page: unit_selection
  // units: taxonomy
  // toggles domain checkboxes on/off
  
  var boxes = document.getElementsByClassName(ckbxclass);
  var i;
  //alert(boxes)
  if (boxes[0].checked === false) {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = true;
          togglebtn.checked = true;
      }
  } else {
      for (i = 0; i < boxes.length; i++) {
          boxes[i].checked = false;
          togglebtn.checked = false;
    }
  }
}
//
// SAVE DATASET LIST
//
var save_datasets_list = function(ds_local, user)
{
    if(user=='guest'){
      document.getElementById('save_ds_result').innerHTML = "The 'guest' user is not permitted to save datasets.";
      return;
    }
    var timestamp = +new Date();  // millisecs since the epoch!

    var filename = 'datasets-' + timestamp + '.json';

    var args =  "datasets="+JSON.stringify(ds_local);
    args += "&filename="+filename;
    args += "&user="+user;
    //console.log('args '+args);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", '/visuals/save_datasets', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

       if (xmlhttp.readyState == 4 ) {
         var response = xmlhttp.responseText;
     //alert(string);
     if(response == 'OK'){
      document.getElementById('save_ds_result').innerHTML = "Saved as: <a href='/visuals/saved_elements'>"+ filename+ "</a>"
     }else{
      document.getElementById('save_ds_result').innerHTML = 'Problem: Not Saved'
     }
       }
    };
    xmlhttp.send(args);

}

//
// PIES and BARS
//
function create_piecharts(imagetype, ts, mtx) {
    //alert(imagetype)  // this is single only: per taxonomy
    //console.log('in create_piecharts  -PIE')
      var unit_list = [];
      for (var n in mtx.rows){
          unit_list.push(mtx.rows[n].id);
      }

      //colorsX = {}
      var total = 0
      for(n in mtx.rows){
        if(imagetype == 'single'){
          //colorsX[mtx.rows[n].id] = get_random_color()
          total +=  parseInt(mtx.data[n])
        }else{
          //colorsX[mtx.rows[n].id] = string_to_color_code(mtx.rows[n].id)
        }
      }

    var tmp={};
    var tmp_names={};
    for (var d in mtx.columns){  // datasets
      tmp[mtx.columns[d].id]=[]; // tmp[taxname] = []
      //tmp_names[mtx_local.columns[d].id]=mtx_local.columns[d].id; // datasets
    }
    for (var x in mtx.data){
      for (var y in mtx.columns){
        tmp[mtx.columns[y].id].push(mtx.data[x][y]);
      }
    }
    var myjson_obj={};
    myjson_obj.dids=[];
    myjson_obj.values=[];
    //myjson_obj.dids=[];
    for (var z in tmp) {
        myjson_obj.dids.push(z);
        myjson_obj.values.push(tmp[z]);
        //myjson_obj.dids.push(z);
    }
  //alert(myjson_obj.names);
    if(imagetype == 'single'){
      var pies_per_row = 1;
      var m = 20; // margin
      var r = 120; // five pies per row

    }else{
      var pies_per_row = 4;
      var m = 20; // margin
      var r = 320/pies_per_row; // five pies per row

    }

    var image_w = 2*(r+m)*pies_per_row;
    var image_h = Math.ceil(myjson_obj.values.length / 4 ) * ( 2 * ( r + m ) )+ 30;
    var arc = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(r);
    var pie = d3.layout.pie();

    var svgContainer = d3.select("#piecharts_div").append("svg")
        .attr("width", image_w)
        .attr("height", image_h)
        .attr("id", 'piecharts_'+ts)
        .attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        //.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

    var pies = svgContainer.selectAll("svg")
        .data(myjson_obj.values)
        .enter().append("g")
        .attr("transform", function(d, i){

            var modulo_i = i+1;
            var diam = r+m;
            var h_spacer = diam*2*(i % pies_per_row);
            var v_spacer = diam*2*Math.floor(i / pies_per_row);
            return "translate(" + (diam + h_spacer) + "," + (diam + v_spacer) + ")";
        })



  pies.append("text")
        .attr("dx", -(r+m))
        .attr("dy", r+m)
        .attr("text-anchor", "center")
        .attr("font-size","9px")
        .text(function(d, i) {
            if(imagetype == 'single'){
              return 'SumCount: '+total.toString()
            }else{
              return mtx.columns[i].id;
            }
        });
    pies.selectAll("path")
        .data(pie.sort(null))
        .enter()
        .append("a").attr("xlink:xlink:href", function(d, i) {            
              return '/visuals/bar_single?did='+mtx.rows[i].did+'&ts='+ts+'&orderby=alpha&val=z';            
          }).attr("target", '_blank' )
        .append("path")
        .attr("d", arc)
        
        .attr("id",function(d, i) {
            var cnt = d.value;
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'pc/'+unit_list[i]+'/'+cnt.toString()+'/'+pct;
            return id;
        })
        .attr("class","tooltip_viz")
        
        .style("fill", function(d, i) {
            
            return string_to_color_code(unit_list[i])

        });



}
//
//  BAR CHARTS
//
function create_barcharts(imagetype, ts, mtx, new_order) {
        //alert(imagetype)
        //alert(JSON.stringify(new_order))

        var barcharts_div = document.getElementById('barcharts_div');
        barcharts_div.innerHTML = ""
        barcharts_div.style.display = 'block';

        var unit_list = [];
        for (var n in mtx.rows){
            unit_list.push(mtx.rows[n].id);
        }
        // function is in this file
        var select_random = false
        //var colors = get_colors(unit_list, select_random);


        data = [];
        //did_by_names ={}
        for (var p in mtx.columns){

          tmp={};
          tmp.datasetName = mtx.columns[p].id;
          tmp.did = mtx.columns[p].did;
          //did_by_names[tmp.datasetName]=mtx_local.columns[p].did;
          for (var t in mtx.rows){
            tmp[mtx.rows[t].id] = mtx.data[t][p];
            //tmp[mtx_local.rows[t].id] = mtx_local.data[p][t];
          }
          data.push(tmp);
        }


        var ds_count = mtx.shape[1];

        var props = get_image_properties(imagetype, ds_count);
        //console.log(props)
        var scaler = d3.scale.ordinal()
          .range( mtx.rows );

        scaler.domain(d3.keys(data[0]).filter(function(key) { return key !== "datasetName" && key !== "did"; }));


        data.forEach(function(d) {
          var x0 = 0;
          d.unitObj = scaler.domain().map(function(name) {
            return { name: name, x0: x0, x1: x0 += +d[name], did: d.did, dsname: d.datasetName, cnt: d[name] };
          });
          //console.log(d.unitObj);
          d.total = d.unitObj[d.unitObj.length - 1].x1;
          //console.log(d.total);
        });


        data.forEach(function(d) {
          // normalize to 100%
          tot = d.total;
          d.unitObj.forEach(function(o) {
              //console.log(o);
              o.total = tot
              o.x0 = (o.x0*100)/tot;
              o.x1 = (o.x1*100)/tot;
          });
        });

    if(imagetype == 'group'){
        if(new_order.orderby == 'alpha'){
          if(new_order.alpha_value == 'a'){
            alpha_name = "Taxa Names <span class=\"glyphicon glyphicon-chevron-up\"></span>"
          }else{
            alpha_name = "Taxa Names <span class=\"glyphicon glyphicon-chevron-down\"></span>"
          }
          count_name = "Count <span class=\"glyphicon glyphicon-chevron-down\"></span>"
        }else{
          if(new_order.count_value == 'max'){
            count_name = "Count <span class=\"glyphicon glyphicon-chevron-up\"></span>"
          }else{
            count_name = "Count <span class=\"glyphicon glyphicon-chevron-down\"></span>"
          }
          alpha_name = "Taxa Names <span class=\"glyphicon glyphicon-chevron-down\"></span>"
        }
        var buttonNames = [{name:alpha_name,ref:"",orderby:"alpha",val:new_order.alpha_value},
                            {name: count_name,ref:"lnk3",orderby:"count",val:new_order.count_value}]
        d3.select("#barcharts_div").append("div")
              .attr("class","pull-left")
              .append("text").html("Re-ordering is applied to all the samples.<br>But only the first sample's values are used.<br>")
              .selectAll("input")
              .data(buttonNames)
              .enter()
              .append("a")
              .attr("class","btn btn-xs btn-success")
              .attr("href", '#')
              .html( function (d){return d.name;})
              .on("click", function (data,index){
                change_matrix_order(data.orderby, data.val)
              })
    }

    var svg = d3.select("#barcharts_div").append("svg")
            .attr("width",  props.width)
            .attr("height", props.height)
            .attr("id", 'barcharts_'+ts)
            .attr("version","1.1")
            .attr("xmlns","http://www.w3.org/2000/svg")
            //.attr("xmlns:xlink","http://www.w3.org/1999/xlink")
          .append("g")
            .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
    // axis legends -- would like to rotate dataset names
    props.y.domain(data.map(function(d) { return d.datasetName; }));
    props.x.domain([0, 100]);

    if(imagetype=='single'){
      //alert(filename)
      create_singlebar_svg_object(svg, props, data, ts);
    }else if(imagetype=='double'){
      create_doublebar_svg_object(svg, props, data, ts);
    }else{  // group
      //create_svg_object(svg,props, did_by_names, data, ts);
      create_svg_object(svg, props, data, ts);
    }
}
function change_matrix_order(orderby, value){
  order = {orderby:orderby,value:value}
  new_mtx = sort_json_matrix(mtx_local, order)
  new_order = {}
  new_order.orderby = orderby
  if(orderby == 'alpha' ){
      if(value == 'a'){
        new_order.alpha_value = 'z'
      }else{
        new_order.alpha_value = 'a'
      }
      new_order.count_value = 'min'
    }else{
      if(value == 'min'){
        new_order.count_value = 'max'
      }else{
        new_order.count_value = 'min'
      }
      new_order.alpha_value = 'a'
    }
  create_barcharts('group', pi_local.ts, new_mtx, new_order);
  $(pre_barcharts_div).scrollView();
}
//
//
//
function sort_json_matrix(mtx, fxn_obj) {
    // fxn must be one of min,max, alphaUp, alphaDown
    // else original mtx returned
    // sorts MATRIX by tax alpha or counts OF FIRST COLUMN only
    // Does not (yet) sort datasets
    obj = []
    for(i in mtx.data){
      obj.push({tax:mtx.rows[i],cnt:mtx.data[i]})
    }
    var reorder = false;

    if(fxn_obj.orderby == 'alpha'){
      if(fxn_obj.value == 'a'){
        obj.sort(function sortByAlpha(a, b) {
               return compareStrings_alpha(b.tax.id, a.tax.id)
        });
        reorder = true;
      }else{
        obj.sort(function sortByAlpha(a, b) {
               return compareStrings_alpha(a.tax.id, b.tax.id)
        });
        reorder = true;
      }
    }else if(fxn_obj.orderby == 'count'){
      if(fxn_obj.value == 'max'){
        obj.sort(function sortByCount(a, b) {
               return b.cnt[0] - a.cnt[0];
        });
        reorder = true;
      }else{
        obj.sort(function sortByCount(a, b) {
               return a.cnt[0] - b.cnt[0];
        });
        reorder = true;
      }
    }else{

    }

    if(reorder){
      mtx.rows = []
      mtx.data = []
      for(i in obj){
        //console.log(i,obj[i])
        mtx.rows.push(obj[i].tax)
        mtx.data.push(obj[i].cnt)
      }
    }
    return mtx

};
//
//
//
function create_doublebar_svg_object(svg, props, data, ts) {
        svg.append("g")
          .attr("class", "x axis")
          .style({'stroke-width': '1px'})
          .call(props.xAxis)
        .append("text")
          .attr("x", props.plot_width)
          .attr("dy", ".8em")
          .style("text-anchor", "end")
          .text("Percent");


       var datasetBar = svg.selectAll(".bar")
          .data(data)
        .enter() .append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return  "translate(0, " + props.y(d.datasetName) + ")"; })
          // .append("a")
          // .attr("xlink:xlink:href",  function(d) {
          //   return 'sequences?id='+d.datasetName+'&taxa='+encodeURIComponent(d.name)+'&filename='+filename;
          // })

          // .attr("target", '_blank' );


    var labels = datasetBar.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
        .style({"font-size":  "13px","font-weight":  "normal" })
      .attr("x", "-2")
      .attr("y", props.bar_height*2)
      .text(function(d) { return d.datasetName; })

    var labels = datasetBar.append("text")
      .style("text-anchor","start")
      .style({"font-size":  "13px","font-weight":  "normal" })
      .attr("x", props.plot_width+10)
      .attr("y", props.bar_height*2)
      .text(function(d) { return 'SumCount: '+d.total; })


    var gnodes = datasetBar.selectAll("rect")
          .data(function(d) { return d.unitObj; })
        .enter()
        .append('a').attr("xlink:href",  function(d,i) {
             //return 'sequences?did='+mtx_local.did+'&taxa='+encodeURIComponent(d.id);
             //alert(d.dsname)
             var filename = user_local+'_'+d.did+'_'+ts+'_sequences.json'
             return 'sequences?did='+d.did+'&taxa='+encodeURIComponent(d.name)+'&filename='+filename;
          }).style("fill",   function(d) { return string_to_color_code(d.name); })

        .append("rect")
          .attr("x", function(d) { return props.x(d.x0); })
          .attr("y", 15)  // adjust where first bar starts on x-axis
          .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
          .attr("height",  18)
          .attr("id",function(d,i) {
            //console.log(this.parentNode.__data__);
            var cnt =  d.cnt;  //this.parentNode.__data__[d.name];
            var total = d.total;  //this.parentNode.__data__['total'];

            //console.log(this._parentNode.__data__['total']);
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'bc/' + d.name + '/'+ cnt.toString() + '/' + pct;
            return id;
          })

          .attr("class","tooltip_viz")
          .style("fill",   function(d,i) {
                return string_to_color_code(d.name);
            });
}
//
//
//
function create_singlebar_svg_object(svg, props, data, ts) {

         //alert(JSON.stringify(data))
         var datasetBar = svg.selectAll(".bar")
            .data(data)
          .enter() .append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return  "translate(0, " + props.y(d.datasetName) + ")"; })


      var labels = datasetBar.append("text")
          .style("text-anchor","start")
          .style({"font-size":  "13px","font-weight":  "normal" })
          .attr("x", props.plot_width+10)
          .attr("y", props.bar_height*2)
          .text(function(d) { return 'SumCount: '+d.total; })

         var gnodes = datasetBar.selectAll("rect")
             .data(function(d) { return d.unitObj; })
             .enter()
               .append('a').attr("xlink:href",  function(d) {
             //return 'sequences?did='+mtx_local.did+'&taxa='+encodeURIComponent(d.id);
             var filename = user_local+'_'+d.did+'_'+ts+'_sequences.json'
             return 'sequences?did='+data[0].did+'&taxa='+encodeURIComponent(d.name)+'&filename='+filename;
          }).style("fill",   function(d) { return string_to_color_code(d.name); })

           .append("rect")
               .attr("x", function(d) { return props.x(d.x0); })
               .attr("y", 15)  // adjust where first bar starts on x-axis
               .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
               .attr("height",  25)

               .attr("id",function(d,i) {
                  var cnt =  d.cnt; //mtx_local.data[i];
                  var total = d.total;  //mtx_local.total;
                  var pct = (cnt * 100 / total).toFixed(2);
                  var id = 'bc/' + d.name + '/'+ cnt.toString() + '/' + pct;
                  return id;
                })
          .attr("class","tooltip_viz");
}
function create_svg_object(svg, props, data, ts) {

      svg.append("g")
          .attr("class", "x axis")
          .style({'stroke-width': '1px'})
          .call(props.xAxis)
        .append("text")
          .attr("x", props.plot_width)
          .attr("dy", ".8em")
          .style("text-anchor", "end")
          .text("Percent");

       var datasetBar = svg.selectAll(".bar")
          .data(data)
        .enter() .append("g")
          .attr("class", "g")
          .attr("transform", function(d) { console.log('props.y(d.datasetName)',props.y(d.datasetName));return  "translate(0, " + props.y(d.datasetName) + ")"; })
          .append("a")
          .attr("xlink:xlink:href",  function(d) { return '/visuals/bar_single?did='+d.did+'&ts='+ts+'&order=alphaDown';} )
          .attr("target", '_blank' );


  var labels = datasetBar.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
        .style({"font-size":  "13px","font-weight":  "normal" })
      .attr("x", "-2")
      .attr("y", props.bar_height*2)
      .text(function(d) { return d.datasetName; })

  var labels = datasetBar.append("text")
      .style("text-anchor","start")
      .style({"font-size":  "13px","font-weight":  "normal" })
      .attr("x", props.plot_width+10)
      .attr("y", props.bar_height*2)
      .text(function(d) { return 'SumCount: '+d.total; })


  var gnodes = datasetBar.selectAll("rect")
          .data(function(d) { return d.unitObj; })
        .enter()


    .append("rect")
          .attr("x", function(d) { return props.x(d.x0); })
          .attr("y", 15)  // adjust where first bar starts on x-axis
          .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
          .attr("height",  18)
          .attr("id",function(d,i) {
            //console.log(this.parentNode.__data__);
            var cnt =  this.parentNode.__data__[d.name];
            var total = this.parentNode.__data__['total'];

            //console.log(this._parentNode.__data__['total']);
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'bc/' + d.name + '/'+ cnt.toString() + '/' + pct;
            return id;
          })

          .attr("class","tooltip_viz")
          .style("fill",   function(d,i) {
          //return get_random_color()
          return string_to_color_code(d.name);
          });


       //rect.append("svg:a").attr("xlink:href",  'http://www.google.com')
}

function get_image_properties(imagetype, ds_count) {
  var props = {};
  var gap = 2;  // gap on each side of bar
  if(imagetype=='single'){
    props.bar_height = 20;
    props.margin = {top: 20, right: 150, bottom: 20, left: 0};
    props.plot_width = 900;
    props.width = props.plot_width + props.margin.left + props.margin.right;
    props.height = (ds_count * (props.bar_height + 2 * gap)) + 125;

    props.x = d3.scale.linear().rangeRound([0, props.plot_width]);

    props.y = d3.scale.ordinal()
        .rangeBands([0, (props.bar_height + 2 * gap) * ds_count]);


  }else{
    props.bar_height = 15;
    //props.margin = {top: 20, right: 20, bottom: 300, left: 50};
    props.margin = {top: 20, right: 150, bottom: 20, left: 300};
    props.plot_width = 650;
    props.width = props.plot_width + props.margin.left + props.margin.right;
    props.height = (ds_count * (props.bar_height + 2 * gap)) + 125;

    props.x = d3.scale.linear().rangeRound([0, props.plot_width]);

    props.y = d3.scale.ordinal()
        .rangeBands([0, (props.bar_height + 2 * gap) * ds_count]);

    props.xAxis = d3.svg.axis()
            .scale(props.x)
            .orient("top");

    props.yAxis = d3.svg.axis()
            .scale(props.y)
            .orient("left");
  }


  return props;
}
// function get_colors(unit_names, random){
//   var colors = [];
//   for(var n in unit_names){
//     //alert(unit_names[n]);
//     //if(random){
//         //col = get_random_color();
//         col = '#fff';
//         //alert(col)
//     //}else{
//         //col = string_to_color_code(unit_names[n]);
//     //}
//     //console.log(col);
//     colors.push(col);
//   }
//   return colors;
// }
// function string_to_color_code2(str) {
//     // requires seedrandom.js library
//     Math.seedrandom(str);
//     var rand = Math.random() * Math.pow(255,3);
//     Math.seedrandom(); // don't leave a non-random seed in the generator
//     for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((rand >> i++ * 8) & 0xFF).toString(16)).slice(-2));
//     //alert(colour)
//     return colour;
// }
function string_to_color_code(str) {
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
    color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777216)).toString(16);
    return '#' + Array(6 - color.length + 1).join('0') + color;
}
// function string_to_color_codeOLD(str){
//     var hash = 0;
//     for(var i=0; i < str.length; i++) {
//       hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     var color = Math.abs(hash).toString(16).substring(0, 6);
//     return "#" + '000000'.substring(0, 6 - color.length) + color;
// }
// function get_random_color(){
//   //return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
//   return '#' + Math.floor(Math.random() * 16777215).toString(16)
// }
// function string_to_color_codeX(str){
//     var hash = 0;
//     //str = str.split('--')[1]
//     //console.log(str.length)
//     for(var i=0; i < str.length; i++) {
//       if(str == 'ApD1'){
//         //console.log(str)
//         //console.log(i)
//         //console.log(str.charCodeAt(i))
//       }

//       hash = str.charCodeAt(i) + ((hash << 3) - hash);
//     }

//     var color = Math.abs(hash).toString(16).substring(0, 6);
//     color = "#" + '000000'.substring(0, 6 - color.length) + color;
//     console.log('str '+str)
//     console.log('color '+color)

//     return color
// }
// function djb2(str){
//   var hash = 5381;
//   for (var i = 0; i < str.length; i++) {
//     hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
//   }
//   return hash;
// }

// function string_to_color_code2(str) {
//   var hash = djb2(str);
//   var r = (hash & 0xFF0000) >> 16;
//   var g = (hash & 0x00FF00) >> 8;
//   var b = hash & 0x0000FF;
//   return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
// }
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
$(function() {
    $("#files").load("filelist");
    $("input[type='button']").click(function() {
      var formData = new FormData();
      if($('#myFile').val()=='') {
        alert("Please choose file!");
        return false;
      }
      $('div.progress').show();
      var file = document.getElementById('myFile').files[0];
      formData.append('uploadfile', file);
      var xhr = new XMLHttpRequest();
      xhr.open('post', 'visuals/fileUpload/', true);
      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          var percentage = (e.loaded / e.total) * 100;
          $('div.progress div').css('width', percentage.toFixed(0) + '%');
          $('div.progress div').html(percentage.toFixed(0) + '%');
        }
      };
      xhr.onerror = function(e) {
        alert('An error occurred while submitting the form. Maybe your file is too big');
      };
      xhr.onload = function() {
        var file = xhr.responseText;
        $('div.progress div').css('width','0%');
        $('div.progress').hide();
        showMsg("alert alert-success", "File uploaded successfully!");
        $('#myFile').val('');
      };
      xhr.send(formData);
      return false;
    });

  function showMsg(className, msg) {
    $("#msg").fadeIn();
    $("#files").load("filelist");
    $("#msg").addClass(className);
    $("#msg").html(msg);
    $("#msg").fadeOut(3000,function() {
      $("#msg").removeClass(className);
    });
  }
  $(document).on('click','#delete',function() {
    $(this).attr('href','javascript:void(0)');
    $(this).html("deleting..");
    var file = $(this).attr("file");
    $.ajax({
      url:'deleteFile/'+file,
      type:'GET',
      data:{},
      success:function(res){
        showMsg("alert alert-danger", "File deleted successfully!")
      }
    });
  });
});
