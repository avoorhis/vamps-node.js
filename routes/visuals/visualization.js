var express = require('express');
var router = express.Router();
var helpers = require('../helpers');
var app = express();


/*
 * GET visualization page.
 */
router.post('/view_selection',  function(req, res) {
  // This page (view_selection) comes after the datasets and units have been selected
  //    in the previous two pages.
  // It should be protected with isLoggedIn like /unit_selection below.
  // The function call will look like this when isLoggedIn is in place:
  //            router.post('/view_selection', isLoggedIn, function(req, res) {
  // This page is where the user will choose to view his/her selected visuals.
  // The left side will show a synopsis of what choices the user has made:
  //    datasets, normalization, units and any specifics such as tax rank, domain, NAs ....
  // The middle section will have a list of buttons allowing download of files
  // And the right side will have links to the previously selected visuals.
  // Before this page is rendered the visuals should have been created using the functions called below.
  // The visual pages will be created in a public directory and each page will have a random number or timestamp
  //    attached so the page is private and can be deleted later.
  // TESTING:
  //    There should be one or more datasets shown in list
  //    There should be one or more visual choices shown.
  //

  // NORMALIZATION:
  if (req.body.normalization === 'max' || req.body.normalization === 'freq') {
    req.body.selection_obj = normalize_counts(req.body.normalization, req.body.selection_obj);
  }
  console.log('START BODY>> in route/visualization.js /view_selection');
  //console.log(req.body);
  console.log('<<END BODY');
  var links = {};
  var matrix = {};  // count matrix that can go directly into count table:
  matrix.seq_ids = req.body.selection_obj.dataset_ids;
  var test_dataset_ids = ["3","4","5","6","7","8"];
  var test_unit_assoc_tax_silva108_id = [ [96,214,82,214,137],[96,214,82,214],[96,214,82,214,137],[96,214,82,214,137],[96,214,84,82,214,112,137],[96,214,82,214,112] ];
  var test_seq_freqs =                  [ [2,103,8,203,3],    [2,13,4,20],    [1,100,1,177,1],    [1,206,6,390,1],    [2,30,4,1,45,1,1],         [ 1,120,2,211,1] ];
  //    seq_ids  : [id1,id2,id3...],
  //    tax_id1 : [tct1,0,tid3...],
  //    tax_id2 : [tct4,tct5,tct6...],
  //    tax_id3 : [tct7,tct8,0...]
  //    ....
  //  }

  var old_sid = 'x';
  var tids = [96,214,82,214,137];
  var vals = [2,103,8,203,3];

  // for (i=0; i < tids.length; i++) {
  //   id = tids[i]
  //   if (id in tmp){
  //     tmp[id][0] += vals[i]
  //   } else {
  //     tmp[id] = [vals[i]]
  //   }
  // }
 var counts = {};
 var tmp;
 var i;
  for (var n=0; n < test_unit_assoc_tax_silva108_id.length; n++) {

        tmp = {};
        counts[test_dataset_ids[n]] = [];
        for (i=0; i < test_unit_assoc_tax_silva108_id[n].length; i++) {

            if (test_unit_assoc_tax_silva108_id[n][i] in tmp){
              tmp[ test_unit_assoc_tax_silva108_id[n][i] ] += test_seq_freqs[n][i];
            } else {
              tmp[ test_unit_assoc_tax_silva108_id[n][i] ] = test_seq_freqs[n][i];
            }
        }
        counts[test_dataset_ids[n] ].push(tmp);
   }
  //console.log(JSON.stringify(counts,null,4))
//   { '82': 8, '96': 2, '137': 3, '214': 306 }
// { '82': 4, '96': 2, '214': 33 }
// { '82': 1, '96': 1, '137': 1, '214': 277 }
// { '82': 6, '96': 1, '137': 1, '214': 596 }
// { '82': 1, '84': 4, '96': 2, '112': 1, '137': 1, '214': 75 }
// { '82': 2, '96': 1, '112': 1, '214': 331 }
  tmp = {};
  for (var k=0; k < counts.length; k++) {
    var did = counts[k];

    for (i=0; i < counts[k].length; i++){
      console.log(counts[k][i]);
      for (n=0; n < counts[k][i].length; n++){
        // if (){
        //
        // } else {
          tmp[counts[k][i][n]] = ['x'];
        // }
      }
    }

  }
  console.log(tmp);
  // Get matrix data here
  // What is the SQL?
  // The visuals have been selected so now we need to create them
  // so they can be shown fast when selected
  for (k=0; k < req.body.visuals.length; k++) {
    //if (req.body.visuals[k] === 'counts_table'){ links.countstable = ''; create_counts_table(req.db, req.body);}
    //if (req.body.visuals[k]  === 'heatmap'){ links.heatmap = ''; create_heatmap(req.body);}
    //if (req.body.visuals[k]  === 'barcharts'){links.barcharts = ''; create_barcharts(req.body);}
    //if (req.body.visuals[k]  === 'dendrogram'){links.dendrogram = ''; create_dendrogram(req.body);}
    //if (req.body.visuals[k]  === 'alphadiversity'){links.alphadiversity = ''; create_alpha_diversity(req.body);}

  }
 // res.render('visuals/view_selection',{ title   : 'VAMPS: Visualization',
  //                                body: JSON.stringify(req.body),
 //                                  user: req.user
 //             });
});
// use the isLoggedIn function to limit exposure of each page to
// logged in users only
//router.post('/unit_selection', isLoggedIn, function(req, res) {
router.post('/unit_selection',  function(req, res) {
  // This page (unit_selection) comes after the datasets have been selected
  // it should only be reached by POST from the previous index_visuals page.
  // It should be protected by the isLoggedIn function (below).
  // Currently I have removed the isLoggedIn function from the function call
  // because the program is easier to test without it (you don't have to be logged in)
  // This function call will look like this when in place:
  //            router.post('/unit_selection', helpers.isLoggedIn, function(req, res) {
  // The logic here is from the selected datasets to create an object that
  // holds the datasetIDs in a certain order. The object also holds the sequence_ids,sequence_counts
  // for each dataset in the same order. The associated unitIDs are also in the object in the same order>
  // {
  //  dataset_ids:["122","136","162"],
  //  seq_ids: [ [1002,1004,1005], [1002,1004,1005], [1002,1005,1007] ],
  //  seq_freqs: [ [94,4,178], [32,1,89], [625,1024,2] ],
  //  unit_assoc: {
  //          "tax_silva108_id": [ [214,82,214], [214,82,214], [214,214,137] ],
  //          "tax_gg_id":[ [null,null,null], [null,null,null], [null,null,null] ],
  //          "med_node_id":[ [null,null,null], [null,null,null], [null,null,null] ],
  //          "otu_id":[ [null,null,null], [null,null,null], [null,null,null] ]
  //          }
  // }
  // I use the GLOBAL keyword below to make this object a global variable:
  // dataset_accumulator  <-- this is the main object containg the IDs
  // Question: can I attach this to the post variable (req.body) or do I need it as GLOBAL?
  //        Currently it is both
  // TESTING:
  //    There should be one or more datasets shown in list
  //    The Submit button should return with an alert error if no display checkboxes are checked
  //    There should be a 'default' Units Selection present (This point is debatable -- the other option
  //        would be leave blank and force the user to select). I chose Silva108--Simple Taxonomy as default.
  //    The 'Display Output' section should list the items from public/constants.js
  //    The 'Normailzation' section should list the items from public/constants.js with the NotNormalized option
  //        checked by default.
  console.log('START BODY>> in route/visualization.js /unit_selection');
  console.log(req.body);
  console.log('<<END BODY');
  var db = req.db;
  var dsets = {};
  var accumulator = {
    dataset_ids : [],
    seq_ids     : [],
    seq_freqs  : [],
    unit_assoc: {}
  };

  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']

  for (var i=0; i < available_units.length; i++){
    accumulator.unit_assoc[available_units[i]]=[];
  }


  // dataset selection +/- is checked in routes/visualization.js: check_for_no_datasets()
  //console.log(req.body);
  var chosen_id_name_hash    = {};
  chosen_id_name_hash.ids    = [];
  chosen_id_name_hash.names  = [];
  for (var n=0; n < req.body.dataset_ids.length; n++){
    var items = req.body.dataset_ids[n].split('--');
    chosen_id_name_hash.ids.push(items[0]);
    chosen_id_name_hash.names.push(items[1]+'--'+items[2]);
  }


  var qSelectSeqID = "SELECT dataset_id, seq_count, sequence_id, "+available_units+" from sequence_pdr_infos";
  qSelectSeqID +=    "  JOIN sequence_uniq_infos using(sequence_id)";
  qSelectSeqID +=    "  WHERE dataset_id in (" + chosen_id_name_hash.ids + ")";
  console.log(qSelectSeqID);


  db.query(qSelectSeqID, function(err, rows, fields){
    if (err)  {
      throw err;
    } else {


      // here get tax_silva108_id, med_id, otu_id.... for each sequence_id from sequence_uniq_infos
      // and keep them in the same order as the sequence_ids
      var u;
      for (var k=0; k < rows.length; k++){

        if (rows[k].dataset_id in dsets){
          dsets[rows[k].dataset_id].seq_ids.push(rows[k].sequence_id);
          dsets[rows[k].dataset_id].seq_counts.push(rows[k].seq_count);
          for (u=0; u < available_units.length; u++) {
            dsets[rows[k].dataset_id].unit_assoc[available_units[u]].push(rows[k][available_units[u]]);
          }
        } else {
          dsets[rows[k].dataset_id] = {};
          dsets[rows[k].dataset_id].seq_ids = [rows[k].sequence_id];
          dsets[rows[k].dataset_id].seq_counts = [rows[k].seq_count];
          dsets[rows[k].dataset_id].unit_assoc = {};
          for (u=0; u < available_units.length; u++) {
            dsets[rows[k].dataset_id].unit_assoc[available_units[u]] = [rows[k][available_units[u]]];
          }

        }

      }

      for (var id=0; id < dsets.length; id++){
        accumulator.dataset_ids.push(id);
        //dataset_accumulator.ds_counts.push(id)
        accumulator.seq_ids.push(dsets[id].seq_ids);
        accumulator.seq_freqs.push(dsets[id].seq_counts);
        for (u=0; u < dsets[id].unit_assoc.length; u++) {
          accumulator.unit_assoc[u].push(dsets[id].unit_assoc[u]);
        }

      }

    }
    GLOBAL.dataset_accumulator = accumulator;
    //console.log(dataset_accumulator);


    res.render('visuals/unit_selection', {   title: 'Unit Selection',
                   chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                   selection_obj: JSON.stringify(dataset_accumulator),
                   constants    : JSON.stringify(req.C),
                   body         : JSON.stringify(req.body),
                   user         : req.user
                 });
  });


});
/*
 * GET visualization page.
 */
