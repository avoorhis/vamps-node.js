
//var visuals = ['counts_table','metadata_table','dheatmap','barcharts','piecharts','fheatmap',
//                 'dendrogram01','dendrogram03','pcoa','pcoa3d','geodistribution','adiversity','phyloseq_bars01',
//                 'phyloseq_hm02','phyloseq_nw03','phyloseq_ord04','phyloseq_tree05'] //    'dbrowser',
//
//
////  VISUALIZATION BUTTONS  \\\\
// COUNTS Table
//

var tax_counts_link = document.getElementById('counts_matrix_link_id') || null;
var tax_counts_btn = document.getElementById('counts_matrix_hide_btn');
var tax_counts_div = document.getElementById('counts_matrix_div');

var pre_counts_matrix_div = document.getElementById('pre_counts_matrix_div');
if (tax_counts_link !== null) {
    tax_counts_link.addEventListener('click', function () {
    
  if(typeof tax_table_created == "undefined"){
        
        create_viz('counts_matrix', pi_local.ts, false, cts_local);
    		
    }else{
        if(tax_counts_btn.value == 'hide'){
          //toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
        }else{
          toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
        }
    }
  $(pre_counts_matrix_div).scrollView();
  });
}
if (typeof tax_counts_btn !=="undefined") {
  tax_counts_btn.addEventListener('click', function () {
      if(tax_counts_btn.value == 'hide'){
        toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
      }else{
        toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
      }
  });
}
// if (typeof counts_table_download_btn !=="undefined") {
  
//     counts_table_download_btn.addEventListener('click', function () {
//    //alert(ds_local.ids)
//    download_data('matrix', JSON.stringify(ds_local), 'partial_project', pi_local.ts)

//   });
// }
var counts_matrix_open_btn = document.getElementById('counts_matrix_open_btn') || null;
if (counts_matrix_open_btn !== null) {
  counts_matrix_open_btn.addEventListener('click', function () {
      
      create_viz('counts_matrix', pi_local.ts, true, cts_local);      
  });
}
//
// METADATA  Table
//

var metadata_link = document.getElementById('metadata_table_link_id') || null;
var metadata_btn = document.getElementById('metadata_table_hide_btn');
var metadata_div = document.getElementById('metadata_table_div');

var pre_metadata_table_div = document.getElementById('pre_metadata_table_div');
if (metadata_link !== null) {
    metadata_link.addEventListener('click', function () {
     
    //$(window).scrollTo(500);
    
    if(typeof metadata_table_created == "undefined"){
        create_viz('metadata_table', pi_local.ts, false, cts_local);
    		
      }else{
        if(metadata_btn.value == 'hide'){
          //toggle_visual_element(metadata_div,'show',metadata_btn);
        }else{
          toggle_visual_element(metadata_div,'hide',metadata_btn);
        }
      }
      $(pre_metadata_table_div).scrollView();
  });
}
if (typeof metadata_btn !=="undefined") {
  metadata_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(metadata_btn.value == 'hide'){
        toggle_visual_element(metadata_div,'show',metadata_btn);
      }else{
        toggle_visual_element(metadata_div,'hide',metadata_btn);
      }
      
  });
}
var metadata_open_btn = document.getElementById('metadata_table_open_btn') || null;
if (metadata_open_btn !== null) {
  metadata_open_btn.addEventListener('click', function () {
      
      create_viz('metadata_table', pi_local.ts, true, cts_local);      
  });
}
//
// PIECHARTS
//
var piecharts_link = document.getElementById('piecharts_link_id') || null;
var piecharts_btn = document.getElementById('piecharts_hide_btn');
var piecharts_div = document.getElementById('piecharts_div');

