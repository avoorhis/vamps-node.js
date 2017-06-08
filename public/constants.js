var path = require("path");


var constants = {};
///////////////////////////////////////////
///////////////////////////////////////////
//// DO NOT CHANGE ANYTHING BELOW HERE ////
///////////////////////////////////////////
///////////////////////////////////////////
// constants.security_levels = {
//         'admin'     : 1,    // access to all the data and administrative pages 
//         'mbluser'   : 10,   // access to all the projects
//         'reguser'   : 50,   // public access plus other projects with permission
//         'guest'     : 99    // public access
//         }
constants.dataset_count_for_visuals_max     = 1100
constants.dataset_count_for_visuals_cutoff  = 500
constants.show_nas   = {"raw":false,"string":"--"};  // if raw==true will show class_NA, genus_NA etc; else show string (tax table only; not biom file)
constants.blast_db   = 'ALL_SEQS';
constants.download_file_formats = ['metadata','fasta','taxbytax','taxbyref','taxbyseq','biom','matrix','phyloseq','distance','emperor','pdf','tree','heatmap'];
// constants.ENV_SOURCE = {
//         10: "air",
//          20: "extreme habitat",
//         30: "host associated",
//          40: "human associated",
// 		 41: "human-skin",
// 		 42: "human-oral",
// 		 43: "human-gut",
//          44: "human-vaginal",
// 		 45: "human-amniotic-fluid",
// 		 46: "human-urine",
// 		 47: "human-blood",
// 	     50: "microbial mat/biofilm",
// 		 60: "miscellaneous_natural_or_artificial_environment",
// 		 70: "plant associated",
// 		 80: "sediment",
// 		 90: "soil/sand",
// 		 100: "unknown",
// 		 110: "wastewater/sludge",
// 		 120: "water-freshwater",
// 		 130: "water-marine",
// 		 140: "indoor"
//     };
// This is required for the simple taxonomy selection box
constants.DOMAINS = { domains: [
        {id: 1, name: "Archaea"},
        {id: 2, name: "Bacteria"},
        {id: 3, name: "Eukarya"},
        {id: 4, name: "Organelle"},
        {id: 5, name: "Unknown"}
    ]};
constants.TARGETS = ["Av3", "Av3v5","Av4","Av4v5","Av5v6", "Av6", "Av6v4",
                      "Bv1v2","Bv1v3","Bv1v4","Bv2","Bv3","Bv3v4","Bv3v5","Bv4","Bv4v5","Bv5","Bv5v6","Bv6", "Bv6v4",
                     "Ev4","Ev9","ITS" ];
constants.UNITSELECT = { units: [
        {id : 'tax_silva119_simple',file: 'unit_selectors/taxa_silva119_simple.html', name : "Taxonomy (Silva-119) -Simple", subtext: 'Silva119'},
        {id : 'tax_silva119_custom',file: 'unit_selectors/taxa_silva119_custom.html', name : "Taxonomy (Silva-119) -Custom", subtext: 'Silva119'},
        {id : 'tax_rdp2.6_simple',     file: 'unit_selectors/taxa_rdp2.6.html',             name : "Taxonomy RDP (v2.6)",     subtext: 'Release 2.6'},

     //   {id : 'tax_silva108_custom_fancytree',file: 'unit_selectors/taxa_silva108_custom_fancytree.json', name : "Taxonomy -Custom_fancytree", subtext: 'Silva108'},
     //   {id : 'tax_silva108_custom_dhtmlx',file: 'unit_selectors/taxa_silva108_custom_dhtmlx.json', name : "Taxonomy -Custom_dhtmlx", subtext: 'Silva108'},
        {id : 'tax_gg_simple',      file: 'unit_selectors/taxa_gg_simple.html',       name : "TODO-Taxonomy (Greengenes-13.5) -Simple", subtext: 'Greengenes v13.5'},
        {id : 'tax_gg_custom',      file: 'unit_selectors/taxa_gg_cust.html',         name : "TODO-Taxonomy (Greengenes-13.5) -Custom", subtext: 'Greengenes v13.5'},

        //{id : 'TODO-otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'ClosedRef GG v13.5'},
        //{id : 'TODO-otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'UCLUST'},
        {id : 'otus',               file: 'unit_selectors/otus.html',                 name : "TODO-OTUs",             subtext: 'SLP'},
        {id : 'med_nodes',          file: 'unit_selectors/med_nodes.html',            name : "TODO-MED Nodes",        subtext: ''}
    ]};
