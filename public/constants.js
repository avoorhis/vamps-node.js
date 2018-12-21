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
constants.default_taxonomy = {name: 'silva119', curator: 'SILVA (v119)', show: 'Silva-119'};
//console.log('in constants');
//console.log(constants.default_taxonomy);
constants.dataset_count_for_visuals_max    = 1100;
constants.dataset_count_for_visuals_cutoff = 500;
constants.show_nas                         = {"raw": false, "string": "--"};  // if raw==true will show class_NA, genus_NA etc; else show string (tax table only; not biom file)
// blast dbs are in public/blast
constants.blast_dbs = ['Bv3v5', 'Bv4v5', 'Av4v5', 'Bv4', 'Bv6', 'Bv6v4', 'Av6v4', 'Av6', 'Ev9', 'Misc']; // leave 'Misc' as last item
//constants.misc_blast_dbs   = 'misc_blast' // ['Bv1v2','Bv1v4','Bv1v3','Bv2','Bv3','Av3v5','Bv3v4','Av3','Bv5v6','ITS']
constants.download_file_formats = [
  'metadata', 'fasta', 'taxbytax', 'taxbyref', 'taxbyseq', 'biom', 'matrix', 'phyloseq', 'distance', 'emperor', 'pdf', 'tree', 'heatmap', 'otus','piecharts','barcharts'
];
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
// should be taken from database each time (AS)
constants.DOMAINS = {
  domains: [
    {id: 10, name: "All"}, // for shotgun
    {id: 2, name: "Archaea"},
    {id: 3, name: "Bacteria"},
    {id: 4, name: "Eukarya"},
    {id: 5, name: "Organelle"},
    {id: 6, name: "Fungi"},
    {id: 1, name: "Unknown"}
  ]
};

constants.DOMAIN_REGIONS = {
  domain_regions: [
    {d_r: ['Av4', 'Av6', 'Av4v5'], domain: "Archaeal", regions: ['v4', 'v6', 'v4v5'], domain_show: "Archaea"},
    {d_r: ['Bv4', 'Bv6', 'Bv4v5'], domain: "Bacterial", regions: ['v4', 'v6', 'v4v5'], domain_show: "Bacteria"},
    {
      d_r: ['Ev4', 'EHSSU', 'EHLSU'],
      domain: "Eukaryal",
      regions: ['v4', 'v4_hap_HSSU', 'v4_hap_HLSU'],
      domain_show: "Eukarya"
    },
    {d_r: ["ITS1"], domain: "Fungal", regions: ['ITS1'], domain_show: "Eukarya"},
    {d_r: ["Sgun"], domain: "Shotgun", regions: [''], domain_show: "All"},
  ]
};

constants.TARGET_GENE = [{domain: "Eukarya", target_gene: ["18s", "ITS"]}, {domain: "Fungi", target_gene: ["ITS"]}, {
  domain: "Archaea",
  target_gene: ["16s"]
}, {domain: "Bacteria", target_gene: ["16s"]},
  {domain: "All", target_gene: ["metagenome", "genome"] }];

constants.TARGETS = ["Av3", "Av3v5", "Av4", "Av4v5", "Av5v6", "Av6", "Av6v4",
  "Bv1v2", "Bv1v3", "Bv1v4", "Bv2", "Bv3", "Bv3v4", "Bv3v5", "Bv4", "Bv4v5", "Bv5", "Bv5v6", "Bv6", "Bv6v4",
  "Ev4", "Ev9", "ITS1"];

constants.UNITSELECT               = {
  silva119_simple   : {
      id: 'tax_silva119_simple',
      file: 'unit_selectors/taxa_silva119_simple.html',
      name: "Taxonomy (Silva-119) -Simple",
      subtext: 'Silva119',
      // This list from:: "SELECT DISTINCT domain FROM silva_taxonomy JOIN domain USING(domain_id)";
      domains: ["Archaea","Bacteria","Eukarya","Organelle","Unknown"]  // these should be the only selections available
    },
  silva119_custom   : {
      id: 'tax_silva119_custom',
      file: 'unit_selectors/taxa_silva119_custom.html',
      name: "Taxonomy (Silva-119) -Custom",
      subtext: 'Silva119'
    },
  rdp2_6_simple     : {
      id: 'tax_rdp2.6_simple',
      file: 'unit_selectors/taxa_rdp2.6.html',
      name: "Taxonomy RDP (v2.6)",
      subtext: 'Release 2.6',
      // This list from:: "SELECT DISTINCT domain FROM rdp_taxonomy JOIN domain USING(domain_id)";
      domains: ["Archaea","Bacteria","Eukarya","Fungi","Organelle","Unknown"] // these should be the only selections available
    },
  generic_simple    : {id: 'tax_generic_simple', file: 'unit_selectors/taxa_generic.html', name: "Generic", subtext: ''},
  gg_simple         : {
      id: 'tax_gg_simple',
      file: 'unit_selectors/taxa_gg_simple.html',
      name: "TODO-Taxonomy (Greengenes-13.5) -Simple",
      subtext: 'Greengenes v13.5',
      domains:[]
    },
  gg_custom         : {
      id: 'tax_gg_custom',
      file: 'unit_selectors/taxa_gg_cust.html',
      name: "TODO-Taxonomy (Greengenes-13.5) -Custom",
      subtext: 'Greengenes v13.5'
    },
  otus              : {id: 'otus', file: 'unit_selectors/otus.html', name: "TODO-OTUs", subtext: 'SLP'},
  med_nodes         : {id: 'med_nodes', file: 'unit_selectors/med_nodes.html', name: "TODO-MED Nodes", subtext: ''}
  
};
constants.UNIT_ASSIGNMENT_CHOICES2 = {
  'refRDP_2.12-16S': {
    taxonomy_curator: 'RDP (2.12) 16S-rRNA',
    method: 'RDP',
    reference_db: 'Default (no training)',
    availability: 'available',
    refdb: '2.12'
  },
  'refRDP_2.12-ITS': {
    taxonomy_curator: 'RDP (2.12) ITS-UNITE',
    method: 'RDP',
    reference_db: 'Default (no training)',
    availability: 'available',
    refdb: '2.12'
  },
  'refssu': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'refssu (full-length)',
    availability: 'available',
    refdb: 'refssu'
  },
  'refv1v3': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv1v3 (Bacterial)',
    availability: 'available',
    refdb: 'refv1v3'
  },
  'refv3a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av3 (Archaeal)',
    availability: 'available',
    refdb: 'refv3a'
  },
  'refv3': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv3 (Bacterial)',
    availability: 'available',
    refdb: 'refv3'
  },
  'refv3v5': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv3v5 (Bacterial)',
    availability: 'available',
    refdb: 'refv3v5'
  },
  'refv3v6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv3v6 (Bacterial)',
    availability: 'available',
    refdb: 'refv3v6'
  },
  'refv4': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv4 (Bacterial)',
    availability: 'available',
    refdb: 'refv4'
  },
  'refv4v5a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av4v5 (Archaeal)',
    availability: 'available',
    refdb: 'refv4v5a'
  },
  'refv4v5': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv4v5 (Bacterial)',
    availability: 'available',
    refdb: 'refv4v5'
  },
  'refv4v6a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av4v6 (Archaeal)',
    availability: 'available',
    refdb: 'refv4v6a'
  },
  'refv4v6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv4v6 (Bacterial)',
    availability: 'available',
    refdb: 'refv4v6'
  },
  'refv5': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv5 (Bacterial)',
    availability: 'available',
    refdb: 'refv5'
  },
  'refv5v6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv5v6 (Bacterial)',
    availability: 'available',
    refdb: 'refv5v6'
  },
  'refv6a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av6 (Archaeal)',
    availability: 'available',
    refdb: 'refv6a'
  },
  'refv6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv6 (Bacterial)',
    availability: 'available',
    refdb: 'refv6'
  },
  'refv9': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Ev9 (Eukaryal)',
    availability: 'available',
    refdb: 'refv9'
  },
  'refits1': {
    taxonomy_curator: 'UNITE',
    method: 'GAST',
    reference_db: 'ITS1',
    availability: 'available',
    refdb: 'refits1'
  },
  'refGG_MAY2013': {
    taxonomy_curator: 'GreenGenes (May2013)',
    method: 'GAST',
    reference_db: 'refssu',
    availability: 'not available',
    refdb: 'GG_MAY2013'
  }
};
constants.UNIT_ASSIGNMENT_CHOICES  = {
  'RDP': {ref_db: ['16S', 'ITS']},
  'GAST': {
    ref_db: ['refssu', 'refv1v3', 'refv3a', 'refv3', 'refv3v5', 'refv3v6', 'refv4', 'refv4v5a', 'refv4v5',
      'refv4v6a', 'refv4v6', 'refv5', 'refv5v6', 'refv6a', 'refv6', 'refv9', 'refits1']
  },
  'SPINGO': {ref_db: ['RDP_11.2']},
};
constants.CONFIG_FILE              = 'INFO.config';
constants.REF_SUFFIX               = {
  "unique.nonchimeric.fa": ['v1v3', 'v1v3a', 'v3v5', 'v4v5', 'v4v6', 'v6v4', 'v4v6a', 'v6v4a', 'its1'],
  "unique": ['v3', 'v3a', 'v4', 'v5', 'v6', 'v6a', 'v9']
};
constants.REF_FULL_OPTION          = ["refits1", "refssu"];

