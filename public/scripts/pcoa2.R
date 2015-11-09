#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
matrix_in <- args[1]
prefix    <- args[2]
method    <- args[3]
label_on_plot<- args[4]
if(label_on_plot=='yes'){
	labels_on_the_plot<-TRUE
}else{
	labels_on_the_plot<-FALSE
}
library(vegan);
library(ape);
#library(labdsv)
library(RColorBrewer)

metadata_in<-"metadata_in.txt"
# the QIIME map file doesnt work well: linkerprimersequence,project,dataset,dataset_description
mtx<-read.delim(matrix_in, header=T, sep="\t",check.names=TRUE,row.names=1);
md<-read.delim(metadata_in, header=T, sep="\t",check.names=TRUE,row.names=1);
print(mtx)


tmp_matrix <- mtx[rowSums(mtx) > 0,]

print(tmp_matrix)



stand <-decostand(t(tmp_matrix),"total");
if(method=="horn")
{
    d<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
    method_text<-"Morisita-Horn"
}else if(method=="bray")
{
    d<-vegdist(stand, method="bray",upper=FALSE,binary=FALSE);
    method_text<-"Bray-Curtis"
}else if(method=="jaccard")
{
    d<-vegdist(stand, method="jaccard",upper=FALSE,binary=TRUE);
    #d  <- dist(stand, method="binary")
    method_text<-"Jaccard"
}else if(method=="yue-clayton")
{
    d<-designdist(stand, method="1-(J/(A+B-J))",terms = c( "quadratic"), abcd = FALSE)
    method_text<-"Yue-Clayton"
}else if(method=="manhattan")
{
    d<-vegdist(stand, method="manhattan",upper=FALSE,binary=FALSE);
    method_text<-"Manhattan"
}else if(method=="gower")
{
    d<-vegdist(stand, method="gower",upper=FALSE,binary=FALSE);
    method_text<-"Gower"
}else if(method=="euclidean")
{
    d<-vegdist(stand, method="euclidean",upper=FALSE,binary=FALSE);
    method_text<-"Euclidean"
}else if(method=="canberra")
{
    d<-vegdist(stand, method="canberra",upper=FALSE,binary=FALSE);
    method_text<-"Canberra"
}else if(method=="kulczynski")
{
    d<-vegdist(stand, method="kulczynski",upper=FALSE,binary=FALSE);
    method_text<-"Kulczynski"
}else if(method=="mountford")
{
    dis<-vegdist(stand, method="mountford",upper=FALSE,binary=FALSE);
    method_text<-"Mountford"
}else if(method=="pearson")
{
    dis<-cor(tmp_matrix, method = 'pearson')
    d<-(1-abs(dis))
    method_text<-"Pearson"
}else if(method=="spearman")
{
    dis<-cor(tmp_matrix, method = 'spearman')
    d<-(1-abs(dis))
    method_text<-"Spearman"
}else if(method=="chao_j")
{
    require(fossil,quiet=TRUE);
    d<-ecol.dist(tmp_matrix, method = chao.jaccard, type = "dis");   
    method_text<-"Chao-Jaccard"
}else if(method=="chao_s")
{
    require(fossil,quiet=TRUE);
    d<-ecol.dist(tmp_matrix, method = chao.sorenson, type = "dis");   
    method_text<-"Chao-Sorenson"
}else{
    d<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
    method_text<-"Morisita-Horn"
}
#'horn'=>'Morisita-Horn',
#'bray'=>'Bray-Curtis',
#'jaccard'=>'Jaccard',
#'yue-clayton'=>'Yue-Clayton', 
#'manhattan'=>'Manhattan',
# 'gower'=>'Gower',
#'euclidean'=>'Euclidean',
#'canberra'=>'Canberra',
#'kulczynski'=>'Kulczynski',
#'mountford'=>'Mountford',
# 'pearson'=>'Pearson',
#'correlation'=>'1-Correlation',
#'spearman'=>'Spearman',
#'chao_j'=>'Chao-Jaccard',
#'chao_s'=>'Chao-Sorenson'  
#pcoa <- pco(d, k=4)
print(d)
pcoa <- pcoa(d)
print(pcoa)
# pcoa$points provides the points for all of the samples (matrix columns), and I have conveniently named my matrix columns
# this gives a new matrix with only the 
#print(md)
#print(a_mtx)
for(md_name in colnames(md))
{
    #print(md_name)
}
# write this to a file for download
print('1-pcoa$vectors')
print(pcoa$vectors)
print('2-pcoa$vectors')
print('1-pcoa$values')
print(pcoa$values)
print('2-pcoa$values')
#point_file<-paste("/usr/local/www/vamps/docs/tmp/",prefix,"_pcoa_matrix_out.txt",sep='')
point_file<-'pcoa_matrix_out.txt'
cat("pc\n", file = point_file)
write.table(pcoa$vectors, file = point_file, append = TRUE, quote = FALSE, col.names = FALSE, sep="\t" )

