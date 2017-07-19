#!/usr/bin/env Rscript
library(jsonlite,quietly=TRUE)
args <- commandArgs(TRUE)
print(args)
process_path <- args[1]
metric <- args[2]
prefix <- args[3]

biom_file <- paste(process_path,'/tmp/',prefix,'_count_matrix.biom',sep='')
image_file <- paste(process_path,'/tmp/',prefix,'_dendrogram.svg',sep='')
#print(biom_file)
myjson<-fromJSON(biom_file)
data_matrix<-myjson$data
rownames(data_matrix)<-myjson$rows$id
colnames(data_matrix)<-myjson$columns$id
#print(colnames(data_matrix))
#x<-data_matrix


ncols<-ncol(data_matrix)
nrows<-nrow(data_matrix)


# get rid of datasets with zero sum over all the taxa:
data_matrix<-data_matrix[,colSums(data_matrix) > 0]

biods = t(data_matrix); #
#print(biods);
require(vegan,quietly=TRUE);
stand <-decostand(data.matrix(biods),"total");
#  http://cc.oulu.fi/~jarioksa/softhelp/vegan/html/vegdist.html
# must use upper=FALSE so that get_distanceR can parse the output correctly
dis <- 0
if(metric == "morisita-horn"){
   dis<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
}else if(metric == "yue-clayton"){
   dis<-designdist(stand, method="1-(J/(A+B-J))",terms = c( "quadratic"), abcd = FALSE)
}else if(metric == "bray-curtis"){
   dis<-vegdist(stand, method="bray",upper=FALSE,binary=FALSE);
}else if(metric == "jaccard"){
   dis<-vegdist(stand, method="jaccard",upper=FALSE,binary=FALSE);
}else if(metric == "canberra"){
   dis<-vegdist(stand, method="canberra",upper=FALSE,binary=FALSE);
}else if(metric == "kulczynski"){
   dis<-vegdist(stand, method="kulczynski",upper=FALSE,binary=FALSE);
}else{
    # Default morisita-horn
    dis<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
}
# dis is the distance matrix
#print(dis);



#print(dd);
library(ape);
#hc = upgma(dd);
hc<-hclust(dis); 

# ape as.phylo is a generic function which converts an object into a tree of class "phylo".
phc<-as.phylo(hc);
dend <- as.dendrogram(hc)
#  write tree to: 
#tree_file<-paste('/usr/local/www/vamps/tmp/',prefix,'_outtree.tre',sep='')
#write.tree(phc, file=tree_file)
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



print(image_file);

#http://cran.r-project.org/web/packages/Cairo/Cairo.pdf
#library(Cairo)
htime<-Sys.time();
#default csi is .2 inches per character
#5 characters per inch
#72 pixels per inch .. maybe
#all related to point size (ps) in the GDD
myheight<- (numtips*0.75);
#myheight<- numtips*36;

#http://cran.r-project.org/web/packages/GDD/GDD.pdf
#library(GDD);

svg(file=image_file, pointsize = 10, width=11, height=myheight,  bg='ivory') # size is in INCHES
#png(file=image_file, pointsize = 10, width=800, height=myheight,  bg='#F8F8FF')
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