constants.VISUALOUTPUTCHOICES = {
  choices: [
    {id: 'counts_table', show: 'Counts Table'},
    {id: 'barcharts', show: 'Counts Bar Charts'},
    {id: 'heatmap', show: 'Distance Heatmap'},
    {id: 'dendrogram', show: 'Community Dendrogram'},
    {id: 'alphadiversity', show: 'Alpha Diversity'}
  ]
};

constants.NORMALIZATIONCHOICES = {
  choices: [
    {id: 'none', brief: 'None (raw counts)', show: 'Not Normalized (default)'},
    {id: 'maximum', brief: 'Maximum (range: 0.0 - maxSampleCount)', show: 'Normalized to the Maximum Sample'},
    {id: 'frequency', brief: 'Frequency (range: 0.0 - 1.0)', show: 'Normalized to Frequency'}
  ]
};


constants.DISTANCECHOICES = {
  choices: [


    {id: 'jaccard', show: 'Jaccard'},
    {id: 'kulczynski', show: 'Kulczynski'},
    {id: 'canberra', show: 'Canberra'},
    {id: 'morisita_horn', show: 'Morisita-Horn'},
    {id: 'bray_curtis', show: 'Bray-Curtis'},
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

  ]
};

constants.PORTALS = {
  'CMP': {
    name: 'Coral Microbiome Portal',
    subtext: 'CMP',
    projects: ['LTR_MCR_Bv6', 'LTR_MCR_Av6', 'LTR_MCR_Ev9', 'ICM_CCB_Bv6', 'ICM_CCB_Av6'],
    prefixes: ['CMP'],
    suffixes: [],
    pagetitle: 'Coral Microbe Portal',
    maintitle: 'Coral Microbiome Portal',
    subtitle: 'The Coral Microbiome Portal (CMP) database brings together next generation sequencing data of coral-associated microorganisms from studies conducted thoughout the world’s reefs.',
    thumb: '/images/portals/cmp_thumbnail.jpg',
    zoom: 3
  },
  'CODL': {
    name: 'Census of Deep Life',
    subtext: 'CoDL',
    projects: [],
    prefixes: ['DCO'],
    suffixes: [],
    pagetitle: 'Census of Deep Life Portal',
    maintitle: 'Census of Deep Life Portal',
    subtitle: 'The mandate of the Census of Deep Life is to perform a global survey of life in continental and marine subsurface environments using deep DNA sequencing technology.',
    thumb: '/images/portals/dco_thumbnail.jpg',
    zoom: 2  // worldwide
  },
  'NIHHMP': {
    name: 'NIH Human Mircrobiome Project',
    subtext: 'HMP',
    projects: [],
    prefixes: ['NIHHMP'],
    suffixes: [],
    pagetitle: 'Human Microbiome Project Portal',
    maintitle: 'HMP Portal',
    subtitle: 'The NIH Human Microbiome Project is one of several international efforts designed to take advantage of large scale, high through multi ‘omics analyses to study the microbiome in human health.',
    thumb: '/images/portals/hmp_logo_NIH_retina.png',
    zoom: 4  // mostly US? Do we even have or want distribution?
  },
  'UC': {
    name: 'Ulcerative Colitis (NIH Demonstration Project)',
    subtext: 'Ulcerative Colitis (NIH Demonstration Project)',
    projects: [],
    prefixes: ['HMP'],
    suffixes: [],
    pagetitle: 'Ulcerative Colitis Portal',
    maintitle: 'Ulcerative Colitis Portal',
    subtitle: 'The Role of the Gut Microbiota in Ulcerative Colitis (NIH Human Microbiome Demonstration Project).',
    thumb: '/images/portals/uc_thumbnail.jpg',
    zoom: 4  // mostly US?
  },
  'ICOMM': {
    name: 'International Census of Marine Microbes',
    subtext: 'ICoMM',
    projects: [],
    prefixes: ['ICM', 'KCK'],
    suffixes: [],
    pagetitle: 'International Census of Marine Microbes Portal',
    maintitle: 'ICoMM - Microbis Portal',
    subtitle: 'The role of the International Census of Marine Microbes (ICoMM) is to promote an agenda and an environment that will accelerate discovery,<br>understanding, and awareness of the global significance of marine microbes.',
    thumb: '/images/portals/icomm_thumbnail.jpg',
    zoom: 2  // worldwide
  },
  'LTER': {
    name: 'Long Term Ecological Research (LTER)',
    subtext: 'LTER',
    projects: [],
    prefixes: ['LTR'],
    suffixes: [],
    pagetitle: 'Microbial Inventory Research Across Diverse Aquatic Sites (MIRADA) Portal',
    maintitle: 'MIRADA Portal',
    subtitle: 'Microbial Inventory Research Across Diverse Aquatic Long Term Ecological Research (LTER) Sites.',
    thumb: '/images/portals/lter_thumbnail.jpg',
    zoom: 5  // mostly US
  },
  'MBE': {
    name: 'Microbiology of the Built Environment',
    subtext: 'MBE',
    projects: [],
    prefixes: ['MBE', 'RARE', 'SLM'],
    suffixes: [],
    pagetitle: 'Microbiology Of the Built Environment Portal',
    maintitle: 'MoBEDAC Portal',
    subtitle: 'Microbiome of the Built Environment -Data Analysis Core.',
    thumb: '/images/portals/mbe_thumbnail.gif',
    zoom: 4  // mostly US?
  },
  'PSPHERE': {
    name: 'The Plastisphere',
    subtext: 'Plastisphere',
    projects: ['LAZ_SEA_Bv6', 'LAZ_SEA_Ev9', 'LAZ_SEA_Bv6v4', 'LAZ_DET_Bv3v4'],
    prefixes: [],
    suffixes: [],
    pagetitle: 'The Plastisphere',
    maintitle: 'Plastisphere Portal',
    subtitle: 'Bacteria and Plastics',
    thumb: '/images/portals/psphere_thumbnail.jpg',
    zoom: 5  // mostly US
  },
  'RARE': {
    name: 'The Rare Biosphere',
    subtext: 'Rare Biosphere',
    projects: [],
    prefixes: ['RARE'],
    suffixes: [],
    pagetitle: 'The Rare Biosphere Portal',
    maintitle: 'Rare Biosphere Portal',
    subtitle: 'A New Paradigm for Microbiology.',
    thumb: '/images/portals/rare_thumbnail.png',
    zoom: 13  // mostly Falmouth
  },
  'UNIEUK': {
    name: 'UniEuk',
    subtext: 'UniEuk',
    projects: [],
    prefixes: [],
    suffixes: ['Ev2', 'Ev4', 'Ev9', 'Euk'],
    pagetitle: 'UniEuk Portal',
    maintitle: 'UniEuk Portal',
    subtitle: 'A Gathering of all Eukaryal Projects.',
    thumb: '/images/portals/unieuk_thumbnail.jpg',
    zoom: 2  // worldwide
  }
}

