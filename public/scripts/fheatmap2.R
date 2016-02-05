#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

biom_file <- args[1]
method <- args[2]   # distance
depth <- args[3]
prefix <- args[4]
out_file = paste("tmp/",prefix,"_heatmap.svg",sep='')


library(pheatmap) 
library(RColorBrewer)
library(jsonlite,quietly=TRUE)
require(vegan,quietly=TRUE);

myjson<-fromJSON(biom_file)
data_matrix<-myjson$data
rownames(data_matrix)<-myjson$rows$id
colnames(data_matrix)<-myjson$columns$id
print(colnames(data_matrix))
x<-data_matrix

#  x remove empty columns (datasets)
x<-x[,colSums(x) > 0]




ncols<-ncol(x)
nrows<-nrow(x)

#print(x/colSums(x))
print(nrow(x))
#print(colSums(x))
# this divides each count by the col sum
#x = x/colSums(x)

w<-(ncol(x)*0.2)+10

pdf_title="VAMPS Frequency Heatmap"

svg(out_file)

if(depth=="genus" || depth=="species" || depth=="strain"){
    r_margin=45
}else if(depth=="class" || depth=="order" || depth=="family"){
    r_margin=20
}else{
    r_margin=10
}

fontsize_row = 8

# clustering methods
if(method=='horn'){ 
    meth <- 'horn'
    text <- "Morisita-Horn"
}else if(method=='bray' || method=='bray_curtis'){
    meth <- 'bray'
    text <- "Bray-Curtis"
}else if(method=='jaccard'){
    meth <- 'jaccard'
    text <- "Jaccard"
}else if(method=='manhattan'){
    meth <- 'manhattan'
    text <- "Manhattan"
}else if(method=='gower'){
    meth <- 'gower'
    text <- "Gower"
}else if(method=='euclidean'){
    meth <- 'euclidean'
    text <- "Euclidean"
}else if(method=='canberra'){
    meth <- 'canberra'
    text <- "Canberra"
}else if(method=='kulczynski'){
    meth <- 'kulczynski'
    text <- "Kulczynski"
}else if(method=='mountford'){
    meth <- 'mountford'
    text <- "Mountford"
}else{
    meth <- 'horn'
    text <- "Morisita-Horn"
}
main_label=paste("VAMPS Frequency Heatmap\n--Taxonomic Level:",depth,"\n--Clustering: ",text)
drows<-vegdist(x, method=meth)
dcols<-vegdist(t(x), method=meth, na.rm=TRUE)

#mypalette1<-colorRampPalette(c("blue", "green", "yellow", "orange", "red"), bias=0.75)(128)
#mypalette2<-colorRampPalette(brewer.pal(12,"Set3"))(128)
#mypalette3<-colorRampPalette(brewer.pal(8,"Dark2"))(128)
#mypalette4<-colorRampPalette(brewer.pal(9,"BuPu"))(128)
#mypalette5<-colorRampPalette(brewer.pal(9,"PuBuGn"))(128)

mypalette6<-colorRampPalette(brewer.pal(12,"Paired"))(256)

#mypalette7<-colorRampPalette(c("#00007F", "blue", "#007FFF", "cyan",
#                     "#7FFF7F", "yellow", "#FF7F00", "red", "#7F0000"))(128)
#mypalette8<-colorRampPalette(c("red", "orange", "blue"),space = "Lab")(128)                    
#mypalette9<-colorRampPalette(c("blue", "magenta", "red", "yellow"), bias=0.75, space="Lab")(128)  

# scale will be yes if data is unnormalize; scale is un-needed otherwise

x1<-scale(x, center=FALSE, scale=colSums(x))
print('x->')
print(x1)
new<-x1[-nrow(x1),]
print('<-x')
print(new)
print('<-x')
print(class(x1))
#print(x1)

#pheatmap(new)
pheatmap(new,  scale="none", color=mypalette6,
			clustering_distance_rows=drows,
			clustering_distance_cols=dcols, margins=c(15,r_margin),
		   fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main=main_label)




#20130619
#if(scale=='yes'){
# 	#x3<-t(scale(t(x), scale=TRUE))
# 	#x3<-scale(x)
# 	pheatmap(x,  scale="column", 
# 			clustering_distance_rows=drows,
# 			clustering_distance_cols=dcols, margins=c(15,r_margin),
# 		   fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main=main_label)
# }else{       
# 	
# 	# WORKS Scale by columns AFTER grab distance above
# 	#x1<-scale(x, center=FALSE, scale=colSums(x))
# 	pheatmap(x,  scale="none", 
# 			clustering_distance_rows=drows,
# 			clustering_distance_cols=dcols, margins=c(15,r_margin),
# 		   fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main=main_label)
# }
#x2<-t(scale(t(x), scale=rowSums(x)))
#pheatmap(x2,  scale="none", 
#        clustering_distance_rows=drows,
#        clustering_distance_cols=dcols, margins=c(15,r_margin),
#       fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main=main_label)
#x1<-scale(x, center=FALSE, scale=colSums(x))
	
#pheatmap(x, col=mypalette1, scale="row", legend=FALSE,
#        clustering_distance_rows=vegdist(x, method=meth),
#        clustering_distance_cols=vegdist(t(x), method=meth), margins=c(15,r_margin),
#       fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main="pheatmap1")
#pheatmap(x, col=mypalette9, scale="row", legend=FALSE,
#        clustering_distance_rows=vegdist(x, method=meth),
#        clustering_distance_cols=vegdist(t(x), method=meth), margins=c(15,r_margin),
#      fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main="pheatmap9")

#heatmap(x, col=mypalette3, scale="row",
#        main="regular heatmap-3",  distfun = function(d) vegdist(d, method=meth), margins=c(15,r_margin) )
#heatmap(x, col=mypalette7, scale="none",
#        main="regular heatmap-7",  distfun = function(d) vegdist(d, method=meth), margins=c(15,r_margin) )
#heatmap(x, col=mypalette1, scale="row",
#        main="regular heatmap-1",  distfun = function(d) vegdist(d, method=meth), margins=c(15,r_margin) )
#heatmap(x, col=mypalette9, scale="row",
#        main="regular heatmap-9",  distfun = function(d) vegdist(d, method=meth), margins=c(15,r_margin) )
        
#legend(0,-4, legend=c("one", "two")) 
#title(main=main_label)


print(warnings())
dev.off()