var pre_piecharts_div = document.getElementById('pre_piecharts_div');
if (piecharts_link !== null) {
  piecharts_link.addEventListener('click', function () {
      
    if(typeof piecharts_created == "undefined"){
        create_viz('piecharts', pi_local.ts, false, cts_local);
    		
      }else{
        if(piecharts_btn.value == 'hide'){
          //toggle_visual_element(piecharts_div,'show',piecharts_btn);
        }else{
          toggle_visual_element(piecharts_div,'hide',piecharts_btn);
        }
      }
      $(pre_piecharts_div).scrollView();
  });
}
if (typeof piecharts_btn !=="undefined") {
  piecharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(piecharts_btn.value == 'hide'){
        toggle_visual_element(piecharts_div,'show',piecharts_btn);
      }else{
        toggle_visual_element(piecharts_div,'hide',piecharts_btn);
      }
      
  });
}
var piecharts_open_btn = document.getElementById('piecharts_open_btn');
if (typeof piecharts_open_btn !== "undefined") {
  piecharts_open_btn.addEventListener('click', function () {
      create_viz('piecharts', pi_local.ts, true, cts_local);      
  });
}
//
// KRONA Chart (Data Browser)
//
// var dbrowser_link = document.getElementById('dbrowser_link_id') || null;
// var dbrowser_btn = document.getElementById('dbrowser_hide_btn');
// var dbrowser_div = document.getElementById('dbrowser_div');
// var dbrowser_download_btn = document.getElementById('dbrowser_download_btn');
// var pre_dbrowser_div = document.getElementById('pre_dbrowser_div');
// if (dbrowser_link !== null) {
//   dbrowser_link.addEventListener('click', function () {
      
//    if(typeof dbrowser_created == "undefined"){
//         create_viz('dbrowser', pi_local.ts);
//    dbrowser_download_btn.disabled = false;
//       }else{
//         if(dbrowser_btn.value == 'hide'){
//           //toggle_visual_element(piecharts_div,'show',dbrowser_btn);
//         }else{
//           toggle_visual_element(dbrowser_div,'hide',dbrowser_btn);
//         }
//       }
//       $(pre_dbrowser_div).scrollView();
//   });
// }
// if (typeof dbrowser_btn !=="undefined") {
//   dbrowser_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(dbrowser_btn.value == 'hide'){
//         toggle_visual_element(dbrowser_div,'show',dbrowser_btn);
//       }else{
//         toggle_visual_element(dbrowser_div,'hide',dbrowser_btn);
//       }
      
//   });
// }
//
// BARCHARTS
//
var barchart_link = document.getElementById('barcharts_link_id') || null;
var barcharts_btn = document.getElementById('barcharts_hide_btn');
var barcharts_div = document.getElementById('barcharts_div');

var pre_barcharts_div = document.getElementById('pre_barcharts_div');
if (barchart_link !== null) {
  barchart_link.addEventListener('click', function () {
      
    if(typeof barcharts_created == "undefined"){
        create_viz('barcharts', pi_local.ts, false, cts_local);
        
      }else{
        if(barcharts_btn.value == 'hide', false){        
          //toggle_visual_element(barcharts_div,'show',barcharts_btn);
        }else{
          toggle_visual_element(barcharts_div,'hide',barcharts_btn);
        }
      }
      $(pre_barcharts_div).scrollView();
  });
}
if (typeof barcharts_btn !=="undefined") {
  barcharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(barcharts_btn.value == 'hide'){        
        toggle_visual_element(barcharts_div,'show',barcharts_btn);
      }else{
        toggle_visual_element(barcharts_div,'hide',barcharts_btn);
      }
      
  });
}
var barcharts_open_btn = document.getElementById('barcharts_open_btn');
if (typeof barcharts_open_btn !== "undefined") {
  barcharts_open_btn.addEventListener('click', function () {
      create_viz('barcharts', pi_local.ts, true, cts_local);      
  });
}
//
// DISTANCE HEATMAP
//
var dheatmap_link = document.getElementById('dheatmap_link_id') || null;
var dheatmap_hide_btn = document.getElementById('dheatmap_hide_btn');
var dheatmap_div = document.getElementById('dheatmap_div');

var pre_dheatmap_div = document.getElementById('pre_dheatmap_div');
if (dheatmap_link !== null) {
  dheatmap_link.addEventListener('click', function () {
      
    if(typeof dheatmap_created == "undefined"){
        create_viz('dheatmap', pi_local.ts, false, cts_local);
        
      }else{
        if(dheatmap_hide_btn.value == 'hide'){        
          //toggle_visual_element(dheatmap_div,'show',dheatmap_btn);
        }else{
          toggle_visual_element(dheatmap_div,'hide',dheatmap_hide_btn);
        }
      }
      $(pre_dheatmap_div).scrollView();
  });
}
if (typeof dheatmap_hide_btn !== "undefined") {
  dheatmap_hide_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dheatmap_hide_btn.value == 'hide'){        
        toggle_visual_element(dheatmap_div,'show',dheatmap_hide_btn);
      }else{
        toggle_visual_element(dheatmap_div,'hide',dheatmap_hide_btn);
      }
      
  });
}
var dheatmap_open_btn = document.getElementById('dheatmap_open_btn');
if (typeof dheatmap_open_btn !== "undefined") {
  dheatmap_open_btn.addEventListener('click', function () {
      create_viz('dheatmap', pi_local.ts, true, cts_local);      
  });
}
//
// FREQUENCY HEATMAP
//
var fheatmap_link = document.getElementById('fheatmap_link_id') || null;
var fheatmap_btn = document.getElementById('fheatmap_hide_btn');
var fheatmap_div = document.getElementById('fheatmap_div');

