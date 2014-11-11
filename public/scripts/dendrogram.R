args <- commandArgs(TRUE)
#print(args)  ;
mtxurl <- args[1]   # csv

distmtx <- read.csv(mtxurl, header=TRUE)

library(ctc);

mydist<-as.dist(distmtx)

hc<-hclust(mydist); 

newick<-hc2Newick(hc);

print(newick);

#write(newick,file='../../tmp/hclust.newick')
q();
