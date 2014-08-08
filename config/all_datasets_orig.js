// all_datasets.js
var datasets = {}

// SELECT project, datasets.id as did, dataset, sum(seq_count) as seq_count
//   FROM datasets 
//   JOIN projects ON (projects.id=project_id)
//   JOIN sequence_pdr_infos on (datasets.id=dataset_id)
//   GROUP BY dataset
//   ORDER BY project,dataset
// datasets.ALL = { datasets: [ {p1:[]},{p2:[]} ] } This gives order to projects and datasets
// todo write python script to create this JSON OBJ from database
datasets.ALL = { 
	projects: [
		{ name: 'SLM_NIH_Bv4v5', datasets:
			[
				{'did':'85', 'dname':'16_Bedford_Hills',			'ds_count':'489'},
				{'did':'225','dname':'1St_05_Monticello',			'ds_count':'321'},
				{'did':'181','dname':'1St_07_Franklin',				'ds_count':'415'},
				{'did':'7',  'dname':'1St_107_Burkburnett',			'ds_count':'84' },
				{'did':'9',  'dname':'1St_108_Freeport',			'ds_count':'349'},
				{'did':'6',  'dname':'1St_114_Hardinsburg',			'ds_count':'604'},
				{'did':'203','dname':'1St_11_South_Shore',			'ds_count':'210'},
				{'did':'4',  'dname':'1St_120_Richmond',			'ds_count':'39' },
				{'did':'3',  'dname':'1St_121_Stockton',			'ds_count':'319'},
				{'did':'227','dname':'1St_12_New_London',			'ds_count':'805'},
				{'did':'8',  'dname':'1St_145_Palo_Alto_Grab',		'ds_count':'335'},
				{'did':'228','dname':'1St_14_Fall_River',			'ds_count':'290'},
				{'did':'5',  'dname':'1St_152_Metro_North',			'ds_count':'280'},
				{'did':'234','dname':'1St_155_Junction_City_Indust','ds_count':'175'},
				{'did':'221','dname':'1St_17_Poughkeepsie',			'ds_count':'379'},
				{'did':'182','dname':'1St_18_Western_Rampo',		'ds_count':'364'},
				{'did':'231','dname':'1St_19_Great_Falls',			'ds_count':'319'},
				{'did':'232','dname':'1St_25_Yukon',				'ds_count':'457'},
				{'did':'229','dname':'1St_32_Palmetto',				'ds_count':'204'},
				{'did':'222','dname':'1St_34_Johns_Creek_Env_Camp',	'ds_count':'559'},
				{'did':'230','dname':'1St_35_Little_River_WRF',		'ds_count':'593'},
				{'did':'184','dname':'1St_40_Williamson',			'ds_count':'365'},
				{'did':'226','dname':'1St_49_Bozeman',				'ds_count':'334'},
				{'did':'223','dname':'1St_56_Burlington',			'ds_count':'280'},
				{'did':'233','dname':'1St_72_Denver_South_Plant',	'ds_count':'244'},
				{'did':'224','dname':'1St_75_Salina',				'ds_count':'326'},
				{'did':'183','dname':'1St_76_Mendenhall',			'ds_count':'587'},
				{'did':'179','dname':'48_Missoula',					'ds_count':'418'},
				{'did':'178','dname':'59_Walnut_Creek',				'ds_count':'805'},
				{'did':'180','dname':'72_Denver_South_Plant',		'ds_count':'228'}
			]},	
		{ name: 'SLM_NIH_Bv6', datasets:
			[
				{'did':'2','dname':'SS_WWTP_1_25_11_2step','ds_count':'2580224'}
			]}
	
]}

module.exports = datasets;     