var pre_fheatmap_div = document.getElementById('pre_fheatmap_div');
if (fheatmap_link !== null) {
  fheatmap_link.addEventListener('click', function () {
      
    if(typeof fheatmap_created == "undefined"){
        create_viz('fheatmap', pi_local.ts, false, cts_local);
    		
      }else{
        if(fheatmap_btn.value == 'hide'){        
          //toggle_visual_element(fheatmap_div,'show',fheatmap_btn);
        }else{
          toggle_visual_element(fheatmap_div,'hide',fheatmap_btn);
        }
      }  
    $(pre_fheatmap_div).scrollView();    
  });
}
if (typeof fheatmap_btn !== "undefined") {
  fheatmap_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(fheatmap_btn.value == 'hide'){        
        toggle_visual_element(fheatmap_div,'show',fheatmap_btn);
      }else{
        toggle_visual_element(fheatmap_div,'hide',fheatmap_btn);
      }
      
  });
}
var fheatmap_open_btn = document.getElementById('fheatmap_open_btn');
if (typeof fheatmap_open_btn !== "undefined") {
  fheatmap_open_btn.addEventListener('click', function () {
      create_viz('fheatmap', pi_local.ts, true, cts_local);      
  });
}
//
// DENDROGRAM1  D3 Phylogram
//
var dendrogram01_link = document.getElementById('dendrogram01_link_id') || null;
var dendrogram01_btn = document.getElementById('dendrogram01_hide_btn');
var dendrogram01_div = document.getElementById('dendrogram01_div');

var pre_dendrogram01_div = document.getElementById('pre_dendrogram01_div');
if (dendrogram01_link !== null) {
  dendrogram01_link.addEventListener('click', function () {
      
    if(typeof dendrogram01_created == "undefined"){
        create_viz('dendrogram01', pi_local.ts, false, cts_local);
    		
      }else{
        if(dendrogram01_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram1_div,'show',dendrogram1_btn);
        }else{
          toggle_visual_element(dendrogram01_div,'hide',dendrogram01_btn);
        }
      }
    $(pre_dendrogram01_div).scrollView();
  });
}
if (typeof dendrogram01_btn !== "undefined") {
  dendrogram01_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram01_btn.value == 'hide'){        
        toggle_visual_element(dendrogram01_div,'show',dendrogram01_btn);
      }else{
        toggle_visual_element(dendrogram01_div,'hide',dendrogram01_btn);
      }      
  });
}
var dendrogram01_open_btn = document.getElementById('dendrogram01_open_btn');
if (typeof dendrogram01_open_btn !== "undefined") {
  dendrogram01_open_btn.addEventListener('click', function () {
      create_viz('dendrogram01', pi_local.ts, true, cts_local);      
  });
}
//
// DENDROGRAM2  D3 Phylonator
//
// var dendrogram2_link = document.getElementById('dendrogram2_link_id') || null;
// var dendrogram2_btn = document.getElementById('dendrogram2_hide_btn');
// var dendrogram2_div = document.getElementById('dendrogram2_div');
// //var dendrogram2_download_btn = document.getElementById('dendrogram2_download_btn');
// var pre_dendrogram2_div = document.getElementById('pre_dendrogram2_div');
// if (dendrogram2_link !== null) {
//   dendrogram2_link.addEventListener('click', function () {
      
