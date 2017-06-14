#!/usr/bin/env node

var args = process.argv.slice(2);

var dbhost = args[0];
var pid = args[1];
var json_dir= '../../json';
var mysql = require('mysql2');
var path = require('path');
//var h5 = require('hdf5')
var hdf5 = require('hdf5').hdf5;
var async = require('async')
NODE_DATABASE = 'vamps_development'
var db_config = {
  host     : dbhost,
  user     : 'ruby',
  password : 'ruby',
  database :  NODE_DATABASE
};
var conn = mysql.createConnection({
  host     : db_config.host,
  user     : db_config.user,
  password : db_config.password,
  database : db_config.database
});

//var db = conn.connect();


var query_core = " FROM sequence_pdr_info" 
query_core += " JOIN sequence_uniq_info USING(sequence_id)"
query_core += " JOIN silva_taxonomy_info_per_seq USING(silva_taxonomy_info_per_seq_id)"
query_core += " JOIN silva_taxonomy USING(silva_taxonomy_id)" 

var domain_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id"
domain_query1 += query_core
domain_query1 += " WHERE dataset_id in"
var domain_query2 = " GROUP BY dataset_id, domain_id"

var phylum_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id, phylum_id" 
phylum_query1 += query_core
phylum_query1 += " WHERE dataset_id in"
var phylum_query2 = " GROUP BY dataset_id, domain_id, phylum_id"

var class_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id, phylum_id, klass_id" 
class_query1 += query_core
class_query1 += " WHERE dataset_id in"
var class_query2 = " GROUP BY dataset_id, domain_id, phylum_id, klass_id"

var order_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id, phylum_id, klass_id, order_id"
order_query1 += query_core
order_query1 += " WHERE dataset_id in"
var order_query2 = " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id"

var family_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"
family_query1 += query_core
family_query1 += " WHERE dataset_id in"
var family_query2 = " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id"

var genus_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id" 
genus_query1 += query_core
genus_query1 += " WHERE dataset_id in"
var genus_query2 = " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id"

var species_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id" 
species_query1 += query_core
species_query1 += " WHERE dataset_id in"
var species_query2 = " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id"

var strain_query1 = "SELECT sum(seq_count) as knt, dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id" 
strain_query1 += query_core
strain_query1 += " WHERE dataset_id in"
var strain_query2 = " GROUP BY dataset_id, domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id"
var queries = [{"rank":"domain","query1":domain_query1,"query2":domain_query2},
           {"rank":"phylum","query1":phylum_query1,"query2":phylum_query2},
           {"rank":"klass","query1":class_query1,"query2":class_query2},
           {"rank":"order","query1":order_query1,"query2":order_query2},
           {"rank":"family","query1":family_query1,"query2":family_query2},
           {"rank":"genus","query1":genus_query1,"query2":genus_query2},
           {"rank":"species","query1":species_query1,"query2":species_query2},
           {"rank":"strain","query1":strain_query1,"query2":strain_query2}
           ]
str_ids = ['domain_id', 'phylum_id', 'klass_id', 'order_id', 'family_id', 'genus_id', 'species_id', 'strain_id'];
required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_material", "latitude", "longitude", "public"];

//ids = get_dataset_ids(conn, pid) 
//console.log('ids',ids)
q0 = "SELECT dataset_id,project_id from dataset where project_id='"+pid+"'" 
console.log(q0)
var ids = {}
ids.dids=[]
ids.pids={}
counts_lookup = {}
metadata_lookup = {}
    //console.log(ids)
async.waterfall(
    [
        
        function(callback){
            q0 = "SELECT dataset_id,project_id from dataset where project_id='"+pid+"'" 
            conn.query(q0, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(r in rows){
                        //console.log('row',rows[r])
                        ids.dids.push(rows[r].dataset_id)
                        ids.pids[rows[r].project_id]=1
                        //pids[row[1]]=1
                    }
                    callback(null, ids)
                }
            });
        },
