var express = require('express');
var router = express.Router();
var path      = require('path');
var fs        = require('fs-extra');
var helpers = require('./helpers/helpers');

/* GET Submissions Tables page. */
router.get('/show_submission', function(req, res) {
      console.log('in submissions choose_submission')
      var q = "select date_updated,submit_code,temp_project from vamps.vamps_submissions order by date_updated DESC" 
      connection.query(q, function(err, rows, fields){
          if(err){
            console.log('ERR',err)
            return
          }
          for(n in rows){
            //console.log('ROW',rows[n])
          }
          res.render('submissions/show_submission', { 
              title: 'VAMPS:Submissions', 
              data : JSON.stringify(rows),
              user: req.user,
              result : 0,
              hostname: req.CONFIG.hostname,          
          });
      })
});
//
//
//
router.post('/get_table', function(req, res) {
      console.log('in submissions get_table')
      console.log(req.body)
      var scode = req.body.scode
      var q = "select * from vamps.vamps_submissions_tubes where submit_code='"+scode+"'  "// order by date_updated DESC" 
      var submit_fields = ['submit_code',	        'tube_number',
                            'tube_label',
                            'dataset_description',  'duplicate',		
                            'domain',               'primer_suite',	
                            'dna_region',
                            'project_name',
                            'dataset_name',		
                            'runkey',			
                            'barcode',	
                            'pool',			
                            'lane',		
                            'direction',		
                            'platform',			
                            'op_amp',		
                            'op_seq',		
                            'op_empcr',		
                            'enzyme',		
                            'rundate',			
                            'adaptor',		
                            'date_initial',
                            'date_updated',	
                            'on_vamps',	
                            'sample_received',		
                            'concentration',	
                            'quant_method',		
                            'overlap',	
                            'insert_size',	
                            'barcode_index',	
                            'read_length',	
                            'trim_distal',
                            'env_sample_source_id']
      console.log(q)
      
      connection.query(q, function(err, rows, fields){
            if(err){
                console.log('ERR',err)
                return
            }
            //html = "<table class='table'>"
            html = "<table border='1' style='border-collapse:collapse'>"
            // headers
            html += '<tr>'
            for(i in submit_fields){
                console.log(submit_fields[i])
                html += '<th>'+submit_fields[i]+'</th>'
            }
            html += '</tr>'
            for(n in rows){
                html += '<tr>'
                for(i in submit_fields){
                    html += '<td>'+rows[n][submit_fields[i]]+'</td>'
                }
                html += '</tr>'
            }
            html += '</table>'
            res.json(html) 
          
      })
});
//
//
//
router.get('/submission_request', function(req, res) {
        console.log('in submissions request_submission')

        // PI List
        pi_list = []        
        for(i in ALL_USERS_BY_UID){
            pi_list.push({'PI':ALL_USERS_BY_UID[i].last_name+' '+ALL_USERS_BY_UID[i].first_name,'pid':i})

        }
        pi_list.sort(function sortByAlpha(a, b) {
            return helpers.compareStrings_alpha(a.PI, b.PI);
        });
        console.log(pi_list)
        // Previous Submissions List
        var user_submissions_query = "SELECT submit_code from vamps.vamps_submissions where user_id='"+req.user.user_id+"'"
        console.log(user_submissions_query)
        var dandr = {}  // Domain and Region List
        dandr.bacterial = ['v4','v6','v4v5']
        dandr.archaeal = ['v4','v6','v4v5']
        dandr.fungal = ['ITS1']
        dandr.eukaryal = ['v4','v4_hap (HSSU)','v4_hap (HLSU)']
        dandr.shotgun = []
        connection.query(user_submissions_query, function(err, rows, fields){
            if(err){
                console.log('ERR',err)
                return
            }
            res.render('submissions/submission_request', { 
                    title : 'VAMPS:Submissions', 
                    user : req.user,
                    user_submits : JSON.stringify(rows),
                    regions  : JSON.stringify(dandr),
                    pi_list  : JSON.stringify(pi_list),
                    hostname : req.CONFIG.hostname,          
            });
        });
});
//
//
//
router.get('/upload_csv', function(req, res) {
      console.log('in submissions upload_submission') 
      res.render('submissions/upload_csv', { 
              title: 'VAMPS:Submissions:upload_csv', 
              user: req.user,
              hostname: req.CONFIG.hostname,          
      });     
});
//
//
//
router.get('/illumina_submission', function(req, res) {
      console.log('in submissions illumina_submission')

});
  //
  //
  //
 

 
module.exports = router;
