args <- commandArgs(TRUE)
#print(args)  ;
url <- args[1]      # file name
metric <- args[2]   # morisita_horn or jaccard or whatever
#print(url)

library(jsonlite,quietly=TRUE)
require(vegan,quietly=TRUE);

myjson<-fromJSON(url)

data_matrix<-myjson$data
rownames(data_matrix)<-myjson$rows$id
colnames(data_matrix)<-myjson$columns$id
#print(data_matrix)
biods = t(data_matrix);
#print(biods);

#  http://cc.oulu.fi/~jarioksa/softhelp/vegan/html/vegdist.html
# must use upper=FALSE so that get_distanceR can parse the output correctly
dis <- as.matrix(0)


if(metric == "morisita_horn" || metric == "Morisita-Horn"){
    stand <-decostand(data.matrix(biods),"total");
   dis<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
}else if(metric == "yue_clayton" || metric == "Yue-Clayton"){ 
  stand <-decostand(data.matrix(biods),"total");
  dis<-designdist(stand, method="1-(J/(A+B-J))",terms = c( "quadratic"), abcd = FALSE)
}else if(metric == "bray_curtis" || metric == "Bray-Curtis"){
    stand <-decostand(data.matrix(biods),"total");
   dis<-vegdist(stand, method="bray",upper=FALSE,binary=FALSE);
}else if(metric == "jaccard" ||  metric == "Jaccard"){
    stand <-decostand(data.matrix(biods),"total");
   dis<-vegdist(stand, method="jaccard",upper=FALSE,binary=TRUE);
}else if(metric == "jaccard2"){
    stand <-decostand(data.matrix(biods),"total");
    dis<-designdist(stand, method = "(A+B-2*J)/(A+B-J)",terms = c("binary"), upper=FALSE)
  
}else if(metric == "manhattan"){
    
    stand <-decostand(data.matrix(biods),"total");
   dis<-vegdist(stand, method="manhattan",upper=FALSE,binary=FALSE);
}else if(metric == "raup"){
    
    stand <-decostand(data.matrix(biods),"total");
   dis<-vegdist(stand, method="raup",upper=FALSE,binary=FALSE);
}else if(metric == "gower"){
    
    stand <-decostand(data.matrix(biods),"total");
    dis<-vegdist(stand, method="gower",upper=FALSE,binary=FALSE);
}else if(metric == "euclidean"){
    
    stand <-decostand(data.matrix(biods),"total");
    dis<-vegdist(stand, method="euclidean",upper=FALSE,binary=FALSE);
}else if(metric == "canberra"){
    
    stand <-decostand(data.matrix(biods),"total");
    dis<-vegdist(stand, method="canberra",upper=FALSE,binary=FALSE);
}else if(metric == "kulczynski"){
    
    stand <-decostand(data.matrix(biods),"total");
    dis<-vegdist(stand, method="kulczynski",upper=FALSE,binary=FALSE);
}else if(metric == "mountford"){
    
    stand <-decostand(data.matrix(biods),"total");
    dis<-vegdist(stand, method="mountford",upper=FALSE,binary=FALSE);
}else if(metric == "chao_j"){
   require(fossil,quiet=TRUE);
   
   dis<-ecol.dist(data_matrix, method = chao.jaccard, type = "dis");   
}else if(metric == "chao_s"){
   require(fossil,quiet=TRUE);
   dis<-ecol.dist(data_matrix, method = chao.sorenson, type = "dis");   
}else if(metric == "pearson"){
     
   dis<-cor(data_matrix, method = 'pearson')
   dis<-(1-abs(dis))

}else if(metric == "correlation"){
   require(amap,quiet=TRUE);   
   dis<-Dist(decostand(data.matrix(biods),"total"), method = 'correlation')   
}else if(metric == "spearman"){
  
   dis<-cor(data_matrix, method = 'spearman')
   dis<-(1-abs(dis))
}else{
    # print("ERROR: no distance method found!")
    dis<-'err'
}
# this should be the ONLY print!!!!

# dis is the distance matrix
#print(dis);



#print(dd);
library(ape);
library(ctc);
#hc = upgma(dd);
hc<-hclust(dis); 
newick<-hc2Newick(hc);
print(newick)
#write(newick,file='../../tmp/hclust.newick')
q()



# ape as.phylo is a generic function which converts an object into a tree of class "phylo".
phc<-as.phylo(hc);
dend <- as.dendrogram(hc)
#  write tree to: 
tree_file<-paste('/usr/local/www/vamps/tmp/',prefix,'_outtree.tre',sep='')
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

plotname <- paste(prefix,'_tree.png',sep='');

filename <-paste('/usr/local/www/vamps/docs/tmp/',plotname,sep='')
#filename <-paste(plotname,sep='')
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
