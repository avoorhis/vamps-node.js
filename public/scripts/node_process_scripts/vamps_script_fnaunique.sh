#!/bin/bash

# see routes_user_data.js
#  USAGE: $0 fastaunique_dir (or PATH) project_dir

# cd $1
echo "Fasta files '.fa' to unique"

PATH="$PATH:$1"

echo "PPPATH\n"

echo "$PATH\n"

echo "cd $2"
cd $2

file_ext=".fa"
if [[ -f *{$file_ext} ]]
then
  echo "$file_ext found."
  echo "for file in *{$file_ext}; do fastaunique $file; done\n"
  for file in *{$file_ext}; do fastaunique $file; done
else 
  echo "$file_ext not found"
fi

# file_ext=".fna"

#grendel
#curr_path=`pwd`
#curr_dir=${PWD##*/}
#echo "Run on Grendel, change the reference file name accordingly:"
#echo "cd $curr_path; run_gast_ill_qiita_sge.sh -s $curr_dir -d gast -v -e fa.unique -r refssu -f -p both"