// all_datasets.jsvar datasets = {}// SELECT project, datasets.id as did, dataset, sum(seq_count) as ds_count//   FROM datasets //   JOIN projects ON (projects.id=project_id)//   JOIN sequence_pdr_infos on (datasets.id=dataset_id)//   GROUP BY dataset//   ORDER BY project,dataset// I use the group-by here to get the ds_counts so I don't have to do more looping// on the live sitedatasets.ALL = {   projects: [    { name: 'SLM_NIH_Bv6', datasets:      [        {'did':'2', 'dname':'SS_WWTP_1_25_11_2step', 'ds_count':'2580224'},      ]},    { name: 'SLM_NIH_Bv4v5', datasets:      [        {'did':'135', 'dname':'01_Boonville', 'ds_count':'434'},        {'did':'126', 'dname':'02_Spencer', 'ds_count':'403'},        {'did':'122', 'dname':'03_Junction_City_East', 'ds_count':'276'},        {'did':'42', 'dname':'04_Delano', 'ds_count':'781'},        {'did':'40', 'dname':'05_Monticello', 'ds_count':'336'},        {'did':'49', 'dname':'06_St_Michael', 'ds_count':'464'},        {'did':'54', 'dname':'07_Franklin', 'ds_count':'402'},        {'did':'162', 'dname':'08_Springboro', 'ds_count':'1651'},        {'did':'124', 'dname':'09_Woodbran', 'ds_count':'296'},        {'did':'134', 'dname':'10_Jones_Island', 'ds_count':'158'},        {'did':'137', 'dname':'11_South_Shore', 'ds_count':'105'},        {'did':'127', 'dname':'12_New_London', 'ds_count':'381'},        {'did':'41', 'dname':'13_Brockton', 'ds_count':'160'},        {'did':'44', 'dname':'14_Fall_River', 'ds_count':'157'},        {'did':'43', 'dname':'15_Gloucester', 'ds_count':'231'},        {'did':'85', 'dname':'16_Bedford_Hills', 'ds_count':'489'},        {'did':'131', 'dname':'17_Poughkeepsie', 'ds_count':'193'},        {'did':'136', 'dname':'18_Western_Rampo', 'ds_count':'122'},        {'did':'123', 'dname':'19_Great_Falls', 'ds_count':'148'},        {'did':'194', 'dname':'1St_01_Boonville', 'ds_count':'336'},        {'did':'66', 'dname':'1St_02_Spencer', 'ds_count':'463'},        {'did':'82', 'dname':'1St_03_Junction_City_East', 'ds_count':'275'},        {'did':'80', 'dname':'1St_04_Delano', 'ds_count':'595'},        {'did':'225', 'dname':'1St_05_Monticello', 'ds_count':'321'},        {'did':'73', 'dname':'1St_06_St_Michael', 'ds_count':'3609'},        {'did':'181', 'dname':'1St_07_Franklin', 'ds_count':'415'},        {'did':'185', 'dname':'1St_08_Springboro', 'ds_count':'1792'},        {'did':'195', 'dname':'1St_09_Woodbran', 'ds_count':'361'},        {'did':'109', 'dname':'1St_100_Great_Falls', 'ds_count':'275'},        {'did':'86', 'dname':'1St_101_Portland', 'ds_count':'294'},        {'did':'95', 'dname':'1St_102_Vancouver_Marinepark', 'ds_count':'183'},        {'did':'98', 'dname':'1St_103_Vancouver_Westside', 'ds_count':'118'},        {'did':'108', 'dname':'1St_104_Heavener', 'ds_count':'7'},        {'did':'13', 'dname':'1St_105_Moore', 'ds_count':'108'},        {'did':'18', 'dname':'1St_106_Yukon', 'ds_count':'629'},        {'did':'7', 'dname':'1St_107_Burkburnett', 'ds_count':'84'},        {'did':'9', 'dname':'1St_108_Freeport', 'ds_count':'349'},        {'did':'92', 'dname':'1St_109_Kenedy', 'ds_count':'310'},        {'did':'62', 'dname':'1St_10_Jones_Island', 'ds_count':'343'},        {'did':'20', 'dname':'1St_111_Palmetto', 'ds_count':'23'},        {'did':'22', 'dname':'1St_112_Johns_Creek', 'ds_count':'152'},        {'did':'106', 'dname':'1St_113_Little_River', 'ds_count':'608'},        {'did':'6', 'dname':'1St_114_Hardinsburg', 'ds_count':'604'},        {'did':'89', 'dname':'1St_115_Clintwood', 'ds_count':'838'},        {'did':'30', 'dname':'1St_116_Coeburn', 'ds_count':'219'},        {'did':'25', 'dname':'1St_117_Matewan', 'ds_count':'416'},        {'did':'115', 'dname':'1St_118_Williamson', 'ds_count':'495'},        {'did':'102', 'dname':'1St_119_Discovery_Bay', 'ds_count':'263'},        {'did':'203', 'dname':'1St_11_South_Shore', 'ds_count':'210'},        {'did':'4', 'dname':'1St_120_Richmond', 'ds_count':'39'},        {'did':'3', 'dname':'1St_121_Stockton', 'ds_count':'319'},        {'did':'21', 'dname':'1St_122_SantaBarbara_INF1', 'ds_count':'9'},        {'did':'117', 'dname':'1St_123_SantaBarbara_INF2', 'ds_count':'72'},        {'did':'23', 'dname':'1St_125_Bozeman', 'ds_count':'201'},        {'did':'107', 'dname':'1St_126_Syracuse', 'ds_count':'238'},        {'did':'19', 'dname':'1St_127_Pendleton', 'ds_count':'327'},        {'did':'97', 'dname':'1St_128_Duncansville', 'ds_count':'489'},        {'did':'91', 'dname':'1St_129_Memphis', 'ds_count':'52'},        {'did':'227', 'dname':'1St_12_New_London', 'ds_count':'805'},        {'did':'94', 'dname':'1St_130_IowaCity', 'ds_count':'101'},        {'did':'29', 'dname':'1St_131_Burlington', 'ds_count':'459'},        {'did':'10', 'dname':'1St_132_Lincoln', 'ds_count':'370'},        {'did':'31', 'dname':'1St_133_Whittier', 'ds_count':'441'},        {'did':'113', 'dname':'1St_134_Austin', 'ds_count':'276'},        {'did':'35', 'dname':'1St_135_Madison', 'ds_count':'199'},        {'did':'88', 'dname':'1St_136_Yuma', 'ds_count':'278'},        {'did':'111', 'dname':'1St_137_Metropolitan', 'ds_count':'155'},        {'did':'120', 'dname':'1St_138_BlueLake', 'ds_count':'124'},        {'did':'39', 'dname':'1St_139_Empire', 'ds_count':'202'},        {'did':'206', 'dname':'1St_13_Brockton', 'ds_count':'278'},        {'did':'116', 'dname':'1St_140_St_Joseph', 'ds_count':'443'},        {'did':'112', 'dname':'1St_141_Mendenhall', 'ds_count':'378'},        {'did':'121', 'dname':'1St_142_Juneau_Douglas', 'ds_count':'487'},        {'did':'27', 'dname':'1St_143_Salina', 'ds_count':'295'},        {'did':'103', 'dname':'1St_144_Key_West', 'ds_count':'120'},        {'did':'8', 'dname':'1St_145_Palo_Alto_Grab', 'ds_count':'335'},        {'did':'100', 'dname':'1St_146_Palo_Alto_Comp', 'ds_count':'237'},        {'did':'118', 'dname':'1St_147_West_Palm_Beach', 'ds_count':'94'},        {'did':'101', 'dname':'1St_148_Kelso', 'ds_count':'575'},        {'did':'110', 'dname':'1St_149_Steamboat_Springs', 'ds_count':'280'},        {'did':'228', 'dname':'1St_14_Fall_River', 'ds_count':'290'},        {'did':'105', 'dname':'1St_150_Roswell', 'ds_count':'460'},        {'did':'11', 'dname':'1St_151_Laramie', 'ds_count':'431'},        {'did':'5', 'dname':'1St_152_Metro_North', 'ds_count':'280'},        {'did':'33', 'dname':'1St_153_Metro_South', 'ds_count':'219'},        {'did':'104', 'dname':'1St_154_Augusta', 'ds_count':'168'},        {'did':'234', 'dname':'1St_155_Junction_City_Indust', 'ds_count':'175'},        {'did':'15', 'dname':'1St_156_Marathon', 'ds_count':'341'},        {'did':'202', 'dname':'1St_15_Gloucester', 'ds_count':'250'},        {'did':'204', 'dname':'1St_16_Bedford_Hills', 'ds_count':'334'},        {'did':'221', 'dname':'1St_17_Poughkeepsie', 'ds_count':'379'},        {'did':'182', 'dname':'1St_18_Western_Rampo', 'ds_count':'364'},        {'did':'231', 'dname':'1St_19_Great_Falls', 'ds_count':'319'},        {'did':'201', 'dname':'1St_20_Gresham', 'ds_count':'559'},        {'did':'83', 'dname':'1St_21_Marine_Park', 'ds_count':'336'},        {'did':'76', 'dname':'1St_22_Vancouver_Westside', 'ds_count':'216'},        {'did':'78', 'dname':'1St_23_Heavener', 'ds_count':'290'},        {'did':'200', 'dname':'1St_24_Moore', 'ds_count':'275'},        {'did':'232', 'dname':'1St_25_Yukon', 'ds_count':'457'},        {'did':'198', 'dname':'1St_26_Burkburnett', 'ds_count':'667'},        {'did':'81', 'dname':'1St_27_Freeport', 'ds_count':'189'},        {'did':'199', 'dname':'1St_28_Gladewater', 'ds_count':'785'},        {'did':'188', 'dname':'1St_29_Kenedy_Texas', 'ds_count':'290'},        {'did':'77', 'dname':'1St_30_Northside', 'ds_count':'518'},        {'did':'69', 'dname':'1St_31_Southside', 'ds_count':'317'},        {'did':'229', 'dname':'1St_32_Palmetto', 'ds_count':'204'},        {'did':'189', 'dname':'1St_33_Big_Creek', 'ds_count':'33'},        {'did':'222', 'dname':'1St_34_Johns_Creek_Env_Camp', 'ds_count':'559'},        {'did':'230', 'dname':'1St_35_Little_River_WRF', 'ds_count':'593'},        {'did':'68', 'dname':'1St_36_Hardinsberg', 'ds_count':'354'},        {'did':'216', 'dname':'1St_37_Clintwood', 'ds_count':'869'},        {'did':'64', 'dname':'1St_38_Coeburn', 'ds_count':'798'},        {'did':'186', 'dname':'1St_39_Matewan', 'ds_count':'189'},        {'did':'184', 'dname':'1St_40_Williamson', 'ds_count':'365'},        {'did':'79', 'dname':'1St_41_Discovery_Bay', 'ds_count':'687'},        {'did':'190', 'dname':'1St_42_Richmond', 'ds_count':'144'},        {'did':'70', 'dname':'1St_43_Stockton_WWControl', 'ds_count':'498'},        {'did':'210', 'dname':'1St_44_El_Estero_INF2', 'ds_count':'260'},        {'did':'207', 'dname':'1St_45_Palo_Alto_comp', 'ds_count':'281'},        {'did':'65', 'dname':'1St_46_East_Central', 'ds_count':'192'},        {'did':'84', 'dname':'1St_47_Augusta', 'ds_count':'142'},        {'did':'213', 'dname':'1St_48_Missoula', 'ds_count':'432'},        {'did':'226', 'dname':'1St_49_Bozeman', 'ds_count':'334'},        {'did':'60', 'dname':'1St_50_Syracuse', 'ds_count':'302'},        {'did':'191', 'dname':'1St_51_Pendleton', 'ds_count':'498'},        {'did':'197', 'dname':'1St_52_Duncansville', 'ds_count':'698'},        {'did':'215', 'dname':'1St_53_Memphis', 'ds_count':'53'},        {'did':'205', 'dname':'1St_54_Laramie', 'ds_count':'1432'},        {'did':'208', 'dname':'1St_55_Iowa_City', 'ds_count':'330'},        {'did':'223', 'dname':'1St_56_Burlington', 'ds_count':'280'},        {'did':'75', 'dname':'1St_58_Lincoln', 'ds_count':'356'},        {'did':'59', 'dname':'1St_59_Walnut_Creek', 'ds_count':'847'},        {'did':'196', 'dname':'1St_60_Denver_North_Plant', 'ds_count':'377'},        {'did':'63', 'dname':'1St_61_Madison', 'ds_count':'462'},        {'did':'71', 'dname':'1St_62_Yuma', 'ds_count':'353'},        {'did':'61', 'dname':'1St_63_Empire', 'ds_count':'361'},        {'did':'187', 'dname':'1St_64_El_Estero_INF1', 'ds_count':'60'},        {'did':'74', 'dname':'1St_65_Palo_Alto_Grab', 'ds_count':'387'},        {'did':'211', 'dname':'1St_66_Junction_City_SW', 'ds_count':'248'},        {'did':'193', 'dname':'1St_67_Erin_Lipp_Sample', 'ds_count':'248'},        {'did':'67', 'dname':'1St_68_Key_West', 'ds_count':'639'},        {'did':'212', 'dname':'1St_69_Whittier', 'ds_count':'424'},        {'did':'218', 'dname':'1St_70_Marathon', 'ds_count':'65'},        {'did':'209', 'dname':'1St_71_St_Joseph', 'ds_count':'333'},        {'did':'233', 'dname':'1St_72_Denver_South_Plant', 'ds_count':'244'},        {'did':'214', 'dname':'1St_73_Blue_Lake', 'ds_count':'466'},        {'did':'192', 'dname':'1St_74_Metropolitan', 'ds_count':'486'},        {'did':'224', 'dname':'1St_75_Salina', 'ds_count':'326'},        {'did':'183', 'dname':'1St_76_Mendenhall', 'ds_count':'587'},        {'did':'217', 'dname':'1St_77_Juneau_Douglas', 'ds_count':'600'},        {'did':'220', 'dname':'1St_78_Honouliuli', 'ds_count':'519'},        {'did':'219', 'dname':'1St_79_Sand_Island', 'ds_count':'1574'},        {'did':'72', 'dname':'1St_80_Reus_Spain', 'ds_count':'24'},        {'did':'87', 'dname':'1St_81_BOONVILLE', 'ds_count':'227'},        {'did':'32', 'dname':'1St_82_SPENCER', 'ds_count':'266'},        {'did':'37', 'dname':'1St_83_JUNCTION_CITY_EAST', 'ds_count':'261'},        {'did':'38', 'dname':'1St_84_JUNCTION_CITY_SW', 'ds_count':'197'},        {'did':'16', 'dname':'1St_85_DELANO', 'ds_count':'305'},        {'did':'93', 'dname':'1St_86_MONTICELLO', 'ds_count':'262'},        {'did':'96', 'dname':'1St_87_ALBERTVILLE', 'ds_count':'396'},        {'did':'90', 'dname':'1St_88_FRANKLIN', 'ds_count':'351'},        {'did':'36', 'dname':'1St_89_SPRINGBORO', 'ds_count':'1009'},        {'did':'119', 'dname':'1St_90_WOODMERE', 'ds_count':'305'},        {'did':'26', 'dname':'1St_91_JONESISLAND', 'ds_count':'145'},        {'did':'14', 'dname':'1St_92_SOUTHSHORE', 'ds_count':'223'},        {'did':'34', 'dname':'1St_93_NEWLONDON', 'ds_count':'300'},        {'did':'12', 'dname':'1St_94_BROCKTON', 'ds_count':'183'},        {'did':'99', 'dname':'1St_95_FALLRIVER', 'ds_count':'358'},        {'did':'17', 'dname':'1St_96_GLOUCESTER', 'ds_count':'345'},        {'did':'24', 'dname':'1St_97_BEDFORD_HILLS', 'ds_count':'369'},        {'did':'28', 'dname':'1St_98_Poughkeepsie', 'ds_count':'287'},        {'did':'114', 'dname':'1St_99_Hillburn', 'ds_count':'197'},        {'did':'129', 'dname':'20_Gresham', 'ds_count':'280'},        {'did':'130', 'dname':'21_Marine_Park', 'ds_count':'197'},        {'did':'132', 'dname':'22_Vancouver_Westside', 'ds_count':'65'},        {'did':'128', 'dname':'23_Heavener', 'ds_count':'173'},        {'did':'125', 'dname':'24_Moore', 'ds_count':'185'},        {'did':'133', 'dname':'25_Yukon', 'ds_count':'409'},        {'did':'151', 'dname':'26_Burkburnett', 'ds_count':'569'},        {'did':'52', 'dname':'27_Freeport', 'ds_count':'174'},        {'did':'146', 'dname':'28_Gladewater', 'ds_count':'475'},        {'did':'176', 'dname':'29_Kenedy_Texas', 'ds_count':'259'},        {'did':'163', 'dname':'30_Northside', 'ds_count':'470'},        {'did':'153', 'dname':'31_Southside', 'ds_count':'186'},        {'did':'166', 'dname':'32_Palmetto', 'ds_count':'220'},        {'did':'152', 'dname':'33_Big_Creek', 'ds_count':'49'},        {'did':'56', 'dname':'34_Johns_Creek_Env_Camp', 'ds_count':'684'},        {'did':'155', 'dname':'35_Little_River_WRF', 'ds_count':'552'},        {'did':'58', 'dname':'36_Hardinsberg', 'ds_count':'386'},        {'did':'150', 'dname':'37_Clintwood', 'ds_count':'929'},        {'did':'175', 'dname':'38_Coeburn', 'ds_count':'809'},        {'did':'141', 'dname':'39_Matewan', 'ds_count':'196'},        {'did':'158', 'dname':'40_Williamson', 'ds_count':'386'},        {'did':'170', 'dname':'41_Discovery_Bay', 'ds_count':'949'},        {'did':'48', 'dname':'42_Richmond', 'ds_count':'168'},        {'did':'159', 'dname':'43_Stockton_WWControl', 'ds_count':'330'},        {'did':'157', 'dname':'44_El_Estero_INF2', 'ds_count':'231'},        {'did':'145', 'dname':'45_Palo_Alto_comp', 'ds_count':'367'},        {'did':'154', 'dname':'46_East_Central', 'ds_count':'143'},        {'did':'144', 'dname':'47_Augusta', 'ds_count':'148'},        {'did':'179', 'dname':'48_Missoula', 'ds_count':'418'},        {'did':'168', 'dname':'49_Bozeman', 'ds_count':'217'},        {'did':'174', 'dname':'50_Syracuse', 'ds_count':'157'},        {'did':'147', 'dname':'51_Pendleton', 'ds_count':'327'},        {'did':'173', 'dname':'52_Duncansville', 'ds_count':'465'},        {'did':'165', 'dname':'53_Memphis', 'ds_count':'51'},        {'did':'149', 'dname':'54_Laramie', 'ds_count':'1209'},        {'did':'45', 'dname':'55_Iowa_City', 'ds_count':'264'},        {'did':'50', 'dname':'56_Burlington', 'ds_count':'239'},        {'did':'148', 'dname':'57_Cowlitz', 'ds_count':'751'},        {'did':'161', 'dname':'58_Lincoln', 'ds_count':'414'},        {'did':'178', 'dname':'59_Walnut_Creek', 'ds_count':'805'},        {'did':'171', 'dname':'60_Denver_North_Plant', 'ds_count':'392'},        {'did':'169', 'dname':'61_Madison', 'ds_count':'443'},        {'did':'55', 'dname':'62_Yuma', 'ds_count':'347'},        {'did':'142', 'dname':'63_Empire', 'ds_count':'441'},        {'did':'51', 'dname':'64_El_Estero_INF1', 'ds_count':'59'},        {'did':'57', 'dname':'65_Palo_Alto_Grab', 'ds_count':'313'},        {'did':'46', 'dname':'66_Junction_City_SW', 'ds_count':'229'},        {'did':'47', 'dname':'67_Erin_Lipp_Sample', 'ds_count':'169'},        {'did':'156', 'dname':'68_Key_West', 'ds_count':'657'},        {'did':'172', 'dname':'69_Whittier', 'ds_count':'499'},        {'did':'143', 'dname':'70_Marathon', 'ds_count':'62'},        {'did':'177', 'dname':'71_St_Joseph', 'ds_count':'344'},        {'did':'180', 'dname':'72_Denver_South_Plant', 'ds_count':'228'},        {'did':'167', 'dname':'73_Blue_Lake', 'ds_count':'186'},        {'did':'139', 'dname':'74_Metropolitan', 'ds_count':'195'},        {'did':'140', 'dname':'75_Salina', 'ds_count':'111'},        {'did':'160', 'dname':'76_Mendenhall', 'ds_count':'289'},        {'did':'138', 'dname':'77_Juneau_Douglas', 'ds_count':'318'},        {'did':'164', 'dname':'79_Sand_Island', 'ds_count':'654'},        {'did':'53', 'dname':'80_Reus_Spain', 'ds_count':'7'},      ]},]}module.exports = datasets;