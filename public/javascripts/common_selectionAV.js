


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
function create_barcharts(imagetype, orderby, ts) {
        //alert(imagetype)
        //var ts = pi_local.ts;
       
		    var barcharts_div = document.getElementById('barcharts_div');
		    barcharts_div.style.display = 'block';
        
        
        // TAXONOMY
        var unit_list = [];
        var new_unit_hash = []
        var data_list = [];
        // rows == taxa // for orderby=='name'
        for (var o in mtx_local.rows){
            unit_list.push(mtx_local.rows[o].id);
            //new_unit_hash.push({tax:mtx_local.rows[o].id, cnt:mtx_local.data[o]})
        }

        // reorder by count
        //new_unit_hash.sort(sort_by('cnt',false, parseInt))
        //alert(new_unit_hash.toSource())
        // colors is a list -- will need rordering
        // make as colors[taxname] = color
        // or **colors = [{tax:taxname,color:color},{},{}]
        //var colors = get_colors(unit_list);
        //var colors = get_colors2(unit_list);
        // DATASETS
        data = [];
        for (var p in mtx_local.columns){  
          tmp={};
          tmp.datasetName = mtx_local.columns[p].id;
          tmp.did = mtx_local.columns[p].did;
		      //did_by_names[tmp.datasetName]=mtx_local.columns[p].did;
          for (var t in mtx_local.rows){
            // taxonomy - no order
            tmp[mtx_local.rows[t].id] = mtx_local.data[t][p];
            
          }
          data.push(tmp);
        }
        

        var ds_count = mtx_local.shape[1];      
        
        var props = get_image_properties(imagetype, ds_count); 
        
        var ul = d3.scale.ordinal().range( unit_list );

        ul.domain(d3.keys(data[0]).filter(function(key) { return key !== "datasetName" && key !== "did"; }));

        
        data.forEach(function(d) {
          var x0 = 0;
          d.unitObj = ul.domain().map(function(name) { 
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
      
	  //alert(data.toSource())
		var svg = d3.select("#barcharts_div").append("svg")
            .attr("width",  props.width)
            .attr("height", props.height)
          .append("g")
            .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
  	      // axis legends -- would like to rotate dataset names
  	      props.y.domain(data.map(function(d) { return d.datasetName; }));
  	      props.x.domain([0, 100]);	
			
    if(imagetype=='single'){
        //create_singlebar_svg_object(svg, props, data, orderby, filename);
    }else if(imagetype=='double'){
        create_doublebar_svg_object(svg, props, data, ts);
    }else{
        // FOR BARCHART STACK:
        create_stacked_svg_object(svg, props, data, ts);
    }
}
//
//
//
function create_singlebar_svg_object(orderby, dataset, filename) {
  //bar_type, 'name',
        //alert(data[0].unitObj.toSource())
        //alert(data.toSource())
// data:
//  [{
//   datasetName:"CMP_JJ_Bv5v6--ApD1", 
//   did:"71", 
//   'Archaea;Euryarchaeota':1, 'Bacteria;Acidobacteria':1, 'Bacteria;Bacteroidetes':1449, 'Bacteria;Cyanobacteria':1, 
//   'Bacteria;Proteobacteria':1040894, 'Bacteria;Spirochaetes':1, 'Bacteria;phylum_NA':925, 'Organelle;Chloroplast':114, 
//   'Unknown;phylum_NA':204218, 
//   unitObj:[
//     {name:"Archaea;Euryarchaeota", x0:0, x1:0.0000801536384942658, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:1, total:1247604}, 
//     {name:"Bacteria;Acidobacteria", x0:0.0000801536384942658, x1:0.0001603072769885316, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:1, total:1247604}, {name:"Bacteria;Bacteroidetes", x0:0.0001603072769885316, x1:0.11630292945517968, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:1449, total:1247604}, {name:"Bacteria;Cyanobacteria", x0:0.11630292945517968, x1:0.11638308309367396, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:1, total:1247604}, {name:"Bacteria;Proteobacteria", x0:0.11638308309367396, x1:83.54782446994399, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:1040894, total:1247604}, {name:"Bacteria;Spirochaetes", x0:83.54782446994399, x1:83.54790462358248, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:1, total:1247604}, 
//     {name:"Bacteria;phylum_NA", x0:83.54790462358248, x1:83.62204673918968, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:925, total:1247604}, 
//     {name:"Organelle;Chloroplast", x0:83.62204673918968, x1:83.63118425397802, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:114, total:1247604}, 
//     {name:"Unknown;phylum_NA", x0:83.63118425397802, x1:100, did:"71", dsname:"CMP_JJ_Bv5v6--ApD1", cnt:204218, total:1247604}
//     ], 
//   total:1247604
// }]
        
        var barcharts_div = document.getElementById('barcharts_div');
        barcharts_div.style.display = 'block';
        
        
        // TAXONOMY
        var unit_list = [];
        var new_unit_hash = []
        var data_list = [];
        // rows == taxa // for orderby=='name'
        
        for (var o in mtx_local.rows){
            unit_list.push(mtx_local.rows[o].id);
            new_unit_hash.push({tax:mtx_local.rows[o].id, cnt:mtx_local.data[o][0]})
        }
        //alert(new_unit_hash.toSource())
        // for(n in mtx_local.columns){
        //   alert(dataset, mtx_local.columns[n].id)
        //   if(mtx_local.columns[n].id === dataset){
        //     dataset_index = n;
        //     did = mtx_local.columns[n].did
        //   }
        // }
        //alert(mtx_local.toSource())

        new_object = {}
        
        //new_object.did = data[0].did
        //data[0].unitObj = data[0].unitObj.sort(sort_by('name',false,function(a){return a.toUpperCase()}))
        orderby = 'bycount';
        if(orderby == 'byname'){
          new_object = new_unit_hash.sort(sort_by('name',false, function(a){return a.toUpperCase()}))
        }else{
          new_object = new_unit_hash.sort(sort_by('cnt',false, parseInt))
        }

        
        // list data[0].unitObj
        var ul = d3.scale.ordinal().range( unit_list );
        var x0 = 0;
        new_object.forEach(function(d) {
          
          // d = new_object.domain().map(function(name) { 
          //   return { name: d.tax, x0: x0, x1: x0 += +d[cnt], did: 10, dsname: dataset, cnt: d[cnt] }; 
          // });
          d.x0 = x0
          x1 = x0 + d.cnt
          d.x1 = x1
          x0 = x1
        });

//alert(new_object.toSource())
        var props = get_image_properties('single', 1); 
        var svg = d3.select("#barcharts_div").append("svg")
            .attr("width",  props.width)
            .attr("height", props.height)
          .append("g")
            .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
          // axis legends -- would like to rotate dataset names
          props.y.domain(new_object.map(function(d) { return dataset; }));
          props.x.domain([0, 100]); 

        
        // data[0].unitObj.sort(function(a, b) {
        //     //return parseFloat(a.price) - parseFloat(b.price);
        //     return a.name.localeCompare(bname)
        // });
         // var datasetBar = svg.selectAll(".bar")
         //    .data(data)
         //  .enter() .append("g")
         //    .attr("class", "g")
         //    .attr("transform", function(d) { return  "translate(0, " + props.y(d.dsname) + ")"; })

        var datasetBar = svg.selectAll(".bar")
            .data(new_object)
          .enter() .append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return  "translate(0, 0)"; })

         var gnodes = datasetBar.selectAll("rect")
             .data(function(d) { 
              //alert(props.x(d.x0))
              return d
            })
             .enter()
              

           .append("rect")
               .attr("x", function(d) { return props.x(d.x0); })
               .attr("y", 15)  // adjust where first bar starts on x-axis
               .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
               .attr("height",  25)

               .attr("id",function(d,i) {
                  
                  var cnt =  d.cnt; //mtx_local.data[i];
                  var total = d.total;  //mtx_local.total;
                  var pct = (cnt * 100 / total).toFixed(2);
                  var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct;
                  return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
                })
          .attr("class","tooltip_viz");
}
var sort_by = function(field, reverse, primer){
  
   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}
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
      
      
    var gnodes = datasetBar.selectAll("rect")
          .data(function(d) { return d.unitObj; })
        .enter()
        .append('a').attr("xlink:href",  function(d,i) {
             //return 'sequences?did='+mtx_local.did+'&taxa='+encodeURIComponent(d.id);
             //alert(d.dsname)
             var filename = user_local+'_'+d.did+'_'+ts+'_sequences.json'
             return 'sequences?id='+d.dsname+'&taxa='+encodeURIComponent(d.name)+'&filename='+filename;
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
            var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct; 
            return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.id + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 

          .attr("class","tooltip_viz")
          .style("fill",   function(d,i) { return string_to_color_code(d.name); });
}
//
//
//

function create_stacked_svg_object(svg, props, data, ts) {
             
             
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
          .attr("xlink:xlink:href",  function(d) { return 'bar_single?id='+d.datasetName+'&ts='+ts;} )

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
            if(i==1){
              //alert(d.toSource())
              // ({name:"Archaea;Euryarchaeota", x0:0.12423702263274455, x1:0.14314265651164046, did:"53", dsname:"ICM_AGW_Bv6--AGW_0001_2005_06_15", cnt:7, total:37026})
            }
            
            var cnt =  this.parentNode.__data__[d.name];
            var total = this.parentNode.__data__['total'];
            
            //console.log(this._parentNode.__data__['total']);
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct; 
            return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.id + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 

          .attr("class","tooltip_viz")
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
function get_colors2(unit_names){
  var colors = [];
  for(var n in unit_names){
    //alert(unit_names[n]);
    col = string_to_color_code(unit_names[n]);
    //console.log(col);
    colors.push({tax:unit_names[n],color:col});
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