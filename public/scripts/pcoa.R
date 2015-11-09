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
tmp_matrix <- as.matrix(OTU[rowSums(OTU) > 0,])

#print(tmp_matrix)
#print(MAP)

ncols<-ncol(tmp_matrix)  #datasets
nrows<-nrow(tmp_matrix)
print(ncols)
print(nrows)


print(class(tmp_matrix))


stand <-decostand(t(tmp_matrix),"total");
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


# k=4 unless #dataset <= 4 
# then k = #dataset-1
k<-4
if(ncols <= 4 ){
	k<-ncols-1
}
# labdsv pco not working on vamps
#pcoa <- pco(d, k=k)
#print(d)
# ape pcoa
pcoa_data <- pcoa(d)
#print(pcoa)
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
     

     
# point_file <- paste(tmp_path,'/',prefix,'_pcoa_matrix_outR.txt',sep='')
# cat("pc vector number\n", file = point_file)

# write.table(pcoa$vectors[,c(1,2,3,4)], file = point_file, append = TRUE, quote = FALSE, col.names = FALSE, sep="\t" )
# #write.table(pcoa$vectors, file = point_file, append = TRUE, quote = FALSE, col.names = FALSE, sep="\t" )

# # creating this for make_emperor.py qiime script
# cat("\n\neigvals\t", append = TRUE, file = point_file)
# #eig_vals <- paste(pcoa$eig[1], pcoa$eig[2], pcoa$eig[3], pcoa$eig[4], sep="\t")
# eig_vals <- pcoa$values[,c(1)]
# eig_vals_show <- paste(eig_vals[1], eig_vals[2], eig_vals[3], eig_vals[4], sep="\t")
# cat(eig_vals_show, append = TRUE, file = point_file)
# sum_eigs <- sum(eig_vals)
# #cat("\n", append = TRUE, file = point_file)
# #cat(sum_eigs, append = TRUE, file = point_file)
# #cat("\n", append = TRUE, file = point_file)
# cat("\n% variation explained\t", append = TRUE, file = point_file)
# eig_pcts <- paste((eig_vals[1]*100)/sum_eigs, (eig_vals[2]*100)/sum_eigs, (eig_vals[3]*100)/sum_eigs, (eig_vals[4]*100)/sum_eigs, sep="\t")
# cat(eig_pcts, append = TRUE, file = point_file)
# cat("\n", append = TRUE, file = point_file)


num_md_items = length(colnames(MAP))

# maximum number of colors/divisions on a graph 
# for practical reasons
# so for datasets: anything greater than 6 will show a single color
maxLength=20
colors1 = c( "blue" )
colors2 = c( "blue", "red" )
colors3 = c( "green", "red",  "blue" )
colors4 = c( "green", "red",  "blue", "cyan" )
colors5 = c( "green", "red",  "blue", "cyan","orange")
colors6<-colorRampPalette(c("blue", "green", "cyan", "orange", "red"))(maxLength)
one_color<-c( "blue" )
one_shape<-16
myshapes<-c(16,17,18,19,20,21,22,23,24,25)
#pch = c(21,22,23,24,25)
#image_file = paste(tmp_path,'/',out_file,sep='')
image_file = out_file
h=(num_md_items*5)+2
#svg(image_file, width=25, height=h)
#png(image_file)
par(mfrow=c(num_md_items,3))

	#print(pcoa$vectors[,1])
	#plot(pcoa$vectors[,3],pcoa$vectors[,2], type="n", main = 'main', xlab='xlabel', ylab='ylabel')
	#print(mypalette)
#print(pcoa$vectors[,1])
	#dev.off()
	#q()
axes=list(c(1:2), c(1,3), c(2:3))
axes_labels <- c("12", "13", "23")
for(md_name in colnames(MAP))
{
    #print(md_name)
    #  but you need the list of datasets for each metadata value.
    #  how do i find all the discreet values for this md_name?    
    md_values <- unique(MAP[,md_name])
    md_val_count<-length(md_values)
    
	if(md_val_count == 1)
	{
		mypalette = colors1  
		pch<-19
		
	}else if(md_val_count == 2)
	{
		mypalette = colors2 
		pch<-c(21,22)
	}else if(md_val_count == 3)
	{
		mypalette = colors3 
		pch<-c(19:21)
	}else if(md_val_count == 4)
	{
		mypalette = colors4 
		pch<-c(19:22)
	}else if(md_val_count == 5)
	{
		mypalette = colors5 
		pch<-c(19:23)
	}else if(md_val_count > 5)
	{
		mypalette = colors6 
		pch<-c(0:81)
	}
	
	for (ax in c(1,2,3))
	{
	
		xlabel <- paste("PCOA", substring(axes_labels[ax],1,1), " (", round((pcoa_data$values[as.integer(substring(axes_labels[1], 1, 1))]/sum(pcoa_data$values[1:3]))*100, 1), "%)", sep="")
		ylabel <- paste("PCOA", substring(axes_labels[ax],2,2), " (", round((pcoa_data$values[as.integer(substring(axes_labels[ax], 2, 2))]/sum(pcoa_data$values[1:3]))*100, 1), "%)", sep="")
	 
		# The main title, 
		main <- paste("PCoA using",metric_text," ( metadata:", md_name, ")")
		par(xpd=NA, mar = c(5, 4, 4, 18) + 0.1)
		print(pcoa_data$vectors[,axes[[ax]]])
		#plot(pcoa$points[,axes[[ax]]], main = main, xlab=xlabel, ylab=ylabel)
		#plot(pcoa_data$vectors[,axes[[ax]]], type="n", main = main, xlab=xlabel, ylab=ylabel)
		#print(md_name)
		ymax=par('usr')[4]
		xmax=par('usr')[2]
		
		
		
		for(i in 1:md_val_count)
		{
			prows <- grep(md_values[i], MAP[,md_name])
			#print(md_values[i])
			#print(MAP[,md_name])
			if(length(prows)==1)
			{
				# this is needed for single data points; 
				# it turns a vector into the correct matrix
				pts<-t(pcoa_data$vectors[prows,axes[[ax]]])
				
			}else{
				pts<-pcoa_data$vectors[prows,axes[[ax]]]
			}
			
			
			if(md_val_count > maxLength){
				c=one_color	
				p=one_shape
			}else{
				c=mypalette[i]
				p=myshapes[i]
			}
					
			
			# if(0){   #labels_on_the_plot
 		# 		cex = 1.2
			# 	text  (pts, labels = rownames(pcoa_data$vectors)[prows], adj=c(0.25,-0.5), cex=cex, col=c)
			# }else{
			# 	cex = 3			
			# }
			cex=1.2
			print(pts)
			#points(pts, col=c,  pch=p, cex=cex)	
			
		}
		if(md_val_count > maxLength){
			c=one_color
			p=one_shape
		}else{
			c=mypalette	
			p=myshapes
		}
		#legend(x=xmax+0.05, y=ymax, legend=md_values, col=c, title=md_name, pch=p, cex=1.2)
		#legend(x=xmax+0.05, y=ymax, legend=md_values, col=c, fill=c, border='black', title=md_name, pch=myshapes)
        
    }
}
dev.off()



