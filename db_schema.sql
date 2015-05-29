-- MySQL dump 10.13  Distrib 5.6.17, for osx10.7 (x86_64)
--
-- Host: 127.0.0.1    Database: vamps_js_development
-- ------------------------------------------------------
-- Server version	5.6.17

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
-- Table structure for table `classifier`
--

DROP TABLE IF EXISTS `classifier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classifier` (
  `classifier_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `classifier` varchar(32) NOT NULL COMMENT '''RDP'',''GAST''',
  PRIMARY KEY (`classifier_id`),
  UNIQUE KEY `classifier_UNIQUE` (`classifier`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `custom_metadata_fields`
--

DROP TABLE IF EXISTS `custom_metadata_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_metadata_fields` (
  `custom_metadata_fields_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int(11) unsigned NOT NULL,
  `field_name` varchar(60) NOT NULL DEFAULT '',
  `field_type` varchar(16) NOT NULL DEFAULT 'varchar(128)',
  `example` varchar(128) NOT NULL,
  PRIMARY KEY (`custom_metadata_fields_id`),
  UNIQUE KEY `project_id_field_name` (`project_id`,`field_name`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `custom_metadata_fields_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10970 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dataset`
--

DROP TABLE IF EXISTS `dataset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=782 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `domain`
--

DROP TABLE IF EXISTS `domain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `domain` (
  `domain_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `domain` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`domain_id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `env_sample_source`
--

DROP TABLE IF EXISTS `env_sample_source`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `env_sample_source` (
  `env_sample_source_id` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `env_source_name` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`env_sample_source_id`),
  UNIQUE KEY `env_source_name` (`env_source_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `family`
--

DROP TABLE IF EXISTS `family`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `family` (
  `family_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `family` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`family_id`),
  UNIQUE KEY `family` (`family`)
) ENGINE=InnoDB AUTO_INCREMENT=2333857 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genus`
--

DROP TABLE IF EXISTS `genus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genus` (
  `genus_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `genus` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`genus_id`),
  UNIQUE KEY `genus` (`genus`)
) ENGINE=InnoDB AUTO_INCREMENT=2090419 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gg_otu`
--

DROP TABLE IF EXISTS `gg_otu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gg_otu` (
  `gg_otu_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `otu_name` int(10) unsigned DEFAULT NULL,
  `gg_taxonomy_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`gg_otu_id`),
  KEY `gg_otu_fk_gg_taxonomy_id_idx` (`gg_taxonomy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gg_taxonomy`
--

DROP TABLE IF EXISTS `gg_taxonomy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `klass`
--

