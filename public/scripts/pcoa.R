args <- commandArgs(TRUE)
url <- args[1]
metadata_in<- args[2]
method    <- args[3]
label_on_plot<- args[4]

if(label_on_plot=='yes'){
	labels_on_the_plot<-TRUE
}else{
	labels_on_the_plot<-FALSE
}


library(labdsv)
library(RColorBrewer)

library(jsonlite,quietly=TRUE)
require(vegan,quietly=TRUE);

#myjson<-fromJSON(paste('./tmp/',url,sep=''))
myjson<-fromJSON(url)

data_matrix<-myjson$data
rownames(data_matrix)<-myjson$rows$id
colnames(data_matrix)<-myjson$columns$id
no_of_datasets<-length(colnames(data_matrix))
# Rscript --no-save --slave --no-restore pcoa.R node_matrix.mtx vamps_metadata.txt horn yes

#metadata_in<-paste("/usr/local/www/vamps/docs/tmp/",prefix,"_metadata.txt",sep='')
# the QIIME map file doesnt work well: linkerprimersequence,project,dataset,dataset_description
#mtx<-read.delim(matrix_in, header=T,sep="\t",check.names=TRUE,row.names=1);  # counts of taxa and ds
md<-read.delim(metadata_in, header=T,sep="\t",check.names=TRUE,row.names=1); # list of datasets with metadata valus
tmp_matrix <- data_matrix[rowSums(data_matrix) > 0,]


biods = t(data_matrix);

axes=list(c(1:2), c(1,3), c(2:3))
axes_labels <- c("12", "13", "23")
stand <-decostand(data.matrix(biods),"total");
if(method=="horn")
{
    d<-vegdist(stand, method="horn",upper=TRUE,binary=FALSE);
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
    d<-vegdist(stand, method="horn",upper=TRUE,binary=FALSE);
    method_text<-"Morisita-Horn"
}
#print(no_of_datasets)
if(no_of_datasets < 4){
	k=no_of_datasets-1
}else{
	k=4
}
#print(k)
pcoa <- pco(d, k=k)
#pcoa2 <- pcoa(d)
#print(pcoa)
# pcoa$points provides the points for all of the samples (matrix columns), and I have conveniently named my matrix columns
# this gives a new matrix with only the 
#print(md)
#print(a_mtx)
for(md_name in colnames(md))
{
    #print(md_name)
}
# write this to a file for download

#print(pcoa)
#point_file<-'tmp/vamps_out.txt'
#cat("pc\n", file = point_file)
#write.table(pcoa$points, file = point_file, append = TRUE, quote = FALSE, col.names = FALSE, sep="\t" )

# creating this for make_emperor.py qiime script
# cat("\n\neigvals\t", append = TRUE, file = point_file)
# eig_vals <- paste(pcoa$eig[1], pcoa$eig[2], pcoa$eig[3], pcoa$eig[4], sep="\t")
# cat(eig_vals, append = TRUE, file = point_file)
# sum_eigs <- sum(pcoa$eig[1:4])
# cat("\n% variation explained\t", append = TRUE, file = point_file)
# eig_pcts <- paste((pcoa$eig[1]*100)/sum_eigs, (pcoa$eig[2]*100)/sum_eigs, (pcoa$eig[3]*100)/sum_eigs, (pcoa$eig[4]*100)/sum_eigs, sep="\t")
# cat(eig_pcts, append = TRUE, file = point_file)


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
pdf_file = 'tmp/vamps_pcoa.pdf'

h=(num_md_items*5)+2
pdf(pdf_file, width=25, height=h, title='PDF Title')
par(mfrow=c(num_md_items,3))


for(md_name in colnames(md))
{
    #print(md_name)
    #  but you need the list of datasets for each metadata value.
    #  how do i find all the discreet values for this md_name?    
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
	
	#print(mypalette)
	for (ax in c(1,2,3))
	{
	
		xlabel <- paste("PCOA", substring(axes_labels[ax],1,1), " (", round((pcoa$eig[as.integer(substring(axes_labels[1], 1, 1))]/sum(pcoa$eig[1:3]))*100, 1), "%)", sep="")
		ylabel <- paste("PCOA", substring(axes_labels[ax],2,2), " (", round((pcoa$eig[as.integer(substring(axes_labels[ax], 2, 2))]/sum(pcoa$eig[1:3]))*100, 1), "%)", sep="")
	 
		# The main title, 
		main <- paste("PCoA using",method_text," ( metadata:", md_name, ")")
		par(xpd=NA, mar = c(5, 4, 4, 18) + 0.1)
		
		#plot(pcoa$points[,axes[[ax]]], main = main, xlab=xlabel, ylab=ylabel)
		plot(pcoa$points[,axes[[ax]]], type="n", main = main, xlab=xlabel, ylab=ylabel)
		#print(md_name)
		ymax=par('usr')[4]
		xmax=par('usr')[2]
		
		#print(paste(main,' --> ',xlabel,' -- ',ylabel))
		
		for(i in 1:md_val_count)
		{
			prows <- grep(md_values[i], md[,md_name])
			
			if(length(prows)==1)
			{
				# this is needed for single data points; 
				# it turns a vector into the correct matrix
				pts<-t(pcoa$points[prows,axes[[ax]]])
				
			}else{
				pts<-pcoa$points[prows,axes[[ax]]]
			}
			
			if(md_val_count > maxLength){
				c=one_color	
				p=one_shape
			}else{
				c=mypalette[i]
				p=myshapes[i]
			}
					
			
			if(labels_on_the_plot){
				cex = 1.2
				text  (pts, labels = rownames(pcoa$points)[prows], adj=c(0.25,-0.5), cex=cex, col=c)
			}else{
				cex = 3			
			}
			points(pts, col=c,  pch=p, cex=cex)	
			
		}
		if(md_val_count > maxLength){
			c=one_color
			p=one_shape
		}else{
			c=mypalette	
			p=myshapes
		}
		legend(x=xmax+0.05, y=ymax, legend=md_values, col=c, title=md_name, pch=p, cex=1.2)
		#legend(x=xmax+0.05, y=ymax, legend=md_values, col=c, fill=c, border='black', title=md_name, pch=myshapes)
        
    }
}
dev.off()




