#!/bin/sh

# CODE:	$code

TSTAMP=`date "+%Y%m%d%H%M%S"`

echo -n "Hostname: "
hostname
echo -n "Current working directory: "
pwd

/Users/avoorhis/programming/vamps-node.js/public/scripts/visualization_scripts/create_GG_alignment_template_from_taxon.py -f Comamonadaceae  /Users/avoorhis/programming/helper_scripts//otu_id_to_greengenes.txt /Users/avoorhis/programming/helper_scripts//gg_97_otus_6oct2010_aligned.fasta.txt -o /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/TEMPLATE.tmpl > /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/alignment.log

pynast -t /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/TEMPLATE.tmpl -i /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/fasta.fa -a /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/pynast_aligned.fa -l 50 > /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/pynast.log

/Users/avoorhis/programming/vamps-node.js/public/scripts/visualization_scripts/minalign /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/pynast_aligned.fa > /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/minaligned.fa

entropy-analysis /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/minaligned.fa --no-display > /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/entropy.log

