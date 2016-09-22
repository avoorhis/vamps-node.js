#!/bin/bash

cd $1
echo "time python demultiplex_qiita.py -i $2"
time python /Users/ashipunova/BPC/vamps-node.js/public/scripts/node_process_scripts/demultiplex_qiita.py -i $2



#grendel
#curr_path=`pwd`
#curr_dir=${PWD##*/} 
#echo "Run on Grendel, change the reference file name accordingly:"
#echo "cd $curr_path; run_gast_ill_qiita_sge.sh -s $curr_dir -d gast -v -e fa.unique -r refssu -f -p both"

