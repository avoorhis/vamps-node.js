#!/bin/bash

# see routes_user_data.js
#  USAGE: $0 fastaunique_dir (or PATH) project_dir

# cd $1
echo "Single file to unique"

PATH="$PATH:$1"

echo "PPPATH\n"

echo "$PATH\n"

echo "cd $2"
cd $2

file_ext=".fa"
if [ -f *".fa" ] 
then 
  echo "$file_ext found."
  echo "for file in *.fa; do fastaunique $file; done\n"
  for file in *.fa; do fastaunique $file; done
else echo "$file_ext not found."
fi

file_ext=".fna"
if [ -f *".fna" ] 
then 
  echo "$file_ext found."
  echo "for file in *.fna; do fastaunique $file; done\n"
  for file in *.fna; do fastaunique $file; done
else echo "$file_ext not found."
fi

#grendel
#curr_path=`pwd`
#curr_dir=${PWD##*/}
#echo "Run on Grendel, change the reference file name accordingly:"
#echo "cd $curr_path; run_gast_ill_qiita_sge.sh -s $curr_dir -d gast -v -e fa.unique -r refssu -f -p both"