#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path    <- args[1]
prefix      <- args[2]
metric      <- args[3]
md1         <- args[4]
md2         <- args[5]
out_file <- args[6]

biom_file <- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
map_file <- paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

library(phyloseq)
library(vegan)
library(ape)

abund_table <- import_biom(biom_file)
meta_table <- import_qiime_sample_data(map_file)
meta_table <- data.frame(meta_table)

# this gets rid of empty colums:  BarcodeSequence LinkerPrimerSequence
meta_table <- meta_table[,colSums(is.na(meta_table))<nrow(meta_table)]

#Transpose the data to have sample names on rows
abund_table<-t(abund_table)

#Just a check to ensure that the samples in meta_table are in the same order as in abund_table
meta_table<-meta_table[rownames(abund_table),]
stand <-decostand(abund_table,"total");





#ncols<-ncol(data_matrix)
#nrows<-nrow(data_matrix)



dis <- 0
if(metric=="horn" || metric=="morisita_horn")
{
    d<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
    metric_text<-"Morisita-Horn"
}else if(metric=="bray")
{
    d<-vegdist(stand, method="bray",upper=FALSE,binary=FALSE);
    metric_text<-"Bray-Curtis"
}else if(metric=="jaccard")
{
    d<-vegdist(stand, method="jaccard",upper=FALSE,binary=TRUE);
    #d  <- dist(stand, method="binary")
    metric_text<-"Jaccard"
}else if(metric=="yue-clayton")
{
    d<-designdist(stand, method="1-(J/(A+B-J))",terms = c( "quadratic"), abcd = FALSE)
    metric_text<-"Yue-Clayton"
}else if(metric=="canberra")
{
    d<-vegdist(stand, method="canberra",upper=FALSE,binary=FALSE);
    metric_text<-"Canberra"
}else if(metric=="kulczynski")
{
    d<-vegdist(stand, method="kulczynski",upper=FALSE,binary=FALSE);
    metric_text<-"Kulczynski"
}else{
    d<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
    metric_text<-"Morisita-Horn"
}
# d is the distance matrix
#hc = upgma(dd);
###################################################
# WRITE DISTANCE TABLE
distance_file <- paste(tmp_path,'/',prefix,'_distance.R',sep='')
write.table(as.matrix(d), file=distance_file)
####################################################

hc<-hclust(d); 

# ape as.phylo is a generic function which converts an object into a tree of class "phylo".
phc<-as.phylo(hc);
dend <- as.dendrogram(hc)
#  write tree to: 
tree_file<-paste(tmp_path,'/',prefix,'_outtree.tre',sep='')
write.tree(phc, file=tree_file)
#
print('dend');
print(dend)
# this file is the output from R
# outfile = paste('tmp/',prefix,'_test_cluster.out',sep='');

edges<-paste(phc$edge,collapse=',');
#xedges<-phpSerialize(edges);
out<-paste('edges',edges,sep='=');
print(out);

lengths<-paste(phc$edge.length,collapse=',');
#xlengths<-phpSerialize(lengths);
out<-paste('lengths',lengths,sep='=');
print(out);
#
#
tiplabels<-paste(phc$tip.label,collapse=',');
#xtiplabels<-phpSerialize(tiplabels);
out<-paste('tiplabels',tiplabels,sep='=');
print(out);

numtips<-length(phc$tip.label);
#xnumtips<-phpSerialize(numtips);
out<-paste('numtips',numtips,sep='=');
print(out);

filename <- paste(tmp_path,'/',prefix,'_tree.png',sep='');

print(filename);

#http://cran.r-project.org/web/packages/Cairo/Cairo.pdf
#library(Cairo)
htime<-Sys.time();
#default csi is .2 inches per character
#5 characters per inch
#72 pixels per inch .. maybe
#all related to point size (ps) in the GDD
myheight<- numtips*50;
#myheight<- numtips*36;

#http://cran.r-project.org/web/packages/GDD/GDD.pdf
#library(GDD);


png(file=filename, pointsize = 10, width=800, height=myheight,  bg='#F8F8FF')
#print('help2');
sink('/dev/null');
#plot(rnorm(100),rnorm(100))

maintitle=paste('VAMPS Cluster Plot Based on Taxonomic Counts (distance metric = ',metric,')\n',htime);

par(mai=c(.5,2.5,.5,4.0));
#plot(phc,horiz=TRUE); 
#plot(phc);
#par(mar = c(8, 0, 0, 0)) # leave space for the labels
plot(dend,horiz=TRUE)

#plot(dend,horiz=TRUE,ylab="Distance")
#plot(1:500, col = gl(2,250)) 


title(main=maintitle);
dev.off();
sink();
#


 #nwkfilename<- paste('./nwk_','.nwk',sep='');
 #write.tree(phc,nwkfilename);

#here we deviate
#DONE
