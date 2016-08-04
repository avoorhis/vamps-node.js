#!/bin/bash

# see routes_user_data.js
#  USAGE: $0 project_dir uniques_file_name dataset_name

cd $1
echo "Single file to unique"


echo "for file in *.fa; do fastaunique $file; done"
for file in *.fa; do fastaunique $file; done


#grendel
#curr_path=`pwd`
#curr_dir=${PWD##*/} 
#echo "Run on Grendel, change the reference file name accordingly:"
#echo "cd $curr_path; run_gast_ill_qiita_sge.sh -s $curr_dir -d gast -v -e fa.unique -r refssu -f -p both"