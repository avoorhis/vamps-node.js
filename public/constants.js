var config = {};
var path = require("path");




//// PATHS *** Change these to match your system ***  ////
//
// if you want to use rdp to assign taxonomy to your uploaded data
// install rdp (http://sourceforge.net/projects/rdp-classifier/files/rdp-classifier/) 
// on your system and provide the path to classifier.jar file here.
// You will also need java on your system to run this.
config.PATH_TO_RDP = '/Users/avoorhis/programming/rdp_classifier/dist/';
//
// http://www.ncbi.nlm.nih.gov/books/NBK279671/
config.PATH_TO_BLAST = '/usr/local/ncbi/blast/bin/';
//
// http://qiime.org/
config.PATH_TO_QIIME_BIN = '/opt/local/Library/Frameworks/Python.framework/Versions/2.7/bin/';
//// END OF USER CONFIGURATION ////

///////////////////////////////////////////
///////////////////////////////////////////
//// DO NOT CHANGE ANYTHING BELOW HERE ////
////
////
config.PATH_TO_SCRIPTS = path.join(process.env.PWD,'public','scripts');
config.ENV_SOURCE = { 
        10: "air",
         20: "extreme habitat",
        30: "host associated",
         40: "human associated",
		 41: "human-skin",
		 42: "human-oral",
		 43: "human-gut",
		 45: "human-amniotic-fluid",
		 46: "human-urine",
		 47: "human-blood",	
	     50: "microbial mat/biofilm",
		 60: "miscellaneous_natural_or_artificial_environment",
		 70: "plant associated",
		 80: "sediment",
		 90: "soil/sand",
		 100: "unknown",
		 110: "wastewater/sludge",
		 120: "water-freshwater",
		 130: "water-marine",
		 140: "indoor"
    };
config.DOMAINS = { domains: [
        {id: 1, name: "Archaea"},
        {id: 2, name: "Bacteria"},
        {id: 3, name: "Eukarya"},
        {id: 4, name: "Organelle"},
        {id: 5, name: "Unknown"}
    ]};

config.UNITSELECT = { units: [
        {id : 'tax_silva108_simple',file: 'unit_selectors/taxa_silva108_simple.html', name : "Taxonomy -Simple", subtext: 'Silva108'},
        {id : 'tax_silva108_custom',file: 'unit_selectors/taxa_silva108_custom.html', name : "Taxonomy -Custom", subtext: 'Silva108'},
        {id : 'tax_gg_simple',      file: 'unit_selectors/taxa_gg_simple.html',       name : "Taxonomy -Simple", subtext: 'Greengenes v13.5'},
        {id : 'tax_gg_custom',      file: 'unit_selectors/taxa_gg_cust.html',         name : "Taxonomy -Custom", subtext: 'Greengenes v13.5'},
        {id : 'tax_rdp',            file: 'unit_selectors/taxa_rdp.html',             name : "Taxonomy RDP",     subtext: 'Release 11'},
        {id : 'otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'ClosedRef GG v13.5'},
        {id : 'otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'UCLUST'},
        {id : 'otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'SLP'},
        {id : 'med_nodes',          file: 'unit_selectors/med_nodes.html',            name : "MED Nodes",        subtext: ''}
    ]};

config.VISUALOUTPUTCHOICES = { choices: [
        {id : 'counts_table',   show: 'Counts Table'},
        {id : 'barcharts',      show: 'Counts Bar Charts'},
        {id : 'heatmap',        show: 'Distance Heatmap'},
        {id : 'dendrogram',     show: 'Community Dendrogram'},
        {id : 'alphadiversity', show: 'Alpha Diversity'}
    ]};

config.NORMALIZATIONCHOICES = { choices: [
        {id: 'none',            show: 'Not Normalized (default)'},
        {id: 'maximum',         show: 'Normalized to the Maximum Sample'},
        {id: 'frequency',       show: 'Normalized to Frequency'}
    ]};

   
config.DISTANCECHOICES = { choices: [
        
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

// This List MUST match the fields in sequence_uniq_infos
config.AVAILABLE_UNITS = ['silva_taxonomy_info_per_seq_id', 'oligotype_id', 'gg_otu_id'];
// blue to red
config.HEATMAP_COLORS = ['1111ff','3333ff','5555ff','7777ff','9999ff','aaaaff','ccccff','ddeeee','eeeedd','ffdddd','ffbbbb','ff9999','ff7777','ff5555','ff3333','ff0000'];

config.RSCRIPT_CMD = 'RScript --no-restore --no-save';

config.RANKS = ["domain", "phylum", "klass", "order", "family", "genus", "species", "strain"];

config.PCT_RANGE = [0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100];

config.VISUAL_THUMBNAILS = { visuals: [
    {name:'Distance Heatmap (py)',      thumb:'/images/visuals/heatmap.png',		link:'user_viz_data/heatmap',        id:'dheatmap_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'},
    {name:'Frequency Heatmap (R-pdf)',  thumb:'/images/visuals/fheatmap.png', 		link:'user_viz_data/frequency_heatmap', id:'fheatmap_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-R (https://www.r-project.org/)-|-pheatmap (R-package)-|-vegan (R-package)-|-jsonlite (R-package)-|-RColorBrewer (R-package)'},
    {name:'Stackbar Charts (d3-svg)',   thumb:'/images/visuals/barcharts.png',   	link:'user_viz_data/barcharts',      id:'barcharts_link_id', 
        tip:''    },
    {name:'Pie Charts (d3-svg)',        thumb:'/images/visuals/pie_charts.png',  	link:'user_viz_data/piecharts',      id:'piecharts_link_id', 
        tip:''    },
    {name:'Data Browser (Krona)',       thumb:'/images/visuals/krona.png',  		link:'user_viz_data/dbrowser',       id:'dbrowser_link_id', 
        tip:''     },
	{name:'Dendrogram (d3-phylogram)',  thumb:'/images/visuals/dendrogram.png',		link:'user_viz_data/dendrogram',     id:'dendrogram1_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },
	{name:'Dendrogram (d3-pylonator)',  thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram2_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },
    {name:'Dendrogram (py-pdf)',        thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram_pdf_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-matplotlib (python library)'},
    {name:'PCoA 2D Analyses (R-pdf)',   thumb:'/images/visuals/pcoa.png',        	link:'user_viz_data/pcoa',           id:'pcoa_link_id', 
        tip:'R (https://www.r-project.org/)-|-jsonlite (R-package)'        },
    {name:'PCoA 3D Analyses (Emperor)', thumb:'/images/visuals/emperor.png',        link:'user_viz_data/pcoa',           id:'pcoa_3d_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-QIIME (http://qiime.org)' },
    {name:'Frequency Matrix (Table)',   thumb:'/images/visuals/counts_table.png',	link:'user_viz_data/counts_table',   id:'counts_table_link_id', 
        tip:''  },
    {name:'Metadata Table',             thumb:'/images/visuals/metadata.png',    	link:'user_viz_data/metadata_table', id:'metadata_table_link_id', 
        tip:''},
    {name:'Data Geo-Location',          thumb:'/images/visuals/map.png',         	link:'user_viz_data/geospatial',     id:'geospatial_link_id', 
        tip:''    },
    {name:'Alpha Diversity',            thumb:'/images/visuals/alpha.png',          link:'user_viz_data/alpha_diversity',id:'adiversity_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-scikit-bio'}
   
]};
    
config.REQ_METADATA_FIELDS = ["altitude", "assigned_from_geo", "collection_date", "common_name", "country", "depth", "description", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public", "taxon_id"];

module.exports = config;