//     if(typeof dendrogram2_created == "undefined"){
//         create_viz('dendrogram2', pi_local.ts, false);
//     //dendrogram2_download_btn.disabled = false;
//       }else{
//         if(dendrogram2_btn.value == 'hide'){        
//           //toggle_visual_element(dendrogram_div,'show',dendrogram_btn);
//         }else{
//           toggle_visual_element(dendrogram2_div,'hide',dendrogram2_btn);
//         }
//       }
//     $(pre_dendrogram2_div).scrollView();
//   });
// }
// if (typeof dendrogram2_btn !== "undefined") {
//   dendrogram2_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(dendrogram2_btn.value == 'hide'){        
//         toggle_visual_element(dendrogram2_div,'show',dendrogram2_btn);
//       }else{
//         toggle_visual_element(dendrogram2_div,'hide',dendrogram2_btn);
//       }      
//   });
// }
// var dendrogram2_open_btn = document.getElementById('dendrogram2_open_btn');
// if (typeof dendrogram2_open_btn !== "undefined") {
//   dendrogram2_open_btn.addEventListener('click', function () {
//       create_viz('dendrogram2', pi_local.ts, true);      
//   });
// }
//
// DENDROGRAM3  D3 Radial
//
var dendrogram03_link = document.getElementById('dendrogram03_link_id') || null;
var dendrogram03_btn = document.getElementById('dendrogram03_hide_btn');
var dendrogram03_div = document.getElementById('dendrogram03_div');

var pre_dendrogram03_div = document.getElementById('pre_dendrogram03_div');
if (dendrogram03_link !== null) {
  dendrogram03_link.addEventListener('click', function () {
      
    if(typeof dendrogram03_created == "undefined"){
        create_viz('dendrogram03', pi_local.ts, false, cts_local);
    		
      }else{
        if(dendrogram03_btn.value == 'hide'){        
          //toggle_visual_element(dendrogram_div,'show',dendrogram_btn);
        }else{
          toggle_visual_element(dendrogram03_div,'hide',dendrogram3_btn);
        }
      }
    $(pre_dendrogram03_div).scrollView();
  });
}
if (typeof dendrogram03_btn !== "undefined") {
  dendrogram03_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram03_btn.value == 'hide'){        
        toggle_visual_element(dendrogram03_div,'show',dendrogram03_btn);
      }else{
        toggle_visual_element(dendrogram03_div,'hide',dendrogram03_btn);
      }      
  });
}
var dendrogram03_open_btn = document.getElementById('dendrogram03_open_btn');
if (typeof dendrogram03_open_btn !== "undefined") {
  dendrogram03_open_btn.addEventListener('click', function () {
      create_viz('dendrogram03', pi_local.ts, true, cts_local);      
  });
}
//
// DENDROGRAM PDF
//
// var dendrogram_pdf_link = document.getElementById('dendrogram_pdf_link_id') || null;
// var dendrogram_pdf_btn = document.getElementById('dendrogram_pdf_hide_btn');
// var dendrogram_pdf_div = document.getElementById('dendrogram_pdf_div');
// //var dendrogram_pdf_download_btn = document.getElementById('dendrogram_pdf_download_btn');
// var pre_dendrogram_pdf_div = document.getElementById('pre_dendrogram_pdf_div');
// if (dendrogram_pdf_link !== null) {
//   dendrogram_pdf_link.addEventListener('click', function () {
      
//     if(typeof dendrogram_pdf_created == "undefined"){
//         create_viz('dendrogram_pdf', pi_local.ts, false);
//     //dendrogram_pdf_download_btn.disabled = false;
//       }else{
//         if(dendrogram_pdf_btn.value == 'hide'){        
//           //toggle_visual_element(dendrogram_pdf_div,'show',dendrogram_pdf_btn);
//         }else{
//           toggle_visual_element(dendrogram_pdf_div,'hide',dendrogram_pdf_btn);
//         }
//       }
//       $(pre_dendrogram_pdf_div).scrollView();
//   });
// }
// if (typeof dendrogram_pdf_btn !== "undefined") {
//   dendrogram_pdf_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(dendrogram_pdf_btn.value == 'hide'){        
//         toggle_visual_element(dendrogram_pdf_div,'show',dendrogram_pdf_btn);
//       }else{
//         toggle_visual_element(dendrogram_png_div,'hide',dendrogram_pdf_btn);
//       }      
//   });
// }
// var dendrogram_pdf_open_btn = document.getElementById('dendrogram_pdf_open_btn');
// if (typeof dendrogram_pdf_open_btn !== "undefined") {
//   dendrogram_pdf_open_btn.addEventListener('click', function () {
//       create_viz('dendrogram_pdf', pi_local.ts, true);      
//   });
// }
//
// PCOA  2D
//
var pcoa_link = document.getElementById('pcoa_link_id') || null;
var pcoa_btn = document.getElementById('pcoa_hide_btn');
var pcoa_div = document.getElementById('pcoa_div');

