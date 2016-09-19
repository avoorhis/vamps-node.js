var path = require("path");


var constants = {};
///////////////////////////////////////////
///////////////////////////////////////////
//// DO NOT CHANGE ANYTHING BELOW HERE ////
///////////////////////////////////////////
///////////////////////////////////////////

constants.blast_db      = 'ALL_SEQS';
constants.download_file_formats = ['metadata','fasta','taxbytax','taxbyref','taxbyseq','biom','matrix','phyloseq','distance','emperor','pdf','tree','heatmap'];
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
        {id : 'tax_silva119_simple',file: 'unit_selectors/taxa_silva119_simple.html', name : "Taxonomy (Silva-119) -Simple", subtext: 'Silva119'},
        {id : 'tax_silva119_custom',file: 'unit_selectors/taxa_silva119_custom.html', name : "Taxonomy (Silva-119) -Custom", subtext: 'Silva119'},
        {id : 'tax_rdp_simple',     file: 'unit_selectors/taxa_rdp.html',             name : "Taxonomy RDP",     subtext: 'Release 11'},

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
constants.GAST_DB_PATH = "/xraid2-2/g454/blastdbs/gast_distributions";
constants.GAST_DB_PATH_local = "public/scripts/gast/ref_files";
constants.GAST_SCRIPT_PATH = "/bioware/seqinfo/bin"
constants.GAST_SCRIPT_PATH_local = "public/scripts/gast";
    
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

constants.PORTALS = {
    'CMP':{ name:'Coral Microbiome Project', 
            subtext:'CMP', 
            projects:['LTR_MCR_Bv6','LTR_MCR_Av6','LTR_MCR_Ev9','ICM_CCB_Bv6','ICM_CCB_Av6'],
            prefixes:['CMP'],
            suffixes:[],
            pagetitle:'Coral Microbe Project Portal',
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
            prefixes:['MBE'],
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
            suffixes:['Ev4','Ev9','Euk'],
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
            prefix:'counts_table',
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
        {   name:'Oligotyping (TESTING)',  
            thumb:'/images/visuals/oligotyping-logo.png',     
            //link:'user_viz_data/dendrogramR',     
            //id:'dendrogram0_link_id', 
            prefix:'oligotyping',
            tip:'Python2.7-' 
        }
   
]};
    
constants.REQ_METADATA_FIELDS = ["altitude",  "collection_date", "common_name", "country", "depth", "description", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public", "taxon_id"];
constants.CONTACT_US_SUBJECTS = ["Account Request", "Report a Problem", "Announce a Publication", "Other"];

module.exports = constants;


