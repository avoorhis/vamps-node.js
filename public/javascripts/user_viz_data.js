//
//  CREATE SINGLE BARCHART on page load
//
var $liveTip = $('<div id="livetip_chart"></div>').hide().appendTo('body'),
    $win = $(window),
    showTip;

var tip = {
  title: '',
  offset: 12,
  delay: 50,
  position: function(event) {
    var positions = {x: event.pageX, y: event.pageY};
    var dimensions = {
      x: [
        $win.width(),
        $liveTip.outerWidth()
      ],
      y: [
        $win.scrollTop() + $win.height(),
        $liveTip.outerHeight()
      ]
    };
 
    for ( var axis in dimensions ) {
 
      if (dimensions[axis][0] <dimensions[axis][1] + positions[axis] + this.offset) {
        positions[axis] -= dimensions[axis][1] + this.offset;
      } else {
        positions[axis] += this.offset;
      }
 
    }
 
    $liveTip.css({
      top: positions.y,
      left: positions.x
    });
  }
};


// download fasta
var download_fasta_btn = document.getElementById('download_fasta_btn') || null;
if (download_fasta_btn !== null) {
  download_fasta_btn.addEventListener('click', function () {
      
      form = document.getElementById('download_fasta_form_id');
      download_type = form.download_type.value; 
      ts =  '';       
      download_data('fasta', download_type, ts);
  });
}


