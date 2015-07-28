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
