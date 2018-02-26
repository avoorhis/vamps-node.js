// TODO: get_taxonomy_query has depth 15! Can we simplify it, that it's no more then 3?
var express = require('express');
var router = express.Router();
var C = require(app_root + '/public/constants');
var mysql = require('mysql2');
var util = require('util');
var helpers = require('./helpers/helpers');

module.exports = {

get_project_permissions: function(){
    var qSelectAccess = "SELECT user_id, project_id from access";
    return qSelectAccess;
},
get_select_datasets_query: function(){
    var qSelectDatasets = "SELECT project, title, dataset_id as did, project_id as pid, project_description, dataset, dataset_description,";
    qSelectDatasets += " username, email, institution, first_name, last_name, owner_user_id, public, metagenomic,created_at,updated_at";
    
    //qSelectDatasets += " FROM dataset";
    //qSelectDatasets += " JOIN project USING(project_id)";
    qSelectDatasets += " FROM project";
    qSelectDatasets += " LEFT JOIN dataset USING(project_id)";
    
    qSelectDatasets += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
    //qSelectDatasets += " WHERE metagenomic='0'";
    qSelectDatasets += " ORDER BY project, dataset";
    //console.log(qSelectDatasets);
    return qSelectDatasets;
	
},
get_select_custom_units_query: function(){
  var qSelectCustomUnits = "SELECT project_id, field_name, field_units FROM `custom_metadata_fields` WHERE field_units <> 'Alphanumeric' AND field_units <> 'unknown'";
  console.log("qSelectCustomUnits:");
  console.log(qSelectCustomUnits);

  return qSelectCustomUnits;
},


get_select_datasets_queryPID: function(pid){
    var qSelectDatasets = "SELECT project, title, dataset_id as did, project_id as pid, dataset, dataset_description, username, email, institution,";
    qSelectDatasets += " first_name, last_name, owner_user_id,public, metagenomic,DATE(created_at),DATE(updated_at)";
    qSelectDatasets += " FROM dataset";
    qSelectDatasets += " JOIN project USING(project_id)";
    qSelectDatasets += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
    qSelectDatasets += " WHERE project_id = " + connection.escape(pid);
    //qSelectDatasets += " AND metagenomic='0'";
    qSelectDatasets += " ORDER BY project, dataset";
    //console.log(qSelectDatasets);
    return qSelectDatasets;	
},

get_select_classifier_query: function(){
		var qSelectClassifiers = "SELECT classifier_id as cid, classifier, `database`";
		qSelectClassifiers += " FROM classifier";
		//console.log(qSelectClassifiers);
    return qSelectClassifiers;
	
},
get_all_user_query: function(){
    var qSelectUser = "SELECT user_id as uid, username, email, institution, last_name, first_name, security_level";
    qSelectUser += " FROM user WHERE active='1'";
    //console.log(qSelectClassifiers);
    return qSelectUser;
  
},

get_projects_queryUID: function( uid ) {
    var q = "SELECT project, project_id from project where owner_user_id='"+uid+"'"
    return q;
},
get_select_seq_count_query: function(){
		
		var qSequenceCounts = "SELECT project_id, dataset_id, classifier_id, SUM(seq_count) as seq_count"; 
		qSequenceCounts += " FROM sequence_pdr_info";
		qSequenceCounts += " JOIN dataset using(dataset_id)";
		qSequenceCounts += " GROUP BY project_id, dataset_id, classifier_id";
		return qSequenceCounts;
	
},	
get_select_seq_count_queryPID: function(pid){
		
		var qSequenceCounts = "SELECT project_id, dataset_id, SUM(seq_count) as seq_count"; 
		qSequenceCounts += " FROM sequence_pdr_info";
		qSequenceCounts += " JOIN dataset using(dataset_id)";
		qSequenceCounts += " WHERE project_id = " + connection.escape(pid);
		qSequenceCounts += " GROUP BY project_id, dataset_id";
		return qSequenceCounts;
	
},	
get_taxonomy_queryX: function( db, uitems, chosen_id_name_hash, post_items) {
    //console.log(body);
    //selection_obj = selection_obj;
    //selection_obj = body.selection_obj;

    //   SELECT dataset_id, silva_taxonomy_info_per_seq_id as id, concat_ws(';',domain,phylum) as tax
    //   From sequence_pdr_info as t1
    //   JOIN sequence_uniq_info as t2 using(sequence_id)
    //   JOIN silva_taxonomy_info_per_seq as t3 using (silva_taxonomy_info_per_seq_id)
    //   JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)
    //   JOIN domain USING(domain_id)
    //   JOIN phylum USING(phylum_id)
    //   WHERE dataset_id in (150,151,152,153)

    if (uitems[0] === 'tax' && uitems[1] === 'silva108'){  //covers both simple and custom taxonomy
      uassoc = 'silva_taxonomy_info_per_seq_id';
    }
    var domains = post_items.domains || ['Archaea', 'Bacteria', 'Eukarya', 'Organelle', 'Unknown'];
    var tax_depth = post_items.tax_depth || 'phylum';
    var fields = [];
    var taxids = [];
    var custom_joins = '';
    var and_domain_in = '';
    var join_domain   = " JOIN domain USING(domain_id)";
    // var join_phylum   = " JOIN phylum USING(phylum_id)";
    // var join_klass    = " JOIN klass USING(klass_id)";
    // var join_order    = " JOIN `order` USING(order_id)";
    // var join_family   = " JOIN family USING(family_id)";
    // var join_genus    = " JOIN genus USING(genus_id)";
    // var join_species  = " JOIN species USING(species_id)";
    // var join_strain   = " JOIN strain USING(strain_id)";

    if (tax_depth === 'custom') {
      var idarray = get_custom_checked_ids_per_rank(post_items);
      var tmp_tax_id_in = "";
      var max_rank_num = 0;
      for(var rank in idarray) {
        this_rank_num = C.RANKS.indexOf(rank);
        if(this_rank_num > max_rank_num) {
          max_rank_num = this_rank_num;
        }
        tmp_tax_id_in += " OR "+rank+"_id in ("+idarray[rank]+")\n";
      }
      // need all the ranks up to max rank for _id and joins
      //TODO: proper escape!!! See https://github.com/mysqljs/mysql
      for (var n in C.RANKS.slice(0,max_rank_num+1)) {
        taxids.push(C.RANKS[n] + '_id');
        custom_joins += " JOIN `"+ C.RANKS[n] + "` USING("+C.RANKS[n]+"_id)\n";
      }
      post_items.tax_depth = C.RANKS[max_rank_num];
      and_domain_in += " AND (\n" + tmp_tax_id_in.slice(3) + " )";
    } else if (tax_depth === 'domain') {
      //fields = ['domain'];
      taxids = ['domain_id'];
      //joins = join_domain;
    } else if (tax_depth === 'phylum') {
      //fields = ['domain','phylum'];
      taxids = ['domain_id','phylum_id'];
      //joins =  join_domain + join_phylum;
    } else if (tax_depth === 'class' || tax_depth === 'klass')  {
      //fields = ['domain','phylum','klass'];
      taxids = ['domain_id','phylum_id','klass_id'];
      //joins =  join_domain + join_phylum + join_klass;
    } else if (tax_depth === 'order')  {
      //fields = ['domain','phylum','klass','`order`'];
      taxids = ['domain_id','phylum_id','klass_id','order_id'];
      //joins =  join_domain + join_phylum + join_klass + join_order;
    } else if (tax_depth === 'family') {
      //fields = ['domain','phylum','klass','`order`','family'];
      taxids = ['domain_id','phylum_id','klass_id','order_id','family_id'];
      //joins =  join_domain + join_phylum + join_klass + join_order + join_family;
    } else if (tax_depth === 'genus') {
      //fields = ['domain','phylum','klass','`order`','family','genus'];
      taxids = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id'];
      //joins =  join_domain + join_phylum + join_klass + join_order + join_family + join_genus;
    } else if (tax_depth === 'species') {
      //fields = ['domain','phylum','klass','`order`','family','genus','species'];
      taxids = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id'];
      //joins =  join_domain + join_phylum + join_klass + join_order + join_family + join_genus + join_species;
    }
     console.log(domains);

    var tax_query = "SELECT dataset_id, seq_count, " + taxids + "\n";
    // var tax_query = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, concat_ws(';',"+fields+") as tax\n";
    tax_query     += "   FROM sequence_pdr_info as t1\n";
    tax_query     += "   JOIN sequence_uniq_info as t2 USING(sequence_id)\n";
    tax_query     += "   JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n";
    tax_query     += "   JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n";


    if (domains.length < 5 && domains[0] !== 'NA'){
      domains = domains.join("','");
      and_domain_in = " AND domain in ('"+domains+"')";
      tax_query     += join_domain+"\n";
    }

    //var tax_query = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, silva_taxonomy_id\n";
     //  var tax_query = "SELECT dataset_id as did, seq_count, silva_taxonomy_info_per_seq_id as uid, concat_ws(';',"+fields+") as tax\n";
     // tax_query     += "   FROM sequence_pdr_info as t1\n";
     // tax_query     += "   JOIN sequence_uniq_info as t2 USING(sequence_id)\n";
     // tax_query     += "   JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n";
     // tax_query     += "   JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n";

     //  //var tax_query = "SELECT distinct silva_taxonomy_info_per_seq_id as id, concat_ws(';',"+fields+") as tax FROM silva_taxonomy_info_per_seq as t1\n";
     //  //tax_query     += "JOIN silva_taxonomy as t2 USING(silva_taxonomy_id)\n";


    // OLD db -->
    // var tax_query = "SELECT dataset_id as did, seq_count,  taxonomy as tax\n";
    //   tax_query     += "   FROM sequence_pdr_info as t1\n";
    //   tax_query     += "   JOIN sequence_uniq_info as t2 USING(sequence_id)\n";
    //   tax_query     += "   JOIN taxonomies_old as t4 on (t2.silva_taxonomy_info_per_seq_id=t4.id)\n";
    // <-- OLD db
    tax_query     += custom_joins;
    tax_query     += " WHERE dataset_id in ("+chosen_id_name_hash.ids+")\n";
    //tax_query     += " WHERE silva_taxonomy_info_per_seq_id in (" + unit_id_array + ")\n";

    tax_query     += and_domain_in;



    return tax_query;

    //
    //
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    //
    //
    function get_custom_checked_ids_per_rank(post_items) {
      console.log('in get_custom_checked_taxa');
      var tmp_array = {};
      console.log(post_items.custom_taxa);
      var value;
      var rank;
      var taxname;
      // if only one item selected then it will be a string rather than a list
      if(typeof post_items.custom_taxa === 'string') {
          value = post_items.custom_taxa;
          taxname = value.split('_');
          //var taxname = items[0];
          //var rank = items[items.length-1];
          rank = taxname.pop();
          //taxname =
          console.log(value);
          console.log(taxname);
          if(rank in tmp_array) {
            tmp_array[rank].push(new_taxonomy.taxa_tree_dict_map_by_name_n_rank[value].db_id);
          }else{
            tmp_array[rank] = [ new_taxonomy.taxa_tree_dict_map_by_name_n_rank[value].db_id ];
          }
      } else {
        for (var n in post_items.custom_taxa){

          //console.log(post_items.custom_taxa[n])
          value = post_items.custom_taxa[n];  // +'domain'
          taxname = value.split('_');
          //var taxname = items[0];
          //var rank = items[items.length-1];
          rank = taxname.pop();
          //taxname =
          console.log(value);
          console.log(taxname);
          if(rank in tmp_array) {
            tmp_array[rank].push(new_taxonomy.taxa_tree_dict_map_by_name_n_rank[value].db_id);
          }else{
            tmp_array[rank] = [ new_taxonomy.taxa_tree_dict_map_by_name_n_rank[value].db_id ];
          }

          //console.log(new_taxonomy.taxa_tree_dict_map_by_name_n_rank[value])

        }
      }
      //console.log('000 new_taxonomy = ' + JSON.stringify(new_taxonomy));
      return tmp_array;
    }

  },
  //
  //
  //
  get_sequences_perDID: function( sql_dids ) {
    //TODO: proper escape!!! See https://github.com/mysqljs/mysql
      
      //var sql_dids = dids.join(',')
      var seqQuery = "SELECT dataset_id, UNCOMPRESS(sequence_comp) as seq, seq_count, gast_distance, classifier\n"
      seqQuery += ",domain_id,phylum_id,klass_id,order_id,family_id,genus_id,species_id,strain_id FROM `sequence`\n"
      seqQuery += " JOIN sequence_pdr_info as t1 USING(sequence_id)\n"
      seqQuery += " JOIN sequence_uniq_info as t2 USING(sequence_id)\n"
      seqQuery += " JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n"
      seqQuery += " JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n"
      seqQuery += " JOIN classifier as t5 USING(classifier_id)\n"
      seqQuery += " WHERE dataset_id in ('"+sql_dids+"')";
      console.log(seqQuery)
      return seqQuery;
  },
  //
  //
  //
  get_sequences_perDID_and_taxa_query: function( did, taxa ) {
      var tax_items  = taxa.split(';');

      var seqQuery = "SELECT UNCOMPRESS(sequence_comp) as seq, seq_count, gast_distance, classifier\n"
      seqQuery += ",domain_id,phylum_id,klass_id,order_id,family_id,genus_id,species_id,strain_id FROM `sequence`\n"
      seqQuery += " JOIN sequence_pdr_info as t1 USING(sequence_id)\n"
      seqQuery += " JOIN sequence_uniq_info as t2 USING(sequence_id)\n"
      seqQuery += " JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n"
      seqQuery += " JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n"
      seqQuery += " JOIN classifier as t5 USING(classifier_id)\n"
      seqQuery += " WHERE dataset_id = " + connection.escape(did);

      for(t=0;t<  tax_items.length;t++){
        var name = tax_items[t]
        var val = name+'_'+C.RANKS[t];
        //console.log(val)
        var id = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[val].db_id;
        seqQuery += " and "+C.RANKS[t]+"_id = " + connection.escape(id);
      }
      seqQuery += "\nORDER BY seq_count DESC";
      seqQuery += " LIMIT 100";
      console.log(seqQuery)
      return seqQuery;
  },
  //
  //
  //
  
  MakeInsertProjectQ: function(req_form, owner_user_id, new_privacy)
  {
    var project_columns = ['project', 'title', 'project_description', 'rev_project_name', 'funding', 'owner_user_id', 'public'];
    var project_info = [req_form.new_project_name, req_form.new_project_title, req_form.new_project_description, "REVERSE(" + req_form.new_project_name + ")", req_form.new_funding, owner_user_id, new_privacy];
    var inserts = [project_columns, project_info];
    var insert_project_q = 'INSERT INTO project (??) VALUES (?);';
  
    var sql_a = mysql.format(insert_project_q, inserts);
    return sql_a.replace(/'REVERSE\((\w+)\)'/g, 'REVERSE(\'$1\')');
  },

  MakeInsertStatusQ: function(status_params)
  {
    // "SELECT user_id, project_id, status, message, NOW() ";
    var statQuery1 = "INSERT IGNORE INTO user_project_status (user_id, project_id, status, message, created_at)"
                  + " SELECT "  + connection.escape(status_params.user_id)
                  + ", project_id"
                  + ", "  + connection.escape(status_params.status)
                  + ", "  + connection.escape(status_params.msg)
                  + ", NOW()"
                  + " FROM user_project_status RIGHT JOIN project using(project_id)"
                  + " WHERE owner_user_id = " + connection.escape(status_params.user_id);
                  if ('project' in status_params) {
                    statQuery1 += " AND project = "  + connection.escape(status_params.project);
                    // console.log("statQuery1 project: " + connection.escape(status_params.project));
                  }
                  else if ('pid' in status_params) {
                    statQuery1 += " AND project_id = " + connection.escape(status_params.pid);
                    // console.log("statQuery1 pid: " + connection.escape(status_params.pid));
                  }
                  statQuery1 += " ON DUPLICATE KEY UPDATE"
                  + " user_project_status.status   = " + connection.escape(status_params.status)
                  + ", user_project_status.message = "  + connection.escape(status_params.msg)
                  + ", user_project_status.updated_at = NOW()"
                  + ";"
                  console.log("statQuery1: " + statQuery1);
                  
    return statQuery1;
  },
  
  MakeDeleteStatusQ: function() {
    console.log('in delete_status');
    if (status_params.type === 'delete') {
      var statQuery = "DELETE"
          + " FROM user_project_status"
         // + " JOIN project USING(project_id)"
          + " WHERE user_id = ?"
          + " AND   project_id = ?";
      console.log('DELETE query: ' + statQuery);
      return statQuery;
    }
  },

  get_select_env_term_query: function() {      
      var q = "SELECT term_id, fullname as ont, term_name\n"
      q += " FROM `term`\n"
      q += " JOIN ontology using(ontology_id)"
      //console.log(q)
      return q;
  },
  get_select_env_package_query: function() {      
      var q = "SELECT env_package_id, env_package\n"
      q += " FROM `env_package`\n"
      //console.log(q)
      return q;
  },
  get_select_domain_query: function() {      
      var q = "SELECT domain_id, domain\n"
      q += " FROM `domain`\n"
      //console.log(q)
      return q;
  },
  get_select_dna_region_query: function() {      
      var q = "SELECT dna_region_id, dna_region\n"
      q += " FROM `dna_region`\n"
      //console.log(q)
      return q;
  },
  get_select_target_gene_query: function() {      
      var q = "SELECT target_gene_id, target_gene\n"
      q += " FROM `target_gene`\n"
      //console.log(q)
      return q;
  },
  get_select_sequencing_platform_query: function() {      
      var q = "SELECT sequencing_platform_id, sequencing_platform\n"
      q += " FROM `sequencing_platform`\n"
      //console.log(q)
      return q;
  },
  get_select_adapter_sequence_query: function() {      
      var q = "SELECT run_key_id, run_key\n"
      q += " FROM `run_key`\n"
      //console.log(q)
      return q;
  },
  get_select_illumina_index_query: function() {      
      var q = "SELECT illumina_index_id, illumina_index\n"
      q += " FROM `illumina_index`\n"
      //console.log(q)
      return q;
  },
  get_select_run_query: function() {      
      var q = "SELECT run_id, run\n"
      q += " FROM `run`\n"
      //console.log(q)
      return q;
  },
  get_select_primer_suite_query: function() {      

      var q = "SELECT primer, primer_id, primer_suite, primer_suite_id,  direction, sequence, region, domain"
        q += " FROM ref_primer_suite_primer"
        q += " JOIN primer_suite USING(primer_suite_id)"
        q += " JOIN primer USING(primer_id)"
        //console.log(q)
      return q;
  },
  get_metagenomic_projects_query: function() {      

        var qSelectProjects = "SELECT project, title, project_id as pid, project_description, ";
        qSelectProjects += " username, email, institution, first_name, last_name, owner_user_id, public, metagenomic";
        qSelectProjects += " FROM project";   
        qSelectProjects += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
        qSelectProjects += " WHERE metagenomic='1'";
        qSelectProjects += " ORDER BY project";
        //console.log(qSelectProjects);
        return qSelectProjects;
  },
  get_metagenomic_datasets_query: function() {      

        var qSelectDatasets = "SELECT project, title, dataset_id as did, project_id as pid, project_description, dataset, dataset_description,";
        qSelectDatasets += " username, email, institution, first_name, last_name, owner_user_id, public, metagenomic";
        qSelectDatasets += " FROM project";
        qSelectDatasets += " LEFT JOIN dataset USING(project_id)";    
        qSelectDatasets += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
        qSelectDatasets += " WHERE metagenomic='1'";
        qSelectDatasets += " ORDER BY project, dataset";
        //console.log(qSelectDatasets);
        return qSelectDatasets;
  }  
 
} // end of module.exports
