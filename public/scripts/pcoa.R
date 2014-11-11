args <- commandArgs(TRUE)

#print(args)  ;
mtxurl <- args[1]   # csv

distmtx <- read.csv(mtxurl, header=TRUE)

#library(ctc);
#library(labdsv)
library(jsonlite)

mydist<-as.dist(distmtx)
no_of_datasets<-dim(distmtx)[1]

#print(mydist)
if(no_of_datasets < 4){
	k=no_of_datasets-1
}else{
	k=4
}
#print(k)
#pcoa <- pco(mydist, k=3)
#print(mydist)
pcoa<-cmdscale(mydist, k=k)
#print(pcoa$points)
#print(pcoa)
#V1<- as.vector(pcoa[,1])
#V2<- as.vector(pcoa[,2])
#V3<- as.vector(pcoa[,3])
myjson<-list(P1=as.vector(pcoa[,1]), P2=as.vector(pcoa[,2]), P3=as.vector(pcoa[,3]), names=rownames(pcoa))

#print(pcoa[,2])
#cat(toJSON(n))
#print("")
cat(toJSON(myjson))
#at(toJSON(pcoa$points[1,1]))
q()

# {
# "P2": [6.7968538435623981e-12, 6.7968538435596274e-12, 6.7968538435585627e-12, 6.7968538435602477e-12, 6.7968538435601952e-12], 
# "P3": [6.0770990643201093e-05, -1.3376276151112777e-05, -4.6848939692851556e-05, -1.1291048586612892e-06, 5.8333005939240609e-07], 
# "P1": [-0.0023837726273334379, -0.0010531100076161756, -0.0027880370795252893, 0.0020264887140886028, 0.0041984310003862994], 
# "names": ["KCK_LSM_Bv6--061907st4", "KCK_LSM_Bv6--071007st3", "KCK_LSM_Bv6--061907st2", "KCK_LSM_Bv6--071007st2", "KCK_LSM_Bv6--061307st4a"]
# }