# creating this for make_emperor.py qiime script
# cat("\n\neigvals\t", append = TRUE, file = point_file)
# eig_vals <- paste(pcoa$values[1], pcoa$values[2], pcoa$values[3], pcoa$values[4], sep="\t")
# cat(eig_vals, append = TRUE, file = point_file)
# sum_eigs <- sum(pcoa$values[1:4])
# cat("\n% variation explained\t", append = TRUE, file = point_file)
# eig_pcts <- paste((pcoa$values[1]*100)/sum_eigs, (pcoa$values[2]*100)/sum_eigs, (pcoa$values[3]*100)/sum_eigs, (pcoa$values[4]*100)/sum_eigs, sep="\t")
# cat(eig_pcts, append = TRUE, file = point_file)

# creating this for make_emperor.py qiime script
cat("\n\neigvals\t", append = TRUE, file = point_file)
#eig_vals <- paste(pcoa$eig[1], pcoa$eig[2], pcoa$eig[3], pcoa$eig[4], sep="\t")
eig_vals <- pcoa$values[,c(1)]
eig_vals_show <- paste(eig_vals[1], eig_vals[2], eig_vals[3], eig_vals[4], sep="\t")
cat(eig_vals_show, append = TRUE, file = point_file)
sum_eigs <- sum(eig_vals)
#cat("\n", append = TRUE, file = point_file)
#cat(sum_eigs, append = TRUE, file = point_file)
#cat("\n", append = TRUE, file = point_file)
cat("\n% variation explained\t", append = TRUE, file = point_file)
eig_pcts <- paste((eig_vals[1]*100)/sum_eigs, (eig_vals[2]*100)/sum_eigs, (eig_vals[3]*100)/sum_eigs, (eig_vals[4]*100)/sum_eigs, sep="\t")
cat(eig_pcts, append = TRUE, file = point_file)
cat("\n", append = TRUE, file = point_file)

# this gives the row numbers of datasets that have these
#prows <- grep("2008", rownames(pcoa$points))
#print(prows)
#print(rownames(pcoa$points))
#prows <- grep("P$", rownames(pcoa$points))
#print("xxxxx")
#print(pcoa$points)
#print(md[,"envo_biome"])
#prows <- grep("^estuarine biome$", md[,"envo_biome"])
#print(prows)
#prows <- grep("^marine neritic benthic zone biome$", md[,"envo_biome"])
#print(prows)
num_md_items = length(colnames(md))

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
#pdf_file = paste("/usr/local/www/vamps/docs/tmp/",prefix,"_pcoa.pdf",sep='')
pdf_file<-"pcoa.png"
h=(num_md_items*5)+2
png(pdf_file, width=800, res=72)
par(mfrow=c(num_md_items,3))