// domain
        function(dsrows, callback){
            console.log(dsrows)
            sql = queries[0].query1+"('"+dsrows.dids.join("','")+"')"+queries[0]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<1; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //console.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    //console.log(counts_lookup)
                    callback(null, dsrows)
                }
            });
        },

        function(dsrows,callback){
            sql = queries[1].query1+"('"+ids.dids.join("','")+"')"+queries[1]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<2; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //console.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    //console.log(counts_lookup)
                    callback(null, dsrows)
                }
            });
        },

        function(dsrows,callback){
            sql = queries[2].query1+"('"+ids.dids.join("','")+"')"+queries[2]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<3; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //console.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    //console.log(counts_lookup)
                    callback(null, dsrows)
                }
            });
        },

        function(dsrows,callback){
            sql = queries[3].query1+"('"+ids.dids.join("','")+"')"+queries[3]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<4; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //console.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    //console.log(counts_lookup)
                    callback(null, dsrows)
                }
            });
        },

        function(dsrows,callback){
            sql = queries[4].query1+"('"+ids.dids.join("','")+"')"+queries[4]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<5; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //console.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    //console.log(counts_lookup)
                    callback(null, dsrows)
                }
            });
        },

        function(dsrows,callback){
            sql = queries[5].query1+"('"+ids.dids.join("','")+"')"+queries[5]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<6; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //console.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    //console.log(counts_lookup)
                    callback(null, dsrows)
                }
            });
        },

        function(dsrows,callback){
            sql = queries[6].query1+"('"+ids.dids.join("','")+"')"+queries[6]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<7; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    console.log('counts_lookup',counts_lookup)
                    callback(null, dsrows)
                }
            });
        },


        REQUIRED_METADATA,
        CUSTOM_METADATA,

    ],
    function(err, status, rows) {
        conn.end();
        file_path = path.join(json_dir,NODE_DATABASE+'--hdf5NEW.h5')
        //console.log('metadata_lookup',metadata_lookup)
        var Access = require('../../../node_modules/hdf5/lib/globals').Access;
        //console.log(Access)
        var hdf5 = require('hdf5').hdf5;
        var f      = new hdf5.File(file_path, Access.ACC_TRUNC);
        //f = hdf5.File(file_path, "w")
        //dt = hdf5.special_dtype(vlen=str)
        for(did in counts_lookup){
            //console.log(did)
            didgrp = f.createGroup(did)
            subgrp1 = f.createGroup(did+"/taxcounts")
            subgrp2 = f.createGroup(did+"/metadata")

            for(i in counts_lookup[did]){
                // console.log(i,counts_lookup[did][i])
                //#print i.strip('_'), counts_lookup[did][i]
                //#subgrp1.create_dataset(i.strip('_'), counts_lookup[did][i], dtype='i')
                //#f[did+"/taxcounts/"+i.strip('_')] = counts_lookup[did][i]
                //subgrp1[i] = counts_lookup[did][i]
            }  
            subgrp1.flush(); 
            if(did in metadata_lookup){
                for(mdname in metadata_lookup[did]){
                    //#print mdname,metadata_lookup[did][mdname]
                    //console.log(mdname,metadata_lookup[did][mdname])
                    if(metadata_lookup[did].hasOwnProperty(mdname)){
                        console.log('got it',did,mdname,metadata_lookup[did][mdname])
                        val = metadata_lookup[did][mdname]
                        //x = numpy.string_(metadata_lookup[did][i], dtype=dt)
                        //#x = "{:10}".format(metadata_lookup[did][i])
                        //print len(x),x
                        //subgrp2.attrs[i] = x
                        //#subgrp2.attrs[i] = metadata_lookup[did][i]
                        //#dset.attrs['temperature'] = 99.5
                        //#f[did+"/metadata/"+i] = metadata_lookup[did][i]
                        //#subgrp2.create_dataset(i, metadata_lookup[did][i], dtype='S10')
                        if(val){
                            subgrp2[mdname] = val;
                        }   
                        
                    }
                    
                }
                

            }
            subgrp2.flush()
            
        }
        f.close() 

        console.log('Finished writing', file_path)
        console.log(status);
    }
);
////////////////////////////////////////
function RANK_SELECT(dsrows,rank_num,callback){
            console.log('dsrows1',dsrows)
            sql = queries[7].query1+"('"+ids.dids.join("','")+"')"+queries[7]["query2"]
            console.log(sql)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        //console.log(rows[n])
                        count = parseInt(rows[n].knt)
                        did = rows[n].dataset_id;
                        tax_id_lst = []
                        str = ''
                        for( k=0; k<8; k++ ){
                            tax_id_lst.push(rows[k][str_ids[k]])
                            str += ' '+str_ids[k]
                        }
                        //console.log(tax_id_str)
                        //console.log(str)
                    
                        tmp = tax_id_lst.join('_')
                        if(counts_lookup.hasOwnProperty(did)){
                            counts_lookup[did][tmp]=count
                        }else{
                            counts_lookup[did] = {}
                            counts_lookup[did][tmp]=count
                        }
                        
                    }
                    //console.log(counts_lookup)
                    callback(null, dsrows)
                }
            });
}         
 // custom metadata