router.get('/index_visuals',  function(req, res) {
  // This page is arrived at using GET from the Main Menu
  // It will be protected usind the helpers.isLoggedIn function
  // TESTING:
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.
  res.render('visuals/index_visuals', { title   : 'Show Datasets!',
                                 rows    : JSON.stringify(ALL_DATASETS),
                                 constants    : JSON.stringify(req.C),
                                 user: req.user
                                  });
});

/*
 *  VISUALS PAGES
 */
// router.get('/counts_table',  function(req, res) {
//     res.render('visuals/counts_table', {
//       body         : JSON.stringify(req.body),
//       user: req.user
//     });
// });
// router.get('/heatmap',  function(req, res) {
//     res.render('visuals/heatmap', {
//       body         : JSON.stringify(req.body),
//       user: req.user
//     });
// });

/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
router.get('/partials/tax_silva108_simple',  function(req, res) {
    res.render('visuals/partials/tax_silva108_simple',{
        doms: req.C.DOMAINS
    });
});
//
//
//
router.get('/partials/tax_silva108_custom',  function(req, res) {
  var db = req.db;
  // This query should be run only once and the results stored in memory
  // The GLOBAL keyword allows this
  // This taxonomy JSON object can be used for other taxonomies so eventually will be
  // move from here ...
  if (typeof tax_silva108_custom_rows === 'undefined'){
    var tax_query = "SELECT domain,phylum,klass,orderx,family,species,strain from taxonomies as t";
    tax_query +=    " JOIN domains  as dom on (t.domain_id=dom.id)";
    tax_query +=    " JOIN phylums  as phy on (t.phylum_id=phy.id)";
    tax_query +=    " JOIN klasses  as kla on (t.klass_id=kla.id)";
    tax_query +=    " JOIN orders   as ord on (t.order_id=ord.id)";
    tax_query +=    " JOIN families as fam on (t.family_id=fam.id)";
    tax_query +=    " JOIN genera   as gen on (t.genus_id=gen.id)";
    tax_query +=    " JOIN species  as spe on (t.species_id=spe.id)";
    tax_query +=    " JOIN strains  as str on (t.strain_id=str.id)";
    console.log('running custom tax query');
    db.query(tax_query, function(err, rows, fields){
      if (err) {
        throw err;
      } else {
          var tax_silva108_custom_rows = {};

          for (var k=0; k < rows.length; k++){
            //console.log(rows[k])
            var domain = rows[k].domain;
            var phylum = rows[k].phylum  || 'phylum_NA';
            var klass  = rows[k].klass   || 'class_NA';
            var order  = rows[k].order   || 'order_NA';
            var family = rows[k].family  || 'family_NA';
            var genus  = rows[k].genus   || 'genus_NA';
            var species= rows[k].species || 'species_NA';
            var strain = rows[k].strain  || 'strain_NA';

//            todo: How to rewrite it without nested ifs?
            if (domain in tax_silva108_custom_rows) {
              if (phylum in tax_silva108_custom_rows[domain]) {
                if (klass in tax_silva108_custom_rows[domain][phylum]) {
                  if (order in tax_silva108_custom_rows[domain][phylum][klass]) {
                    if (family in tax_silva108_custom_rows[domain][phylum][klass][order]) {
                      if (genus in tax_silva108_custom_rows[domain][phylum][klass][order][family]) {
                        if (species in tax_silva108_custom_rows[domain][phylum][klass][order][family][genus]) {
                          if (strain in tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species]) {
                            // must be dup
                          } else {
                            tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                          }
                        } else {
                          tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                          tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                        }
                      } else {
                        tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                        tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                        tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                      }
                    } else {
                      tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                      tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                      tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                      tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                    }
                  } else {
                    tax_silva108_custom_rows[domain][phylum][klass][order] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                    tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                  }
                } else {
                  tax_silva108_custom_rows[domain][phylum][klass] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                  tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
                }
              } else {
                tax_silva108_custom_rows[domain][phylum] = {};
                tax_silva108_custom_rows[domain][phylum][klass] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
                tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
              }
            } else {
              tax_silva108_custom_rows[domain] = {};
              tax_silva108_custom_rows[domain][phylum] = {};
              tax_silva108_custom_rows[domain][phylum][klass] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family][genus] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species] = {};
              tax_silva108_custom_rows[domain][phylum][klass][order][family][genus][species][strain] = 1;
            }
          }
          GLOBAL.tax_silva108_custom_rows = tax_silva108_custom_rows;
          //console.log(util.inspect(tax_silva108_custom_rows, {showHidden: false, depth: null}));

          res.render('visuals/partials/tax_silva108_custom', {
            rows: tax_silva108_custom_rows
          });
      }
    });
  } else {
    console.log('already have custom tax query');
    res.render('visuals/partials/tax_silva108_custom', {
            rows: tax_silva108_custom_rows
    });
  }

});
router.get('/partials/tax_gg_custom',  function(req, res) {
    res.render('visuals/partials/tax_gg_custom',{});
});
router.get('/partials/tax_gg_simple',  function(req, res) {
    res.render('visuals/partials/tax_gg_simple',{});
});
router.get('/partials/otus',  function(req, res) {
    res.render('visuals/partials/otus',{});
});
router.get('/partials/med_nodes',  function(req, res) {
    res.render('visuals/partials/med_nodes',{});
});