axes=list(c(1:2), c(1,3), c(2:3))
axes_labels <- c("12", "13", "23")
# print(class(pcoa$vectors[,1]))
# print('XX')
# print(substring(axes_labels[1],1,1))
# print(substring(axes_labels[2],2,2))
# print(substring(axes_labels[3],1,1))
# print('YY')
#print(substring(axes_labels[1],1,1), " (", round((pcoa$values[as.integer(substring(axes_labels[1], 1, 1))]/sum(pcoa$values[1:2]))*100, 1), "%)", sep="")
xlabel <- paste("PCOA", 'c(1,2)',  sep="")
ylabel <- paste("PCOA", 'c(1,2)',  sep="")
for(md_name in colnames(md)) {
	md_values <- unique(md[,md_name])
  md_val_count<-length(md_values)
  #print(md_values)
  main <- paste("PCoA using",method_text," ( metadata:", md_name, ")")
  pch<-c(21,22)
  #print(md_val_count)
	#par(xpd=NA, mar = c(5, 4, 4, 4) + 0.1)
	c=colors6[0]
	cex=1.0	# size of the data points
		
		#print(sum(pcoa$values[as.integer(substring(axes_labels[1], 1, 1))]))
		#print(sum(pcoa$values[1:2]))
		#print('x')
		
		xlabel <- paste("PCoA", substring(axes_labels[1],1,1), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[1], 1, 1))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
	  ylabel <- paste("PCoA", substring(axes_labels[1],2,2), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[1], 2, 2))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
		plot(pcoa$vectors[,axes[[1]]], type="n", main = main, xlab=xlabel, ylab=ylabel)
		for(i in 1:md_val_count){
			
			prows <- grep(md_values[i], md[,md_name])
			print(prows)
			pts<-pcoa$vectors[prows,axes[[1]]]
			
			points(pts, cex=cex)	
			text(pts, labels = rownames(pcoa$vectors)[prows], adj=c(0.25,-0.5), cex=cex, col=c)
			

			#print(pts)
		}
		result2<-tryCatch(
			{
							xlabel <- paste("PCoA", substring(axes_labels[2],1,1), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[1], 1, 1))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
						  ylabel <- paste("PCoA", substring(axes_labels[2],2,2), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[2], 2, 2))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
							plot(pcoa$vectors[,axes[[2]]], type="n", main = main, xlab=xlabel, ylab=ylabel)
							for(i in 1:md_val_count){
								prows <- grep(md_values[i], md[,md_name])
								#print(prows)
								pts<-pcoa$vectors[prows,axes[[2]]]
								points(pts, cex=cex)	
								#print(pts)
							}
			},
			error=function(cond) {
          message(paste("URL does not seem to exist:", url))
          message("Here's the original error message:")
          message(cond)
          # Choose a return value in case of error
          return(NA)
      },
      warning=function(cond) {
          message(paste("URL caused a warning:", url))
          message("Here's the original warning message:")
          message(cond)
          # Choose a return value in case of warning
          return(NULL)
      },
      finally={
      	print('finally 2')
      }
      
		)
		result3<-tryCatch(
			{
							xlabel <- paste("PCoA", substring(axes_labels[3],1,1), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[3], 1, 1))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
						  ylabel <- paste("PCoA", substring(axes_labels[3],2,2), " (", round((sum(pcoa$values[as.integer(substring(axes_labels[3], 2, 2))])/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
							plot(pcoa$vectors[,axes[[3]]], type="n", main = main, xlab=xlabel, ylab=ylabel)
							for(i in 1:md_val_count){
								prows <- grep(md_values[i], md[,md_name])
								#print(prows)
								pts<-pcoa$vectors[prows,axes[[3]]]
								points(pts, cex=cex)	
								#print(pts)
							}
			},
			error=function(cond) {
          message(paste("URL does not seem to exist:", url))
          message("Here's the original error message:")
          message(cond)
          # Choose a return value in case of error
          return(NA)
      },
      warning=function(cond) {
          message(paste("URL caused a warning:", url))
          message("Here's the original warning message:")
          message(cond)
          # Choose a return value in case of warning
          return(NULL)
      },
      finally={
      	print('finally 3')
      }
      
		)
	
}
dev.off()
q()






for(md_name in colnames(md))
{
    print(md_name)
    
    md_values <- unique(md[,md_name])
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
	
	#par(xpd=NA, mar = c(5, 4, 4, 18) + 0.1)
	
	#pts<-pcoa$vectors[prows,c(1,2)]
	#print(mypalette)
	# for (ax in c(1,2,3))
	# {
	
	# 	#xlabel <- paste("PCOA", substring(axes_labels[ax],1,1), " (", round((pcoa$values[as.integer(substring(axes_labels[1], 1, 1))]/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
	# 	#ylabel <- paste("PCOA", substring(axes_labels[ax],2,2), " (", round((pcoa$values[as.integer(substring(axes_labels[ax], 2, 2))]/sum(pcoa$values[1:3]))*100, 1), "%)", sep="")
	 
	# 	# The main title, 
	# 	main <- paste("PCoA using",method_text," ( metadata:", md_name, ")")
	# 	par(xpd=NA, mar = c(5, 4, 4, 18) + 0.1)
		
	# 	#plot(pcoa$vectors[,axes[[ax]]], main = main, xlab='xlabel', ylab='ylabel')
	# 	plot(pcoa$vectors[,axes[[ax]]], type="n", main = 'main', xlab='xlabel', ylab='ylabel')
	# 	#print(md_name)
	# 	ymax=par('usr')[4]
	# 	xmax=par('usr')[2]
		
		
		
	# 	for(i in 1:md_val_count)
	# 	{
	# 		prows <- grep(md_values[i], md[,md_name])
	# 		#print(prows)
			
	# 		if(length(prows)==1)
	# 		{
	# 			# this is needed for single data points; 
	# 			# it turns a vector into the correct matrix
	# 			#pts<-t(pcoa$vectors[prows,axes[[ax]]])
				
	# 		}else{
	# 			pts<-pcoa$vectors[prows,axes[[ax]]]
	# 		}
	# 		print(pts)
			
	# 		if(md_val_count > maxLength){
	# 			c=one_color	
	# 			p=one_shape
	# 		}else{
	# 			c=mypalette[i]
	# 			p=myshapes[i]
	# 		}
					
			
	# 		# if(labels_on_the_plot){
	# 		# 	cex = 1.2
	# 		# 	text  (pts, labels = rownames(pcoa$points)[prows], adj=c(0.25,-0.5), cex=cex, col=c)
	# 		# }else{
	# 		# 	cex = 3			
	# 		# }
	# 		cex=1.2
	# 		points(pts, col=c,  pch=p, cex=cex)	
			
	# 	}
	# 	if(md_val_count > maxLength){
	# 		c=one_color
	# 		p=one_shape
	# 	}else{
	# 		c=mypalette	
	# 		p=myshapes
	# 	}
	# 	#legend(x=xmax+0.05, y=ymax, legend=md_values, col=c, title=md_name, pch=p, cex=1.2)
	# 	#legend(x=xmax+0.05, y=ymax, legend=md_values, col=c, fill=c, border='black', title=md_name, pch=myshapes)
        
 #    }
}
dev.off()