function CUSTOM_METADATA(dsrows,callback){
            console.log('dsrows2',dsrows)
            pids = Object.keys(ids.pids)
            for(p in pids){
                //console.log(pids[p])
                custom_table = 'custom_metadata_'+ pids[p]
                cust_metadata_lookup = {}
                field_collection = ['dataset_id']
                sql1 = "SELECT project_id,field_name from custom_metadata_fields WHERE project_id = '"+pids[p]+"'"
                conn.query(sql1, function(err, rows, fields){
                    if(err){
                        console.log(err)
                    }else{
                        for(n in rows){
                            pid = rows[n].project_id
                            field = rows[n].field_name
                            if(field != 'dataset_id'){
                                field_collection.push(field)
                            }
                        }
                        cust_dquery = "SELECT `" + field_collection.join('`,`')+ "` from " + custom_table
                        //console.log(cust_dquery)
                        conn.query(cust_dquery, function(err, rows, fields){
                            if(err){
                                console.log(err)
                            }else{
                                for(n in rows){
                                    did = rows[n].dataset_id
                                    for(i in field_collection){
                                        name = field_collection[i]
                                        value = rows[n][name]
                                        //console.log(name,value)
                                        if(metadata_lookup.hasOwnProperty(did)){
                                             metadata_lookup[did][name] = value
                                        }else{
                                             metadata_lookup[did] = {}
                                             metadata_lookup[did][name] = value
                                        }
                                    }
                                }
                                //console.log(metadata_lookup)
                                callback(null, 'FINISHED',dsrows)
                            }
                        })
                        
                    }
                });

            }

           
}
// req metadata
function REQUIRED_METADATA(dsrows,callback){
            sql = "SELECT dataset_id, "+required_metadata_fields.join(',')+" from required_metadata_info WHERE dataset_id in ('"+ids.dids.join("','")+"')"
            console.log('dsrows3',dsrows)
            conn.query(sql, function(err, rows, fields){
                if(err){
                    console.log(err)
                }else{
                    for(n in rows){
                        did = rows[n].dataset_id
                        for(i in required_metadata_fields){
                            name = required_metadata_fields[i]
                            value = rows[n][name]
                            //console.log(name,value)
                            if(metadata_lookup.hasOwnProperty(did)){
                                 metadata_lookup[did][name] = value
                            }else{
                                 metadata_lookup[did] = {}
                                 metadata_lookup[did][name] = value
                            }
                        }
                    }
                    //console.log(metadata_lookup)
                    callback(null, dsrows)
                }
            });
}
