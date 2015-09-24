#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

biom_file <- args[1]
method <- args[2]   # distance
depth <- args[3]
prefix <- args[4]
#pdf_file = paste("/Users/avoorhis/node_projects/vamps-node.js/public/tmp_images/",prefix,"_heatmap.pdf",sep='')
#pdf_file = paste("public/tmp_images/",prefix,"_heatmap.pdf",sep='')
pdf_file = paste("tmp/",prefix,"_heatmap.pdf",sep='')

# /groups/vampsweb/vamps/seqinfobin/bin/Rscript --no-save --slave --no-restore 
# fheatmap.R /usr/local/www/vamps/docs/tmp/avoorhis_1784983_normalized.mtx avoorhis_1784983 Phylum horn yes

library(pheatmap) 
library(RColorBrewer)
#library(pracma)
library(jsonlite,quietly=TRUE)
require(vegan,quietly=TRUE);

myjson<-fromJSON(biom_file)
data_matrix<-myjson$data
rownames(data_matrix)<-myjson$rows$id
colnames(data_matrix)<-myjson$columns$id
print(colnames(data_matrix))
x<-data_matrix

#biods = t(data_matrix);
#data_matrix<-read.delim(biom_file);
#print(biods)


#t<-"[[0.0, 0.009861597266620836, 8.902864390669674e-05], [0.009861597266620836, 0.0, 0.011373159462720328], [8.902864390669674e-05, 0.011373159462720328, 0.0]]"
#u<-[[0.0, 0.009861597266620836, 8.902864390669674e-05], [0.009861597266620836, 0.0, 0.011373159462720328], [8.902864390669674e-05, 0.011373159462720328, 0.0]]
#print(matrix_in)
#string_in<-substring(string_in, 2)
#string_in<-substring(string_in, 0, nchar(string_in)-1)

#print(matrix_in)
#x<-strsplit(string_in, "], [", fixed=TRUE)
#print(class(unlist(x)))
#y<-strsplit(unlist(x), ", ", fixed=TRUE)
#print(y)
#cc <- unlist(lapply(y, as.numeric))
#print(cc)
#print(class(cc))
#z<-c(0.009861597266620836, 8.902864390669674e-05, 0.011373159462720328)
#print(z)
#print(class(z))
#x<-squareform(cc)


#  x remove empty columns (datasets)
x<-x[,colSums(x) > 0]




ncols<-ncol(x)
nrows<-nrow(x)

#last_name = row.names(x)[nrows]
#if(last_name == 'ORIGINAL_SUMS'){
    # remove it -- it screws up the dist calculation    
#    x <- x[1:nrows-1,]
#}


# columns are datasets
# need to get the sum of each column
#print(colSums(x))
#print(x/colSums(x))
print(nrow(x))
#print(colSums(x))
# this divides each count by the col sum
#x = x/colSums(x)

# rows (taxa)
if (nrow(x) <= 30 ){
    h<-(nrow(x)*.14)+6
}else if(nrow(x) > 30 && nrow(x) <= 80){
    h<-(nrow(x)*.13)+5
}else if(nrow(x) > 80 && nrow(x) <= 150){
    h<-(nrow(x)*.13)+3
}else if(nrow(x) > 150 && nrow(x) <= 300){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 300 && nrow(x) <= 400){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 400 && nrow(x) <= 500){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 500 && nrow(x) <= 600){
    h<-(nrow(x)*.12)+2
}else if(nrow(x) > 600 && nrow(x) <= 700){
    h<-(nrow(x)*.11)+1
}else if(nrow(x) > 700 && nrow(x) <= 800){
    h<-(nrow(x)*.11)+1
}else if(nrow(x) > 800 && nrow(x) <= 900){
    h<-(nrow(x)*.1)+1
}else if(nrow(x) > 900 && nrow(x) <= 1000){
    h<-(nrow(x)*.1)+1
}else if(nrow(x) > 1000 && nrow(x) <= 1100){
    h<-(nrow(x)*.09)
}else if(nrow(x) > 1100 && nrow(x) <= 1200){
    h<-(nrow(x)*.09)
}else{
    
    h<-(nrow(x)*.1)
}
# cols (datasets)
# if (ncol(x) <= 5){
#     w<-10
# }else if(ncol(x) > 5 && ncol(x) <= 15){
#     w<-14
# }else if(ncol(x) > 15 && ncol(x) <= 30){
#     w<-20
# }else if(ncol(x) > 30 && ncol(x) <= 50){
#     w<-23
# }else if(ncol(x) > 50 && ncol(x) <= 70){
#     w<-26
# }else if(ncol(x) > 70 && ncol(x) <= 90){
#     w<-29
# }else if(ncol(x) > 90 && ncol(x) <= 110){
#     w<-32
# }else{
#     w<-35
# }



w<-(ncol(x)*0.2)+10


#
#[1] "rows: 128 h: 20 rmarg: 20"
#[1] "cols: 284 w: 35"



#k=x
#dimnames(k) <- NULL 
#annotation = data.frame(factor(1:ncol(x) %% 2 == 0, labels = c("Even", "Odd")))
#print(data_matrix)
#head(x)
pdf_title="VAMPS Frequency Heatmap"

#print(pdf_file)
#print(h)
#print(w)
#pdf(pdf_file, width=w, height=h, title=pdf_title)
pdf(pdf_file, width=w, height=h, title=pdf_title)

if(depth=="genus" || depth=="species" || depth=="strain"){
    r_margin=45
}else if(depth=="class" || depth=="order" || depth=="family"){
    r_margin=20
}else{
    r_margin=10
}
print(paste("rows:",nrow(x),"h:",h,"rmarg:",r_margin))
print(paste("cols:",ncol(x),"w:",w))
#print(paste("fontsize_row:",fontsize_row))

              
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

#print('drows')
#print(drows)
#print(x)
#v=function(x) vegdist(x, method=meth)
#print(v)
#aheatmap(x, col=mypalette, distfun = function(d) vegdist(d, method=meth), scale="row",
#        fontsize=fontsize_row,cellwidth=12,cellheight=6, main="aheatmap")
#stand <-decostand(k,"total");
#dis<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
# x = x * 10
#heatmap.2(x, col=mypalette, scale="row",
#        distfun=function(d) vegdist(d, method=meth), 
#            margins=c(16,r_margin), main="heatmap.2")
#            key=FALSE, symkey=FALSE, density.info="none", trace="none", cexRow=0.5)        
#pheatmap(x, col=mypalette3, scale="row", legend=FALSE,
#        clustering_distance_rows=vegdist(x, method=meth),
#        clustering_distance_cols=vegdist(t(x), method=meth), margins=c(15,r_margin),
#       fontsize_row=fontsize_row, cellwidth=12, cellheight=6, main="pheatmap3")

#
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


#print(x1)


pheatmap(x1,  scale="none", color=mypalette6,
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


