# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: localhost (MySQL 5.6.17)
# Database: new_vamps
# Generation Time: 2014-07-30 18:02:04 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table annotation
# ------------------------------------------------------------

DROP TABLE IF EXISTS `annotation`;

CREATE TABLE `annotation` (
  `annotation_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `term_id` bigint(20) NOT NULL,
  `annotation_name` varchar(16) NOT NULL,
  `annotation_num_value` bigint(20) DEFAULT NULL,
  `annotation_str_value` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`annotation_id`),
  UNIQUE KEY `annotation_id` (`annotation_id`),
  KEY `idx_annotation` (`term_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table classifier
# ------------------------------------------------------------

DROP TABLE IF EXISTS `classifier`;

CREATE TABLE `classifier` (
  `classifier_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `classifier` varchar(32) NOT NULL COMMENT '''RDP'',''GAST''',
  PRIMARY KEY (`classifier_id`),
  UNIQUE KEY `classifier_UNIQUE` (`classifier`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table column_controlled_vocabularies
# ------------------------------------------------------------

DROP TABLE IF EXISTS `column_controlled_vocabularies`;

CREATE TABLE `column_controlled_vocabularies` (
  `controlled_vocab_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `column_name` varchar(16) NOT NULL,
  PRIMARY KEY (`controlled_vocab_id`,`column_name`),
  UNIQUE KEY `controlled_vocab_id` (`controlled_vocab_id`),
  KEY `idx_column_controlled_vocabularies_0` (`column_name`),
  KEY `idx_column_controlled_vocabularies_1` (`controlled_vocab_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table column_ontology
# ------------------------------------------------------------

DROP TABLE IF EXISTS `column_ontology`;

CREATE TABLE `column_ontology` (
  `column_ontology_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `column_name` varchar(16) NOT NULL,
  `ontology_short_name` varchar(16) NOT NULL,
  `bioportal_id` int(11) NOT NULL,
  `ontology_branch_id` int(11) NOT NULL,
  PRIMARY KEY (`column_ontology_id`),
  UNIQUE KEY `combine` (`column_name`,`ontology_short_name`),
  KEY `idx_column_ontology_0` (`column_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table controlled_vocab_values
# ------------------------------------------------------------

DROP TABLE IF EXISTS `controlled_vocab_values`;

CREATE TABLE `controlled_vocab_values` (
  `vocab_value_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `controlled_vocab_id` bigint(20) NOT NULL,
  `term` varchar(16) NOT NULL,
  `order_by` varchar(16) NOT NULL,
  `default_item` varchar(16) DEFAULT NULL,
  `term_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`vocab_value_id`),
  UNIQUE KEY `vocab_value_id` (`vocab_value_id`),
  KEY `idx_controlled_vocab_values` (`controlled_vocab_id`),
  KEY `fk_controlled_vocab_values_term_idx` (`term_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table controlled_vocabularies
# ------------------------------------------------------------

DROP TABLE IF EXISTS `controlled_vocabularies`;

CREATE TABLE `controlled_vocabularies` (
  `controlled_vocab_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `vocab_name` varchar(16) NOT NULL,
  PRIMARY KEY (`controlled_vocab_id`),
  UNIQUE KEY `controlled_vocab_id` (`controlled_vocab_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table dataset
# ------------------------------------------------------------

DROP TABLE IF EXISTS `dataset`;

CREATE TABLE `dataset` (
  `dataset_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `dataset` varchar(64) NOT NULL DEFAULT '',
  `dataset_description` varchar(100) NOT NULL DEFAULT '',
  `env_sample_source_id` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `project_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`dataset_id`),
  UNIQUE KEY `dataset_project` (`dataset`,`project_id`),
  KEY `dataset_fk_project_id` (`project_id`),
  KEY `dataset_fk_env_sample_source_id` (`env_sample_source_id`),
  CONSTRAINT `dataset_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE,
  CONSTRAINT `dataset_ibfk_2` FOREIGN KEY (`env_sample_source_id`) REFERENCES `env_sample_source` (`env_sample_source_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table dataset_column_ontology
# ------------------------------------------------------------

DROP TABLE IF EXISTS `dataset_column_ontology`;

CREATE TABLE `dataset_column_ontology` (
  `dataset_column_ontology_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dataset_id` int(10) unsigned NOT NULL,
  `column_ontology` int(10) unsigned NOT NULL,
  PRIMARY KEY (`dataset_column_ontology_id`),
  KEY `dataset_column_ontology_fk_dataset_id_idx` (`dataset_id`),
  KEY `dataset_column_ontology_fk_column_ontology_id_idx` (`column_ontology`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table dbxref
# ------------------------------------------------------------

DROP TABLE IF EXISTS `dbxref`;

CREATE TABLE `dbxref` (
  `dbxref_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `term_id` bigint(20) NOT NULL,
  `dbname` varchar(16) NOT NULL,
  `accession` varchar(16) NOT NULL,
  `description` varchar(16) NOT NULL,
  `xref_type` varchar(16) NOT NULL,
  PRIMARY KEY (`dbxref_id`),
  UNIQUE KEY `dbxref_id` (`dbxref_id`),
  KEY `idx_dbxref` (`term_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table domain
# ------------------------------------------------------------

DROP TABLE IF EXISTS `domain`;

CREATE TABLE `domain` (
  `domain_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `domain` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`domain_id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table env_sample_source
# ------------------------------------------------------------

DROP TABLE IF EXISTS `env_sample_source`;

CREATE TABLE `env_sample_source` (
  `env_sample_source_id` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `env_source_name` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`env_sample_source_id`),
  UNIQUE KEY `env_source_name` (`env_source_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table family
# ------------------------------------------------------------

DROP TABLE IF EXISTS `family`;

CREATE TABLE `family` (
  `family_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `family` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`family_id`),
  UNIQUE KEY `family` (`family`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table genus
# ------------------------------------------------------------

DROP TABLE IF EXISTS `genus`;

CREATE TABLE `genus` (
  `genus_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `genus` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`genus_id`),
  UNIQUE KEY `genus` (`genus`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table gg_otu
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gg_otu`;

CREATE TABLE `gg_otu` (
  `gg_otu_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `otu_name` int(10) unsigned DEFAULT NULL,
  `gg_taxonomy_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`gg_otu_id`),
  KEY `gg_otu_fk_gg_taxonomy_id_idx` (`gg_taxonomy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table gg_taxonomy
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gg_taxonomy`;

CREATE TABLE `gg_taxonomy` (
  `gg_taxonomy_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) unsigned DEFAULT NULL,
  `phylum_id` int(11) unsigned DEFAULT NULL,
  `klass_id` int(11) unsigned DEFAULT NULL,
  `order_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `genus_id` int(11) unsigned DEFAULT NULL,
  `species_id` int(11) unsigned DEFAULT NULL,
  `strain_id` int(11) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`gg_taxonomy_id`),
  UNIQUE KEY `all_names` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`strain_id`),
  KEY `taxonomy_fk_strain_id` (`strain_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table klass
# ------------------------------------------------------------

DROP TABLE IF EXISTS `klass`;

CREATE TABLE `klass` (
  `klass_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `klass` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`klass_id`),
  UNIQUE KEY `klass` (`klass`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table mixs_field_description
# ------------------------------------------------------------

DROP TABLE IF EXISTS `mixs_field_description`;

CREATE TABLE `mixs_field_description` (
  `column_name` varchar(16) NOT NULL,
  `data_type` varchar(16) NOT NULL,
  `desc_or_value` varchar(16) NOT NULL,
  `definition` varchar(16) NOT NULL,
  `min_length` int(11) DEFAULT NULL,
  `active` int(11) NOT NULL,
  PRIMARY KEY (`column_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table olygotypes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `olygotypes`;

CREATE TABLE `olygotypes` (
  `olygotypes_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `olygotype_info` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`olygotypes_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ontology
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ontology`;

CREATE TABLE `ontology` (
  `ontology_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shortname` varchar(16) NOT NULL,
  `fully_loaded` smallint(1) NOT NULL,
  `fullname` varchar(16) DEFAULT NULL,
  `query_url` varchar(16) DEFAULT NULL,
  `source_url` varchar(16) DEFAULT NULL,
  `definition` text,
  `load_date` date NOT NULL,
  `version` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`ontology_id`),
  UNIQUE KEY `ontology_id` (`ontology_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table order
# ------------------------------------------------------------

DROP TABLE IF EXISTS `order`;

CREATE TABLE `order` (
  `order_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table phylum
# ------------------------------------------------------------

DROP TABLE IF EXISTS `phylum`;

CREATE TABLE `phylum` (
  `phylum_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `phylum` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`phylum_id`),
  UNIQUE KEY `phylum` (`phylum`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table project
# ------------------------------------------------------------

DROP TABLE IF EXISTS `project`;

CREATE TABLE `project` (
  `project_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `project` varchar(32) NOT NULL DEFAULT '',
  `title` varchar(64) NOT NULL DEFAULT '',
  `project_description` varchar(255) NOT NULL DEFAULT '',
  `rev_project_name` varchar(32) NOT NULL DEFAULT '',
  `funding` varchar(64) NOT NULL DEFAULT '',
  `owner_user_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `project` (`project`),
  UNIQUE KEY `rev_project_name` (`rev_project_name`),
  KEY `project_fk_user_id_idx` (`owner_user_id`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`owner_user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table rank
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rank`;

CREATE TABLE `rank` (
  `rank_id` tinyint(11) unsigned NOT NULL AUTO_INCREMENT,
  `rank` varchar(32) NOT NULL DEFAULT '',
  `rank_number` tinyint(3) NOT NULL,
  PRIMARY KEY (`rank_id`),
  UNIQUE KEY `rank` (`rank`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table ref_silva_taxonomy_info_per_seq_refhvr_id
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ref_silva_taxonomy_info_per_seq_refhvr_id`;

CREATE TABLE `ref_silva_taxonomy_info_per_seq_refhvr_id` (
  `refhvr_id_id` int(10) unsigned NOT NULL,
  `silva_taxonomy_info_per_seq_id` int(10) unsigned NOT NULL,
  KEY `silva_taxonomy_info_per_seq_id_idx` (`silva_taxonomy_info_per_seq_id`),
  KEY `refhvr_id_id_idx` (`refhvr_id_id`),
  CONSTRAINT `refhvr_id_id` FOREIGN KEY (`refhvr_id_id`) REFERENCES `refhvr_id` (`refhvr_id_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_info_per_seq_id` FOREIGN KEY (`silva_taxonomy_info_per_seq_id`) REFERENCES `silva_taxonomy_info_per_seq` (`silva_taxonomy_info_per_seq_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table refhvr_id
# ------------------------------------------------------------

DROP TABLE IF EXISTS `refhvr_id`;

CREATE TABLE `refhvr_id` (
  `refhvr_id_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `refhvr_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`refhvr_id_id`),
  UNIQUE KEY `refhvr_id_UNIQUE` (`refhvr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table relationship_type
# ------------------------------------------------------------

DROP TABLE IF EXISTS `relationship_type`;

CREATE TABLE `relationship_type` (
  `relationship_type_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `relationship_type` varchar(16) NOT NULL,
  PRIMARY KEY (`relationship_type_id`),
  UNIQUE KEY `relationship_type_id` (`relationship_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table sequence
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sequence`;

CREATE TABLE `sequence` (
  `sequence_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_comp` longblob,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence_id`),
  UNIQUE KEY `sequence_comp` (`sequence_comp`(400))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table sequence_pdr_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sequence_pdr_info`;

CREATE TABLE `sequence_pdr_info` (
  `sequence_pdr_info_id` int(11) NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) unsigned NOT NULL,
  `sequence_id` bigint(11) unsigned NOT NULL,
  `seq_count` int(11) unsigned NOT NULL COMMENT 'count unique sequence per run / project / dataset = frequency from a file',
  `classifier_id` int(10) unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence_pdr_info_id`),
  UNIQUE KEY `uniq_seq_pd` (`dataset_id`,`sequence_id`),
  KEY `sequence_pdr_info_fk_sequence_id` (`sequence_id`),
  KEY `sequence_pdr_info_fk_dataset_id` (`dataset_id`),
  KEY `sequence_pdr_info_fk_classifier_id_idx` (`classifier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='sequences uniqued per run / project / dataset';



# Dump of table sequence_uniq_info
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sequence_uniq_info`;

CREATE TABLE `sequence_uniq_info` (
  `sequence_uniq_info_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_id` bigint(11) unsigned NOT NULL,
  `silva_taxonomy_info_per_seq_id` int(11) unsigned DEFAULT NULL,
  `gg_otu_id` int(10) unsigned DEFAULT NULL,
  `olygotype_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence_uniq_info_id`),
  UNIQUE KEY `sequence_id` (`sequence_id`),
  KEY `sequence_uniq_info_fk_silva_taxonomy_info_per_seq_id_idx` (`silva_taxonomy_info_per_seq_id`),
  KEY `sequence_uniq_info_fk_gg_otu_id_idx` (`gg_otu_id`),
  KEY `sequence_uniq_info_fk_olygotype_id_idx` (`olygotype_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table silva_taxonomy
# ------------------------------------------------------------

DROP TABLE IF EXISTS `silva_taxonomy`;

CREATE TABLE `silva_taxonomy` (
  `silva_taxonomy_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) unsigned DEFAULT NULL,
  `phylum_id` int(11) unsigned DEFAULT NULL,
  `klass_id` int(11) unsigned DEFAULT NULL,
  `order_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `genus_id` int(11) unsigned NOT NULL,
  `species_id` int(11) unsigned DEFAULT NULL,
  `strain_id` int(11) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`silva_taxonomy_id`),
  UNIQUE KEY `all_names` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`strain_id`),
  KEY `taxonomy_fk_strain_id` (`strain_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`),
  CONSTRAINT `silva_taxonomy_ibfk_10` FOREIGN KEY (`strain_id`) REFERENCES `strain` (`strain_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genus` (`genus_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_ibfk_4` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_ibfk_5` FOREIGN KEY (`family_id`) REFERENCES `family` (`family_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_ibfk_6` FOREIGN KEY (`klass_id`) REFERENCES `klass` (`klass_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_ibfk_7` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_ibfk_8` FOREIGN KEY (`phylum_id`) REFERENCES `phylum` (`phylum_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_ibfk_9` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table silva_taxonomy_info_per_seq
# ------------------------------------------------------------

DROP TABLE IF EXISTS `silva_taxonomy_info_per_seq`;

CREATE TABLE `silva_taxonomy_info_per_seq` (
  `silva_taxonomy_info_per_seq_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_id` bigint(11) unsigned NOT NULL,
  `silva_taxonomy_id` int(11) unsigned NOT NULL,
  `gast_distance` decimal(7,5) NOT NULL,
  `refssu_id` int(11) unsigned NOT NULL,
  `refssu_count` int(10) unsigned NOT NULL DEFAULT '0',
  `rank_id` tinyint(11) unsigned NOT NULL,
  `refhvr_id_id` int(10) unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`silva_taxonomy_info_per_seq_id`),
  KEY `refssu_id` (`refssu_id`),
  KEY `sequence_uniq_info_fk_rank_id` (`rank_id`),
  KEY `sequence_uniq_info_fk_taxonomy_id_idx` (`silva_taxonomy_id`),
  KEY `all_ids` (`silva_taxonomy_id`,`gast_distance`,`refssu_id`,`refssu_count`,`rank_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table species
# ------------------------------------------------------------

DROP TABLE IF EXISTS `species`;

CREATE TABLE `species` (
  `species_id` int(5) unsigned NOT NULL AUTO_INCREMENT,
  `species` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`species_id`),
  UNIQUE KEY `species` (`species`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table strain
# ------------------------------------------------------------

DROP TABLE IF EXISTS `strain`;

CREATE TABLE `strain` (
  `strain_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `strain` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`strain_id`),
  UNIQUE KEY `strain` (`strain`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table term
# ------------------------------------------------------------

DROP TABLE IF EXISTS `term`;

CREATE TABLE `term` (
  `term_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ontology_id` bigint(20) NOT NULL,
  `term_name` varchar(16) NOT NULL,
  `identifier` varchar(16) DEFAULT NULL,
  `definition` varchar(16) DEFAULT NULL,
  `namespace` varchar(16) DEFAULT NULL,
  `is_obsolete` smallint(1) NOT NULL DEFAULT '0',
  `is_root_term` smallint(1) NOT NULL,
  `is_leaf` smallint(1) NOT NULL,
  PRIMARY KEY (`term_id`),
  UNIQUE KEY `term_id` (`term_id`),
  UNIQUE KEY `idx_term` (`ontology_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table term_path
# ------------------------------------------------------------

DROP TABLE IF EXISTS `term_path`;

CREATE TABLE `term_path` (
  `term_path_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subject_term_id` bigint(20) NOT NULL,
  `predicate_term_id` bigint(20) NOT NULL,
  `object_term_id` bigint(20) NOT NULL,
  `ontology_id` bigint(20) NOT NULL,
  `relationship_type_id` int(11) NOT NULL,
  `distance` int(11) DEFAULT NULL,
  PRIMARY KEY (`term_path_id`),
  UNIQUE KEY `term_path_id` (`term_path_id`),
  KEY `idx_term_path` (`ontology_id`),
  KEY `idx_term_path_relatonship` (`relationship_type_id`),
  KEY `idx_term_path_subject` (`subject_term_id`),
  KEY `idx_term_path_predicate` (`predicate_term_id`),
  KEY `idx_term_path_object` (`object_term_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table term_relationship
# ------------------------------------------------------------

DROP TABLE IF EXISTS `term_relationship`;

CREATE TABLE `term_relationship` (
  `term_relationship_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subject_term_id` bigint(20) NOT NULL,
  `predicate_term_id` bigint(20) NOT NULL,
  `object_term_id` bigint(20) NOT NULL,
  `ontology_id` bigint(20) NOT NULL,
  PRIMARY KEY (`term_relationship_id`),
  UNIQUE KEY `term_relationship_id` (`term_relationship_id`),
  KEY `idx_term_relationship_subject` (`subject_term_id`),
  KEY `idx_term_relationship_predicate` (`predicate_term_id`),
  KEY `idx_term_relationship_object` (`object_term_id`),
  KEY `idx_term_relationship_ontology` (`ontology_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table term_synonym
# ------------------------------------------------------------

DROP TABLE IF EXISTS `term_synonym`;

CREATE TABLE `term_synonym` (
  `synonym_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `term_id` bigint(20) NOT NULL,
  `synonym_value` varchar(16) NOT NULL,
  `synonym_type_id` bigint(20) NOT NULL,
  PRIMARY KEY (`synonym_id`),
  UNIQUE KEY `synonym_id` (`synonym_id`),
  KEY `idx_term_synonym` (`term_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table user
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `user_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `email` varchar(64) NOT NULL DEFAULT '',
  `institution` varchar(128) DEFAULT NULL,
  `first_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `security_level` tinyint(3) unsigned NOT NULL DEFAULT '50',
  `encrypted_password` varchar(255) NOT NULL DEFAULT '',
  `sign_in_count` int(11) DEFAULT '0',
  `current_sign_in_at` datetime DEFAULT NULL,
  `last_sign_in_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `contact_email_inst` (`first_name`,`last_name`,`email`,`institution`),
  UNIQUE KEY `username` (`username`),
  KEY `institution` (`institution`(15))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table user_project
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_project`;

CREATE TABLE `user_project` (
  `user_project_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned DEFAULT NULL,
  `project_id` int(11) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_project_id`),
  UNIQUE KEY `user_id_project_id` (`user_id`,`project_id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `user_project_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_project_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
