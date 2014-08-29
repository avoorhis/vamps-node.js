var taxa_query = "SELECT DISTINCT domain, phylum, klass, `order`, family, genus, species, strain \
 FROM silva_taxonomy \
 JOIN domain AS dom USING(domain_id) \
 JOIN phylum AS phy USING(phylum_id) \
 JOIN klass AS kla USING(klass_id) \
 JOIN `order` AS ord USING(order_id) \
 JOIN family AS fam USING(family_id) \
 JOIN genus AS gen USING(genus_id) \
 JOIN species AS spe USING(species_id) \
 JOIN strain AS str USING(strain_id)";
 console.log('running custom tax query short');

function get_all_taxa(done)
{
   connection.query(taxa_query, function(err, rows) 
   {
       if (err)
        {
          throw err;
        }
           //return done(err);
           // { return done(null, false, { message: err }); }
       if (!rows.length) {
           { return done(null, false);}
       }
       return done(rows);
   });
}


// 
// function get_all_taxa(callback) 
// {
//   try{
//     connection.query(taxa_query,
//         function(err, rows, fields) {
//             if (err) return "sorry, an error occurred. Please try again later";
//             if(rows.length!=0){
//               console.log('EEE rows[0]' + JSON.stringify(rows[0]));
//               
//               cmd = rows.toString();
//               return cmd;
//             }
//         });
//     }catch (e){console.log(e.message);}
// }


 // function get_all_taxa(connection, callback) 
 //   connection.query(taxa_query, function (err, rows, fields) {
 //     // close connection first
 //     // closeConnection(connection);
 //     // done: call callback with results
 //     console.log("UUU rows from Silva_taxonomy = " + JSON.stringify(rows))
 //     
 //     callback(err, rows);
 //   });
 // };


// function get_all_taxa(callback)
// {
//   var taxa1 = [];
//   
//   connection.query(taxa_query, function(err, rows, fields)
//   {
//     if (err) {
//       throw err;
//     }
//     taxa1 = rows;
//     console.log("UUU rows from Silva_taxonomy = " + JSON.stringify(rows))
//     callback(taxa1);
//   });
//   // console.log("QQQ taxa1 from Silva_taxonomy = " + JSON.stringify(taxa1))
//   // return taxa1
// }

// Public
module.exports = Silva_taxonomy;


function Silva_taxonomy() {

  this.all_taxa = [];
  
  function get_all_taxa(cb) { // doQuery
          connection.query(taxa_query,
              function (err, results, fields) { // logResults
                  // results = results[0];
                  // results.key = radix64.fromNumber(results.id); // yep, I'm converting the
                                                                // number into base-64 notation
                  cb(results); // if I wanted to do something useful at the end, I would have
                        // called cb(results) instead, which compiles an array of results
                        // to be accessed by the final callback
              });
              console.log("EEE =========\n");
              console.log("this.all_taxa from Silva_taxonomy = " + JSON.stringify(results));
              
              return results;
      };
  
    this.all_taxa = get_all_taxa();
  
  // 
  // // accept a callback function to execute after getting results...
  // function searchTaxa(callback){
  //   var result = result;
  //   connection.query(taxa_query, function(err, result){
  //     if(err){
  //       console.log(err);
  //     }
  //     // run the callback function, passing the results...
  //     callback({result: result});
  //   });
  // }
  // 
  // // call like this...
  // // pass a function accepting results object that will be executed as callback
  // // once results have been returned...
  // 
  // searchTaxa(function(resultsObject){
  //   console.log("EEE =========\n");
  //     // console.log(resultsObject.result);
  //     // this.all_taxa = resultsObject.result;
  //     // console.log(this.all_taxa);
  //     ALL_TAXA = resultsObject.results;
  //     // return resultsObject.results;
  // })


// this.all_taxa = searchTaxa(function(resultsObject){ resultsObject.result; });

  console.log("QQQ this.all_taxa from Silva_taxonomy = " + JSON.stringify(this.all_taxa));
  // console.log("QQQ this.all_taxa from Silva_taxonomy = " + JSON.stringify(ALL_TAXA));
  // console.log("QQQ this.all_taxa from Silva_taxonomy = " + this.all_taxa);
  
}


//  module.exports.get_datasets = function(callback){
//    connection.query(qSelectDatasets, function(err, rows, fields){
// 
// var Silva_taxonomy =
// {
//   get_all_taxa: function(request, response)
//   {
//     request.db.query(taxa_query, function(err, rows, fields)
//    {
//        if (err) 
//        {
//          throw err;
//        } 
//        // return rows;
//        console.log("UUU Silva_taxonomy = " + JSON.stringify(rows))
//        response.send(rows);
//     }    
//   }
// };

module.exports = Silva_taxonomy;