constants.UNIT_ASSIGNMENT_CHOICES = {
        'refRDP_2.12-16S': { taxonomy_curator:'RDP (2.12) 16S-rRNA', method:'RDP',  reference_db:'Default (no training)', availability:'available',     refdb:'2.12' },
        'refRDP_2.12-ITS': { taxonomy_curator:'RDP (2.12) ITS-UNITE', method:'RDP',  reference_db:'Default (no training)', availability:'available',     refdb:'2.12' },
        'refssu':   { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'refssu (full-length)',  availability:'available',     refdb:'refssu' },
        'refv1v3':  { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv1v3 (Bacterial)',     availability:'available', refdb:'refv1v3' },
        'refv3a':   { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Av3 (Archaeal)',        availability:'available', refdb:'refv3a' },
        'refv3':    { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv3 (Bacterial)',       availability:'available', refdb:'refv3' },
        'refv3v5':  { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv3v5 (Bacterial)',     availability:'available', refdb:'refv3v5' },
        'refv3v6':  { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv3v6 (Bacterial)',     availability:'available', refdb:'refv3v6' },
        'refv4':    { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv4 (Bacterial)',       availability:'available', refdb:'refv4' },
        'refv4v5a': { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Av4v5 (Archaeal)',      availability:'available', refdb:'refv4v5a' },
        'refv4v5':  { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv4v5 (Bacterial)',     availability:'available', refdb:'refv4v5' },
        'refv4v6a': { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Av4v6 (Archaeal)',      availability:'available', refdb:'refv4v6a' },
        'refv4v6':  { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv4v6 (Bacterial)',     availability:'available', refdb:'refv4v6' },
        'refv5':    { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv5 (Bacterial)',       availability:'available', refdb:'refv5' },
        'refv5v6':  { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv5v6 (Bacterial)',     availability:'available', refdb:'refv5v6' },
        'refv6a':   { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Av6 (Archaeal)',        availability:'available', refdb:'refv6a' },
        'refv6':    { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Bv6 (Bacterial)',       availability:'available', refdb:'refv6' },
        'refv9':    { taxonomy_curator:'SILVA (v119)', method:'GAST', reference_db:'Ev9 (Eukaryal)',        availability:'available', refdb:'refv9' },
        'refits1':  { taxonomy_curator:'UNITE', method:'GAST', reference_db:'ITS1',                         availability:'available', refdb:'refits1' },
        'refGG_MAY2013': { taxonomy_curator:'GreenGenes (May2013)', method:'GAST', reference_db:'refssu',        availability:'not available', refdb:'GG_MAY2013' }


    };

constants.REF_SUFFIX = { "unique.nonchimeric.fa": ['v1v3', 'v1v3a', 'v3v5', 'v4v5', 'v4v6', 'v6v4', 'v4v6a', 'v6v4a', 'its1'],
                         "unique": ['v3', 'v3a', 'v4', 'v5', 'v6', 'v6a', 'v9']
};
constants.REF_FULL_OPTION = ["refits1", "refssu"];

constants.VISUALOUTPUTCHOICES = { choices: [
        {id : 'counts_table',   show: 'Counts Table'},
        {id : 'barcharts',      show: 'Counts Bar Charts'},
        {id : 'heatmap',        show: 'Distance Heatmap'},
        {id : 'dendrogram',     show: 'Community Dendrogram'},
        {id : 'alphadiversity', show: 'Alpha Diversity'}
    ]};

constants.NORMALIZATIONCHOICES = { choices: [
        {id: 'none',            brief:'None (raw counts)',                      show: 'Not Normalized (default)'},
        {id: 'maximum',         brief:'Maximum (range: 0.0 - maxSampleCount)',  show: 'Normalized to the Maximum Sample'},
        {id: 'frequency',       brief:'Frequency (range: 0.0 - 1.0)',           show: 'Normalized to Frequency'}
    ]};


constants.DISTANCECHOICES = { choices: [

    {id: 'jaccard',         show: 'Jaccard'     },
    {id: 'kulczynski',      show: 'Kulczynski'  },
    {id: 'canberra',        show: 'Canberra'    },
    {id: 'morisita_horn',   show: 'Morisita-Horn'},
        // both R and python


    {id: 'bray_curtis',     show: 'Bray-Curtis' },
 //       {id: 'manhattan',       show: 'Manhattan'   },
 //       {id: 'gower',           show: 'Gower'       },
 //       {id: 'euclidean',       show: 'Euclidean'   },


 //       {id: 'pearson',         show: 'Pearson'     },
 //       {id: 'spearman',        show: 'Spearman'    },
// R only
//        {id: 'correlation',     show: 'Correlation' },
//        {id: 'mountford',       show: 'Mountford'   },
//        {id: 'chao_j',          show: 'Chao J'      },
//        {id: 'chao_s',          show: 'Chao S'      },
//        {id: 'raup',            show: 'Raup'        },

//        {id: 'yue_clayton',     show: 'Yue-Clayton' }

// python distances:

        // {id: 'abund_jaccard',         show: 'Jaccard  - Abundance'     },
        // {id: 'binary_jaccard',        show: 'Jaccard - Binary'     },
        // {id: 'soergel',         show: 'Soergel'     },
        // {id: 'hellinger',         show: 'Hellinger'     },
        // {id: 'chord',         show: 'chord'     },
        // {id: 'chisq',         show: 'Chisq'     }

    ]};

constants.PORTALS = {
    'CMP':{ name:'Coral Microbiome Portal',
            subtext:'CMP',
            projects:['LTR_MCR_Bv6','LTR_MCR_Av6','LTR_MCR_Ev9','ICM_CCB_Bv6','ICM_CCB_Av6'],
            prefixes:['CMP'],
            suffixes:[],
            pagetitle:'Coral Microbe Portal',
            maintitle:'Coral Microbiome Portal',
            subtitle: 'The Coral Microbiome Portal (CMP) database brings together next generation sequencing data of coral-associated microorganisms from studies conducted thoughout the world’s reefs.',
            thumb:'/images/portals/cmp_thumbnail.jpg',
            zoom:3
        },
    'CODL':{name:'Census of Deep Life',
            subtext:'CoDL',
            projects:[],
            prefixes:['DCO'],
            suffixes:[],
            pagetitle:'Census of Deep Life Portal',
            maintitle:'Census of Deep Life Portal',
            subtitle: 'The mandate of the Census of Deep Life is to perform a global survey of life in continental and marine subsurface environments using deep DNA sequencing technology.',
            thumb:'/images/portals/dco_thumbnail.jpg',
            zoom:2  // worldwide
        },
    'HMP': {name:'Human Mircrobiome Project',
            subtext:'HMP',
            projects:[],
            prefixes:['HMP'],
            suffixes:[],
            pagetitle:'Human Microbiome Project Portal',
            maintitle:'HMP Portal',
            subtitle: 'The NIH Human Microbiome Project is one of several international efforts designed to take advantage of large scale, high through multi ‘omics analyses to study the microbiome in human health.',
            thumb:'/images/portals/hmp_logo_NIH_retina.png',
            zoom:4  // mostly US? Do we even have or want distribution?
        },
    'ICOMM': {name:'International Census of Marine Microbes',
            subtext:'ICoMM',
            projects:[],
            prefixes:['ICM','KCK'],
            suffixes:[],
            pagetitle: 'International Census of Marine Microbes Portal',
            maintitle: 'ICoMM - Microbis Portal',
            subtitle: 'The role of the International Census of Marine Microbes (ICoMM) is to promote an agenda and an environment that will accelerate discovery,<br>understanding, and awareness of the global significance of marine microbes.',
            thumb:'/images/portals/icomm_thumbnail.jpg',
            zoom: 2  // worldwide
        },
    'LTER': {name:'Long Term Ecological Research (LTER)',
            subtext:'LTER',
            projects:[],
            prefixes:['LTR'],
            suffixes:[],
            pagetitle: 'Microbial Inventory Research Across Diverse Aquatic Sites (MIRADA) Portal',
            maintitle: 'MIRADA Portal',
            subtitle: 'Microbial Inventory Research Across Diverse Aquatic Long Term Ecological Research (LTER) Sites.',
            thumb:'/images/portals/lter_thumbnail.jpg',
            zoom: 5  // mostly US
        },
    'MBE': {name:'Microbiology of the Built Environment',
            subtext:'MBE',
            projects:[],
            prefixes:['MBE','RARE','SLM'],
            suffixes:[],
            pagetitle: 'Microbiology Of the Built Environment Portal',
            maintitle: 'MoBEDAC Portal',
            subtitle: 'Microbiome of the Built Environment -Data Analysis Core.',
            thumb:'/images/portals/mbe_thumbnail.gif',
            zoom: 4  // mostly US?
        },
    'PSPHERE':{name:'The Plastisphere',
            subtext:'Plastisphere',
            projects:['LAZ_SEA_Bv6','LAZ_SEA_Ev9','LAZ_SEA_Bv6v4','LAZ_DET_Bv3v4'],
            prefixes:[],
            suffixes:[],
            pagetitle: 'The Plastisphere',
            maintitle: 'Plastisphere Portal',
            subtitle: 'Bacteria and Plastics',
            thumb:'/images/portals/psphere_thumbnail.jpg',
            zoom: 5  // mostly US
        },
    'RARE':{name:'The Rare Biosphere',
            subtext:'Rare Biosphere',
            projects:[],
            prefixes:['RARE'],
            suffixes:[],
            pagetitle: 'The Rare Biosphere Portal',
            maintitle: 'Rare Biosphere Portal',
            subtitle: 'A New Paradigm for Microbiology.',
            thumb:'/images/portals/rare_thumbnail.png',
            zoom: 13  // mostly Falmouth
        },
    'UC':  {name:'Ulcerative Colitis',
            subtext:'Ulcerative Colitis',
            projects:[],
            prefixes:['UC'],
            suffixes:[],
            pagetitle: 'Ulcerative Colitis Portal',
            maintitle: 'Ulcerative Colitis Portal',
            subtitle: 'The Role of the Gut Microbiota in Ulcerative Colitis (NIH Human Microbiome Demonstration Project).',
            thumb:'/images/portals/uc_thumbnail.jpg',
            zoom: 4  // mostly US?
        },
    'UNIEUK': {name:'UniEuk',
            subtext:'UniEuk',
            projects:[],
            prefixes:[],
            suffixes:['Ev2','Ev4','Ev9','Euk'],
            pagetitle: 'UniEuk Portal',
            maintitle: 'UniEuk Portal',
            subtitle: 'A Gathering of all Eukaryal Projects.',
            thumb:'/images/portals/unieuk_thumbnail.jpg',
            zoom: 2  // worldwide
        }
    }

// This List MUST match the fields in sequence_uniq_infos
constants.AVAILABLE_UNITS = ['silva_taxonomy_info_per_seq_id', 'oligotype_id', 'gg_otu_id'];
// blue to red
constants.HEATMAP_COLORS = ['1111ff','3333ff','5555ff','7777ff','9999ff','aaaaff','ccccff','ddeeee','eeeedd','ffdddd','ffbbbb','ff9999','ff7777','ff5555','ff3333','ff0000'];

constants.RSCRIPT_CMD = 'RScript --no-restore --no-save';

constants.RANKS = ["domain", "phylum", "klass", "order", "family", "genus", "species", "strain"];

constants.PCT_RANGE = [0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100];

// these define the order and the images of the visual thumbnails available on the view_selection page
// Ideally ALL the information should be available here in the JSON
constants.VISUAL_THUMBNAILS = {
    visuals: [
        {   name:'Taxonomy Frequency Table',
            thumb:'/images/visuals/counts_table.png',
            //link:'user_viz_data/counts_table',
            //id:'counts_table_link_id',
            prefix:'counts_matrix',
            tip:''
        },

        {   name:'Metadata Table',
            thumb:'/images/visuals/metadata.png',
            //link:'user_viz_data/metadata_table',
            //id:'metadata_table_link_id',
            prefix:'metadata_table',
            tip:''
        },

        {   name:'Distance Heatmap (py)',
            thumb:'/images/visuals/heatmap.png',
            //link:'user_viz_data/heatmap',
            //id:'dheatmap_link_id',
            prefix:'dheatmap',
            tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
        },

        {   name:'Stackbar Charts (d3/svg)',
            thumb:'/images/visuals/barcharts.png',
            //link:'user_viz_data/barcharts',
            //id:'barcharts_link_id',
            prefix:'barcharts',
            tip:''
        },

        {   name:'Pie Charts (d3/svg)',
            thumb:'/images/visuals/pie_charts.png',
            //link:'user_viz_data/piecharts',
            //id:'piecharts_link_id',
            prefix:'piecharts',
            tip:''
        },

        {   name:'Frequency Heatmap (R/pdf)',
            thumb:'/images/visuals/fheatmap.png',
            //link:'user_viz_data/frequency_heatmap',
            //id:'fheatmap_link_id',
            prefix:'fheatmap',
            tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-R (https://www.r-project.org/)-|-pheatmap (R-package)-|-vegan (R-package)-|-jsonlite (R-package)-|-RColorBrewer (R-package)'
        },

        {   name:'Data Browser (Krona)',
            thumb:'/images/visuals/krona.png',
            //link:'user_viz_data/dbrowser',
            //id:'dbrowser_link_id',
            prefix:'dbrowser',
            tip:''
        },

        {   name:'Dendrogram (d3/phylogram)',
            thumb:'/images/visuals/dendrogram.png',
            //link:'user_viz_data/dendrogram',
            //id:'dendrogram1_link_id',
            prefix:'dendrogram01',
            tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
        },

    //{name:'Dendrogram (d3-phylonator)', thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram2_link_id',
   //     tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },

        {   name:'Dendrogram (d3/radial)',
            thumb:'/images/visuals/radial.png',
            //link:'user_viz_data/dendrogram',
            //id:'dendrogram3_link_id',
            prefix:'dendrogram03',
            tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
        },


   // {name:'Dendrogram (py-pdf)',        thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram_pdf_link_id',
   //     tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-matplotlib (python library)'},

        {   name:'PCoA 2D Analyses (R/pdf)',
            thumb:'/images/visuals/pcoa.png',
            //link:'user_viz_data/pcoa',
            //id:'pcoa_link_id',
            prefix:'pcoa',
            tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)-|-vegan (R-package)-|-ape (R-package)'
        },

        {   name:'PCoA 3D Analyses (Emperor)',
            thumb:'/images/visuals/emperor.png',
            //link:'user_viz_data/pcoa',
            //id:'pcoa_3d_link_id',
            prefix:'pcoa3d',
            tip:'Python2.7-|-scikit-bio (python library)-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-QIIME (http://qiime.org)'
        },

        {   name:'Geo Distribution',
            thumb:'/images/visuals/map.png',
            //link:'user_viz_data/geospatial',
            //id:'geospatial_link_id',
            prefix:'geospatial',
            tip:'lat/lon metadata'
        },

        {   name:'Alpha Diversity',
            thumb:'/images/visuals/alpha.png',
            //link:'user_viz_data/alpha_diversity',
            //id:'adiversity_link_id',
            prefix:'adiversity',
            tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-scikit-bio'
        },

        {   name:'Phyloseq Bars (R/svg)',
            thumb:'/images/visuals/phyloseq_bars.png',
            //link:'user_viz_data/phyloseq01',
            //id:'phyloseq01_link_id',
            prefix:'phyloseq_bars01',
            tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'
        },

        {   name:'Phyloseq Heatmap (R/png)',
            thumb:'/images/visuals/phyloseq_heatmap.png',
            //link:'user_viz_data/phyloseq02',
            //id:'phyloseq02_link_id',
            prefix:'phyloseq_hm02',
            tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'
        },

        {   name:'Phyloseq Network (R/svg)',
            thumb:'/images/visuals/phyloseq_network.png',
            //link:'user_viz_data/phyloseq03',
            //id:'phyloseq03_link_id',
            prefix:'phyloseq_nw03',
            tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'
        },

        {   name:'Phyloseq Ordination (R/svg)',
            thumb:'/images/visuals/phyloseq_ord1.png',
            //link:'user_viz_data/phyloseq04',
            //id:'phyloseq04_link_id',
            prefix:'phyloseq_ord04',
            tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'
        },

        {   name:'Phyloseq Tree (R/svg)',
            thumb:'/images/visuals/phyloseq_tree.png',
            //link:'user_viz_data/phyloseq05',
            //id:'phyloseq05_link_id',
            prefix:'phyloseq_tree05',
            tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'
        },

        {   name:'Cytoscape (TESTING)',
            thumb:'/images/visuals/phyloseq_tree.png',
            //link:'user_viz_data/cytoscape',
            //id:'cytoscape_link_id',
            prefix:'cytoscape',
            tip:''
        },
        {   name:'Dendrogram (TESTING)',
            thumb:'/images/visuals/dendrogram.png',
            //link:'user_viz_data/dendrogramR',
            //id:'dendrogram0_link_id',
            prefix:'dendrogram0',
            tip:'R (https://www.r-project.org/)-|-phyloseq & ape (R-packages);'
        },
        // {   name:'Oligotyping (TESTING)',
        //     thumb:'/images/visuals/oligotyping-logo.png',
        //     //link:'user_viz_data/dendrogramR',
        //     //id:'dendrogram0_link_id',
        //     prefix:'oligotyping',
        //     tip:'Python2.7-'
        // }

]};


// constants.REQ_METADATA_FIELDS = ["altitude", "assigned_from_geo", "collection_date",
//                                 "common_name", "country", "depth", "description",
//                                 "dna_region", "domain", "elevation", "env_biome",
//                                 "env_feature", "env_material", "env_package",
//                                 "fragment_name", "latitude", "longitude",
//                                 "sequencing_platform", "taxon_id"];

constants.REQ_METADATA_FIELDS = [   "collection_date",  // format?? yyyy-mm-dd
                                    "geo_loc_name",     // name of country or longhurst zone
                                    "dna_region",       // v6, v4v5 v6v4 .... (from mysql table) 
                                    "domain",           // Bacteria, Archaea or Eukarya (from mysql table)
                                    "env_biome",
                                    "env_feature", 
                                    "env_material", 
                                    "env_package",      // (from mysql table) 
                                    "target_gene",      // 16s or 18s (from mysql table)
                                    "latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
                                    "longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
                                    "sequencing_platform",
                                    "adapter_sequence",
                                    "illumina_index",
                                    "primer_suite",
                                    "run"
                                    ];
constants.REQ_METADATA_FIELDS_wIDs = ["geo_loc_name",     // name of country or longhurst zone
                                    "dna_region",       // v6, v4v5 v6v4 .... (from mysql table) 
                                    "domain",           // Bacteria, Archaea or Eukarya (from mysql table)
                                    "env_biome",
                                    "env_feature", 
                                    "env_material", 
                                    "env_package",      // (from mysql table) 
                                    "target_gene",      // 16s or 18s (from mysql table)                                        
                                    "sequencing_platform",
                                    "adapter_sequence",
                                    "illumina_index",
                                    "primer_suite",
                                    "run"
                                    ];                                    
// constants.REQ_METADATA_FIELDS = [{  "name":"collection_date",       "units":"date","format":"YYYY-MM-DD"}, // format?? yyyy-mm-dd
//                                   {  "name":"geo_loc_name",         "units":"alpha_numeric","format":""},   // name of country or longhurst zone
//                                   {  "name":"dna_region",           "units":"alpha_numeric","format":""},   // v6, v4v5 v6v4 .... (from mysql table) 
//                                   {  "name":"domain",               "units":"alpha_numeric","format":""},   // Bacteria, Archaea or Eukarya (from mysql table)
//                                   {  "name":"env_biome",            "units":"alpha_numeric","format":""},
//                                   {  "name":"env_feature",          "units":"alpha_numeric","format":""}, 
//                                   {  "name":"env_material",           "units":"alpha_numeric","format":""},
//                                   {  "name":"env_package",          "units":"alpha_numeric","format":""},   // (from mysql table) 
//                                   {  "name":"target_gene",          "units":"alpha_numeric","format":""},   // 16s or 18s (from mysql table)
//                                   {  "name":"latitude",             "units":"decimal_degrees","format":""}, // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
//                                   {  "name":"longitude",            "units":"decimal_degrees","format":""}, // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
//                                   {  "name":"sequencing_platform",  "units":"alpha_numeric","format":""},
//                                   {  "name":"adapter_sequence",     "units":"alpha_numeric","format":""},
//                                   {  "name":"index_sequence",       "units":"alpha_numeric","format":""},
//                                   {  "name":"primer_suite",         "units":"alpha_numeric","format":""}
//                                 ];                                    
constants.CONTACT_US_SUBJECTS = ["Account Request", "Report a Problem", "Announce a Publication", "Other"];

constants.ORDERED_METADATA_NAMES = [
    ["structured comment name","Parameter",""], //MBL Supplied or Optional
    ["","General",""],
    // ["project","VAMPS project name","MBL Supplied"],
    ["dataset","VAMPS dataset name","MBL Supplied"],
    ["sample_name","Sample ID (user sample name)","User supplied"],
    ["investigation_type","Investigation Type","User supplied"],
    ["sample_type","Sample Type (most often environmental)","User supplied"],
    ["collection_date","Sample collection date (YYYY-MM-DD)","User supplied"],
    ["latitude","Latitude (WGS84 system, values bounded by ±90°)","User supplied"],
    ["longitude","Longitude (values bounded by ±180°)","User supplied"],
    ["geo_loc_name_continental","Country","MBL Supplied"],
    ["geo_loc_name_marine","Longhurst Zone","MBL Supplied"],
    ["env_package","Environmental Package","User supplied"],
    ["env_biome","Environmental Biome - Primary","User supplied"],
    ["env_biome_sec","Environmental Biome - Secondary","User supplied"],
    ["env_feature","Environmental Feature - Primary","User supplied"],
    ["env_feature_sec","Environmental Feature - Secondary","User supplied"],
    ["env_material","Environmental Material - Primary","User supplied"],
    ["material_secondary","Environmental Material - Secondary","User supplied"],
    ["","Enter depth values in one or more categories",""],
    ["depth_subseafloor","Depth below seafloor","User supplied"],
    ["depth_subterrestrial","Depth below terrestrial surface","User supplied"],
    ["depth_in_core","Depth within core","User supplied"],
    ["tot_depth_water_col","Water column depth (Sampling depth if applicable. If sampling below seafloor, depth of water column at the seafloor)","User supplied"],
    ["elevation","Elevation above sea level (land only)","User supplied"],
    ["dna_extraction_meth","DNA Extraction","User supplied"],
    ["dna_quantitation","DNA Quantitation","User supplied"],
    ["","Enter either volume or mass",""],
    ["sample_size_vol","Sample Size (volume)","Optional user supplied"],
    ["sample_size_mass","Sample Size (mass)","Optional user supplied"],
    ["formation_name","Formation name","Optional user supplied"],
    ["access_point_type","Access Point Type","Optional user supplied"],
    ["","Sample handling",""],
    ["samp_store_dur","Storage duration","Optional user supplied"],
    ["samp_store_temp","Storage temperature","Optional user supplied"],
    ["isol_growth_cond","Isolation and growth condition (publication reference)","Optional user supplied"],
    ["","MBL generated laboratory metadata",""],
    ["domain","Domain","MBL Supplied"],
    ["target_gene","Target gene name (16S rRNA, mcrA)","MBL Supplied"],
    ["dna_region","DNA region","MBL Supplied"],
    ["sequencing_meth","Sequencing method","MBL Supplied"],
    ["forward_primer","Forward PCR Primer","MBL Supplied"],
    ["reverse_primer","Reverse PCR Primer","MBL Supplied"],
    ["illumina_index","Index sequence (for Illumina)","MBL Supplied"],
    ["adapter_sequence","Adapter sequence","MBL Supplied"],
    ["run","Sequencing run date (YYYY-MM-DD)","MBL Supplied"],
    ["","Non-biological",""],
    ["pH","pH","User supplied"],
    ["temperature","Temperature","User supplied"],
    ["conductivity","Conductivity","User supplied"],
    ["resistivity","Resistivity",""],
    ["salinity","Salinity",""],
    ["pressure","Pressure",""],
    ["redox_state","Redox state",""],
    ["redox_potential","Redox potential",""],
    ["diss_oxygen","Dissolved oxygen",""],
    ["diss_hydrogen","Dissolved hydrogen",""],
    ["diss_org_carb","Dissolved organic carbon",""],
    ["diss_inorg_carb","Dissolved inorganic carbon",""],
    ["tot_org_carb","Total organic carbon",""],
    ["NPOC","NPOC (Non-purgeable organic carbon)",""],
    ["tot_inorg_carb","Total inorganic carbon",""],
    ["tot_carb","Total carbon",""],
    ["calcium_carbonate","Calcium carbonate",""],
    ["bicarbonate","Bicarbonate",""],
    ["del18O_water","Delta 18O of water",""],
    ["part_org_carbon_del13C","Delta 13C for particulate organic carbon",""],
    ["diss_inorg_carbon_del13C","Delta 13C for dissolved inorganic carbon",""],
    ["methane_del13C","Delta 13C for methane",""],
    ["alkalinity","Alkalinity",""],
    ["calcium","Calcium",""],
    ["sodium","Sodium",""],
    ["ammonium","Ammonium",""],
    ["nitrate","Nitrate",""],
    ["nitrite","Nitrite",""],
    ["nitrogen_tot","Total nitrogen",""],
    ["org_carb_nitro_ratio","Carbon nitrogen ratio",""],
    ["sulfate","Sulfate",""],
    ["sulfide","Sulfide",""],
    ["sulfur_tot","Total sulfur",""],
    ["chloride","Chloride",""],
    ["phosphate","Phosphate",""],
    ["potassium","Potassium",""],
    ["iron","Total iron",""],
    ["iron_II","Iron II",""],
    ["iron_III","Iron III",""],
    ["magnesium","Magnesium",""],
    ["manganese","Manganese",""],
    ["methane","Methane",""],
    ["noble_gas_chemistry","Noble gas chemistry",""],
    ["trace_element_geochem","Trace element geochemistry",""],
    ["porosity","Porosity",""],
    ["rock_age","Sediment or rock age",""],
    ["water_age","Water age",""],
    ["","Biological",""],
    ["microbial_biomass_FISH","FISH-based cell counts",""],
    ["microbial_biomass_intactpolarlipid","Microbial biomass – intact polar lipid",""],
    ["microbial_biomass_microscopic","Microbial biomass – total cell counts",""],
    ["microbial_biomass_qPCR","qPCR and primers used",""],
    ["microbial_biomass_platecounts","Microbial biomass – plate counts - cell numbers",""],
    ["microbial_biomass_avg_cell_number","Microbial biomass – other",""],
    ["microbial_biomass_wet_weight","Microbial biomass – wet weight",""],
    ["plate_counts","Plate counts – colony forming units",""],
    ["functional_gene_assays","functional gene assays (key findings)",""],
    ["clone_library_results","clone library results (key findings)",""],
    ["enzyme_activities","enzyme activities (key findings)",""]
];

constants.ORDERED_METADATA_DIVIDERS = ["Biological",
    "Enter depth values in one or more categories",
    "Enter either volume or mass",
    "General",
    "MBL generated laboratory metadata",
    "Non-biological",
    "Parameter",
    "Sample handling",
    "User-added"
];

constants.MY_DNA_EXTRACTION_METH_OPTIONS = ["Please choose one",
    "CTAB phenol–chloroform",
    "Hot alkaline extraction",
    "MP Biomedical Fast DNA",
    "MP Biomedical Fast DNA Spin Kit for Soil",
    "Mo Bio/Qiagen PowerBiofilm",
    "Mo Bio/Qiagen PowerMax Soil",
    "Mo Bio/Qiagen PowerSoil",
    "Mo Bio/Qiagen PowerWater",
    "Mo Bio/Qiagen UltraClean Microbial",
    "Other",
    "Phenol–chloroform",
    "Qiagen Genomic DNA lysis buffer",
    "SDS Phenol–chloroform"];

constants.DNA_QUANTITATION_OPTIONS = ["Please choose one",
    "Fluorescent Microspheres",
    "NanoDrop",
    "NanoQuant",
    "Perfluorocarbon Tracers",
    "PicoGreen",
    "Other"];

constants.BIOME_PRIMARY = ["Please choose one",
"marine",
"subseafloor",
"subterrestrial",
"terrestrial"];

constants.FEATURE_PRIMARY = ["Please choose one",
"aquifer",
"borehole",
"cave",
"enrichment",
"fracture",
"geyser",
"lake",
"mine",
"reservoir",
"seep",
"spring",
"vent",
"volcano",
"well"];

constants.MATERIAL_PRIMARY = ["Please choose one",
"biofilm",
"fluid",
"microbial mat material",
"mud",
"oil",
"rock",
"sand",
"sediment",
"soil",
"water"];

constants.METADATA_FORM_REQUIRED_FIELDS = ["project",
  "dataset",
  "sample_name",
  "investigation_type",
  "sample_type",
  "collection_date",
  "latitude",
  "longitude",
  "geo_loc_name_continental",
  "geo_loc_name_marine",
  "env_package",
  "env_biome",
  "env_feature",
  "env_material",
  "elevation",
  "dna_extraction_meth",
  "dna_quantitation",
  "domain",
  "target_gene",
  "dna_region",
  "sequencing_meth",
  "forward_primer",
  "reverse_primer",
  "illumina_index",
  "adapter_sequence",
  "run",
  "pH",
  "temperature",
  "conductivity"];

constants.DCO_ENVIRONMENTAL_PACKAGES = ["Please choose one",
    "misc environment",
    "microbial mat/biofilm",
    "plant-associated",
    "sediment",
    "soil",
    "water"];

// definition
constants.INVESTIGATION_TYPE = [["Please choose one", "Please choose one"],
    ["mimarks-survey", "marker gene from whole community (e.g. 16S survey)"],
    ["mimarks-specimen", "marker gene from single organism (e.g. culture"],
    ["metagenome", "whole metagenome survey"],
    ["bacteria_archaea", "genome from bacterial or archaeal origin"],
    ["eukaryote", "genome from eukaryotic origin"],
    ["plasmid", ""],
    ["virus", ""],
    ["organelle", ""]];


constants.SAMPLE_TYPE = ["control",
    "enrichment",
    "environmental sample",
    "isolate"];

module.exports = constants;
