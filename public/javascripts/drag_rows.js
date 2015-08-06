$("#dheatmap_div").on("click", "#drag_table", function () {     
     
    $("#drag_table").tableDnD({
    
       onDragClass: "myDragClass",
       onDragStart: function(table, row){        
          
          var originalRows = table.tBodies[0].rows;     
          for(var i=0; i<=originalRows.length-1; i++) {
                  
                  if (originalRows[i].cells[0].id == row.cells[0].id){
                     fromRowIndex=i;
                     //alert(row.cells[3].id)
                     //original_sample_order += originalRows[i].cells[0].id + ',';
                  }
          } 
               //alert(original_sample_order)
          $("#dragInfoArea").html("Moving row " + row.cells[0].id
                            + " (index: " + fromRowIndex + ")" );   
      
       },
       onDrop: function(table, row) {

            var rows = table.tBodies[0].rows;
            for (var i=0; i<=rows.length-1; i++) {
              if (row.cells[0].id == rows[i].cells[0].id){
                 toRowIndex=i;
                 //alert(row.cells[3].id)
              }
            }
                    
            direction = 'up';
            if(toRowIndex > fromRowIndex) {
              direction = 'down';
            }

            // start counting at 1 not zero
            var first_data_row = 2; 
            var first_data_col = 3;  
            fromColIndex = fromRowIndex + (first_data_col - first_data_row);
            toColIndex   = toRowIndex   + (first_data_col - first_data_row);

            for (var i=0; i < rows.length;i++){
               var row = rows[i];
               var cell1 = row.cells[fromColIndex];
               var cell2 = row.cells[toColIndex];
               if(direction == 'down')
               {
                  row.insertBefore(cell1,cell2.nextSibling);
               }  
               else
               {
                  row.insertBefore(cell1,cell2);
               }  
            } //end of loop        
            ///// debug /////////////////////
            var debugStr = " ** Drag a row to change the dataset order. **";
            
            // this gets the new sample order for saving state between distance_metric changes
            new_sample_order = '';
            for (var i=0; i<rows.length-1; i++) {
                //debugStr += '<br>'+i+'-'+rows[i].cells[0].id;
                new_sample_order += rows[i].cells[0].id + ',';
                //alert(rows[i].id+'-'+ rows[i+1].id)                
             } 
             //alert(new_sample_order)
             // trim off trailing comma
             new_sample_order = new_sample_order.replace(/\,$/,'');
            
             $("#dragInfoArea").html(debugStr);
             
             
             // refresh() here makes the heatmap cell links non-functional
            
             
        }  // end of onDrop
       
  });  
   
});

 // jquery script for moving table rows AND columns
 $("#reorder_ds_div").on("click", "#drag_table", function () {     
     
    $("#drag_table").tableDnD({
    
       onDragClass: "myDragClass",
       onDragStart: function(table, row){        
          
          var originalRows = table.tBodies[0].rows;     
          for(var i=0; i<=originalRows.length-1; i++) {
                  
                  originalRows[i].style.background = '#FFF8DC';
                  //alert(orig_bgcolor)
                  if (originalRows[i].cells[0].id == row.cells[0].id){
                     fromRowIndex=i;

                     
                     //alert(row.cells[3].id)
                     //original_sample_order += originalRows[i].cells[0].id + ',';
                  }
          } 
          originalRows[fromRowIndex].style.background='tan'
               //alert(original_sample_order)
          //$("#dragInfoArea").html("Moving row " + row.cells[0].id
          //                  + " (index: " + fromRowIndex + ")" );   

      
       },

       onDrop: function(table, row) {
            var rows = table.tBodies[0].rows;

            
            // this gets the new sample order for saving state between distance_metric changes
            new_sample_order = '';
            for (var i=0; i<=rows.length-1; i++) {
              if (row.cells[0].id == rows[i].cells[0].id){
                 toRowIndex=i;
                 //alert(row.cells[3].id)
              }
            }
            //alert(toRowIndex.toString()+orig_bgcolor)
            rows[toRowIndex].style.background = '#FFF8DC'
            for (var i=0; i<rows.length; i++) {
                
                new_sample_order += rows[i].cells[1].id + ',';
                //alert(i)
                //alert(rows[i].cells[0].id) 
                
             } 
             //alert(new_sample_order)
             
             // trim off trailing comma
             new_sample_order = new_sample_order.replace(/\,$/,'');
             new_sample_order = new_sample_order.replace(/^,/,'');
             
             //update_session('sampleOrder',new_sample_order,'yes');
             //update_session('new_sample_order',new_sample_order,'yes');
             //update_session('sampleOrder',"",'yes');
             //opener.document.getElementById('gradient_sampleOrder').innerHTML = new_sample_order;       
             
        },  // end of onDrop
       
       
  });  
   
});
