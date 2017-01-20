Maintenance Scripts (For use outside of the VAMPS2 GUI):
See /groups/vampsweb/new_vamps_maintenance_scripts/README.txt for more information
==========================================================================================
TaxBySeq
-- Load TaxBySeq File (downloaded from old VAMPS)
    Requirements: SINGLE project (enter name on command line). Load metadata separately.
    ./load_tax_by_seq_files.py -o andy -site localhost -infile  ~/Downloads/KCK_LSM_Bv6-TaxBySeq1000.txt -p KCK_SLM_Bv6

    ./taxcounts_metadata_files_utils.py -host localhost -list

-- Create (or recreate) json files 
    ./taxcounts_metadata_files_utils.py -host localhost -add -pids 438,439 -units [silva119:rdp2.6]
    
==========================================================================================
Old to NewVAMPS pipeline -COMPLETE (scripts are generally in /groups/vampsweb/new_vamps_maintenance_scripts)
    For localhost: after export script (step-1) move the files to localhost
    ------------------------------------------------------------------
step-1:  ../export_project.sh LTR_VCR_Bv6 [USER:MBL]
step-2:  ../old_2_new_vamps_by_project.py -site vamps --public 0 --project DCO_BOM_Bv6
LIST:    ../taxcounts_metadata_files_utils.py -host vampsdb -list
step-3:  ../taxcounts_metadata_files_utils.py -host vampsdb -add -pids 438,439 -units [silva119:rdp2.6]
RDP:
Script takes sequences from sequences table, creates a fasta file, then runs rdp and puts the result into
rdp_taxonomy, rdp_taxonomy_info_per_seq and sequence_uniq_info
step-4:  ../vamps_rdp_convert_by_seq.py -site vamps -path_to_classifier /groups/vampsweb/seqinfobin/rdp_classifier_2.6 -limit 100000
LIST:    ../taxcounts_metadata_files_utils.py -host vampsdb -list -units rdp2.6 
step-5:  ../taxcounts_metadata_files_utils.py -host vampsdb -add -units rdp2.6 -pids 438,439 
CHECK Files:
../taxcounts_metadata_files_utils.py -host vampsdb -list -units silva119
../taxcounts_metadata_files_utils.py -host vampsdb -list -units rdp2.6
==========================================================================================
METADATA (how to get it into new vamps)
------------------------------------------------------------------
1) Use the "Old to NewVAMPS pipeline" above to export the project data and metadata from old vamps before putting in new vamps
------------------------------------------------------------------
2) Metadata --export from old vamps (gives you vamps-formated file):
        mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_metadata where project = 'LTR_VCR_Bv6';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > metadata_LTR_VCR_Bv6.csv
   Metadata --import to new vamps
        MOBE/QIIME format:
            sample_name    	barcode	center_name    	center_project_name    	emp_status     	experiment_center      	experiment_design_description  	experiment_title
            ../metadata2new_vamps.py -p MBE_XXX_Bv6 -m mobe_metadata.txt -site vampsdev -style mobe
        VAMPS format:
            "dataset","parameterName","parameterValue","units","miens_units","project","units_id","structured_comment_name","method","other","notes","ts","entry_date","parameter_id","project_dataset"
            ../metadata2new_vamps.py -p LTR_VCR_Bv6 -m metadata_LTR_VCR_Bv6.csv -site vampsdev -style vamps
------------------------------------------------------------------
3) Find projects in new vamps without required metadata:
    
        SELECT distinct project,project_id from dataset
        join project using(project_id)
        left join required_metadata_info using(dataset_id)
        where required_metadata_info.dataset_id is null
    ------ Manually:
    INSERT ignore into required_metadata_info (dataset_id, env_package_id, dna_region_id,sequencing_platform_id,fragment_name_id,domain_id,env_feature_id,env_matter_id,env_biome_id,country_id)
    VALUES    ('344488','8','11','2','1','3','6191','6191','6191','365'),('344489','8','11','2','1','3','6191','6191','6191','365')
    SELECT concat("('",dataset_id,"','8','11','2','1','3','6191','6191','6191','365'),") from dataset where project_id in ('697')
------------------------------------------------------------------
4) As Administrator in new vamps GUI: Update/Upload Metadata
    Download spreadsheet and fill out by hand -- then re-upload
==========================================================================================
How to add a new 'Unit' such as rdp