function get_single_bar_html(obj){
  
  var total = 0;
  var html ='';
  var tax_col_count = 0;
  var ordered_taxa = [];
  var taxa;
  var ranks = ['Domain','Phylum','Class','Order','Family','Genus','Species','Strain']
  for(n in obj.rows){
    if(obj.data[n] > 0){
      total += parseInt(obj.data[n]);
      taxa = obj.rows[n].id.split(';')

      ordered_taxa[n] = taxa
      if(taxa.length > tax_col_count){
        tax_col_count = taxa.length
      }
    }
  }
  //alert(ordered_taxa)
  html += "<div class='overflow_500'>click headers to sort";
  html += "<table id='single_barchart_table_id' class='table table-condensed overflow200 sortable'>";
  html += '<thead>'
  html += "<tr><th width='25' >color</th>";  //<th>Taxonomy <small>(click to sort)</small></th>
  for(i=0;i<tax_col_count;i++){
    html += '<th>'+ranks[i]+'</th>'
  }
  html += "<th>Count</th></tr>";
  
  html += '</thead><tbody>'
  
  //alert(html)
  for(n in obj.rows){
    if(obj.data[n] > 0){
      color = string_to_color_code(obj.rows[n].id)
      link = 'sequences?id='+obj.columns[0].id+'&taxa='+encodeURIComponent(obj.rows[n].id)+'&filename='+filename;
      var pct = ((obj.data[n] / total)*100).toFixed(2);
      var id = 'barcharts-|-' + obj.rows[n].id + '-|-'+ obj.data[n] + '-|-' + pct;
      html += "<tr class='tooltip_viz' id='"+id+"' ><td style='background-color:"+color+"'></td>";
      for(i=0;i<tax_col_count;i++){
        html += "<td><a href='"+link+"'>"+ordered_taxa[n][i]+'</a></td>'
      }
      html += '<td>'+obj.data[n]+"</td></tr>";
    }
  }
  html += '</tbody>'
  html += '</table></div>';
  
  return html;
}
//
//
//
function get_double_bar_html(obj, ts){
  
  var total = [0,0];
  var ranks = ['Domain','Phylum','Class','Order','Family','Genus','Species','Strain']
  var pct1,pct2,id1,id2,link1,link2,filename1,filename2,color,taxa;
  var tax_col_count = 0;
  var ordered_taxa = [];
  for(n in obj.rows){
    if(obj.data[n][0] > 0 || obj.data[n][1] > 0){
      total[0] += parseInt(obj.data[n][0]);
      total[1] += parseInt(obj.data[n][1]);
      taxa = obj.rows[n].id.split(';')
      ordered_taxa[n] = taxa
      if(taxa.length > tax_col_count){
          tax_col_count = taxa.length
      }
    }
  }
  var html ='';

  html += "<div class='overflow_500'>click headers to sort";
  html += "<table class='table table-condensed overflow200 sortable'>";
  html += '<thead>'
  html += "<tr><th width='25' >color</th>"
  for(i=0;i<tax_col_count;i++){
    html += '<th>'+ranks[i]+'</th>'
  }
  html += "<th>"+obj.datasets[0]+" </th><th>"+obj.datasets[1]+"</th></tr>";
  html += '</thead><tbody>'
  
  for(n in obj.rows){
      if(obj.data[n][0] > 0 || obj.data[n][1] > 0){
        color = string_to_color_code(obj.rows[n].id)
        filename1 = user_local+'_'+obj.columns[0].did+'_'+ts+'_sequences.json';
        filename2 = user_local+'_'+obj.columns[1].did+'_'+ts+'_sequences.json';
        link1 = 'sequences?id='+obj.columns[0].id+'&taxa='+encodeURIComponent(obj.rows[n].id)+'&filename='+filename1;
        link2 = 'sequences?id='+obj.columns[1].id+'&taxa='+encodeURIComponent(obj.rows[n].id)+'&filename='+filename2;
        pct1 = ((obj.data[n][0] / total[0])*100).toFixed(2);
        id1 = 'barcharts-|-' + obj.rows[n].id + '-|-'+ obj.data[n][0] + '-|-' + pct1;
        pct2 = ((obj.data[n][1] / total[1])*100).toFixed(2);
        id2 = 'barcharts-|-' + obj.rows[n].id + '-|-'+ obj.data[n][1] + '-|-' + pct2;
        html += "<tr>"
        html += "<td style='background-color:"+color+"'></td>";
        for(i=0;i<tax_col_count;i++){
          html += "<td>"+ordered_taxa[n][i]+'</td>'
        }
        html += "<td class='tooltip_viz' id='"+id1+"' ><a href='"+link1+"'>"+obj.data[n][0]+'</a></td>'
        //html += "<td class='tooltip_viz' id='"+id2+"' >"+obj.data[n][1]+'</td>'
        html += "<td class='tooltip_viz' id='"+id2+"' ><a href='"+link2+"'>"+obj.data[n][1]+'</a></td>'
        html += "</tr>";
      }
  }
  html += '</tbody>'
  html += '</table></div>';
  
  return html;
}
//
//
//
function get_single_pie_html(obj){
  
  var total = 0;
  var html ='';
  var tax_col_count = 0;
  var ordered_ds = [];
  var taxa;
  var ranks = ['Domain','Phylum','Class','Order','Family','Genus','Species','Strain']
  for(n in obj.rows){
    //if(obj.data[n] > 0){
      total += parseInt(obj.data[n]);
      ds = obj.rows[n].id

      ordered_ds[n] = ds
      
    //}
  }
  //alert(ordered_taxa)
  html += "<div class='overflow_500'>click headers to sort";
  html += "<table id='single_piechart_table_id' class='table table-condensed overflow200 sortable'>";
  html += '<thead>'
  html += "<tr><th width='25' >color</th>";  //<th>Taxonomy <small>(click to sort)</small></th>
  
  html += '<th>Dataset</th>'
  
  html += "<th>Count</th></tr>";
  
  html += '</thead><tbody>'
  
  
  // colorsX is created in common_selection::create_piecharts(imagetype, ts, mtx)
  for(n in obj.rows){
    //if(obj.data[n] > 0){
      //color = string_to_color_code(obj.rows[n].id)
      color = colorsX[obj.rows[n].id]
      //link = 'sequences?id='+obj.columns[0].id+'&taxa='+encodeURIComponent(obj.rows[n].id)+'&filename='+filename;
      var pct = ((obj.data[n] / total)*100).toFixed(2);
      var id = 'barcharts-|-' + obj.rows[n].id + '-|-'+ obj.data[n] + '-|-' + pct;
      html += "<tr class='tooltip_viz' id='"+id+"' ><td style='background-color:"+color+"'></td>";
      
      //html += "<td><a href='"+link+"'>"+ordered_taxa[n][i]+'</a></td>'
      html += "<td>"+ordered_ds[n]+'</td>'
      
      html += '<td>'+obj.data[n]+"</td></tr>";
    //}
  }
  html += '</tbody>'
  html += '</table></div>';
  
  return html;
}
//
//
//
function download_data(type, download_type, ts) {
    var html = '';
    var args =  "download_type="+download_type;
    
    var xmlhttp = new XMLHttpRequest(); 
    if(type == 'metadata'){
      target = '/user_data/download_selected_metadata';      
    } else if(type == 'fasta'){
      target = '/user_data/download_selected_seqs'
    }else if(type == 'matrix'){
      //alert(ts)
      args += '&ts='+ts;
      target = '/user_data/download_selected_matrix'
    }else{

    }
    xmlhttp.open("POST", target, true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 ) {
         var filename = xmlhttp.responseText; 
         html += "<div class=''>Your file is being compiled. "
         html += " When ready your file can be downloaded from the file retrieval page under 'Your Data': "+filename+"</div>"
         document.getElementById('download_confirm_id').innerHTML = html;
      }
    };
    xmlhttp.send(args);   
}
//
//
//
function hide_seqs(id, taxa, fname){
  checked_seqs = document.getElementById('hide_seqs_cb').checked;
  checked_taxa = document.getElementById('hide_tax_cb').checked;

  seq_tds = document.getElementsByClassName('hide_class_seq');
  for(i in seq_tds){
    if(checked_seqs){
        seq_tds[i].style.display = 'none'
    }else{
        seq_tds[i].style.display = 'inline';
    }
  }
  
}
//
//
//
function hide_tax(id, taxa, fname){
  checked_seqs = document.getElementById('hide_seqs_cb').checked;
  checked_taxa = document.getElementById('hide_tax_cb').checked;
  tax_tds = document.getElementsByClassName('hide_class_tax');
  
  for(i in tax_tds){
    if(checked_taxa){
        tax_tds[i].style.display = 'none'
    }else{
        tax_tds[i].style.display = 'inline';
    }
  }
      
}
//
//
//
function ncbi_blast(seq){

  var ncbi_url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&PAGE_TYPE=BlastSearch&LINK_LOC=blasthome&QUERY="
  window.open(ncbi_url+seq)
}