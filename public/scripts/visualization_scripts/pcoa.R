#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

library(phyloseq)
library(vegan)
library(ape)
library(RColorBrewer)

tmp_path 	<- args[1]
prefix   	<- args[2]
metric 		<- args[3]
out_file	<- args[4]
#out_file <- args[3]
#phy   	 <- args[4]
#rank     <- args[5]
biom_file <- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
map_file <- paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

OTU <- import_biom(biom_file)
MAP <- import_qiime_sample_data(map_file)
#print(OTU)
#print(class(OTU))



# the QIIME map file doesnt work well: linkerprimersequence,project,dataset,dataset_description
#mtx<-read.delim(matrix_in, header=T,sep="\t",check.names=TRUE,row.names=1);
#md<-read.delim(metadata_in, header=T,sep="\t",check.names=TRUE,row.names=1);
tmp_matrix <- t(as.matrix(OTU[rowSums(OTU) > 0,]))

#print(tmp_matrix)
#print(MAP)
myrownames<-row.names(tmp_matrix)
ncols<-ncol(tmp_matrix)  
nrows<-nrow(tmp_matrix)
#print(ncols) # taxa
#print(nrows) #datasets

row.names(tmp_matrix) <- NULL   
#print(tmp_matrix)
#q()

stand <-decostand(tmp_matrix,"total");


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
distance_file = paste(tmp_path,'/',prefix,'_distance.R',sep='')
write.table(as.matrix(d),file=distance_file)
#print(d)
#q()


pcoa_data <- pcoa(d)
#print(pcoa_data)


# pcoa$points provides the points for all of the samples (matrix columns), and I have conveniently named my matrix columns
# this gives a new matrix with only the 
#print(md)
#print(a_mtx)
for(md_name in colnames(MAP))
{
    #print(md_name)
}
# write this to a file for download

#print(pcoa_data)

# plot(pcoa$vectors[,1], pcoa$vectors[,2], type = "n", xlab = "", ylab = "",
#//      axes = FALSE, main = "pcoa (ape)")
#// text(pcoa$vectors[,1], pcoa$vectors[,2], 
#//      cex = 0.9, xpd = TRUE)
   

   


num_md_items = length(colnames(MAP))

# maximum number of colors/divisions on a graph 
# for practical reasons
# so for datasets: anything greater than 6 will show a single color
maxLength=20
colors6<-colorRampPalette(c("blue", "green", "cyan", "orange", "red"))(maxLength)
mypalette = colors6 
c = mypalette

#pch = c(21,22,23,24,25)
image_file = paste(tmp_path,'/',out_file,sep='')
#image_file = out_file
h=(num_md_items*5)+2
#svg(image_file, width=25, height=h)
pdf(image_file, width=10)
par(mfrow=c(num_md_items,3))

	#print(pcoa$vectors[,1])
	#plot(pcoa$vectors[,3],pcoa$vectors[,2], type="n", main = 'main', xlab='xlabel', ylab='ylabel')
	#print(mypalette)
#print(pcoa$vectors[,1])
	#dev.off()
	#print(MAP)
	
axes=list(c(1:2), c(1,3), c(2:3))
axes_labels <- c("12", "13", "23")
for(md_name in colnames(MAP))
{
    #print(md_name)
    #  but you need the list of datasets for each metadata value.
    #  how do i find all the discreet values for this md_name?    
    md_values <- unique(MAP[,md_name],na.rm=TRUE)
    row.names(md_values) <- NULL 
    md_values <- as.vector(md_values)[md_values != ""]
    #md_values <- md_values[]
    #tmp_matrix <- tmp_matrix[rowSums(tmp_matrix) > 0,]
    md_val_count<-nrow(md_values)
     #print('-')
     #print(paste('md val count ',md_val_count))
     #print(MAP[,md_name])
    # print(md_val_count)
     #print(md_values[1])
     #print('--')
		mypalette = colors6 
		pch<-c(0:81)
	
	
	for (ax in c(1,2,3))
	{
	
		#xlabel <- paste("PCOA", substring(axes_labels[ax],1,1), " (", round((pcoa_data$values[as.integer(substring(axes_labels[1], 1, 1))]/sum(pcoa_data$values[1:3,1]))*100, 1), "%)", sep="")
		#ylabel <- paste("PCOA", substring(axes_labels[ax],2,2), " (", round((pcoa_data$values[as.integer(substring(axes_labels[ax], 2, 2))]/sum(pcoa_data$values[1:3,1]))*100, 1), "%)", sep="")
	 	#print(pcoa_data$values[,as.integer(substring(axes_labels[1], 1, 1))])
	  xlabel <- paste("PCOA", substring(axes_labels[ax],1,1), sep="")
		ylabel <- paste("PCOA", substring(axes_labels[ax],2,2),  sep="")
	 
		# The main title, 
		main <- paste("PCoA using",metric_text," ( metadata:", md_name, ")")
		#par(xpd=NA, mar = c(5, 4, 4, 18) + 0.1)
		#print(pcoa_data$vectors[,axes[[ax]]])
		#plot(pcoa$points[,axes[[ax]]], main = main, xlab=xlabel, ylab=ylabel)
		plot(pcoa_data$vectors[,axes[[ax]]], type="n", main = main, xlab=xlabel, ylab=ylabel)
		#print(md_name)
		ymax=par('usr')[4]
		xmax=par('usr')[2]
		

		#xlabel <- paste("PCoA", substring(axes_labels[1],1,1), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[1], 1, 1))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
	  #ylabel <- paste("PCoA", substring(axes_labels[1],2,2), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[1], 2, 2))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
		# plot(pcoa$vectors[,axes[[1]]], type="n", main = main, xlab='xlabel', ylab='ylabel')
		 for(i in 1:md_val_count){
			#print(md_values[i])
			#print(pcoa_data)
		 	#prows <- grep(md_values[i], MAP[,md_name])
		 	#print(prows)
		 	pts<-pcoa_data$vectors[,axes[[ax]]]
			
		 	points(pts, cex=1.2,  col=c)	
		 	#text(pts, labels = myrownames, adj=c(0.25,-0.5), cex=1.2, col=c)
			legend(x=xmax+0.05, y=ymax, legend=md_values, col=c, title=md_name,  cex=0.1)

		# 	#print(pts)
		 }
		}
		
	
}
dev.off()