var pre_pcoa_div = document.getElementById('pre_pcoa_div');
if (pcoa_link !== null) {
  pcoa_link.addEventListener('click', function () {
      
    if(typeof pcoa_created == "undefined"){
        create_viz('pcoa', pi_local.ts, false, cts_local);
    
      }else{
        if(pcoa_btn.value == 'hide'){        
          //toggle_visual_element(pcoa_div,'show',pcoa_btn);
        }else{
          toggle_visual_element(pcoa_div,'hide',pcoa_btn);
        }
      } 
    $(pre_pcoa_div).scrollView();     
  });
}
if (typeof pcoa_btn !== "undefined") {
  pcoa_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(pcoa_btn.value == 'hide'){        
        toggle_visual_element(pcoa_div,'show',pcoa_btn);
      }else{
        toggle_visual_element(pcoa_div,'hide',pcoa_btn);
      }
  });
}
var pcoa_open_btn = document.getElementById('pcoa_open_btn');
if (typeof pcoa_open_btn !== "undefined") {
  pcoa_open_btn.addEventListener('click', function () {
      create_viz('pcoa', pi_local.ts, true, cts_local);      
  });
}
//
// PCOA  3D
//
var pcoa3d_link = document.getElementById('pcoa3d_link_id') || null;
var pcoa3d_btn = document.getElementById('pcoa3d_hide_btn');
var pcoa3d_div = document.getElementById('pcoa3d_div');

var pre_pcoa3d_div = document.getElementById('pre_pcoa3d_div');
if (pcoa3d_link !== null) {
  pcoa3d_link.addEventListener('click', function () {
      
    if(typeof pcoa3d_created == "undefined"){
        create_viz('pcoa3d', pi_local.ts, false, cts_local);
    
      }else{
        if(pcoa3d_btn.value == 'hide'){        
         
        }else{
          toggle_visual_element(pcoa3d_div,'hide',pcoa3d_btn);
        }
      } 
    $(pre_pcoa3d_div).scrollView();     
  });
}
if (typeof pcoa3d_btn !== "undefined") {
  pcoa3d_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(pcoa3d_btn.value == 'hide'){        
        toggle_visual_element(pcoa3d_div,'show',pcoa3d_btn);
      }else{
        toggle_visual_element(pcoa3d_div,'hide',pcoa3d_btn);
      }
  });
}

//
// GEOSPATIAL
//
var geospatial_link = document.getElementById('geospatial_link_id') || null;
var geospatial_btn = document.getElementById('geospatial_hide_btn');
//var geospatial_div = document.getElementById('map-canvas');
var geospatial_div = document.getElementById('geospatial_div');

var pre_geospatial_div = document.getElementById('pre_geospatial_div');
if (geospatial_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  geospatial_link.addEventListener('click', function () {
      
    if(typeof geospatial_created == "undefined"){
        create_viz('geospatial', pi_local.ts, false, cts_local);
       
      }else{
        if(geospatial_btn.value == 'hide'){        
         // toggle_visual_element(geospatial_div,'show',geospatial_btn);
        }else{
          toggle_visual_element(geospatial_div,'hide',geospatial_btn);
        }
      } 
    $(pre_geospatial_div).scrollView();     
  });
}
if (typeof geospatial_btn !== "undefined") {
  geospatial_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(geospatial_btn.value == 'hide'){        
        toggle_visual_element(geospatial_div,'show',geospatial_btn);
      }else{
        toggle_visual_element(geospatial_div,'hide',geospatial_btn);
      }
  });
}
var geospatial_open_btn = document.getElementById('geospatial_open_btn');
if (typeof geospatial_open_btn !== "undefined") {
  geospatial_open_btn.addEventListener('click', function () {
      create_viz('geospatial', pi_local.ts, true, cts_local);      
  });
}
//
// ALPHA DIVERSITY
//
var adiversity_link = document.getElementById('adiversity_link_id') || null;
var adiversity_btn = document.getElementById('adiversity_hide_btn');
var adiversity_div = document.getElementById('adiversity_div');

