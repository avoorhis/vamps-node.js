var config = {}

//console.log( JSON.stringify(datasets_by_project_all) );
config.DOMAINS = {"domains":[ {id:1,name:"Archaea"},
                                  {id:2,name:"Bacteria"},
                                  {id:5,name:"Eukarya"},
                                  {id:3,name:"Organelle"},
                                  {id:4,name:"Unknown"}
                                ]}

config.UNITSELECT = {"units":[ 
		{id : 'tax_silva116_simple',file:'unit_selectors/taxa_sil106_simple.html', name : "Taxonomy Silva116 (Simple)"},
    {id : 'tax_silva116_custom',	file:'unit_selectors/taxa_sil106_cust.html', name : "Taxonomy Silva116 (Custom)"},
    {id : 'tax_gg_simple',		file:'unit_selectors/taxa_gg_simple.html', name : "Taxonomy Greengenes (Simple)"},
    {id : 'tax_gg_custom',		file:'unit_selectors/taxa_gg_cust.html', name : "Taxonomy Greengenes (Custom)"},
    {id : 'tax_rdp',				  file:'unit_selectors/taxa_rdp.html', name : "Taxonomy RDP"},
    {id : 'otus',					    file:'unit_selectors/otus.html', name : "OTUs"},
    {id : 'med_nodes',			  file:'unit_selectors/med_nodes.html', name : "MED Nodes"}
                           ]}  

module.exports = config;                                