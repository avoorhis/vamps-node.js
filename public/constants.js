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
console.log('in constants');
console.log(constants.default_taxonomy);
constants.dataset_count_for_visuals_max    = 1100;
constants.dataset_count_for_visuals_cutoff = 500;
constants.show_nas                         = {"raw": false, "string": "--"};  // if raw==true will show class_NA, genus_NA etc; else show string (tax table only; not biom file)
// blast dbs are in public/blast
constants.blast_dbs = ['Bv3v5', 'Bv4v5', 'Av4v5', 'Bv4', 'Bv6', 'Bv6v4', 'Av6v4', 'Av6', 'Ev9', 'Misc']; // leave 'Misc' as last item
//constants.misc_blast_dbs   = 'misc_blast' // ['Bv1v2','Bv1v4','Bv1v3','Bv2','Bv3','Av3v5','Bv3v4','Av3','Bv5v6','ITS']
constants.download_file_formats = ['metadata', 'fasta', 'taxbytax', 'taxbyref', 'taxbyseq', 'biom', 'matrix', 'phyloseq', 'distance', 'emperor', 'pdf', 'tree', 'heatmap', 'otus'];
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
    {d_r: ["Sgun"], domain: "Shotgun", regions: ['random'], domain_show: "All"},
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
  units: [
    {
      id: 'tax_silva119_simple',
      file: 'unit_selectors/taxa_silva119_simple.html',
      name: "Taxonomy (Silva-119) -Simple",
      subtext: 'Silva119'
    },
    {
      id: 'tax_silva119_custom',
      file: 'unit_selectors/taxa_silva119_custom.html',
      name: "Taxonomy (Silva-119) -Custom",
      subtext: 'Silva119'
    },
    {
      id: 'tax_rdp2.6_simple',
      file: 'unit_selectors/taxa_rdp2.6.html',
      name: "Taxonomy RDP (v2.6)",
      subtext: 'Release 2.6'
    },
    {id: 'tax_generic_simple', file: 'unit_selectors/taxa_generic.html', name: "Generic", subtext: ''},

    //   {id : 'tax_silva108_custom_fancytree',file: 'unit_selectors/taxa_silva108_custom_fancytree.json', name : "Taxonomy -Custom_fancytree", subtext: 'Silva108'},
    //   {id : 'tax_silva108_custom_dhtmlx',file: 'unit_selectors/taxa_silva108_custom_dhtmlx.json', name : "Taxonomy -Custom_dhtmlx", subtext: 'Silva108'},
    {
      id: 'tax_gg_simple',
      file: 'unit_selectors/taxa_gg_simple.html',
      name: "TODO-Taxonomy (Greengenes-13.5) -Simple",
      subtext: 'Greengenes v13.5'
    },
    {
      id: 'tax_gg_custom',
      file: 'unit_selectors/taxa_gg_cust.html',
      name: "TODO-Taxonomy (Greengenes-13.5) -Custom",
      subtext: 'Greengenes v13.5'
    },

    //{id : 'TODO-otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'ClosedRef GG v13.5'},
    //{id : 'TODO-otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'UCLUST'},
    {id: 'otus', file: 'unit_selectors/otus.html', name: "TODO-OTUs", subtext: 'SLP'},
    {id: 'med_nodes', file: 'unit_selectors/med_nodes.html', name: "TODO-MED Nodes", subtext: ''}
  ]
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

// duplicate in metadta.js!
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

module.exports = constants;