var pre_adiversity_div = document.getElementById('pre_adiversity_div');
if (adiversity_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  adiversity_link.addEventListener('click', function () {
      
    if(typeof adiversity_created == "undefined"){
        create_viz('adiversity', pi_local.ts, false, cts_local);
        
      }else{
        if(adiversity_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(adiversity_div,'hide',adiversity_btn);
        }
      } 
    $(pre_adiversity_div).scrollView();     
  });
}
if (typeof adiversity_btn !== "undefined") {
  adiversity_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(adiversity_btn.value == 'hide'){        
        toggle_visual_element(adiversity_div,'show',adiversity_btn);
      }else{
        toggle_visual_element(adiversity_div,'hide',adiversity_btn);
      }
  });
}
var adiversity_open_btn = document.getElementById('adiversity_open_btn');
if (typeof adiversity_open_btn !== "undefined") {
  adiversity_open_btn.addEventListener('click', function () {
      create_viz('adiversity', pi_local.ts, true, cts_local);      
  });
}
//
// PHYLOSEQ 01
//
var phyloseq_bars01_link = document.getElementById('phyloseq_bars01_link_id') || null;
var phyloseq_bars01_btn = document.getElementById('phyloseq_bars01_hide_btn');
var phyloseq_bars01_div = document.getElementById('phyloseq_bars01_div');

var pre_phyloseq_bars01_div = document.getElementById('pre_phyloseq_bars01_div');
if (phyloseq_bars01_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq_bars01_link.addEventListener('click', function () {
      
    if(typeof phyloseq_bars01_created == "undefined"){
        create_viz('phyloseq_bars01', pi_local.ts, false, cts_local);
        
      }else{
        if(phyloseq_bars01_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq_bars01_div,'hide',phyloseq_bars01_btn);
        }
      } 
    $(pre_phyloseq_bars01_div).scrollView();     
  });
}
if (typeof phyloseq_bars01_btn !== "undefined") {
  phyloseq_bars01_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq_bars01_btn.value == 'hide'){        
        toggle_visual_element(phyloseq_bars01_div,'show',phyloseq_bars01_btn);
      }else{
        toggle_visual_element(phyloseq_bars01_div,'hide',phyloseq_bars01_btn);
      }
  });
}
var phyloseq_bars01_open_btn = document.getElementById('phyloseq_bars01_open_btn');
if (typeof phyloseq_bars01_open_btn !== "undefined") {
  phyloseq_bars01_open_btn.addEventListener('click', function () {
      create_viz('phyloseq_bars01', pi_local.ts, true, cts_local);      
  });
}
//
// PHYLOSEQ 02
//
var phyloseq_hm02_link = document.getElementById('phyloseq_hm02_link_id') || null;
var phyloseq_hm02_btn = document.getElementById('phyloseq_hm02_hide_btn');
var phyloseq_hm02_div = document.getElementById('phyloseq_hm02_div');

