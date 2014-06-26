-- MySQL dump 10.13  Distrib 5.6.17, for osx10.7 (x86_64)
--
-- Host: localhost    Database: vamps_js_development
-- ------------------------------------------------------
-- Server version  5.6.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `datasets`
--

DROP TABLE IF EXISTS `datasets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `datasets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dataset` varchar(64) NOT NULL DEFAULT '',
  `dataset_description` varchar(100) NOT NULL DEFAULT '',
  `env_sample_source_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dataset_project` (`dataset`,`project_id`),
  KEY `dataset_fk_project_id` (`project_id`),
  KEY `dataset_fk_env_sample_source_id` (`env_sample_source_id`),
  CONSTRAINT `dataset_fk_env_sample_source_id` FOREIGN KEY (`env_sample_source_id`) REFERENCES `env_sample_sources` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `dataset_fk_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dna_regions`
--

DROP TABLE IF EXISTS `dna_regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dna_regions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dna_region` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dna_region` (`dna_region`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `domains`
--

DROP TABLE IF EXISTS `domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `domains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `env_sample_sources`
--

DROP TABLE IF EXISTS `env_sample_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `env_sample_sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `env_sample_source_id` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `env_source_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `env_source_name` (`env_source_name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `families`
--

DROP TABLE IF EXISTS `families`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `families` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `family` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `family` (`family`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genera`
--

DROP TABLE IF EXISTS `genera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genera` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `genus` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `genus` (`genus`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ill_full_temp`
--

DROP TABLE IF EXISTS `ill_full_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ill_full_temp` (
  `run_info_run_info_id` int(11) NOT NULL DEFAULT '0',
  `run_info_run_key_id` int(11) NOT NULL,
  `run_info_run_id` int(11) NOT NULL,
  `run_info_lane` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `run_info_dataset_id` int(11) NOT NULL,
  `run_info_project_id` int(11) NOT NULL,
  `run_info_tubelabel` varchar(32) NOT NULL DEFAULT '',
  `run_info_barcode` char(4) NOT NULL DEFAULT '',
  `run_info_adaptor` char(3) NOT NULL DEFAULT '',
  `run_info_dna_region_id` int(11) NOT NULL,
  `run_info_amp_operator` varchar(5) NOT NULL DEFAULT '',
  `run_info_seq_operator` varchar(5) NOT NULL DEFAULT '',
  `run_info_barcode_index` char(12) NOT NULL DEFAULT '',
  `run_info_overlap` enum('complete','partial','none') NOT NULL DEFAULT 'none',
  `run_info_insert_size` smallint(5) unsigned NOT NULL DEFAULT '0',
  `run_info_file_prefix` char(0) NOT NULL DEFAULT '',
  `run_info_read_length` smallint(5) unsigned NOT NULL COMMENT 'the raw reads lengths from the machine',
  `run_info_primer_suite_id` int(11) NOT NULL,
  `run_key_run_key_id` int(11) NOT NULL DEFAULT '0',
  `run_key` varchar(25) NOT NULL DEFAULT '',
  `run_run_id` int(11) NOT NULL DEFAULT '0',
  `run_run` varchar(16) NOT NULL DEFAULT '',
  `run_run_prefix` char(7) NOT NULL DEFAULT '',
  `run_date_trimmed` date DEFAULT NULL,
  `dna_region_dna_region_id` int(11) NOT NULL DEFAULT '0',
  `dna_region_dna_region` varchar(32) DEFAULT NULL,
  `primer_suite_primer_suite_id` int(11) NOT NULL DEFAULT '0',
  `primer_suite_primer_suite` varchar(25) NOT NULL DEFAULT '',
  `sequence_pdr_info_sequence_pdr_info_id` int(11) NOT NULL DEFAULT '0',
  `sequence_pdr_info_run_info_id` int(11) NOT NULL,
  `sequence_pdr_info_sequence_id` int(11) NOT NULL,
  `sequence_pdr_info_seq_count` int(11) unsigned NOT NULL COMMENT 'count unique sequence per run / project / dataset = frequency from a file',
  `sequence_uniq_info_sequence_uniq_info_id` int(11) NOT NULL DEFAULT '0',
  `sequence_uniq_info_sequence_id` int(11) NOT NULL,
  `sequence_uniq_info_taxonomy_id` int(11) NOT NULL,
  `sequence_uniq_info_gast_distance` decimal(7,5) NOT NULL,
  `sequence_uniq_info_refssu_id` int(11) NOT NULL,
  `sequence_uniq_info_refssu_count` int(10) unsigned NOT NULL DEFAULT '0',
  `sequence_uniq_info_rank_id` int(11) NOT NULL,
  `sequence_uniq_info_refhvr_ids` text NOT NULL,
  `rank_rank_id` int(11) NOT NULL DEFAULT '0',
  `rank_rank` varchar(32) NOT NULL DEFAULT '',
  `taxonomy` varchar(300) DEFAULT NULL,
  `sequence_sequence_id` int(11) NOT NULL DEFAULT '0',
  `sequence` longblob NOT NULL,
  `project_project_id` int(11) NOT NULL DEFAULT '0',
  `project_project` varchar(32) NOT NULL DEFAULT '',
  `project_title` varchar(64) NOT NULL DEFAULT '',
  `project_project_description` varchar(255) NOT NULL DEFAULT '',
  `project_rev_project_name` varchar(32) NOT NULL DEFAULT '',
  `project_funding` varchar(64) NOT NULL DEFAULT '',
  `env_sample_source_id` int(11) DEFAULT NULL,
  `project_contact_id` int(11) DEFAULT NULL,
  `env_sample_source_env_sample_source_id` int(11) NOT NULL DEFAULT '0',
  `env_sample_source_env_source_name` varchar(50) DEFAULT NULL,
  `contact_contact_id` int(11) NOT NULL DEFAULT '0',
  `contact_contact` varchar(32) DEFAULT NULL,
  `contact_email` varchar(64) DEFAULT NULL,
  `contact_institution` varchar(128) DEFAULT NULL,
  `contact_vamps_name` varchar(20) DEFAULT NULL,
  `contact_first_name` varchar(20) DEFAULT NULL,
  `contact_last_name` varchar(20) DEFAULT NULL,
  `dataset_dataset_id` int(11) NOT NULL DEFAULT '0',
  `dataset_dataset` varchar(64) NOT NULL DEFAULT '',
  `dataset_dataset_description` varchar(100) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `klasses`
--

DROP TABLE IF EXISTS `klasses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `klasses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `klass` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `klass` (`klass`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderx` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order` (`orderx`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phylums`
--

DROP TABLE IF EXISTS `phylums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phylums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phylum` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phylum` (`phylum`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project` varchar(32) NOT NULL DEFAULT '',
  `title` varchar(64) NOT NULL DEFAULT '',
  `project_description` varchar(255) NOT NULL DEFAULT '',
  `rev_project_name` varchar(32) NOT NULL DEFAULT '',
  `funding` varchar(64) NOT NULL DEFAULT '',
  `user_id` int(11) DEFAULT NULL,
  `public` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `project` (`project`),
  UNIQUE KEY `rev_project_name` (`rev_project_name`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `project_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ranks`
--

DROP TABLE IF EXISTS `ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ranks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rank` varchar(32) NOT NULL DEFAULT '',
  `rank_number` tinyint(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rank` (`rank`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refssu115_notes`
--

DROP TABLE IF EXISTS `refssu115_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refssu115_notes` (
  `refssu115_notes_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `tax_silva115` varchar(254) NOT NULL DEFAULT '' COMMENT 'path',
  `node` varchar(64) NOT NULL DEFAULT '',
  `rank` varchar(32) NOT NULL DEFAULT '',
  `remark` char(1) NOT NULL DEFAULT '',
  PRIMARY KEY (`refssu115_notes_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9588 DEFAULT CHARSET=latin1 COMMENT='File from Pelin tax_ranks_ssu_115.csv, SILVA Release 115';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `schema_migrations`
--

DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schema_migrations` (
  `version` varchar(255) NOT NULL,
  UNIQUE KEY `unique_schema_migrations` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sequence_pdr_infos`
--

DROP TABLE IF EXISTS `sequence_pdr_infos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequence_pdr_infos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) NOT NULL,
  `sequence_id` int(11) NOT NULL,
  `seq_count` int(11) unsigned NOT NULL COMMENT 'count unique sequence per run / project / dataset = frequency from a file',
  `classifier` enum('RDP','GAST') DEFAULT 'GAST',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_seq_pd` (`dataset_id`,`sequence_id`),
  KEY `sequence_pdr_info_fk_sequence_id` (`sequence_id`),
  CONSTRAINT `sequence_pdr_info_fk_sequence_id` FOREIGN KEY (`sequence_id`) REFERENCES `sequences` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2001 DEFAULT CHARSET=latin1 COMMENT='sequences uniqued per projsect / dataset';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sequence_uniq_infos`
--

DROP TABLE IF EXISTS `sequence_uniq_infos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequence_uniq_infos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence_id` int(11) NOT NULL,
  `taxonomy_id` int(11) NOT NULL,
  `tax_silva108_id` int(11) DEFAULT NULL,
  `tax_gg_id` int(11) DEFAULT NULL,
  `otu_id` int(11) DEFAULT NULL,
  `med_node_id` int(11) DEFAULT NULL,
  `gast_distance` decimal(7,5) NOT NULL,
  `refssu_id` int(11) NOT NULL,
  `refssu_count` int(10) unsigned NOT NULL DEFAULT '0',
  `rank_id` int(11) NOT NULL,
  `refhvr_ids` text NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sequence_id` (`sequence_id`),
  KEY `refssu_id` (`refssu_id`),
  KEY `sequence_uniq_info_fk_rank_id` (`rank_id`),
  KEY `sequence_uniq_info_fk_taxonomy_id` (`taxonomy_id`),
  CONSTRAINT `sequence_uniq_info_fk_rank_id` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sequence_uniq_info_fk_sequence_id` FOREIGN KEY (`sequence_id`) REFERENCES `sequences` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sequence_uniq_info_fk_taxonomy_id` FOREIGN KEY (`taxonomy_id`) REFERENCES `taxonomies_old` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1008 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sequences`
--

DROP TABLE IF EXISTS `sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence_comp` longblob,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sequence_comp` (`sequence_comp`(400))
) ENGINE=InnoDB AUTO_INCREMENT=1008 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `species`
--

DROP TABLE IF EXISTS `species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `species` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `species` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `species` (`species`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `strains`
--

DROP TABLE IF EXISTS `strains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `strains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `strain` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `strain` (`strain`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tax_silva115_a_temp`
--

DROP TABLE IF EXISTS `tax_silva115_a_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tax_silva115_a_temp` (
  `tax_silva115` varchar(254) NOT NULL DEFAULT '' COMMENT 'path'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxonomies`
--

DROP TABLE IF EXISTS `taxonomies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxonomies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `phylum_id` int(11) DEFAULT NULL,
  `klass_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `family_id` int(11) DEFAULT NULL,
  `genus_id` int(11) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `strain_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `all_names` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`strain_id`),
  KEY `taxonomy_fk_strain_id` (`strain_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`),
  CONSTRAINT `taxonomy_fk_domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_fk_family_id` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_fk_genus_id` FOREIGN KEY (`genus_id`) REFERENCES `genera` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_fk_klass_id` FOREIGN KEY (`klass_id`) REFERENCES `klasses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_fk_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_fk_phylum_id` FOREIGN KEY (`phylum_id`) REFERENCES `phylums` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_fk_species_id` FOREIGN KEY (`species_id`) REFERENCES `species` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_fk_strain_id` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxonomies_old`
--

DROP TABLE IF EXISTS `taxonomies_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxonomies_old` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `taxonomy` varchar(300) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `taxonomy` (`taxonomy`)
) ENGINE=InnoDB AUTO_INCREMENT=3915255 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_med`
--

DROP TABLE IF EXISTS `unit_med`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_med` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `phylum_id` int(11) DEFAULT NULL,
  `klass_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `family_id` int(11) DEFAULT NULL,
  `genus_id` int(11) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `strain_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `all_names` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`strain_id`),
  KEY `taxonomy_fk_strain_id` (`strain_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`),
  CONSTRAINT `unit_med_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_med_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_med_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genera` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_med_ibfk_4` FOREIGN KEY (`klass_id`) REFERENCES `klasses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_med_ibfk_5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_med_ibfk_6` FOREIGN KEY (`phylum_id`) REFERENCES `phylums` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_med_ibfk_7` FOREIGN KEY (`species_id`) REFERENCES `species` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_med_ibfk_8` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_otus`
--

DROP TABLE IF EXISTS `unit_otus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_otus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `phylum_id` int(11) DEFAULT NULL,
  `klass_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `family_id` int(11) DEFAULT NULL,
  `genus_id` int(11) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `strain_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `all_names` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`strain_id`),
  KEY `taxonomy_fk_strain_id` (`strain_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`),
  CONSTRAINT `unit_otus_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_otus_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_otus_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genera` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_otus_ibfk_4` FOREIGN KEY (`klass_id`) REFERENCES `klasses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_otus_ibfk_5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_otus_ibfk_6` FOREIGN KEY (`phylum_id`) REFERENCES `phylums` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_otus_ibfk_7` FOREIGN KEY (`species_id`) REFERENCES `species` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_otus_ibfk_8` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_tax_gg`
--

DROP TABLE IF EXISTS `unit_tax_gg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_tax_gg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `phylum_id` int(11) DEFAULT NULL,
  `klass_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `family_id` int(11) DEFAULT NULL,
  `genus_id` int(11) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `strain_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `all_names` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`strain_id`),
  KEY `taxonomy_fk_strain_id` (`strain_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`),
  CONSTRAINT `unit_tax_gg_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_gg_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_gg_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genera` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_gg_ibfk_4` FOREIGN KEY (`klass_id`) REFERENCES `klasses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_gg_ibfk_5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_gg_ibfk_6` FOREIGN KEY (`phylum_id`) REFERENCES `phylums` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_gg_ibfk_7` FOREIGN KEY (`species_id`) REFERENCES `species` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_gg_ibfk_8` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_tax_silva108`
--

DROP TABLE IF EXISTS `unit_tax_silva108`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_tax_silva108` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) DEFAULT NULL,
  `phylum_id` int(11) DEFAULT NULL,
  `klass_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `family_id` int(11) DEFAULT NULL,
  `genus_id` int(11) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `strain_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `all_names` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`strain_id`),
  KEY `taxonomy_fk_strain_id` (`strain_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`),
  CONSTRAINT `unit_tax_silva108_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_silva108_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_silva108_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genera` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_silva108_ibfk_4` FOREIGN KEY (`klass_id`) REFERENCES `klasses` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_silva108_ibfk_5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_silva108_ibfk_6` FOREIGN KEY (`phylum_id`) REFERENCES `phylums` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_silva108_ibfk_7` FOREIGN KEY (`species_id`) REFERENCES `species` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `unit_tax_silva108_ibfk_8` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `email` varchar(64) NOT NULL DEFAULT '',
  `institution` varchar(128) DEFAULT NULL,
  `first_name` varchar(20) DEFAULT NULL,
  `last_name` varchar(20) DEFAULT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `security_level` tinyint(3) unsigned NOT NULL DEFAULT '50',
  `encrypted_password` varchar(255) NOT NULL DEFAULT '',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_sent_at` datetime DEFAULT NULL,
  `remember_created_at` datetime DEFAULT NULL,
  `sign_in_count` int(11) DEFAULT '0',
  `current_sign_in_at` datetime DEFAULT NULL,
  `last_sign_in_at` datetime DEFAULT NULL,
  `current_sign_in_ip` varchar(255) DEFAULT NULL,
  `last_sign_in_ip` varchar(255) DEFAULT NULL,
  `confirmation_token` varchar(255) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `confirmation_sent_at` datetime DEFAULT NULL,
  `unconfirmed_email` varchar(255) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `contact_email_inst` (`first_name`,`last_name`,`email`,`institution`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `index_users_on_reset_password_token` (`reset_password_token`),
  UNIQUE KEY `index_users_on_confirmation_token` (`confirmation_token`),
  KEY `institution` (`institution`(15))
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users_projects`
--

DROP TABLE IF EXISTS `users_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users_projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users_projects_fk_project_id` (`project_id`),
  KEY `users_projects_fk_users_id` (`user_id`),
  CONSTRAINT `users_projects_fk_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `users_projects_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-06-17 15:56:23
