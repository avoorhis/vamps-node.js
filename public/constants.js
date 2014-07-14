var config = {};

//console.log( JSON.stringify(datasets_by_project_all) );
config.DOMAINS = { domains: [
        {id: 1, name: "Archaea"},
        {id: 2, name: "Bacteria"},
        {id: 5, name: "Eukarya"},
        {id: 3, name: "Organelle"},
        {id: 4, name: "Unknown"}
    ]};

config.UNITSELECT = { units: [
        {id : 'tax_silva108_simple',file: 'unit_selectors/taxa_silva108_simple.html', name : "Taxonomy Silva108 (Simple)"},
        {id : 'tax_silva108_custom',file: 'unit_selectors/taxa_silva108_cust.html',   name : "Taxonomy Silva108 (Custom)"},
        {id : 'tax_gg_simple',      file: 'unit_selectors/taxa_gg_simple.html',       name : "Taxonomy Greengenes (Simple)"},
        {id : 'tax_gg_custom',      file: 'unit_selectors/taxa_gg_cust.html',         name : "Taxonomy Greengenes (Custom)"},
        {id : 'tax_rdp',            file: 'unit_selectors/taxa_rdp.html',             name : "Taxonomy RDP"},
        {id : 'otus',                file: 'unit_selectors/otus.html',                 name : "OTUs"},
        {id : 'med_nodes',          file: 'unit_selectors/med_nodes.html',             name : "MED Nodes"}
    ]};

config.VISUALOUTPUTCHOICES = { visulachoices: [
        {id : 'heatmap',        show: 'Heatmap'},
        {id : 'counts_table',   show: 'Counts Table'},
        {id : 'barcharts',      show: 'Bar Charts'},
        {id : 'dendrogram',     show: 'Dendrogram'},
        {id : 'alphadiversity', show: 'Alpha Diversity'}
    ]};

config.NORMALIZATIONCHOICES = { normchoices: [
        {id: 'none',            show: 'Not Normalized (default)'},
        {id: 'max',             show: 'Normalized to the Maximum Sample'},
        {id: 'freq',            show: 'Normalized to Frequency'}
    ]};


// This List MUST match the fields in sequence_uniq_infos
config.AVAILABLE_UNITS = ['tax_silva108_id', 'tax_gg_id', 'med_node_id', 'otu_id'];


module.exports = config;
