// search.js

// $(document).ready(function(){
//     $('a.back').click(function(){
//         parent.history.back();
//         return false;
//     });
// });
var metadata_search_range_div1 = document.getElementById('metadata_search_range_div1');
var metadata_search_id1 = document.getElementById('metadata_search_id1');
var metadata_search_range_div2 = document.getElementById('metadata_search_range_div2');
var metadata_search_id2 = document.getElementById('metadata_search_id2');
var metadata_search_range_div3 = document.getElementById('metadata_search_range_div3');
var metadata_search_id3 = document.getElementById('metadata_search_id3');
if (typeof metadata_search_id1 !=="undefined") {
  metadata_search_id1.addEventListener('change', function () {
      var item = metadata_search_id1.value;
      
      var html = "";
      if(Array.isArray(mi_local[item])){
        //html += "<br>";
        for(i in mi_local[item]){
          val = mi_local[item][i];
          html += " <input type='checkbox' id='"+val+"' value='"+val+"'>"+val;
        }
      }else{
        var min = mi_local[item].min
        var max = mi_local[item].max
        var range = max - min;
        if(range > 1){
          range = Math.ceil(max) - Math.floor(min);
        }
        
        html += "Min: "+min+" Max: "+max
        html += " -->> Select range to search: "+range

      }
      //html += "<br><input type='button' value='Search Datasets' >"
      metadata_search_range_div1.innerHTML        = html;
      metadata_search_range_div1.style.display    = "block";
      metadata_search_range_div1.style.background = "#C0C0C0";
      metadata_search_range_div1.style.padding    = "3px";
      metadata_search_range_div1.style.width      = "95%";
      document.getElementById('search_metadata_btn').style.display    = "block";
      
  });
}
//
if (typeof metadata_search_id2 !=="undefined") {
  metadata_search_id2.addEventListener('change', function () {
      var item = metadata_search_id2.value;
      
      var html = "";
      if(Array.isArray(mi_local[item])){
        //html += "<br>";
        for(i in mi_local[item]){
          val = mi_local[item][i];
          html += " <input type='checkbox' id='"+val+"' value='"+val+"'>"+val;
        }
      }else{
        var min = mi_local[item].min
        var max = mi_local[item].max
        var range = max - min;
        if(range > 1){
          range = Math.ceil(max) - Math.floor(min);
        }
        
        html += "Min: "+min+" Max: "+max
        html += " -->> Select range to search: "+range

      }
      //html += "<br><input type='button' value='Search Datasets' >"
      metadata_search_range_div2.innerHTML        = html;
      metadata_search_range_div2.style.display    = "block";
      metadata_search_range_div2.style.background = "#C0C0C0";
      metadata_search_range_div2.style.padding    = "3px";
      metadata_search_range_div2.style.width      = "95%";
      document.getElementById('search_metadata_btn').style.display    = "block";
      
  });
}
//
if (typeof metadata_search_id3 !=="undefined") {
  metadata_search_id3.addEventListener('change', function () {
      var item = metadata_search_id3.value;
      
      var html = "";
      if(Array.isArray(mi_local[item])){
        //html += "<br>";
        for(i in mi_local[item]){
          val = mi_local[item][i];
          html += " <input type='checkbox' id='"+val+"' value='"+val+"'>"+val;
        }
      }else{
        var min = mi_local[item].min
        var max = mi_local[item].max
        var range = max - min;
        if(range > 1){
          range = Math.ceil(max) - Math.floor(min);
        }
        
        html += "Min: "+min+" Max: "+max
        html += " -->> Select range to search: "+range

      }
      //html += "<br><input type='button' value='Search Datasets' >"
      metadata_search_range_div3.innerHTML        = html;
      metadata_search_range_div3.style.display    = "block";
      metadata_search_range_div3.style.background = "#C0C0C0";
      metadata_search_range_div3.style.padding    = "3px";
      metadata_search_range_div3.style.width      = "95%";
      document.getElementById('search_metadata_btn').style.display    = "block";
      
  });
}