var pre_phyloseq_hm02_div = document.getElementById('pre_phyloseq_hm02_div');
if (phyloseq_hm02_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq_hm02_link.addEventListener('click', function () {
      
    if(typeof phyloseq_hm02_created == "undefined"){
        create_viz('phyloseq_hm02', pi_local.ts, false, cts_local);
        
      }else{
        if(phyloseq_hm02_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq_hm02_div,'hide',phyloseq_hm02_btn);
        }
      } 
    $(pre_phyloseq_hm02_div).scrollView();     
  });
}
if (typeof phyloseq_hm02_btn !== "undefined") {
  phyloseq_hm02_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq_hm02_btn.value == 'hide'){        
        toggle_visual_element(phyloseq_hm02_div,'show',phyloseq_hm02_btn);
      }else{
        toggle_visual_element(phyloseq_hm02_div,'hide',phyloseq_hm02_btn);
      }
  });
}
var phyloseq_hm02_open_btn = document.getElementById('phyloseq_hm02_open_btn');
if (typeof phyloseq_hm02_open_btn !== "undefined") {
  phyloseq_hm02_open_btn.addEventListener('click', function () {
      create_viz('phyloseq_hm02', pi_local.ts, true, cts_local);      
  });
}
//
// PHYLOSEQ 03
//
var phyloseq_nw03_link = document.getElementById('phyloseq_nw03_link_id') || null;
var phyloseq_nw03_btn = document.getElementById('phyloseq_nw03_hide_btn');
var phyloseq_nw03_div = document.getElementById('phyloseq_nw03_div');
var pre_phyloseq_nw03_div = document.getElementById('pre_phyloseq_nw03_div');
if (phyloseq_nw03_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq_nw03_link.addEventListener('click', function () {
      
    if(typeof phyloseq_nw03_created == "undefined"){
        create_viz('phyloseq_nw03', pi_local.ts, false, cts_local);
        
      }else{
        if(phyloseq_nw03_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq_nw03_div,'hide',phyloseq_nw03_btn);
        }
      } 
    $(pre_phyloseq_nw03_div).scrollView();     
  });
}
if (typeof phyloseq_nw03_btn !== "undefined") {
  phyloseq_nw03_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq_nw03_btn.value == 'hide'){        
        toggle_visual_element(phyloseq_nw03_div,'show',phyloseq_nw03_btn);
      }else{
        toggle_visual_element(phyloseq_nw03_div,'hide',phyloseq_nw03_btn);
      }
  });
}
var phyloseq_nw03_open_btn = document.getElementById('phyloseq_nw03_open_btn');
if (typeof phyloseq_nw03_open_btn !== "undefined") {
  phyloseq_nw03_open_btn.addEventListener('click', function () {
      create_viz('phyloseq_nw03', pi_local.ts, true, cts_local);      
  });
}
//
// PHYLOSEQ 04
//
var phyloseq_ord04_link = document.getElementById('phyloseq_ord04_link_id') || null;
var phyloseq_ord04_btn = document.getElementById('phyloseq_ord04_hide_btn');
var phyloseq_ord04_div = document.getElementById('phyloseq_ord04_div');

var pre_phyloseq_ord04_div = document.getElementById('pre_phyloseq_ord04_div');
if (phyloseq_ord04_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq_ord04_link.addEventListener('click', function () {
      
    if(typeof phyloseq_ord04_created == "undefined"){
        create_viz('phyloseq_ord04', pi_local.ts, false, cts_local);
        
      }else{
        if(phyloseq_ord04_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq_ord04_div,'hide',phyloseq_ord04_btn);
        }
      } 
    $(pre_phyloseq_ord04_div).scrollView();     
  });
}
if (typeof phyloseq_ord04_btn !== "undefined") {
  phyloseq_ord04_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq_ord04_btn.value == 'hide'){        
        toggle_visual_element(phyloseq_ord04_div,'show',phyloseq_ord04_btn);
      }else{
        toggle_visual_element(phyloseq_ord04_div,'hide',phyloseq_ord04_btn);
      }
  });
}
var phyloseq_ord04_open_btn = document.getElementById('phyloseq_ord04_open_btn');
if (typeof phyloseq_ord04_open_btn !== "undefined") {
  phyloseq_ord04_open_btn.addEventListener('click', function () {
      create_viz('phyloseq_ord04', pi_local.ts, true, cts_local);      
  });
}
//
// PHYLOSEQ 05
//
var phyloseq_tree05_link = document.getElementById('phyloseq_tree05_link_id') || null;
var phyloseq_tree05_btn = document.getElementById('phyloseq_tree05_hide_btn');
var phyloseq_tree05_div = document.getElementById('phyloseq_tree05_div');

var pre_phyloseq_tree05_div = document.getElementById('pre_phyloseq_tree05_div');
if (phyloseq_tree05_link !== null) {
  //google.maps.event.addDomListener(window, 'load', initialize);
  phyloseq_tree05_link.addEventListener('click', function () {
      
    if(typeof phyloseq_tree05_created == "undefined"){
        create_viz('phyloseq_tree05', pi_local.ts, false, cts_local);
        
      }else{
        if(phyloseq_tree05_btn.value == 'hide'){        
         // toggle_visual_element(adiversity_div,'show',adiversity_btn);
        }else{
          toggle_visual_element(phyloseq_tree05_div,'hide',phyloseq_tree05_btn);
        }
      } 
    $(pre_phyloseq_tree05_div).scrollView();     
  });
}
if (typeof phyloseq_tree05_btn !== "undefined") {
  phyloseq_tree05_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(phyloseq_tree05_btn.value == 'hide'){        
        toggle_visual_element(phyloseq_tree05_div,'show',phyloseq_tree05_btn);
      }else{
        toggle_visual_element(phyloseq_tree05_div,'hide',phyloseq_tree05_btn);
      }
  });
}
var phyloseq_tree05_open_btn = document.getElementById('phyloseq_tree05_open_btn');
if (typeof phyloseq_tree05_open_btn !== "undefined") {
  phyloseq_tree05_open_btn.addEventListener('click', function () {
      create_viz('phyloseq_tree05', pi_local.ts, true, cts_local);      
  });
}

