


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
function create_barcharts(imagetype, ts, mtx) {
        //alert(imagetype)
        //var ts = pi_local.ts;
       
        var barcharts_div = document.getElementById('barcharts_div');
        barcharts_div.innerHTML = ""
        barcharts_div.style.display = 'block';
        
        //document.getElementById('pre_barcharts_table_div').style.display = 'block';
        var unit_list = [];
        for (var o in mtx.rows){
            unit_list.push(mtx.rows[o].id);
        }
        var colors = get_colors(unit_list);

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
        var color = d3.scale.ordinal()                  
          .range( colors );

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "datasetName" && key !== "did"; }));

        
        data.forEach(function(d) {
          var x0 = 0;
          d.unitObj = color.domain().map(function(name) { 
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
        var buttonNames = [{name:"Taxa Names <span class=\"glyphicon glyphicon-chevron-down\"></span>",ref:"",order:"alphaDown"},
                          {name: "Taxa Names <span class=\"glyphicon glyphicon-chevron-up\"></span>",ref:"lnk2",order:"alphaUp"},
                          {name: "Count <span class=\"glyphicon glyphicon-chevron-down\"></span>",ref:"lnk3",order:"max"},
                          {name: "Count <span class=\"glyphicon glyphicon-chevron-up\"></span>",ref:"4ref",order:"min"}]           
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
                change_matrix_order(data.order)
              })
    }     
    
    var svg = d3.select("#barcharts_div").append("svg")
            .attr("width",  props.width)
            .attr("height", props.height)
          .append("g")
            .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
    // axis legends -- would like to rotate dataset names
    props.y.domain(data.map(function(d) { return d.datasetName; }));
    props.x.domain([0, 100]); 
      
    if(imagetype=='single'){
      //alert(filename)
      create_singlebar_svg_object(svg, props, data, filename);
    }else if(imagetype=='double'){
      create_doublebar_svg_object(svg, props, data, ts);
    }else{  // group
      //create_svg_object(svg,props, did_by_names, data, ts);
      create_svg_object(svg, props, data, ts);
    }
}
function change_matrix_order(order){
  //alert('ord',order)
  new_mtx = sort_json_matrix(mtx_local, order)
  create_barcharts('group', pi_local.ts, new_mtx);
  $(pre_barcharts_div).scrollView();
}
//
//
//
function sort_json_matrix(mtx, fxn) {
    // fxn must be one of min,max, alphaUp, alphaDown
    // else original mtx returned
    // sorts MATRIX by tax alpha or counts OF FIRST COLUMN only
    // Does not (yet) sort datasets
    obj = []
    for(i in mtx.data){
      obj.push({tax:mtx.rows[i],cnt:mtx.data[i]})
    }
    var reorder = false;
    if(fxn == 'max'){
        obj.sort(function sortByCount(a, b) {
               return b.cnt[0] - a.cnt[0];
        });
        reorder = true;
    }else if(fxn == 'min'){
        obj.sort(function sortByCount(a, b) {
               return a.cnt[0] - b.cnt[0];
        });
        reorder = true;
    }else if(fxn == 'alphaUp'){
      obj.sort(function sortByAlpha(a, b) {
               return compareStrings_alpha(b.tax.id, a.tax.id)
      });
      reorder = true;
    }else if(fxn == 'alphaDown'){
      obj.sort(function sortByAlpha(a, b) {
               return compareStrings_alpha(a.tax.id, b.tax.id)
      });
      reorder = true;
    }else{
      
    }
    if(reorder){
      mtx.rows = []
      mtx.data = []
      for(i in obj){
        console.log(i,obj[i])
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
function create_singlebar_svg_object(svg, props, data, filename) {

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
             return 'sequences?id='+data[0].datasetName+'&taxa='+encodeURIComponent(d.name)+'&filename='+filename;
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
                  var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct;
                  return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
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
          .attr("transform", function(d) { return  "translate(0, " + props.y(d.datasetName) + ")"; }) 
          .append("a")
          .attr("xlink:xlink:href",  function(d) { return '/visuals/bar_single?id='+d.datasetName+'&ts='+ts+'&order=alphaDown';} )

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
    props.margin = {top: 20, right: 150, bottom: 20, left: 0};   
    props.plot_width = 900;
    props.width = props.plot_width + props.margin.left + props.margin.right;
    props.height = (ds_count * (props.bar_height + 2 * gap)) + 125;
  
    props.x = d3.scale.linear().rangeRound([0, props.plot_width]);
    
    props.y = d3.scale.ordinal()
        .rangeBands([0, (props.bar_height + 2 * gap) * ds_count]);
    
    // props.xAxis = d3.svg.axis()
 //             .scale(props.x)
 //             .orient("top");
 //
 //     props.yAxis = d3.svg.axis()
 //             .scale(props.y)
 //             .orient("left");
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