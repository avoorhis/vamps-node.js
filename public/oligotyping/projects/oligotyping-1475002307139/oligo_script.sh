#!/bin/sh

# CODE:	$code

TSTAMP=`date "+%Y%m%d%H%M%S"`

echo -n "Hostname: "
hostname
echo -n "Current working directory: "
pwd

oligotype /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/minaligned.fa /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/minaligned.fa-ENTROPY --skip-check-input-file -o /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/OLIGOTYPE -A 0 -M 0 -a 0.0 -s 2 -t __ --project "(Comamonadaceae)-oligotyping-1475002307139" > /Users/avoorhis/programming/vamps-node.js/public/oligotyping/projects/oligotyping-1475002307139/oligo.log -C 1,2

