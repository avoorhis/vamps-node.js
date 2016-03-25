var path = require("path");


var constants = {};
///////////////////////////////////////////
///////////////////////////////////////////
//// DO NOT CHANGE ANYTHING BELOW HERE ////
///////////////////////////////////////////
///////////////////////////////////////////

constants.blast_db      = 'ALL_SEQS';

constants.ENV_SOURCE = { 
        10: "air",
         20: "extreme habitat",
        30: "host associated",
         40: "human associated",
		 41: "human-skin",
		 42: "human-oral",
		 43: "human-gut",
         44: "human-vaginal",
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
constants.DOMAINS = { domains: [
        {id: 1, name: "Archaea"},
        {id: 2, name: "Bacteria"},
        {id: 3, name: "Eukarya"},
        {id: 4, name: "Organelle"},
        {id: 5, name: "Unknown"}
    ]};
constants.TARGETS = ["Av3","Av6", "Av6v4","Av4v5", "Av3v5","Av5v6",
                     "Bv1v3","Bv3","Bv6", "Bv6v4","Bv4v5", "Bv3v5","Bv5v6",
        "Ev9" ];
constants.UNITSELECT = { units: [
        {id : 'tax_silva108_simple',file: 'unit_selectors/taxa_silva108_simple.html', name : "Taxonomy (Silva-108) -Simple", subtext: 'Silva108'},
        {id : 'tax_silva108_custom',file: 'unit_selectors/taxa_silva108_custom.html', name : "Taxonomy (Silva-108) -Custom", subtext: 'Silva108'},
     //   {id : 'tax_silva108_custom_fancytree',file: 'unit_selectors/taxa_silva108_custom_fancytree.json', name : "Taxonomy -Custom_fancytree", subtext: 'Silva108'},
     //   {id : 'tax_silva108_custom_dhtmlx',file: 'unit_selectors/taxa_silva108_custom_dhtmlx.json', name : "Taxonomy -Custom_dhtmlx", subtext: 'Silva108'},
        {id : 'tax_gg_simple',      file: 'unit_selectors/taxa_gg_simple.html',       name : "TODO-Taxonomy (Greengenes-13.5) -Simple", subtext: 'Greengenes v13.5'},
        {id : 'tax_gg_custom',      file: 'unit_selectors/taxa_gg_cust.html',         name : "TODO-Taxonomy (Greengenes-13.5) -Custom", subtext: 'Greengenes v13.5'},
        {id : 'tax_rdp',            file: 'unit_selectors/taxa_rdp.html',             name : "TODO-Taxonomy RDP",     subtext: 'Release 11'},
        //{id : 'TODO-otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'ClosedRef GG v13.5'},
        //{id : 'TODO-otus',               file: 'unit_selectors/otus.html',                 name : "OTUs",             subtext: 'UCLUST'},
        {id : 'otus',               file: 'unit_selectors/otus.html',                 name : "TODO-OTUs",             subtext: 'SLP'},
        {id : 'med_nodes',          file: 'unit_selectors/med_nodes.html',            name : "TODO-MED Nodes",        subtext: ''}
    ]};
constants.UNIT_ASSIGNMENT_CHOICES = { 
        1:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'refssu (full-length)',  availability:'available',     refdb:'SILVA108_FULL_LENGTH' },
        2:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Av6v4 (Archaeal)',      availability:'not available', refdb:'' },
        3:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Av3 (Archaeal)',        availability:'not available', refdb:'' },
        4:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Av4v5 (Archaeal)',      availability:'not available', refdb:'' },
        5:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Bv6v4 (Bacterial)',     availability:'not available', refdb:'' },
        6:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Bv3 (Bacterial)',       availability:'not available', refdb:'' },
        7:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Bv4v5 (Bacterial)',     availability:'not available', refdb:'' },
        8:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Bv6 (Bacterial)',       availability:'not available', refdb:'' },
        9:  { taxonomy_curator:'SILVA (v108)', method:'GAST', reference_db:'Ev9 (Eukaryal)',        availability:'not available', refdb:'' },
        10: { taxonomy_curator:'GreenGenes (May2013)', method:'GAST', reference_db:'refssu',        availability:'not available', refdb:'GG_MAY2013' },
        11: { taxonomy_curator:'UNITE',        method:'GAST', reference_db:'ITS1',                  availability:'not available', refdb:'' },
        12: { taxonomy_curator:'RDP (2.10.1)', method:'RDP',  reference_db:'Default (no training)', availability:'available',     refdb:'2.10.1' },
        13: { taxonomy_curator:'GreenGenes',   method:'RDP',  reference_db:'',                      availability:'not available', refdb:'GG_MAY2013' }
    };
constants.VISUALOUTPUTCHOICES = { choices: [
        {id : 'counts_table',   show: 'Counts Table'},
        {id : 'barcharts',      show: 'Counts Bar Charts'},
        {id : 'heatmap',        show: 'Distance Heatmap'},
        {id : 'dendrogram',     show: 'Community Dendrogram'},
        {id : 'alphadiversity', show: 'Alpha Diversity'}
    ]};