//
//
//
// TEST
//
// test_link = document.getElementById('test_page_link_id');
// if (typeof test_link !=="undefined") {
//   test_link.addEventListener('click', function () {
//       //alert('here in pc')
//       create_test_page(pi_local.ts);
//   });
// }
// function create_test_page(ts) {
//
//     var opened = window.open("");
//     opened.document.write("<html><head><title>My title</title></head><body>open in another page:  test</body></html>");
//
// }

//
//  CYTOSCAPE
//
var cytoscape_link = document.getElementById('cytoscape_link_id') || null;
var cytoscape_btn = document.getElementById('cytoscape_hide_btn');
var cytoscape_div = document.getElementById('cytoscape_div');
//var cytoscape_download_btn = document.getElementById('cytoscape_download_btn');
var pre_cytoscape_div = document.getElementById('pre_cytoscape_div');
if (cytoscape_link !== null) {
  cytoscape_link.addEventListener('click', function () {
      
    if(typeof cytoscape_created == "undefined"){
        
        create_viz('cytoscape', pi_local.ts, false, cts_local);
        //cytoscape_download_btn.disabled = false;
      }else{
        if(cytoscape_btn.value == 'hide'){        
         // toggle_visual_element(geospatial_div,'show',geospatial_btn);
        }else{
          toggle_visual_element(cytoscape_div,'hide',cytoscape_btn);
        }
      } 
    $(pre_cytoscape_div).scrollView();     
  });
}
if (typeof cytoscape_btn !== "undefined") {
  cytoscape_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(cytoscape_btn.value == 'hide'){        
        toggle_visual_element(cytoscape_div,'show',cytoscape_btn);
      }else{
        toggle_visual_element(cytoscape_div,'hide',cytoscape_btn);
      }
  });
}
var cytoscape_open_btn = document.getElementById('cytoscape_open_btn');
if (typeof cytoscape_open_btn !== "undefined") {
  cytoscape_open_btn.addEventListener('click', function () {
      create_viz('cytoscape', pi_local.ts, true, cts_local);      
  });
}
//
// OLIGOTYPING
//
// var oligotyping_link = document.getElementById('oligotyping_link_id') || null;
// var oligotyping_btn = document.getElementById('oligotyping_hide_btn');
// var oligotyping_div = document.getElementById('oligotyping_div');
// //var cytoscape_download_btn = document.getElementById('cytoscape_download_btn');
// var pre_oligotyping_div = document.getElementById('pre_oligotyping_div');
// if (oligotyping_link !== null) {
//   oligotyping_link.addEventListener('click', function () {
      
//     if(typeof oligotyping_created == "undefined"){
        
//         create_viz('oligotyping', pi_local.ts, false);
//         //cytoscape_download_btn.disabled = false;
//       }else{
//         if(oligotyping_btn.value == 'hide'){        
//          // toggle_visual_element(geospatial_div,'show',geospatial_btn);
//         }else{
//           toggle_visual_element(oligotyping_div,'hide',oligotyping_btn);
//         }
//       } 
//     $(pre_oligotyping_div).scrollView();     
//   });
// }
// if (typeof oligotyping_btn !== "undefined") {
//   oligotyping_btn.addEventListener('click', function () {
//       //alert('here in tt')
//       if(oligotyping_btn.value == 'hide'){        
//         toggle_visual_element(oligotyping_div,'show',oligotyping_btn);
//       }else{
//         toggle_visual_element(oligotyping_div,'hide',oligotyping_btn);
//       }
//   });
// }
// var oligotyping_open_btn = document.getElementById('oligotyping_open_btn');
// if (typeof oligotyping_open_btn !== "undefined") {
//   oligotyping_open_btn.addEventListener('click', function () {
//       create_viz('oligotyping', pi_local.ts, true);      
//   });
// }