// This List MUST match the fields in sequence_uniq_infos
constants.AVAILABLE_UNITS = ['silva_taxonomy_info_per_seq_id', 'oligotype_id', 'gg_otu_id'];
// blue to red
constants.HEATMAP_COLORS  = ['1111ff', '3333ff', '5555ff', '7777ff', '9999ff', 'aaaaff', 'ccccff', 'ddeeee', 'eeeedd', 'ffdddd', 'ffbbbb', 'ff9999', 'ff7777', 'ff5555', 'ff3333', 'ff0000'];

constants.RSCRIPT_CMD = 'RScript --no-restore --no-save';

constants.RANKS = ["domain", "phylum", "klass", "order", "family", "genus", "species", "strain"];

constants.PCT_RANGE = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// these define the order and the images of the visual thumbnails available on the view_selection page
// Ideally ALL the information should be available here in the JSON
constants.VISUAL_THUMBNAILS = {
  visuals: [
    {
      name: 'Taxonomy Frequency Table',
      thumb: '/images/visuals/counts_table.png',
      //link:'user_viz_data/counts_table',
      //id:'counts_table_link_id',
      prefix: 'counts_matrix',
      tip: ''
    },

    {
      name: 'Metadata Table',
      thumb: '/images/visuals/metadata.png',
      //link:'user_viz_data/metadata_table',
      //id:'metadata_table_link_id',
      prefix: 'metadata_table',
      tip: ''
    },

    {
      name: 'Distance Heatmap (py)',
      thumb: '/images/visuals/heatmap.png',
      //link:'user_viz_data/heatmap',
      //id:'dheatmap_link_id',
      prefix: 'dheatmap',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
    },

    {
      name: 'Stackbar Charts (d3/svg)',
      thumb: '/images/visuals/barcharts.png',
      //link:'user_viz_data/barcharts',
      //id:'barcharts_link_id',
      prefix: 'barcharts',
      tip: ''
    },

    {
      name: 'Pie Charts (d3/svg)',
      thumb: '/images/visuals/pie_charts.png',
      //link:'user_viz_data/piecharts',
      //id:'piecharts_link_id',
      prefix: 'piecharts',
      tip: ''
    },

    {
      name: 'Frequency Heatmap (R/pdf)',
      thumb: '/images/visuals/fheatmap.png',
      //link:'user_viz_data/frequency_heatmap',
      //id:'fheatmap_link_id',
      prefix: 'fheatmap',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-R (https://www.r-project.org/)-|-pheatmap (R-package)-|-vegan (R-package)-|-jsonlite (R-package)-|-RColorBrewer (R-package)'
    },

    {
      name: 'Data Browser (Krona)',
      thumb: '/images/visuals/krona.png',
      //link:'user_viz_data/dbrowser',
      //id:'dbrowser_link_id',
      prefix: 'dbrowser',
      tip: ''
    },

    {
      name: 'Dendrogram (d3/phylogram)',
      thumb: '/images/visuals/dendrogram.png',
      //link:'user_viz_data/dendrogram',
      //id:'dendrogram1_link_id',
      prefix: 'dendrogram01',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
    },

    //{name:'Dendrogram (d3-phylonator)', thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram2_link_id',
    //     tip:'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },

    {
      name: 'Dendrogram (d3/radial)',
      thumb: '/images/visuals/radial.png',
      //link:'user_viz_data/dendrogram',
      //id:'dendrogram3_link_id',
      prefix: 'dendrogram03',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
    },


    // {name:'Dendrogram (py-pdf)',        thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram_pdf_link_id',
    //     tip:'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-matplotlib (python library)'},

    {
      name: 'PCoA 2D Analyses (R/pdf)',
      thumb: '/images/visuals/pcoa.png',
      //link:'user_viz_data/pcoa',
      //id:'pcoa_link_id',
      prefix: 'pcoa',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)-|-vegan (R-package)-|-ape (R-package)'
    },

    {
      name: 'PCoA 3D Analyses (Emperor)',
      thumb: '/images/visuals/emperor.png',
      //link:'user_viz_data/pcoa',
      //id:'pcoa_3d_link_id',
      prefix: 'pcoa3d',
      tip: 'Python3-|-scikit-bio (python library)-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-QIIME (http://qiime.org)'
    },

    {
      name: 'Geo Distribution',
      thumb: '/images/visuals/map.png',
      //link:'user_viz_data/geospatial',
      //id:'geospatial_link_id',
      prefix: 'geospatial',
      tip: 'lat/lon metadata'
    },

    {
      name: 'Alpha Diversity',
      thumb: '/images/visuals/alpha.png',
      //link:'user_viz_data/alpha_diversity',
      //id:'adiversity_link_id',
      prefix: 'adiversity',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-scikit-bio'
    },

    {
      name: 'Phyloseq Bars (R/svg)',
      thumb: '/images/visuals/phyloseq_bars.png',
      //link:'user_viz_data/phyloseq01',
      //id:'phyloseq01_link_id',
      prefix: 'phyloseq_bars01',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Heatmap (R/png)',
      thumb: '/images/visuals/phyloseq_heatmap.png',
      //link:'user_viz_data/phyloseq02',
      //id:'phyloseq02_link_id',
      prefix: 'phyloseq_hm02',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Network (R/svg)',
      thumb: '/images/visuals/phyloseq_network.png',
      //link:'user_viz_data/phyloseq03',
      //id:'phyloseq03_link_id',
      prefix: 'phyloseq_nw03',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Ordination (R/svg)',
      thumb: '/images/visuals/phyloseq_ord1.png',
      //link:'user_viz_data/phyloseq04',
      //id:'phyloseq04_link_id',
      prefix: 'phyloseq_ord04',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Tree (R/svg)',
      thumb: '/images/visuals/phyloseq_tree.png',
      //link:'user_viz_data/phyloseq05',
      //id:'phyloseq05_link_id',
      prefix: 'phyloseq_tree05',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Cytoscape (TESTING)',
      thumb: '/images/visuals/phyloseq_tree.png',
      //link:'user_viz_data/cytoscape',
      //id:'cytoscape_link_id',
      prefix: 'cytoscape',
      tip: ''
    },
    {
      name: 'Dendrogram (R/svg)',
      thumb: '/images/visuals/dendrogram.png',
      //link:'user_viz_data/dendrogramR',
      //id:'dendrogram0_link_id',
      prefix: 'dendrogram',
      tip: 'R (https://www.r-project.org/)-|-vegan & ape (R-packages);'
    },


  ]
};


