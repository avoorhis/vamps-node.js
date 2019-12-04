// TODO: get_taxonomy_query has depth 15! Can we simplify it, that it's no more then 3?
var express = require('express');
var router = express.Router();
var C = require(app_root + '/public/constants');
var mysql = require('mysql2');
var util = require('util');
var helpers = require('./helpers/helpers');

module.exports = {

  get_project_permissions: function(){
    let qSelectAccess = "SELECT user_id, project_id from access";
    return qSelectAccess;
  },
  get_select_datasets_query: function(){
    var qSelectDatasets = "SELECT project, title, dataset_id as did, project_id as pid, project_description, dataset, dataset_description,";
    qSelectDatasets += " username, email, institution, first_name, last_name, owner_user_id, public, metagenomic,matrix,project.created_at,project.updated_at";

    //qSelectDatasets += " FROM dataset";
    //qSelectDatasets += " JOIN project USING(project_id)";
    qSelectDatasets += " FROM project";
    qSelectDatasets += " LEFT JOIN dataset USING(project_id)";

    qSelectDatasets += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
    qSelectDatasets += " WHERE project.active = 1";
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
    qSelectDatasets += " first_name, last_name, owner_user_id,public, metagenomic,matrix,DATE(project.created_at),DATE(project.updated_at)";
    qSelectDatasets += " FROM dataset";
    qSelectDatasets += " JOIN project USING(project_id)";
    qSelectDatasets += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
    qSelectDatasets += " WHERE project_id = " + connection.escape(pid);
    qSelectDatasets += " AND project.active = 1";
//qSelectDatasets += " AND metagenomic='0'";
    qSelectDatasets += " ORDER BY project, dataset";
    console.log(qSelectDatasets);
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
  get_all_user_groups: function(){
    var qSelectUserGroup = "SELECT user_id as uid, `group` FROM user_group"
    return qSelectUserGroup;
  },
  get_projects_queryUID: function( uid ) {
    var q = "SELECT project, project_id from project where owner_user_id='"+uid+"'";
    q += " WHERE project.active = 1";

  return q;
},
get_select_seq_count_query: function(){

    var qSequenceCounts = "SELECT dataset_id, classifier_id, SUM(seq_count) as seq_count";
    qSequenceCounts += " FROM sequence_pdr_info USE INDEX FOR GROUP BY (dataset_id)";
    qSequenceCounts += " GROUP BY dataset_id, classifier_id";
    return qSequenceCounts;


   
  },
  get_select_seq_count_queryPID: function(pid){

    var qSequenceCounts = "SELECT project_id, dataset_id, SUM(seq_count) as seq_count";
    qSequenceCounts += " FROM sequence_pdr_info";
    qSequenceCounts += " JOIN dataset using(dataset_id)";
    qSequenceCounts += " WHERE project_id = " + connection.escape(pid);
    //qSequenceCounts += " AND project.active = 1";  // not needed here
    qSequenceCounts += " GROUP BY project_id, dataset_id";
    return qSequenceCounts;

  },
  
  //
  //
  //
  get_sequences_perDID: function( sql_dids, classifier ) {
    //TODO: proper escape!!! See https://github.com/mysqljs/mysql

    //var sql_dids = dids.join(',')
    let distance = '';
    if (classifier.startsWith('tax_rdp')){
        distance = 'boot_score';
    }
    else {
        distance = 'gast_distance';
    }
    let seqQuery = "SELECT dataset_id, UNCOMPRESS(sequence_comp) as seq, seq_count, " + distance + ", classifier\n";
    seqQuery += ",domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id FROM `sequence`\n"
    seqQuery += " JOIN sequence_pdr_info as t1 USING(sequence_id)\n";
    seqQuery += " JOIN sequence_uniq_info as t2 USING(sequence_id)\n";
    if (classifier.startsWith('tax_rdp')) {
        seqQuery += " JOIN rdp_taxonomy_info_per_seq as t3 USING (rdp_taxonomy_info_per_seq_id)\n";
        seqQuery += " JOIN rdp_taxonomy as t4 USING(rdp_taxonomy_id)\n";
    }
    else {  // SILVA
        seqQuery += " JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n"
        seqQuery += " JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n";
    }
    seqQuery += " JOIN classifier as t5 USING(classifier_id)\n";
    seqQuery += " WHERE dataset_id in ('" + sql_dids + "')";
    console.log(seqQuery);
    return seqQuery;
  },
  //
  //
  //
  get_sequences_perDID_and_taxa_query: function( did, taxa, classifier ) {
    var tax_items  = taxa.split(';');
    if(classifier.startsWith('tax_rdp')){
        distance = 'boot_score'
    }else{
        distance = 'gast_distance'
    }
    var seqQuery = "SELECT UNCOMPRESS(sequence_comp) as seq, seq_count, "+distance+", classifier\n"
    seqQuery += ", domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id FROM `sequence`\n"
    seqQuery += " JOIN sequence_pdr_info as t1 USING(sequence_id)\n"
    seqQuery += " JOIN sequence_uniq_info as t2 USING(sequence_id)\n"
    
    if(classifier.startsWith('tax_rdp')){
        seqQuery += " JOIN rdp_taxonomy_info_per_seq as t3 USING (rdp_taxonomy_info_per_seq_id)\n"
        seqQuery += " JOIN rdp_taxonomy as t4 USING(rdp_taxonomy_id)\n"        
    }else{  // SILVA
        seqQuery += " JOIN silva_taxonomy_info_per_seq as t3 USING (silva_taxonomy_info_per_seq_id)\n"
        seqQuery += " JOIN silva_taxonomy as t4 USING(silva_taxonomy_id)\n"
    }
    
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
    var q = "SELECT domain_id, domain\n";
    q += " FROM `domain`\n";
    q += "where domain in ('Archaea', 'Bacteria', 'Eukarya', 'Fungi', 'Organelle', 'Unknown', 'all')";
    //console.log(q)
    return q;
  },
  get_select_dna_region_query: function() {
    var q = "SELECT dna_region_id, dna_region\n";
    q += " FROM `dna_region`\n";
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
    var q = "SELECT sequencing_platform_id, sequencing_platform\n";
    q += " FROM `sequencing_platform`\n";
    //console.log(q)
    return q;
  },

  get_select_Illumina_3letter_adapter_query: function() {
  var q = "SELECT illumina_adaptor_id, illumina_adaptor\n";
  q += " FROM `illumina_adaptor`\n";
  //console.log(q)
  return q;
},
  get_select_adapter_sequence_query: function() {
    var q = "SELECT run_key_id, run_key\n";
    q += " FROM `run_key`\n";
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
    let q = "SELECT run_id, run\n";
    q += " FROM `run`\n";
    //console.log(q)
    return q;
  },
  get_select_primer_suite_query: function() {

    let q = "SELECT primer, primer_id, primer_suite, primer_suite_id,  direction, sequence, region, domain";
    q += " FROM ref_primer_suite_primer";
    q += " JOIN primer_suite USING(primer_suite_id)";
    q += " JOIN primer USING(primer_id)";
    //console.log(q)
    return q;
  },

  get_metagenomic_projects_query: function() {

    var qSelectProjects = "SELECT project, title, project_id as pid, project_description, ";
    qSelectProjects += " username, email, institution, first_name, last_name, owner_user_id, public, metagenomic";
    qSelectProjects += " FROM project";
    qSelectProjects += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
    qSelectProjects += " WHERE metagenomic='1'";
    qSelectProjects += " AND project.active = 1";
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
    qSelectDatasets += " AND project.active = 1";
    qSelectDatasets += " ORDER BY project, dataset";
    //console.log(qSelectDatasets);
    return qSelectDatasets;
  },
  get_project_notes_query: function(pid) {

    var qSelectNotes = "SELECT notes FROM project_notes";
    qSelectNotes += " WHERE project_id='"+pid+"'";
    //console.log(qSelectNotes);
    return qSelectNotes;
  }

}; // end of module.exports