module.exports = router;

/**
* F U N C T I O N S
*/

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

//
// COUNTS TABLE
//
function create_counts_table(db,body) {
  // Intend to create (write) counts_table page here.
  // The page should have a timestamp and/or username appeneded to the file name
  // so that it is unique to the user.
  // The page should be purged when? -- after a certain length of time
  // or when the user leaves the page.
  // Also I am having trouble understanding how this page (with a dynamic/unique name)
  // will be seen and accessed by the router.   AAV

  //console.log(b)
  var ms = +new Date();  // millisecs since the epoch
  var page = 'user_pages/counts_table'+ms+'.html';
  var selection_obj         = JSON.parse(body.selection_obj);

  // taxa_ckbx_toggle: 'all',
  // domain: [ 'Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown' ],
  // include_nas: 'yes',
  // tax_depth: 'phylum',
  // unit_choice: 'taxa_silva108_simple',
  // datasets: '{"ids":["135","126","122"],"names":["SLM_NIH_Bv4v5--01_Boonville","SLM_NIH_Bv4v5--02_Spencer","SLM_NIH_Bv4v5--03_Junction_City_East"]}',
  // normalization: 'no',
  // visuals: [ 'counts_table' ],
   var test_chosen_id_names_hash = {ids:["127","41"],names:["BPC_MRB_C--dataset244","XX_power_data"]}; // purposely put these ids in reverse for testing
   var test_selection_obj = {
    dataset_ids : ["41","127"],
    seq_ids     : [[1001,1002,1004,1005],[1002,1003,1004,1005,1007]],
    seq_freqs   : [[2,53,4,101],[137,1,2,240,1]],
    unit_assoc  : {
      tax_silva108_id : [[96,214,82,214],[214,84,82,214,137]],
   }};
   console.log('TEST OBJ');
   console.log(test_selection_obj);
  //console.log(chosen_id_name_hash)

  var dataset_ids = selection_obj.dataset_ids;
  var units       = body.unit_choice;


  var matrix = create_matrix(db,test_selection_obj,test_chosen_id_names_hash,'tax_silva108_simple');

}
//
// C R E A T E  M A T R I X
//
function create_matrix(db, obj, ds_names, units) {

  // should matrix be a JSON object or a string?
  // this matrix will be central to the visualizations: counts_table, bar_charts and any pie charts
  var matrix = {};
  matrix.dset_names = [];
  var uitems = units.split('_');
  var uassoc;
  if (uitems[0] === 'tax' && uitems[1] === 'silva108'){  //covers both simple and custom
    uassoc = 'tax_silva108_id';
  }
  var domains = ['Archaea', 'Bacteria', 'Eukarya', 'Organelle'];
  var tax_depth = 'species';
  var fields = [];
  var joins = '';
  var and_domain_in = '';
  if (tax_depth === 'domain') {
    fields = ['domain'];
    joins = " JOIN domains  as dom on (t.domain_id=dom.id)";
  } else if (tax_depth === 'phylum') {
    fields = ['domain','phylum'];
    joins =  " JOIN domains  as dom on (t.domain_id=dom.id)";
    joins += " JOIN phylums  as phy on (t.phylum_id=phy.id)";
  } else if (tax_depth === 'class')  {
    fields = ['domain','phylum','klass'];
    joins =  " JOIN domains  as dom on (t.domain_id=dom.id)";
    joins += " JOIN phylums  as phy on (t.phylum_id=phy.id)";
    joins += " JOIN klasses  as kla on (t.klass_id=kla.id)";
  } else if (tax_depth === 'order')  {
    fields = ['domain','phylum','klass','orderx'];
    joins =  " JOIN domains  as dom on (t.domain_id=dom.id)";
    joins += " JOIN phylums  as phy on (t.phylum_id=phy.id)";
    joins += " JOIN klasses  as kla on (t.klass_id=kla.id)";
    joins += " JOIN orders   as ord on (t.order_id=ord.id)";
  } else if (tax_depth === 'family') {
    fields = ['domain','phylum','klass','orderx','family'];
    joins =  " JOIN domains  as dom on (t.domain_id=dom.id)";
    joins += " JOIN phylums  as phy on (t.phylum_id=phy.id)";
    joins += " JOIN klasses  as kla on (t.klass_id=kla.id)";
    joins += " JOIN orders   as ord on (t.order_id=ord.id)";
    joins += " JOIN families as fam on (t.family_id=fam.id)";
  } else if (tax_depth === 'genus') {
    fields = ['domain','phylum','klass','orderx','family','genus'];
    joins =  " JOIN domains  as dom on (t.domain_id=dom.id)";
    joins += " JOIN phylums  as phy on (t.phylum_id=phy.id)";
    joins += " JOIN klasses  as kla on (t.klass_id=kla.id)";
    joins += " JOIN orders   as ord on (t.order_id=ord.id)";
    joins += " JOIN families as fam on (t.family_id=fam.id)";
    joins += " JOIN genera   as gen on (t.genus_id=gen.id)";
  } else if (tax_depth === 'species') {
    fields = ['domain','phylum','klass','orderx','family','genus','species'];
    joins =  " JOIN domains  as dom on (t.domain_id=dom.id)";
    joins += " JOIN phylums  as phy on (t.phylum_id=phy.id)";
    joins += " JOIN klasses  as kla on (t.klass_id=kla.id)";
    joins += " JOIN orders   as ord on (t.order_id=ord.id)";
    joins += " JOIN families as fam on (t.family_id=fam.id)";
    joins += " JOIN genera   as gen on (t.genus_id=gen.id)";
    joins += " JOIN species  as spe on (t.species_id=spe.id)";
  }
  
  for (var index=0; index < obj.dataset_ids.length; index++) {

    var did = obj.dataset_ids[index];
    var dname =  ds_names.names[ds_names.ids.indexOf(did)];
    matrix.dset_names.push(dname);
    // for any units:
    //matrix = {
    //  dset_names : [ds1,ds2,ds3]
    //  u1 : [cnt1,cnt2,cnt3],
    //  u2 : [cnt4,cnt5,cnt6],
    //  u3 : [cnt7,cnt8,cnt9]
    //}
    if (domains.length < 5){
      domains = domains.join("','");
      and_domain_in = " AND domain in ('"+domains+"')";
    }
    //var tax_query = "SELECT id,taxonomy from taxonomies where taxonomy_id in (" + obj.unit_assoc[uassoc][index] + ")";


    var tax_query = "SELECT t.id, concat_ws(';',"+fields+") as tax from taxonomies as t";
    tax_query     += joins;
    tax_query     += " WHERE t.id in ("+obj.unit_assoc[uassoc][index] +")";
    tax_query     += and_domain_in;
    console.log(tax_query);
//    TODO: Don't make functions within a loop
    db.query(tax_query, function(err, rows, fields){
      if (err) {
        throw err;
      } else {
        for (var r=0; r < rows.length; r++){
          console.log(rows[r]);
//          todo: JSLint - Expected an assignment or function call and instead saw an expression
          tax_array[rows[r]];
        }
      }
    });
  }




}
//
// HEATMAP
//
function create_heatmap(b) {
  console.log('in create_hetamap');
  console.log(b);
}
//
// ALPHA DIVERSITY
//
function create_alpha_diversity() {

}
//
//  BAR CHARTS
//
function create_barcharts() {

}
//
// NORMALIZATION
//
function normalize_counts(norm_type, obj) {
  console.log('in normalization: '+norm_type);
  // get max dataset count
  var selection_obj = JSON.parse(obj);
  var max_count = get_max_dataset_count(selection_obj);
  //selection_obj.max_ds_count = max_count;

  var new_obj = [];
  for (var n=0; n < selection_obj.seq_freqs.length; n++) {
    var sum=0;
    for (var i = selection_obj.seq_freqs[n].length; i--;) {
      sum += selection_obj.seq_freqs[n][i];
    }
    var temp = [];
    for (i=0; i < selection_obj.seq_freqs[n].length; i++) {

      if (norm_type === 'max') {
        temp.push( parseInt((selection_obj.seq_freqs[n][i] * max_count) / sum, 10) );
      } else {
        temp.push( parseFloat((selection_obj.seq_freqs[n][i] / sum).toFixed(8)) );
      }

    }
    new_obj.push(temp);
  }

  selection_obj.seq_freqs = new_obj;
  return JSON.stringify(selection_obj);
}
//
//  MAX DS COUNT
//
function get_max_dataset_count(obj) {
  // Gets the maximum dataset count from the 'seq_freqs' in selection_obj
  var max_count = 0;
  for (var n=0; n < obj.seq_freqs.length; n++) {
    var sum=0;
//    todo: Andy, could you please check logic here?
    for (var i = obj.seq_freqs[n].length; i === 0; i--) {
      sum += obj.seq_freqs[n][i];
    }
    if (sum > max_count) {
      max_count = sum;
    }
  }
  return max_count;
}

