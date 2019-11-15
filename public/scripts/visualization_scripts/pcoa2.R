#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path 	<- args[1]
prefix   	<- args[2]
metric 		<- args[3]
md1 		<- args[4]
md2 		<- args[5]
out_file	<- args[6]

biom_file <- paste(tmp_path,prefix,'_count_matrix.biom',sep='')
map_file <- paste(tmp_path,prefix,'_metadata.txt',sep='')

library(phyloseq)
library(vegan)
#library(plyr)
#library(grid)
library(ape)
#library(ggplot2)

abund_table <- import_biom(biom_file)
meta_table <- import_qiime_sample_data(map_file)
meta_table <- data.frame(meta_table)

# this gets rid of empty colums:  BarcodeSequence LinkerPrimerSequence
meta_table <- meta_table[,colSums(is.na(meta_table))<nrow(meta_table)]

#print(class(meta_table))
#print(meta_table)

#  x remove empty columns (datasets with zero sums)
abund_table<-abund_table[,colSums(abund_table) > 0]
 
#abund_table<-read.csv("SPE_pitlatrine.csv",row.names=1,check.names=FALSE)
#Transpose the data to have sample names on rows
abund_table<-t(abund_table)
 
#meta_table<-read.csv("ENV_pitlatrine.csv",row.names=1,check.names=FALSE)
 
#Just a check to ensure that the samples in meta_table are in the same order as in abund_table
meta_table<-meta_table[rownames(abund_table),]

#========================================================================#
#print (abund_table)

stand <-decostand(abund_table,"total");

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
distance_file = paste(tmp_path,prefix,'_distance.R',sep='')
write.table(as.matrix(d),file=distance_file)
Sys.chmod(distance_file, "0664", use_umask = FALSE)
#meta_table<-meta_table[is.na(meta_table)]<-0
#print (meta_table)
num_md_items = length(colnames(meta_table))
#x<-with(meta_table, levels(sample))
#[1] "Patient f" "Patient m"
#print(x)
#scl <- 3
#colvec <- c("red2", "green4", "mediumblue")

colors6<-colorRampPalette(c("blue", "green", "cyan", "orange", "red"))

#print(colvec)
pcoa <- pcoa(d)

image_file = paste(tmp_path,out_file,sep='')
#pdf_file<-"pcoa.pdf"
#ht = num_md_items*5
# for 2 rows:
ht=10
pdf(image_file, w=20, h=ht)

points.axis12<-pcoa$vectors[,1:2]
points.axis13<-pcoa$vectors[,1:3]
points.axis23<-pcoa$vectors[,2:3]
#print(meta_table$env_feature)

# makes 3 accross
par(mfrow=c(2,3))

ymax=par('usr')[4]
xmax=par('usr')[2]
max_md_items_for_legend = 25
for(md_name in colnames(meta_table))
{
    #print(md_name)
    if(md_name==md1 || md_name==md2){

		    meta_col<-meta_table[,md_name]
		    meta_col<-meta_col[meta_col != '']
		    #print(meta_col)


		    l<-levels(meta_col)
		    #l <- as.vector(l)[l != ""]
		    
		    #print(l)
		    lcount<-length(l)
		    #print(meta_table[,md_name])
		    colvec<-colors6(lcount)

		    if(md_name == 'X.SampleID'){
		    	mdname = 'Dataset'
		    }else{
		    	mdname = md_name
		    }
		    
				#print(colvec[meta_table[,md_name]])
				par(xpd=NA, mar=c(5, 4, 4, 2) + 0.1)
				
		    plot(points.axis12, type = "n" )
				with(meta_table, points(points.axis12,  col = colvec[meta_col],   pch = 21, bg = colvec[meta_col]))
				
				
				main<-paste('[',metric_text,']::[',mdname,']')
				plot(points.axis13,type = "n", main=main )
				with(meta_table, points(points.axis13,  col = colvec[meta_col],   pch = 21, bg = colvec[meta_col]))
				
				
				par(xpd=NA, mar = c(5, 4, 4, 18) + 0.1)
				
				plot(points.axis23,type = "n" )
				with(meta_table, points(points.axis23,  col = colvec[meta_col],   pch = 21, bg = colvec[meta_col]))
				#with(meta_table, legend(x=xmax+0.05, y=ymax, legend=l, col=colvec, title=mdname,  cex=0.1))
				if(lcount < max_md_items_for_legend){
					legend("topleft", inset=c(1.05,0), legend=l, col=colvec, fill=colvec, border='black', title=mdname)
					#legend(x=0.2, y=0.1, legend=l, col=colvec, fill=colvec, border='black', title=mdname)			
				}else{
					#legend("topright", inset=c(-0.3,0), legend=c('(too many divisions','- maximum is 20)'), title=mdname)
					legend(x=0.2, y=0.1, legend=c('(too many divisions',paste('- maximum is ',max_md_items_for_legend,')')), title=mdname)	
				}
	}
}
dev.off()
Sys.chmod(image_file, "0664", use_umask = FALSE)
q()







