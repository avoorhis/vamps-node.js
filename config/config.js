var config = {}

//console.log( JSON.stringify(datasets_by_project_all) );
config.simpleTaxonomy = {"domains":[ {'id':1,'name':"Archaea"},
                                  {'id':2,'name':"Bacteria"},
                                  {'id':5,'name':"Eukarya"},
                                  {'id':3,'name':"Organelle"},
                                  {'id':4,'name':"Unknown"}
                                ]}

config.unitSelect = {"units":[ 
				{'id' : 'tax_silva116_simple',	'name' : "Taxonomy Silva116 Simple"},
                {'id' : 'tax_silva116_custom',	'name' : "Taxonomy Silva116 Custom"},
                {'id' : 'tax_gg_simple',		'name' : "Taxonomy Greengenes Simple"},
                {'id' : 'tax_gg_custom',		'name' : "Taxonomy Greengenes Custom"},
                {'id' : 'tax_rdp',				'name' : "Taxonomy RDP"},
                {'id' : 'otus',					'name' : "OTUs"},
                {'id' : 'med_nodes',			'name' : "MED Nodes"}
                           ]}  

module.exports = config;                                