// constants.REQ_METADATA_FIELDS = ["altitude", "assigned_from_geo", "collection_date",
//                                 "common_name", "country", "depth", "description",
//                                 "dna_region", "domain", "elevation", "env_biome",
//                                 "env_feature", "env_material", "env_package",
//                                 "fragment_name", "latitude", "longitude",
//                                 "sequencing_platform", "taxon_id"];

constants.REQ_METADATA_FIELDS      = [
  "collection_date",  // format?? yyyy-mm-dd
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
//  "forward_primer",
//  "reverse_primer",
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
  // "forward_primer",
  // "reverse_primer",
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
constants.CONTACT_US_SUBJECTS = ["Account Request", "Report a Problem", "Announce a Publication","Request Project Permanency", "Other"];

// duplicate in metadata.js!
constants.ORDERED_METADATA_NAMES = [
  ["structured comment name", "Parameter", "", ""], //MBL Supplied or Optional
  ["", "General", "", ""],
  // ["project","VAMPS project name","MBL Supplied", ""],
  ["dataset", "VAMPS dataset name", "MBL Supplied", ""],
  ["geo_loc_name_continental", "Country (if not international waters)", "User Supplied", ""],
  ["geo_loc_name_marine", "Longhurst Zone (if marine)", "User Supplied", ""],
  ["", "MBL generated laboratory metadata", "", ""],
  ["domain", "Domain", "MBL Supplied", ""],
  ["target_gene", "Target gene name", "MBL Supplied", "16S rRNA, mcrA, etc"],
  ["dna_region", "DNA region", "MBL Supplied", ""],
  // was sequencing_meth
  ["sequencing_platform", "Sequencing method", "MBL Supplied", ""],
  ["forward_primer", "Forward PCR Primer", "MBL Supplied", ""],
  ["reverse_primer", "Reverse PCR Primer", "MBL Supplied", ""],
  ["illumina_index", "Index sequence (for Illumina)", "MBL Supplied", ""],
  ["adapter_sequence", "Adapter sequence", "MBL Supplied", ""],
  ["run", "Sequencing run date", "MBL Supplied", "YYYY-MM-DD"],
  ["", "User supplied metadata", "", ""],
  ["env_package", "Environmental Package", "User supplied", ""],
  ["sample_name", "Sample ID (user sample name)", "User supplied", ""],
  ["investigation_type", "Investigation Type", "User supplied", ""],
  ["sample_type", "Sample Type", "User supplied", ""],
  ["collection_date", "Sample collection date", "User supplied", "YYYY-MM-DD"],
  ["latitude", "Latitude (±90°)", "User supplied", "decimal degrees ±90°"],
  ["longitude", "Longitude (±180°)", "User supplied", "decimal degrees ±180°"],
  ["env_biome", "Environmental Biome - Primary", "User supplied", ""],
  ["biome_secondary", "Environmental Biome - Secondary", "User supplied", ""],
  ["env_feature", "Environmental Feature - Primary", "User supplied", ""],
  ["feature_secondary", "Environmental Feature - Secondary", "User supplied", ""],
  ["env_material", "Environmental Material - Primary", "User supplied", ""],
  ["material_secondary", "Environmental Material - Secondary", "User supplied", ""],
  ["", "Enter depth values in one or more categories", "", ""],
  ["depth_subseafloor", "Depth below seafloor", "User supplied", "mbsf"],
  ["depth_subterrestrial", "Depth below terrestrial surface", "User supplied", "meter"],
  // ["depth_in_core","Depth within core","User supplied", "cm"],
  ["tot_depth_water_col", "Water column depth", "User supplied", "meter"],
  ["elevation", "Elevation (if terrestrial)", "User supplied", "meter"],
  ["dna_extraction_meth", "DNA Extraction", "User supplied", ""],
  ["dna_quantitation", "DNA Quantitation", "User supplied", ""],
  ["", "Enter either volume or mass", "", ""],
  ["sample_size_vol", "Sample Size (volume)", "User supplied", "liter"],
  ["sample_size_mass", "Sample Size (mass)", "User supplied", "gram"],
  ["sample_collection_device", "Sample collection device", "User supplied", ""],
  ["formation_name", "Formation name", "User supplied", ""],
  ["", "Sample handling", "", ""],
  ["samp_store_dur", "Storage duration", "User supplied", "days"],
  ["samp_store_temp", "Storage temperature", "User supplied", "degrees celsius"],
  ["isol_growth_cond", "Isolation and growth condition (reference)", "User supplied", "PMID, DOI or URL"],
  ["", "Non-biological", "", ""],
  ["ph", "pH", "User supplied", ""],
  ["temperature", "Temperature", "User supplied", "degrees celsius"],
  ["conductivity", "Conductivity", "User supplied", "mS/cm"],
  ["resistivity", "Resistivity", "", "ohm-meter"],
  ["salinity", "Salinity", "", "PSU"],
  //It is measured in unit of PSU (Practical Salinity Unit), which is a unit based on the properties of sea water conductivity. It is equivalent to per thousand or (o/00) or to  g/kg.
  ["pressure", "Pressure", "", "bar"],
  ["redox_state", "Redox state", "", ""],
  ["redox_potential", "Redox potential", "", "millivolt"],
  ["diss_oxygen", "Dissolved oxygen", "", "µmol/kg"],
  ["diss_hydrogen", "Dissolved hydrogen", "", "µmol/kg"],
  ["diss_org_carb", "Dissolved organic carbon", "", "µmol/kg"],
  ["diss_inorg_carb", "Dissolved inorganic carbon", "", "µmol/kg"],
  ["tot_org_carb", "Total organic carbon", "", "percent"],
  ["npoc", "Non-purgeable organic carbon", "", "µmol/kg"],
  ["tot_inorg_carb", "Total inorganic carbon", "", "percent"],
  ["tot_carb", "Total carbon", "", "percent"],
  ["carbonate", "Carbonate", "", "µmol/kg"],
  ["bicarbonate", "Bicarbonate", "", "µmol/kg"],
  ["silicate", "Silicate", "", "µmol/kg"],
  ["del180_water", "Delta 180 of water", "", "parts per mil"],
  ["part_org_carbon_del13c", "Delta 13C for particulate organic carbon", "", "parts per mil"],
  ["diss_inorg_carbon_del13c", "Delta 13C for dissolved inorganic carbon", "", "parts per mil"],
  ["methane_del13c", "Delta 13C for methane", "", "parts per mil"],
  ["alkalinity", "Alkalinity", "", "meq/L"],
  ["calcium", "Calcium", "", "µmol/kg"],
  ["sodium", "Sodium", "", "µmol/kg"],
  ["ammonium", "Ammonium", "", "µmol/kg"],
  ["nitrate", "Nitrate", "", "µmol/kg"],
  ["nitrite", "Nitrite", "", "µmol/kg"],
  ["nitrogen_tot", "Total nitrogen", "", "µmol/kg"],
  ["org_carb_nitro_ratio", "Carbon nitrogen ratio", "", ""],
  ["sulfate", "Sulfate", "", "µmol/kg"],
  ["sulfide", "Sulfide", "", "µmol/kg"],
  ["sulfur_tot", "Total sulfur", "", "µmol/kg"],
  ["chloride", "Chloride", "", "µmol/kg"],
  ["phosphate", "Phosphate", "", "µmol/kg"],
  ["potassium", "Potassium", "", "µmol/kg"],
  ["iron", "Total iron", "", "µmol/kg"],
  ["iron_ii", "Iron II", "", "µmol/kg"],
  ["iron_iii", "Iron III", "", "µmol/kg"],
  ["magnesium", "Magnesium", "", "µmol/kg"],
  ["manganese", "Manganese", "", "µmol/kg"],
  ["methane", "Methane", "", "µmol/kg"],
  ["noble_gas_chemistry", "Noble gas chemistry", "", ""],
  ["trace_element_geochem", "Trace element geochemistry", "", ""],
  ["porosity", "Porosity", "", "percent"],
  ["rock_age", "Sediment or rock age", "", "millions of years (Ma)"],
  ["water_age", "Water age", "", "thousands of years (ka)"],
  ["", "Biological", "", ""],
  ["microbial_biomass_microscopic", "Microbial biomass - total cell counts", "", "cells/g"],
  ["n_acid_for_cell_cnt", "NA dyes used for total cell counts", "", ""],
  ["microbial_biomass_fish", "FISH-based cell counts", "", "cells/g"],
  ["fish_probe_name", "Name of FISH probe", "", ""],
  ["fish_probe_seq", "Sequence of FISH probe", "", ""],
  ["intact_polar_lipid", "Intact polar lipid", "", "pg/g"],
  ["microbial_biomass_qpcr", "qPCR and primers used", "", "gene copies"],
  // ["microbial_biomass_platecounts","Microbial biomass - plate counts - cell numbers","", ""],
  // ["microbial_biomass_avg_cell_number","Microbial biomass - other","", ""],
  ["biomass_wet_weight", "Biomass - wet weight", "", "gram"],
  ["biomass_dry_weight", "Biomass - dry weight", "", "gram"],
  ["plate_counts", "Plate counts - colony forming", "", "CFU/ml"],
  ["functional_gene_assays", "functional gene assays", "", ""],
  ["clone_library_results", "clone library results", "", ""],
  ["enzyme_activities", "enzyme activities", "", ""],
  ["", "User-added", "", ""]
];

constants.PROJECT_INFO_FIELDS = [
  // "dataset",
  // "dataset_description",
  // "dataset_id",
  "first_name",
  "institution",
  "last_name",
  "pi_email",
  "pi_name",
  "project",
  // "project_abstract",
  "project_title",
  "public",
  // "reference",
  "username"
];

constants.METADATA_NAMES_ADD = [
  // "dataset",
  "dataset_id",
  "project_abstract"
];

constants.METADATA_NAMES_SUBSTRACT = [
  "dataset_description",
  "primer_suite",
  "project_abstract",
  "reference"
];

// see metadata.js
// constants.METADATA_DROPDOWN_FIELDS = ["biome_secondary",
//   "dna_extraction_meth",
//   "env_biome",
//   "env_feature",
//   "env_material",
//   "env_package",
//   "feature_secondary",
//   "investigation_type",
//   "material_secondary",
//   "sample_type"
// ];

constants.ORDERED_METADATA_DIVIDERS = ["Biological",
  "Enter depth values in one or more categories",
  "Enter either volume or mass",
  "General",
  "MBL generated laboratory metadata",
  "Please fill in",
  "Non-biological",
  "Parameter",
  "Sample handling",
  "User supplied metadata",
  "User-added"
];

constants.MY_DNA_EXTRACTION_METH_OPTIONS = ["Please choose one",
  "CTAB Phenol-chloroform",
  "Hot alkaline extraction",
  "MP Biomedical Fast DNA",
  "MP Biomedical Fast DNA Spin Kit for Soil",
  "Mo Bio/Qiagen PowerBiofilm",
  "Mo Bio/Qiagen PowerMax Soil",
  "Mo Bio/Qiagen PowerSoil",
  "Mo Bio/Qiagen PowerWater",
  "Mo Bio/Qiagen UltraClean Microbial",
  "Other",
  "Phenol-chloroform",
  "Qiagen Genomic DNA lysis buffer",
  "SDS Phenol-chloroform"];

constants.DNA_QUANTITATION_OPTIONS = ["Please choose one",
  "Fluorescent Microspheres",
  "NanoDrop",
  "NanoQuant",
  "Perfluorocarbon Tracers",
  "PicoGreen",
  "Other"];

// "subseafloor",
// "subterrestrial",

constants.BIOME_PRIMARY = ["Please choose one",
  "marine biome",
  "terrestrial biome"];

constants.FEATURE_PRIMARY = ["Please choose one",
  "aquifer",
  "borehole",
  "cave",
  "enrichment",
  "geological fracture",
  "geyser",
  "hydrothermal vent",
  "lake",
  "mine",
  "ocean trench",
  "reservoir",
  "seep",
  "spring",
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

constants.METADATA_FORM_REQUIRED_FIELDS = ["adapter_sequence",
  "collection_date",
  "conductivity",
  "dataset",
  "dataset_description",
  "dna_extraction_meth",
  "dna_quantitation",
  "dna_region",
  "domain",
  "elevation",
  "env_biome",
  "env_feature",
  "env_material",
  "env_package",
  "forward_primer",
  "geo_loc_name_continental",
  "geo_loc_name_marine",
  "illumina_index",
  "investigation_type",
  "latitude",
  "longitude",
  "ph",
  "project",
  "reverse_primer",
  "run",
  "sample_concentration",
  "sample_name",
  "sample_type",
  "sequencing_meth",
  "target_gene",
  "temperature",
  "tube_label",
  "user_sample_name"
];

// "misc natural or artificial environment" = miscellaneous_natural_or_artificial_environment

constants.DCO_ENVIRONMENTAL_PACKAGES = ["Please choose one",
  "miscellaneous_natural_or_artificial_environment",
  "microbial_mat/biofilm",
  "plant_associated",
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


constants.SAMPLE_TYPE = ["Please choose one",
  "control",
  "enrichment",
  "environmental sample",
  "isolate"];

constants.GAZ_SPELLING = {"United States": ["usa", "united states of america"]};

// TODO: add fields_names for each
constants.PACKAGES_AND_PORTALS = {
  'air': ['air'],
  'built environment': ['built_environment', 'indoor', 'MBE', 'MOBE'],
  'extreme habitat': ['extreme_habitat'],
  'host associated': ['host_associated'],
  'human associated': ['NIHHMP', 'UC', 'human-amniotic-fluid', 'human-associated', 'human-blood', 'human-gut', 'human-oral', 'human-skin', 'human-urine', 'human-vaginal'],
  'microbial mat/biofilm': ['microbial mat/biofilm', 'PSPHERE'],
  'miscellaneous natural or artificial environment': ['miscellaneous natural or artificial environment'],
  'plant associated': ['plant_associated'],
  'sediment': ['sediment'],
  'soil': ['soil'],
  'unknown': ['unknown'],
  'wastewater/sludge': ['wastewater/sludge'],
  'water': ['water', 'ICOMM', 'water-freshwater', 'water-marine'],
  'CMP': ['CMP', 'host-associated', 'water'],
  'CODL': ['CODL', 'DCO'],
  'LTER': ['LTER'],
  'PSPHERE': ['PSPHERE'],
  'UNIEUK': ['UNIEUK'],
};

// CSV files (3)
// 1
constants.METADATA_FIELDS_FOR_PIPELINE_PROCESSING_INPUT_CSV = ["adaptor",
  "amp_operator",
  "barcode",
  "barcode_index",
  "data_owner",
  "dataset",
  "dataset_description",
  "dna_region",
  "email",
  "env_sample_source_id",
  "first_name",
  "funding",
  "insert_size",
  "institution",
  "lane",
  "last_name",
  "overlap",
  "platform",
  "primer_suite",
  "project",
  "project_description",
  "project_title",
  "read_length",
  "run",
  "run_key",
  "seq_operator",
  "tubelabel"
];

// 2
constants.METADATA_EMPTY_TEMPLATE_CSV = [["structured_comment_name","Metadata name"],
  ["","","Information by project"],
  ["project_title","Title of Project"],
  ["project","VAMPS project name"],
  ["pi_name","PI Name"],
  ["pi_email","PI's email address"],
  ["project_abstract","Project abstract"],
  ["reference","References for selected manuscripts published that describe the location"],
  ["","","Information by sample (dataset)"],
  ["sample_num","Sample Number",1],
  ["sample_name","Sample ID (user sample name)"],
  ["dataset_description","Dataset description"],
  ["tube_label","Tube label"],
  ["sample_concentration","Sample concentration"],
  ["dna_quantitation","DNA Quantitation"],
  ["env_package","Environmental Package"],
  ["dataset","VAMPS dataset name"],
  ["geo_loc_name_continental","Country (if not international waters)"],
  ["geo_loc_name_marine","Longhurst Zone (if marine)"],
  ["domain","Domain"],
  ["target_gene","Target gene name"],
  ["dna_region","DNA region"],
  ["sequencing_platform","Sequencing method"],
  ["forward_primer","Forward PCR Primer"],
  ["reverse_primer","Reverse PCR Primer"],
  ["illumina_index","Index sequence (for Illumina)"],
  ["adapter_sequence","Adapter sequence"],
  ["run","Sequencing run date"],
  ["investigation_type","Investigation Type"],
  ["sample_type","Sample Type"],
  ["collection_date","Sample collection date"],
  ["latitude","Latitude (±90°)"],
  ["longitude","Longitude (±180°)"],
  ["env_biome","Environmental Biome - Primary"],
  ["biome_secondary","Environmental Biome - Secondary"],
  ["env_feature","Environmental Feature - Primary"],
  ["feature_secondary","Environmental Feature - Secondary"],
  ["env_material","Environmental Material - Primary"],
  ["material_secondary","Environmental Material - Secondary"],
  ["depth_subseafloor","Depth below seafloor"],
  ["depth_subterrestrial","Depth below terrestrial surface"],
  ["tot_depth_water_col","Water column depth"],
  ["elevation","Elevation (if terrestrial)"],
  ["dna_extraction_meth","DNA Extraction"],
  ["sample_size_vol","Sample Size (volume)"],
  ["sample_size_mass","Sample Size (mass)"],
  ["sample_collection_device","Sample collection device"],
  ["formation_name","Formation name"],
  ["samp_store_dur","Storage duration"],
  ["samp_store_temp","Storage temperature"],
  ["isol_growth_cond","Isolation and growth condition (reference)"],
  ["ph","pH"],
  ["temperature","Temperature"],
  ["conductivity","Conductivity"],
  ["resistivity","Resistivity"],
  ["salinity","Salinity"],
  ["pressure","Pressure"],
  ["redox_state","Redox state"],
  ["redox_potential","Redox potential"],
  ["diss_oxygen","Dissolved oxygen"],
  ["diss_hydrogen","Dissolved hydrogen"],
  ["diss_org_carb","Dissolved organic carbon"],
  ["diss_inorg_carb","Dissolved inorganic carbon"],
  ["tot_org_carb","Total organic carbon"],
  ["npoc","Non-purgeable organic carbon"],
  ["tot_inorg_carb","Total inorganic carbon"],
  ["tot_carb","Total carbon"],
  ["carbonate","Carbonate"],
  ["bicarbonate","Bicarbonate"],
  ["silicate","Silicate"],
  ["del180_water","Delta 180 of water"],
  ["part_org_carbon_del13c","Delta 13C for particulate organic carbon"],
  ["diss_inorg_carbon_del13c","Delta 13C for dissolved inorganic carbon"],
  ["methane_del13c","Delta 13C for methane"],
  ["alkalinity","Alkalinity"],
  ["calcium","Calcium"],
  ["sodium","Sodium"],
  ["ammonium","Ammonium"],
  ["nitrate","Nitrate"],
  ["nitrite","Nitrite"],
  ["nitrogen_tot","Total nitrogen"],
  ["org_carb_nitro_ratio","Carbon nitrogen ratio"],
  ["sulfate","Sulfate"],
  ["sulfide","Sulfide"],
  ["sulfur_tot","Total sulfur"],
  ["chloride","Chloride"],
  ["phosphate","Phosphate"],
  ["potassium","Potassium"],
  ["iron","Total iron"],
  ["iron_ii","Iron II"],
  ["iron_iii","Iron III"],
  ["magnesium","Magnesium"],
  ["manganese","Manganese"],
  ["methane","Methane"],
  ["noble_gas_chemistry","Noble gas chemistry"],
  ["trace_element_geochem","Trace element geochemistry"],
  ["porosity","Porosity"],
  ["rock_age","Sediment or rock age"],
  ["water_age","Water age"],
  ["microbial_biomass_microscopic","Microbial biomass - total cell counts"],
  ["n_acid_for_cell_cnt","NA dyes used for total cell counts"],
  ["microbial_biomass_fish","FISH-based cell counts"],
  ["fish_probe_name","Name of FISH probe"],
  ["fish_probe_seq","Sequence of FISH probe"],
  ["intact_polar_lipid","Intact polar lipid"],
  ["microbial_biomass_qpcr","qPCR and primers used"],
  ["biomass_wet_weight","Biomass - wet weight"],
  ["biomass_dry_weight","Biomass - dry weight"],
  ["plate_counts","Plate counts - colony forming"],
  ["functional_gene_assays","functional gene assays"],
  ["clone_library_results","clone library results"],
  ["enzyme_activities","enzyme activities"]
];

// 3 created from form
constants.METADATA_CSV_FROM_FORM = ["npoc", "access_point_type", "adapter_sequence", "alkalinity", "ammonium", "bicarbonate", "env_biome", "biome_secondary", "calcium", "carbonate", "chloride", "clone_library_results", "collection_date", "conductivity", "dataset", "dataset_description", "dataset_id", "del180_water", "depth_in_core", "depth_subseafloor", "depth_subterrestrial", "diss_hydrogen", "diss_inorg_carb", "diss_inorg_carbon_del13c", "diss_org_carb", "diss_oxygen", "dna_extraction_meth", "dna_quantitation", "dna_region", "domain", "elevation", "env_package", "enzyme_activities", "env_feature", "fish_probe_name", "fish_probe_seq", "feature_secondary", "formation_name", "forward_primer", "functional_gene_assays", "geo_loc_name_continental", "geo_loc_name_marine", "illumina_index", "intact_polar_lipid", "investigation_type", "iron", "iron_ii", "iron_iii", "isol_growth_cond", "latitude", "longitude", "magnesium", "manganese", "env_material", "material_secondary", "methane", "methane_del13c", "microbial_biomass_fish", "microbial_biomass_microscopic", "microbial_biomass_qpcr", "nitrate", "nitrite", "nitrogen_tot", "noble_gas_chemistry", "org_carb_nitro_ratio", "ph", "part_org_carbon_del13c", "phosphate", "pi_email", "pi_name", "plate_counts", "porosity", "potassium", "pressure", "project", "project_abstract", "project_title", "redox_potential", "redox_state", "reference", "resistivity", "reverse_primer", "rock_age", "run", "salinity", "sample_collection_device", "samp_store_dur", "samp_store_temp", "sample_name", "sample_size_mass", "sample_size_vol", "sample_type", "sequencing_meth", "silicate", "sodium", "sulfate", "sulfide", "sulfur_tot", "target_gene", "temperature", "tot_carb", "tot_depth_water_col", "tot_inorg_carb", "tot_org_carb", "trace_element_geochem", "water_age", "first_name", "institution", "last_name", "public", "username", "95percenct_ci_cellspermilliliter", "API Gravity", "APPX_age_Ma", "Acetate", "Ammonium", "Archaeal/Bacteria", "B_OH_4-", "Ba+2 _ppm_", "Bottom_Hole_Latitude", "Bottom_Hole_Longitude", "Br-", "Butyrate", "CO3-2", "Ca+2", "Cl-", "Cu+2", "DNA_Yield_ml_or_g", "DNA_quants", "Date", "Depth_Below_SeaFloor", "Depth_Below_SeaSurface", "Depth_Interval", "Depth_mbsf", "Dive Number or Well Name", "Formate", "GOR Single Stage Flash if available _SCF", "Glycolate", "HCO3-", "Hero Taxa-4", "Hero Taxa-5", "I-", "Item", "K+", "Location", "MBL_dna_region", "MBL_platform", "MBL_run", "MVCO_event_number", "Matrix", "Mg+2", "Mn+2", "Na+", "Ni+2", "Nitrate_nitrite", "Notes", "Oil Related Hit-1", "Oil Related Hit-2", "Oil Related Hit-3", "Pb+2", "Phosphate", "Pressure Mpa", "Pressure_Mpa", "Priority", "Propionate", "Read Count-1", "Read Count-2", "Read Count-3", "Read Count-4", "Read Count-5", "S-2", "SO4-2", "Salinity", "Sample", "Sample Depth mbsf", "Sample Type", "Sample_Number", "Si+4", "Silicate", "Site_Name", "Sr+2", "TVD_Below_SeaFloor", "Temperature", "Temperature_C_", "V+2", "Valerate", "Water Depth m", "Water_Depth", "Zn+2", "a260_280", "a260_280_2", "absolute_depth_beta", "acetate", "achnanthes_sp", "acid_neutr_cap", "actinoptychus_senarius", "ag", "age", "age_in_years", "air_temperature", "airflowvelocitympersec", "al", "alexandrium_fundyense", "alexandrium_ostenfeldii", "alkaline_phospatase_activity", "alkaline_phospatase_km", "alkaline_phospatase_vmax", "alpha glucosidase activity", "alpha_glucosidase_activity", "alt_elev", "altitude", "aminopeptidase activity", "aminopeptidase_activity", "aminopeptidase_average", "aminopeptidase_se", "ammonium_nh4", "amount or size of sa", "amphidinium_sp", "amylax_triacantha", "anabaeana_sp", "aphanizomenon_sp", "app_oxygen_utilization", "apparent_oxygen_utilization", "arc_lib_reads_seqd", "arch_production", "area", "argon", "arsenic", "as", "asterionellopsis_glacialis", "atm_press", "au", "b", "ba", "bac_lib_reads_seqd", "bact_cell_count", "bact_cell_count_micro", "bact_cell_count_se", "bact_production", "bact_production_unfiltered", "bacteria", "bacterial abundance", "bacterial production", "bacterial production from unfiltered sample", "bacterial_carbon_average", "bacterial_carbon_se", "bacterialcellsperm3", "bafc", "barcode", "barcode_index", "batch_no", "be", "benzene", "beta glucosidase activity", "beta_glucosidase_activity", "beta_glucosidase_average", "beta_glucosidase_se", "bi", "borehole_depth", "boron", "br", "brachionus_sp_", "butane", "c", "c14", "c37:2", "c37:3", "c37:4", "c37total", "ca", "calcium_carbonate", "calcium_carbonate_caco3", "calcium_mg/l_", "calcium_ppm_", "calfid", "carb_dioxide", "carbon_14", "carbon_dioxide", "carotenoids", "cbafc", "cd", "ce", "cell_high_dna", "cells", "center_name", "center_project_name", "centric_diatoms", "cerataulina_pelagica", "ceratium_fusus", "ceratium_kofoidii", "ceratium_lineatum", "ceratium_longipes", "ceratium_tripos", "chaetoceros_compressus", "chaetoceros_convolutus", "chaetoceros_debilis", "chaetoceros_decipiens", "chaetoceros_lorenzianus", "chaetoceros_simplex", "chaetoceros_socialis", "chaetoceros_sp", "chatonella_sp", "chitinase_average", "chitinase_se", "chl-a", "chla", "chla-mg/l", "chloride_mg/l_", "chlorophyll", "chlorophyll__ctd_", "chlorophyll_a", "chlorophyll_plus_phaeopigments", "chlorophyll_total", "chlorophyllide-a", "cl", "clay_inf4_micron", "co", "collection date", "collection_time", "core_depth__1-2_cm_-_cold_sediment", "core_depth__1-2_cm_-_orange_mat", "core_depth__1-2_cm__cold_sediment", "core_depth__1-2_cm__orange_mat", "corethron_criophilum", "coscinodiscus_sp", "cr", "cs", "ctd oxygen", "ctd pressure", "ctd temperature", "ctd transmission", "ctdoxy", "ctdprs", "ctdsal", "ctdtmp", "cu", "cyanobacteria_cyto", "cylindrotheca_closterium", "dactyliosolen_fragilissimus", "date", "decimal_time", "del18o_water", "density", "density_gamma_epsilon", "density_gamma_theta", "depth", "depth_category", "depth_end", "depth_start", "detonula_confervacea", "dgge_richness", "diatoms", "dictyocha_fibula", "dictyocha_speculum", "dinobryon_sp", "dinoflagellate_cells", "dinophysis_acuminata", "dinophysis_acuta", "dinophysis_norvegica", "dinosphysis_sp", "diss_inorg_carbon", "diss_inorg_nitro", "diss_org_nitro", "diss_org_phosp", "diss_oxygen_mg/l_", "dissolved_inorganic_carbon", "dissolved_iron_fe_ii", "dissolved_organic_carbon", "dissolved_organic_nitrogen", "dissolved_organic_phosphorus", "dissolved_oxygen2", "dissolved_oxygen_ctd", "distance_from_shore", "ditylum_brightwellii", "dna_extracted", "doc", "dry_dna", "dy", "ebria_tripartita", "electron_transport_system__potential_respiration_", "emp_status", "environmental packag", "er", "ethane", "eu", "eucampia_zodiacus", "eucaryotic phytoplankton cells", "eucaryotic picoplankton cells", "euglenophyceae", "euk_cell_count", "euk_lib_reads_seqd", "exact_depth", "experimen_location", "experiment_center", "experiment_design_description", "experiment_title", "experimental factor", "fecal_coliform", "flagel_cell_count", "fluor", "fluorescence", "fluoride", "fluoroprobe_chlorophytes", "fluoroprobe_cryptophytes", "fluoroprobe_cyanobacteria", "fluoroprobe_diatoms", "fphaeo-a chch", "fragment_size", "fwd_primer", "ga", "gamma_epsilon", "gamma_theta", "gd", "ge", "geographic location", "gonyaulax_digitale", "gonyaulax_spinifera", "grain_size_125-63_micron", "grain_size_250-125_micron", "grain_size_500-250_micron", "grain_size_sup500_micron", "gravel", "guinardia_delicatula", "guinardia_flaccida", "guinardia_striata", "gymnodinium_sp", "gyrodinium_sp", "gyrosigma_fasciola", "gyrosigma_tennuissimum", "helicostomella_sp_", "helicotheca_tamesis", "heterocapsa_triquetra", "heterotrophic bacteria", "hf", "hg", "hna", "ho", "hplc-19-but", "hplc-19-hex", "hplc-allox", "hplc-chl-b", "hplc-chl-c2", "hplc-chlorophyllide-a", "hplc-dvchl-a", "hplc-peridinin", "hplc-phaeophorb-a", "hplc-phaeophyt-a", "hplc-prasin", "humidity", "hydrogen", "hydrogen_sulfide", "hydrogen_sulfide_h2s", "i", "i_butane", "illumina_technology", "in", "instrument_model", "investigation type", "ir", "iron_II_dissolved", "iron_II_total", "iron_fe", "irradiance", "isobutane", "la", "lat_lon", "lauderia_annulata", "leptocylindrus_danicus", "leptocylindrus_minimus", "leucine", "leucine-aminopeptidase_activity", "leucine-aminopeptidase_km", "leucine-aminopeptidase_vmax", "li", "lib_reads_seqd", "library construction", "library reads sequen", "library_construction_protocol", "licmophora_abbreviata", "light_ext_coeff", "linker", "lipase_average", "lipase_se", "lithium", "lithology", "litostomatea", "local_time", "lter_station_name", "lu", "magnesium_ppm_", "manganese_mn", "manganese_ug/l_", "melosira_sp", "methane _bottom water_", "methane oxidation depth integrated 0-10", "methane_ch4", "methane_oxidation_rate", "methane_turnover", "microbial biomass _average cell numbers_", "microbial_biomass_avg_cell_number", "microbial_biomass_for_dna_extract", "microbial_biomass_intactpolarlipid", "microbial_biomass_platecounts", "microbial_biomass_std_deviation", "microeukaryote_cells__>_5_micrometers_", "minuscula_bipes", "ml_or_g", "mo", "mud_average", "mud_sd", "myrionecta_rubrum", "n_butane", "nanodrop", "nanodrop_2", "navicula_sp_", "nb", "nd", "nh4", "nh4um/l", "ni", "nitrate + nitrite nitrogen_no3-n_", "nitrate _no3_", "nitrate+nitrate", "nitrate__no3__and_nitrite__no2_", "nitrate_no3", "nitrate_no3_nitrite_no2", "nitrate_nodc_annual", "nitrate_nodc_monthly", "nitrite _no2_", "nitrite_no2", "nitrite_plus_nitrate", "nitrogen", "nitrogen_minus_nitrite", "no2no3", "non_thecate_dinoflagellate_", "non_thecate_dinoflagellates", "nucleic acid extract", "o2_seapoint", "odontella_sinensis", "odontells_regia", "only gcs: methane oxidation rate at dna", "only gcs: sulfate reduction rate at dna", "optical back scatter", "optical_back_scatter", "organism_count", "os", "oxygen", "oxygen_pct", "p", "pH", "par_irradiance", "part_carb", "part_carb_ug/l_", "part_nitro", "part_nitro_ug/l_", "part_org_carb", "part_org_carv", "part_org_nitro", "part_phosp", "pb", "pcr conditions", "pcr primers", "pcr_primers", "pd", "pennate_diatoms", "pentane", "perc_core_recovered", "percent_oxygen", "ph_of_mud_pool", "phaeocystis_spp", "phaeophytine_a", "phaeopigments", "phosphatase activity", "phosphatase_activity", "phosphatase_average", "phosphatase_se", "phosphate_po4", "physical_specimen_remaining", "picoeukaryotes", "plate counts on m3-ch3oh", "plate counts on m3-nh4cl+vitamines", "plate counts on marine agar", "platform", "pleurosigma/gyrosigma", "pleurosigma_angulatum", "pleurosigma_angulatum_var_strigosa", "po4", "po4ug/l", "poc", "poc-mg/m3", "pon", "potassium_ppm_", "potential_acetate_methanogenesis", "potential_bicarbonate_methanogenesis", "potential_sulphate_reduction", "pr", "precipitation", "primer", "primerSuite", "prochlorococcus", "project name", "propane", "prorocentrum_micans", "prorocentrum_minimum", "protoperidinium_brevipes", "protoperidinium_sp", "pseudo-nitschia_seriata-group", "pseudo-nitzschia_delicatissima_group", "pseudo-nitzschia_sp", "pseudo-nitzschia_sp_", "pseudoanabaeana_sp", "pt", "quality assurance / quality control meth", "quality_method", "rb", "re", "rel_to_oxygen", "relevant electronic", "relevant standard op", "rev_primer", "rh", "rhizoselenia_hebetata", "rhizoselenia_setigera", "ru", "run_center", "run_date", "run_key", "run_prefix", "s", "sal", "salinity_at_bottom", "salinity_ppt", "samp_size", "sample collection de", "sample_center", "sample_volume", "sample_weight", "sampleid", "sampling_date", "sand", "sand_average", "sand_sd", "sb", "sc", "scrippsiella_sp_", "scrippsiella_trochoidea", "se", "secchi", "secchi_depth", "sediment_chlorophyll_a_average", "sediment_depth_end", "sediment_depth_start", "sediment_phaeopigments_average", "seq_count", "sequence quality che", "shannon_index", "si", "sigma-theta", "silicate _sio4_", "silicate__sio2_", "silicate_sio4", "silicon", "silt_4-63_micron", "silt_clay", "skeletonema_costatum", "sm", "sn", "sodium_mg/l_", "sodium_ppm_", "soil_ch4_flux", "soil_co2_flux", "specific_conductance", "sr", "string_depth", "study_center", "sulfate reduction depth integrated 0-10", "sulfate_so4", "sulfide_s2", "suspend_sediment", "synechococcus", "ta", "target gene", "target subfragment", "target_depth", "target_subfragment", "tb", "tds", "te", "temp", "temperature_at_the_time_of_sampling", "temperature_avg", "temperature_bottom", "temperature_ctd", "temperature_maximum", "temperature_nodc_annual", "th", "thalassiosira_august-lineata", "thalassiosira_gravida", "thalassiosira_nordenskioeldii", "thalassiosira_sp", "thaloassionema_nitzschioides", "thecate_dinoflagellates", "thecate_dinoflagellates_lt_20_micrometers", "thecate_dinoflagellates_lt_20um", "theta_pot_temp", "thymidine", "thymidine_uptake", "ti", "time", "time_utc", "tl", "tm", "tot_diss_nitro", "tot_diss_phos", "tot_diss_phosp", "tot_nitro", "tot_org_matter", "tot_org_matter_avg", "tot_phos", "tot_phosp", "tot_suspend_solids", "total chlorophyll", "total_cell_count", "total_nitrogen", "total_organic_carbon", "total_organic_nitrogen", "total_phosphorus", "total_weight", "transparency", "turbidity", "u", "v", "visit_date", "vol_filtered", "volume_filtered", "w", "water_average", "water_sd", "wind_speed", "y", "yb", "zn", "zr"
]

module.exports = constants;