constants.NORMALIZATIONCHOICES = { choices: [
        {id: 'none',            show: 'Not Normalized (default)'},
        {id: 'maximum',         show: 'Normalized to the Maximum Sample'},
        {id: 'frequency',       show: 'Normalized to Frequency'}
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

// This List MUST match the fields in sequence_uniq_infos
constants.AVAILABLE_UNITS = ['silva_taxonomy_info_per_seq_id', 'oligotype_id', 'gg_otu_id'];
// blue to red
constants.HEATMAP_COLORS = ['1111ff','3333ff','5555ff','7777ff','9999ff','aaaaff','ccccff','ddeeee','eeeedd','ffdddd','ffbbbb','ff9999','ff7777','ff5555','ff3333','ff0000'];

constants.RSCRIPT_CMD = 'RScript --no-restore --no-save';

constants.RANKS = ["domain", "phylum", "klass", "order", "family", "genus", "species", "strain"];

constants.PCT_RANGE = [0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100];

constants.VISUAL_THUMBNAILS = { visuals: [
    {name:'Taxonomy Frequency Table',   thumb:'/images/visuals/counts_table.png',   link:'user_viz_data/counts_table',   id:'counts_table_link_id', 
        tip:''  },
    {name:'Metadata Table',             thumb:'/images/visuals/metadata.png',       link:'user_viz_data/metadata_table', id:'metadata_table_link_id', 
        tip:''},    
    {name:'Distance Heatmap (py)',      thumb:'/images/visuals/heatmap.png',		link:'user_viz_data/heatmap',        id:'dheatmap_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'},
    
    {name:'Stackbar Charts (d3/svg)',   thumb:'/images/visuals/barcharts.png',   	link:'user_viz_data/barcharts',      id:'barcharts_link_id', 
        tip:''    },
    {name:'Pie Charts (d3/svg)',        thumb:'/images/visuals/pie_charts.png',  	link:'user_viz_data/piecharts',      id:'piecharts_link_id', 
        tip:''    },
    {name:'Frequency Heatmap (R/pdf)',  thumb:'/images/visuals/fheatmap.png',       link:'user_viz_data/frequency_heatmap', id:'fheatmap_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-R (https://www.r-project.org/)-|-pheatmap (R-package)-|-vegan (R-package)-|-jsonlite (R-package)-|-RColorBrewer (R-package)'},
    {name:'Data Browser (Krona)',       thumb:'/images/visuals/krona.png',  		link:'user_viz_data/dbrowser',       id:'dbrowser_link_id', 
        tip:''     },
	{name:'Dendrogram (d3/phylogram)',  thumb:'/images/visuals/dendrogram.png',		link:'user_viz_data/dendrogram',     id:'dendrogram1_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },
	//{name:'Dendrogram (d3-phylonator)', thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram2_link_id', 
   //     tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },
    {name:'Dendrogram (d3/radial)',     thumb:'/images/visuals/radial.png',         link:'user_viz_data/dendrogram',     id:'dendrogram3_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },
   // {name:'Dendrogram (py-pdf)',        thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram_pdf_link_id', 
   //     tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-matplotlib (python library)'},
    {name:'PCoA 2D Analyses (R/pdf)',   thumb:'/images/visuals/pcoa.png',        	link:'user_viz_data/pcoa',           id:'pcoa_link_id', 
        tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)-|-vegan (R-package)-|-ape (R-package)'        },
    {name:'PCoA 3D Analyses (Emperor)', thumb:'/images/visuals/emperor.png',        link:'user_viz_data/pcoa',           id:'pcoa_3d_link_id', 
        tip:'Python2.7-|-scikit-bio(python library)-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-QIIME (http://qiime.org)' },
    
    
    {name:'Geo Distribution',          thumb:'/images/visuals/map.png',         	link:'user_viz_data/geospatial',     id:'geospatial_link_id', 
        tip:'lat/lon metadata'    },
    {name:'Alpha Diversity',            thumb:'/images/visuals/alpha.png',          link:'user_viz_data/alpha_diversity',id:'adiversity_link_id', 
        tip:'Python2.7-|-scipy (python library)-|-numpy (python library)-|-scikit-bio'},
    {name:'Phyloseq Bars (R/svg)',      thumb:'/images/visuals/phyloseq_bars.png',  link:'user_viz_data/phyloseq01',  id:'phyloseq01_link_id', 
        tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'},
    {name:'Phyloseq Heatmap (R/png)',   thumb:'/images/visuals/phyloseq_heatmap.png',link:'user_viz_data/phyloseq02', id:'phyloseq02_link_id', 
        tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'},
    {name:'Phyloseq Network (R/svg)',   thumb:'/images/visuals/phyloseq_network.png',link:'user_viz_data/phyloseq03', id:'phyloseq03_link_id', 
        tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'},
    {name:'Phyloseq Ordination (R/svg)',thumb:'/images/visuals/phyloseq_ord1.png',  link:'user_viz_data/phyloseq04', id:'phyloseq04_link_id', 
        tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'},
    {name:'Phyloseq Tree (R/svg)',      thumb:'/images/visuals/phyloseq_tree.png',     link:'user_viz_data/phyloseq05', id:'phyloseq05_link_id', 
        tip:'R (https://www.r-project.org/)-|-phyloseq (R-package)'}
   
]};
    
constants.REQ_METADATA_FIELDS = ["altitude", "assigned_from_geo", "collection_date", "common_name", "country", "depth", "description", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public", "taxon_id"];

module.exports = constants;


