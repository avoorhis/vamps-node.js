args <- commandArgs(TRUE)
#print(args)  ;
url <- args[1]  # json
metric <- args[2]   # horn or jaccard
#print(url)

library(jsonlite)

myjson<-fromJSON(paste('./tmp/',url,sep=''))


#print(myjson$rows)
#print(myjson$data)
#data_matrix<-read.delim(matrix_in, header=T,sep="\t",check.names=FALSE,row.names=1);
#print(data_matrix);

# IMPORTANT!! must remove last line IF rowname=='ORIGINAL_SUMS'
#rowcount<-nrow(data_matrix)
#last_name = row.names(data_matrix)[rowcount]
#print(rowcount)
#print(last_name)

# to get rid of potential NaN errors
# get rid of datasets with zero sum over all the taxa :
#print(myjson$data)
data_matrix<-myjson$data
rownames(data_matrix)<-myjson$rows$id
colnames(data_matrix)<-myjson$columns$id
#print(data_matrix)
biods = t(data_matrix);
#print(biods)
#print(biods);
require(vegan);
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
x = as.matrix(dis)
#print(dis);
#format(x, cols = 1)

#print(row.names(x)[1])
#print(x[,1])
# write.table gives the most consistant output for varying dataset length
write.table(x, quote=FALSE,sep = "\t",row.names = TRUE,col.names = TRUE);
#print('')

#
q();

