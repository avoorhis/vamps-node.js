


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
// 	  // referer
//     //window.location='visuals_index';
//     window.location=document.referrer;
//   });
// }

//
// SAVE DATASET LIST
//
var save_datasets_list = function(ds_local, user)
{
	
    var timestamp = +new Date();  // millisecs since the epoch!
    
	var filename = 'datasets:' + timestamp + '.json';
    
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
		 	document.getElementById('save_ds_result').innerHTML = "Saved as: <a href='/visuals/saved_datasets'>"+ filename+ "</a>"
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

function create_barcharts(imagetype) {

        var ts = pi_local.ts;
       
		var barcharts_div = document.getElementById('barcharts_div');
		barcharts_div.style.display = 'block';
        
        //document.getElementById('pre_barcharts_table_div').style.display = 'block';
        var unit_list = [];
        for (var o in mtx_local.rows){
            unit_list.push(mtx_local.rows[o].name);
        }
        var colors = get_colors(unit_list);

        data = [];
        did_by_names ={}
        for (var p in mtx_local.columns){
          tmp={};
          tmp.datasetName = mtx_local.columns[p].name;
		  did_by_names[tmp.datasetName]=mtx_local.columns[p].did;
		  //tmp.did = mtx_local.columns[p].did;
          for (var t in mtx_local.rows){
            tmp[mtx_local.rows[t].name] = mtx_local.data[t][p];
          }
          data.push(tmp);
        }
        

        var ds_count = mtx_local.shape[1];      
        
        var props = get_image_properties(imagetype,ds_count); 
        //console.log(props)
        var color = d3.scale.ordinal()                  
          .range( colors );

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "datasetName"; }));

        
        data.forEach(function(d) {
          var x0 = 0;
          d.unitObj = color.domain().map(function(name) { 
            return { name: name, x0: x0, x1: x0 += +d[name] }; 
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
              o.x0 = (o.x0*100)/tot;
              o.x1 = (o.x1*100)/tot;
          });
        });
      
	  
		var svg = d3.select("#barcharts_div").append("svg")
            .attr("width",  props.width)
            .attr("height", props.height)
          .append("g")
            .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
  	      // axis legends -- would like to rotate dataset names
  	      props.y.domain(data.map(function(d) { return d.datasetName; }));
  	      props.x.domain([0, 100]);	
			
        if(imagetype=='single'){
        	create_singlebar_svg_object(svg,props, did_by_names, data, ts)
        }else{
        	create_svg_object(svg,props, did_by_names, data, ts);
        }
}
//
//
//
function create_singlebar_svg_object(svg,props, did_by_names, data, ts) {

	       var datasetBar = svg.selectAll(".bar")
	          .data(data)
	        .enter() .append("g")
	          .attr("class", "g")
	          .attr("transform", function(d) { return  "translate(0, " + props.y(d.datasetName) + ")"; })


	       var gnodes = datasetBar.selectAll("rect")
	           .data(function(d) { return d.unitObj; })
	           .enter()
	             .append('a').attr("xlink:href",  function(d) {
				     return 'sequences?did='+mtx_local.did+'&taxa='+encodeURIComponent(d.name);
				  }).style("fill",   function(d) { return string_to_color_code(d.name); });

	       gnodes.append("rect")
	             .attr("x", function(d) { return props.x(d.x0); })
	             .attr("y", 15)  // adjust where first bar starts on x-axis
	             .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
	             .attr("height",  25)

	             .attr("id",function(d,i) {
	                var cnt =  mtx_local.data[i];
	                var total = mtx_local.total;
	                var pct = (cnt * 100 / total).toFixed(2);
	                var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct;
	                return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
	              })
				  .attr("class","tooltipx");
}
function create_svg_object(svg,props, did_by_names, data, ts) {
      

      // svg.append("g")
      //     .attr("class", "y axis")
      // 	      .style({  'stroke-width': '1px'})
      //     .call(props.yAxis)
      //     .selectAll("text")
      //        .style("text-anchor", "end")
      //        .attr("dx", "-.5em")
      //        .attr("dy", "1.4em");
             
             
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
          .append("a")
        .attr("xlink:xlink:href",  function(d) { return 'bar_single?did='+did_by_names[d.datasetName]+'&ts='+ts;} )
		  .attr("target", '_blank' );
  
  var labels = datasetBar.append("text")
            .attr("class", "y label")
			.attr("text-anchor", "end")
		  .style({"font-size":  "13px","font-weight":  "normal" })
            .attr("x", "-2")
            .attr("y", props.bar_height*2)
			.text(function(d) { return d.datasetName; })
			
			
      var gnodes = datasetBar.selectAll("rect")
          .data(function(d) { return d.unitObj; })
        .enter()
        
		
		.append("rect")
          .attr("x", function(d) { return props.x(d.x0); })
          .attr("y", 15)  // adjust where first bar starts on x-axis
          .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
          .attr("height",  18)
          .attr("id",function(d,i) { 
            var cnt =  this.parentNode.__data__[d.name];
            var total = this.parentNode.__data__['total'];
            
            //console.log(this._parentNode.__data__['total']);
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct; 
            return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 

          .attr("class","tooltipx")
          .style("fill",   function(d,i) { return string_to_color_code(d.name); });


       //rect.append("svg:a").attr("xlink:href",  'http://www.google.com')
}

function get_image_properties(imagetype, ds_count) {
  var props = {};
  var gap = 2;  // gap on each side of bar
  if(imagetype=='single'){
	  props.bar_height = 20;
	  props.margin = {top: 20, right: 0, bottom: 20, left: 0};   
	  props.plot_width = 900;
	  props.width = props.plot_width + props.margin.left + props.margin.right;
	  props.height = (ds_count * (props.bar_height + 2 * gap)) + 125;
  
	  props.x = d3.scale.linear().rangeRound([0, props.plot_width]);
    
	  props.y = d3.scale.ordinal()
	      .rangeBands([0, (props.bar_height + 2 * gap) * ds_count]);
    
	  // props.xAxis = d3.svg.axis()
 // 	          .scale(props.x)
 // 	          .orient("top");
 //
 // 	  props.yAxis = d3.svg.axis()
 // 	          .scale(props.y)
 // 	          .orient("left");
  }else{
	  props.bar_height = 15;
	  //props.margin = {top: 20, right: 20, bottom: 300, left: 50};
	  props.margin = {top: 20, right: 100, bottom: 20, left: 300};
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
function get_colors(unit_names){
  var colors = [];
  for(var n in unit_names){
    //alert(unit_names[n]);
    col = string_to_color_code(unit_names[n]);
    //console.log(col);
    colors.push(col);
  }
  return colors;
}

function string_to_color_code(str){
    var hash = 0;
    for(var i=0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 3) - hash);
    }
    var color = Math.abs(hash).toString(16).substring(0, 6);
    return "#" + '000000'.substring(0, 6 - color.length) + color;
}