DROP TABLE IF EXISTS `klass`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `klass` (
  `klass_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `klass` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`klass_id`),
  UNIQUE KEY `klass` (`klass`)
) ENGINE=InnoDB AUTO_INCREMENT=370048 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `olygotypes`
--

DROP TABLE IF EXISTS `olygotypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `olygotypes` (
  `olygotypes_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `olygotype_info` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`olygotypes_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `order_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order` (`order`)
) ENGINE=InnoDB AUTO_INCREMENT=1646277 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phylum`
--

DROP TABLE IF EXISTS `phylum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phylum` (
  `phylum_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `phylum` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`phylum_id`),
  UNIQUE KEY `phylum` (`phylum`)
) ENGINE=InnoDB AUTO_INCREMENT=100381 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project` (
  `project_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `project` varchar(32) NOT NULL DEFAULT '',
  `title` varchar(64) NOT NULL DEFAULT '',
  `project_description` varchar(255) NOT NULL DEFAULT '',
  `rev_project_name` varchar(32) NOT NULL DEFAULT '',
  `funding` varchar(64) NOT NULL DEFAULT '',
  `owner_user_id` int(11) unsigned DEFAULT NULL,
  `public` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `project` (`project`),
  UNIQUE KEY `rev_project_name` (`rev_project_name`),
  KEY `project_fk_user_id_idx` (`owner_user_id`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`owner_user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rank`
--

DROP TABLE IF EXISTS `rank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rank` (
  `rank_id` tinyint(11) unsigned NOT NULL AUTO_INCREMENT,
  `rank` varchar(32) NOT NULL DEFAULT '',
  `rank_number` tinyint(3) NOT NULL,
  PRIMARY KEY (`rank_id`),
  UNIQUE KEY `rank` (`rank`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_silva_taxonomy_info_per_seq_refhvr_id`
--

DROP TABLE IF EXISTS `ref_silva_taxonomy_info_per_seq_refhvr_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ref_silva_taxonomy_info_per_seq_refhvr_id` (
  `refhvr_id_id` int(10) unsigned NOT NULL,
  `silva_taxonomy_info_per_seq_id` int(10) unsigned NOT NULL,
  UNIQUE KEY `all_uniq` (`refhvr_id_id`,`silva_taxonomy_info_per_seq_id`),
  KEY `silva_taxonomy_info_per_seq_id_idx` (`silva_taxonomy_info_per_seq_id`),
  KEY `refhvr_id_id_idx` (`refhvr_id_id`),
  CONSTRAINT `ref_silva_taxonomy_info_per_seq_refhvr_id_ibfk_1` FOREIGN KEY (`refhvr_id_id`) REFERENCES `refhvr_id` (`refhvr_id_id`) ON UPDATE CASCADE,
  CONSTRAINT `ref_silva_taxonomy_info_per_seq_refhvr_id_ibfk_2` FOREIGN KEY (`silva_taxonomy_info_per_seq_id`) REFERENCES `silva_taxonomy_info_per_seq` (`silva_taxonomy_info_per_seq_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refhvr_id`
--

DROP TABLE IF EXISTS `refhvr_id`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refhvr_id` (
  `refhvr_id_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `refhvr_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`refhvr_id_id`),
  UNIQUE KEY `refhvr_id_UNIQUE` (`refhvr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=90973 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `required_metadata_info`
--

DROP TABLE IF EXISTS `required_metadata_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `required_metadata_info` (
  `required_metadata_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) unsigned NOT NULL,
  `taxon_id` int(11) NOT NULL COMMENT 'Refers to the number assigned to the specific metagenome being sampled:\n  required for all sample submissions e.g. marine metagenome is 408172\n   http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi',
  `description` varchar(100) NOT NULL DEFAULT '' COMMENT 'A description of the sample that can include site, subject, sample matter',
  `common_name` varchar(100) NOT NULL DEFAULT '' COMMENT 'Name of the TAXON_ID e.g. 408172 is marine metagenome',
  `altitude` double NOT NULL COMMENT 'Height above ground or sea in the air (in meters) required for all sample submissions - 0 should be used if sample is not in the air above ground',
  `assigned_from_geo` char(1) NOT NULL COMMENT 'Is the latitude, longitude and elevation assigned from a geographic reference? y or n required for all sample submissions.',
  `collection_date` date NOT NULL COMMENT 'The day and time of sampling, single point in time using a 24 hour time format required for all sample submissions Date should be in MM/DD/YY format.  Time can be truncated or omitted or entered in a separate column collection_time',
  `depth` double NOT NULL COMMENT 'Depth underground for soil or under water for aquatic samples.  Should be in meters required for all sample submissions, should be in meters',
  `country` varchar(128) NOT NULL COMMENT 'The geographical origin of the sample as defined by the country\n  required for all sample submissions, chosen from the GAZ ontology\n  http://bioportal.bioontology.org/visualize/40651',
  `elevation` int(11) NOT NULL COMMENT 'Height of land above sea level in meters\n  required for all sample submissions, distinguish from altitude which is height above land or sea in the air.',
  `env_biome` varchar(128) NOT NULL COMMENT 'Classification of the location where the sample was obtained\n  required for all sample submissions. The world''s major communities, classified according to the predominant vegetation and characterized by adaptations of organisms to that particular environment\nhttp://www.ebi.ac.uk/ontology-lookup/browse.do?ontName=ENVO',
  `env_feature` varchar(128) NOT NULL COMMENT 'Classification of a specific feature in the biome\n  required for all sample submissions e.g. Was the feature a forest, grassland, agricultural site\n  http://www.ebi.ac.uk/ontology-lookup/browse.do?ontName=ENVO ',
  `env_matter` varchar(128) NOT NULL COMMENT 'Classification of the material being sampled\n  required for all sample submissions e.g. soil, sea water, feces\n  http://www.ebi.ac.uk/ontology-lookup/browse.do?ontName=ENVO',
  `latitude` double NOT NULL COMMENT 'Classification of the site by latitude and longitude in decimal degrees\n  required for all sample submissions. Please convert from GPS co-ordinates  or DD MM SS to decimal degrees\n  http://www.microbio.me/qiime/fusebox.psp?page=tools_geo.psp',
  `longitude` double NOT NULL COMMENT 'Classification of the site by latitude and longitude in decimal degrees\n  required for all sample submissions. Please convert from GPS co-ordinates  or DD MM SS to decimal degrees\n  http://www.microbio.me/qiime/fusebox.psp?page=tools_geo.psp',
  `public` char(1) NOT NULL COMMENT 'Has the sample been published?\n  responses: y/n',
  PRIMARY KEY (`required_metadata_id`),
  UNIQUE KEY `dataset_id_u` (`dataset_id`),
  CONSTRAINT `required_metadata_info_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=300 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sequence`
--

DROP TABLE IF EXISTS `sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequence` (
  `sequence_id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_comp` longblob,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence_id`),
  UNIQUE KEY `sequence_comp` (`sequence_comp`(400))
) ENGINE=InnoDB AUTO_INCREMENT=7191869 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sequence_pdr_info`
--

DROP TABLE IF EXISTS `sequence_pdr_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequence_pdr_info` (
  `sequence_pdr_info_id` int(11) NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) unsigned NOT NULL,
  `sequence_id` bigint(11) unsigned NOT NULL,
  `seq_count` int(11) unsigned NOT NULL COMMENT 'count unique sequence per run / project / dataset = frequency from a file',
  `classifier_id` int(10) unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence_pdr_info_id`),
  UNIQUE KEY `dat_seq_count` (`dataset_id`,`seq_count`,`sequence_id`),
  KEY `sequence_pdr_info_fk_sequence_id` (`sequence_id`),
  KEY `sequence_pdr_info_fk_classifier_id_idx` (`classifier_id`),
  CONSTRAINT `sequence_pdr_info_ibfk_1` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE,
  CONSTRAINT `sequence_pdr_info_ibfk_2` FOREIGN KEY (`sequence_id`) REFERENCES `sequence` (`sequence_id`) ON UPDATE CASCADE,
  CONSTRAINT `sequence_pdr_info_ibfk_3` FOREIGN KEY (`classifier_id`) REFERENCES `classifier` (`classifier_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14613907 DEFAULT CHARSET=latin1 COMMENT='sequences uniqued per run / project / dataset';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sequence_uniq_info`
--

DROP TABLE IF EXISTS `sequence_uniq_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequence_uniq_info` (
  `sequence_uniq_info_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_id` bigint(11) unsigned NOT NULL,
  `silva_taxonomy_info_per_seq_id` int(11) unsigned DEFAULT NULL,
  `gg_otu_id` int(10) unsigned DEFAULT NULL,
  `oligotype_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence_uniq_info_id`),
  UNIQUE KEY `sequence_id` (`sequence_id`),
  KEY `sequence_uniq_info_fk_silva_taxonomy_info_per_seq_id_idx` (`silva_taxonomy_info_per_seq_id`),
  KEY `sequence_uniq_info_fk_gg_otu_id_idx` (`gg_otu_id`),
  KEY `sequence_uniq_info_fk_olygotype_id_idx` (`oligotype_id`),
  CONSTRAINT `sequence_uniq_info_ibfk_1` FOREIGN KEY (`sequence_id`) REFERENCES `sequence` (`sequence_id`) ON UPDATE CASCADE,
  CONSTRAINT `sequence_uniq_info_ibfk_2` FOREIGN KEY (`silva_taxonomy_info_per_seq_id`) REFERENCES `silva_taxonomy_info_per_seq` (`silva_taxonomy_info_per_seq_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7146094 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `silva_taxonomy`
--

DROP TABLE IF EXISTS `silva_taxonomy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5527996 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `silva_taxonomy_info_per_seq`
--

DROP TABLE IF EXISTS `silva_taxonomy_info_per_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `silva_taxonomy_info_per_seq` (
  `silva_taxonomy_info_per_seq_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sequence_id` bigint(11) unsigned NOT NULL,
  `silva_taxonomy_id` int(11) unsigned NOT NULL,
  `gast_distance` decimal(7,5) NOT NULL,
  `refssu_id` int(11) unsigned NOT NULL,
  `refssu_count` int(10) unsigned NOT NULL DEFAULT '0',
  `rank_id` tinyint(11) unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`silva_taxonomy_info_per_seq_id`),
  KEY `refssu_id` (`refssu_id`),
  KEY `sequence_uniq_info_fk_rank_id` (`rank_id`),
  KEY `sequence_uniq_info_fk_taxonomy_id_idx` (`silva_taxonomy_id`),
  KEY `all_ids` (`silva_taxonomy_id`,`gast_distance`,`refssu_id`,`refssu_count`,`rank_id`),
  KEY `sequence_id` (`sequence_id`),
  CONSTRAINT `silva_taxonomy_info_per_seq_ibfk_1` FOREIGN KEY (`rank_id`) REFERENCES `rank` (`rank_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_info_per_seq_ibfk_2` FOREIGN KEY (`silva_taxonomy_id`) REFERENCES `silva_taxonomy` (`silva_taxonomy_id`) ON UPDATE CASCADE,
  CONSTRAINT `silva_taxonomy_info_per_seq_ibfk_3` FOREIGN KEY (`sequence_id`) REFERENCES `sequence` (`sequence_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15067747 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `species`
--

DROP TABLE IF EXISTS `species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `species` (
  `species_id` int(5) unsigned NOT NULL AUTO_INCREMENT,
  `species` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`species_id`),
  UNIQUE KEY `species` (`species`)
) ENGINE=InnoDB AUTO_INCREMENT=1532410 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `strain`
--

DROP TABLE IF EXISTS `strain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `strain` (
  `strain_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `strain` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`strain_id`),
  UNIQUE KEY `strain` (`strain`)
) ENGINE=InnoDB AUTO_INCREMENT=423659 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `summed_counts`
--

DROP TABLE IF EXISTS `summed_counts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `summed_counts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) unsigned DEFAULT NULL,
  `domain_id` int(11) unsigned DEFAULT NULL,
  `phylum_id` int(11) unsigned DEFAULT NULL,
  `klass_id` int(11) unsigned DEFAULT NULL,
  `order_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `genus_id` int(11) unsigned DEFAULT NULL,
  `species_id` int(11) unsigned DEFAULT NULL,
  `strain_id` int(11) unsigned DEFAULT NULL,
  `rank_id` tinyint(11) unsigned DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `summed_counts_ibfk_11` (`dataset_id`),
  KEY `summed_counts_ibfk_1` (`strain_id`),
  KEY `summed_counts_ibfk_3` (`genus_id`),
  KEY `summed_counts_ibfk_4` (`domain_id`),
  KEY `summed_counts_ibfk_5` (`family_id`),
  KEY `summed_counts_ibfk_6` (`klass_id`),
  KEY `summed_counts_ibfk_7` (`order_id`),
  KEY `summed_counts_ibfk_8` (`phylum_id`),
  KEY `summed_counts_ibfk_9` (`species_id`),
  KEY `summed_counts_ibfk_10` (`rank_id`),
  CONSTRAINT `summed_counts_ibfk_1` FOREIGN KEY (`strain_id`) REFERENCES `strain` (`strain_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_10` FOREIGN KEY (`rank_id`) REFERENCES `rank` (`rank_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_11` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genus` (`genus_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_4` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_5` FOREIGN KEY (`family_id`) REFERENCES `family` (`family_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_6` FOREIGN KEY (`klass_id`) REFERENCES `klass` (`klass_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_7` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_8` FOREIGN KEY (`phylum_id`) REFERENCES `phylum` (`phylum_id`) ON UPDATE CASCADE,
  CONSTRAINT `summed_counts_ibfk_9` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1071232 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxa_counts_temp`
--

DROP TABLE IF EXISTS `taxa_counts_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxa_counts_temp` (
  `taxa_counts_temp_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dataset_id` int(11) unsigned NOT NULL,
  `seq_count` int(11) unsigned NOT NULL COMMENT 'count unique sequence per run / project / dataset = frequency from a file',
  `sequence_id` bigint(11) unsigned NOT NULL,
  `sequence_pdr_info_id` int(11) NOT NULL DEFAULT '0',
  `silva_taxonomy_id` int(11) unsigned NOT NULL,
  `domain_id` int(11) unsigned DEFAULT NULL,
  `phylum_id` int(11) unsigned DEFAULT NULL,
  `klass_id` int(11) unsigned DEFAULT NULL,
  `order_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `genus_id` int(11) unsigned NOT NULL,
  `species_id` int(11) unsigned DEFAULT NULL,
  `strain_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`taxa_counts_temp_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13483900 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_project`
--

DROP TABLE IF EXISTS `user_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_project_status`
--

DROP TABLE IF EXISTS `user_project_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_project_status` (
  `user_project_status_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user` varchar(64) NOT NULL DEFAULT '',
  `project` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `message` varchar(128) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`user_project_status_id`),
  UNIQUE KEY `user` (`user`,`project`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-05-29 13:37:44
