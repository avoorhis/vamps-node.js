reset_order_btn = document.getElementById('reset_order_btn');
if (typeof reset_order_btn !=="undefined") {
	reset_order_btn.addEventListener('click', function() {
  	  reset_order();
	});
}
alphabetize = document.getElementById('alphabetize');
if (typeof alphabetize !=="undefined") {
	alphabetize.addEventListener('click', function() {
  	  
	  _alphabetize();
		
	});
}

//
//
//
function _alphabetize()
{
    var args =  "aplhabetize=1";
    
    reorder_div = document.getElementById('reorder_div');
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", 'alphabetize_ds_order', true);
    //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

      if (xmlhttp.readyState == 4 ) {
         var htmlstring = xmlhttp.responseText;
         //alert(htmlstring)
         reorder_div.innerHTML = htmlstring;
      }
    };
    xmlhttp.send(args);
	
}
function reset_order()
{
    
    var args =  "reorder=1";
    
    reorder_div = document.getElementById('reorder_div'); 
    var xmlhttp = new XMLHttpRequest();  
    xmlhttp.open("POST", 'reset_ds_order', true);
    //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

      if (xmlhttp.readyState == 4 ) {
         var htmlstring = xmlhttp.responseText;
         //alert(htmlstring)
         reorder_div.innerHTML = htmlstring;
      }
    };
    xmlhttp.send(args);
}

function cluster_order(metric, ts)
{
  //alert(ts)
  //alert(metric)
  if(metric==0){
    return
  }
    var args =  "metric="+metric;
    args += "&ts="+ts;
    //alert(args)
    reorder_div = document.getElementById('reorder_div'); 
    var xmlhttp = new XMLHttpRequest();  
    xmlhttp.open("POST", 'cluster_ds_order', true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {

      if (xmlhttp.readyState == 4 ) {
         var htmlstring = xmlhttp.responseText;
         //alert(htmlstring)
         reorder_div.innerHTML = htmlstring;
      }
    };
    xmlhttp.send(args);
}
//
//
//
function move_to_the_top(counter,string_id)
{
  //alert(counter)
  var items = string_id.split('--')
  var html = "<table id='drag_table' class='table table-condensed' >";
  html += "<thead></thead>";
  html += "  <tbody>";
  // add the first new row:
  html += "<tr class='tooltip_row' >";
  html += "  <td class='dragHandle' id='"+string_id+"'>";
  html += "    <input type='hidden' name='ds_order[]' value='"+items[0]+"' >  1 - "+items[1]+"--"+items[2]+" (id:"+items[0]+")";
  html += "  </td>";
  html += "  <td>";
  html += "     <a href='#' onclick=\"move_to_the_top('"+string_id+"')\">^</a>";
  html += "  </td>";
  html += "</tr>";
  reorder_div = document.getElementById('reorder_div'); 
  table = document.getElementById('drag_table'); 
  var originalRows = table.tBodies[0].rows;     
  for(var i=0; i<=originalRows.length-1; i++) {
    //alert(originalRows[i].cells[0].id)
    if( originalRows[i].cells[0].id != string_id){    
      var items = originalRows[i].cells[0].id.split('--')
      if(i < counter){
        cnt = parseInt(i)+2
      }else{
        cnt = parseInt(i)+1
      }
      html += "<tr class='tooltip_row' >";
      html += "   <td class='dragHandle' id='"+originalRows[i].cells[0].id+"'> ";                  
      html += "       <input type='hidden' name='ds_order[]' value='"+items[0]+"' > ";
      html += "          "+cnt+" - "+items[1]+"--"+items[2]+" (id:"+items[0]+")";
      html += "   </td>";
      html += "   <td>";
      html += "       <a href='#' onclick='move_to_the_top("+cnt+",\""+originalRows[i].cells[0].id+"\")'>^</a>";
      html += "   </td>";
      html += "</tr>";
    }
  }
  html += "  </tbody>";
  html += "</table>";

  reorder_div.innerHTML = html;


}




