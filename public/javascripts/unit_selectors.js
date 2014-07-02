  // unit_selctors.js



function get_taxa_silva108_simple(){ 
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/visuals/partials/taxa_silva108_simple", true);
  xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
           string=xmlhttp.responseText;
           //alert(string)
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  }
  xmlhttp.send();
  

}
////////////////////////////////////
function get_taxa_silva108_custom(){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/visuals/partials/taxa_silva108_custom", true);
  xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
           string=xmlhttp.responseText;
           //alert(string)
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  }
  xmlhttp.send();
}
  
function get_taxa_gg_simple(){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/visuals/partials/taxa_gg_simple", true);
  xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
           string=xmlhttp.responseText;
           //alert(string)
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  }
  xmlhttp.send();
}
  
function get_taxa_gg_custom(){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/visuals/partials/taxa_gg_custom", true);
  xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
           string=xmlhttp.responseText;
           //alert(string)
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  }
  xmlhttp.send();
}
function get_med_nodes(){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/visuals/partials/med_nodes", true);
  xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
           string=xmlhttp.responseText;
           //alert(string)
           var div = document.getElementById('units_select_div').innerHTML = string;
         }
  }
  xmlhttp.send();
}

