#!/usr/bin/env Rscript
library(ggplot2)
library(vegan)
library(dplyr)
library(scales)
library(grid)
library(reshape2)
library(phyloseq)

args <- commandArgs(TRUE)
print(args)

process_path <- args[1]
metric      <- args[2]
prefix      <- args[3]
taxa_label <- args[4]
# Set plotting theme
theme_set(theme_bw())

taxa_label  <- paste(toupper(substr(taxa_label, 1, 1)),substr(taxa_label, 2, nchar(taxa_label)),sep='')
if(taxa_label == 'Klass'){
    taxa_label <- 'Class'
}
md1 <- 'X.SampleID'
phy <- 'Proteobacteria'
ord_type <- 'NMDS'
tmp_path   <- paste(process_path,'/tmp/',sep='')
biom_file  <- paste(tmp_path, prefix,'_count_matrix.biom',sep='')
tax_file   <- paste(tmp_path, prefix,'_taxonomy.txt',sep='')
map_file   <- paste(tmp_path, prefix,'_metadata.txt',sep='')
image_file <- paste(tmp_path, prefix,'_phyloseq_test.svg',sep='')
print(tax_file)
dist     <-  'bray'

if(metric  == "morisita_horn"){
	dist = 'horn'
	disp = "Morisita-Horn"
}else if(metric == "jaccard"){
	dist = 'jaccard'
	disp = "Jaccard"
}else if(metric == "kulczynski"){
	dist = 'kulczynski'
	disp = "Kulczynski"
}else if(metric == "canberra"){
	dist = 'canberra'
	disp = "Canberra"
}else if(metric == "bray_curtis"){
	dist = 'bray'
	disp = "Bray_Curtis"
}


TAX1<-as.matrix(read.table(tax_file, header=TRUE, sep = "\t", row.names = 1,as.is=TRUE))
TAX <- tax_table(TAX1)
OTU <- import_biom(biom_file)
OTU <- otu_table(OTU)
MAP <- import_qiime_sample_data(map_file)






###################################################
# WRITE DISTANCE TABLE
biods <- OTU
stand <- decostand(data.matrix(biods),"total")
d <- vegdist(stand, method=dist,upper=FALSE,binary=FALSE)
distance_file <- paste(tmp_path, prefix,'_distance.R',sep='')
write.table(as.matrix(d), file=distance_file)
####################################################
#print(colnames(TAX))
#print(class(TAX))
#print(is.recursive(TAX))
#print(is.atomic(TAX))
#print(MAP)

df <- as.data.frame(TAX)[taxa_label]
rows <- nrow(df)





physeq <- merge_phyloseq(OTU,TAX,MAP)
MAP

physeq
#  https://www.bioconductor.org/packages/devel/bioc/vignettes/phyloseq/inst/doc/phyloseq-basics.html#import-data
most_abundant_taxa20 <- sort(taxa_sums(physeq), TRUE)[1:20]
ex20 <- prune_taxa(names(most_abundant_taxa20), physeq)
ex20
topFamilies <- tax_table(ex20)[, "Family"]
as(topFamilies, "vector")


phylum_colors <- c(
  "#CBD588", "#5F7FC7", "orange","#DA5724", "#508578", "#CD9BCD",
   "#AD6F3B", "#673770","#D14285", "#652926", "#C84248", 
  "#8569D5", "#5E738F","#D1A33D", "#8A7C64", "#599861"
)

ggplot(ex20, aes(x = X.SampleID,  fill = Phylum))
q()


ds_count<-ncol(OTU)
w = floor(ds_count/5)
if(w <= 7){ w = 10 }
h = floor(rows/10)
#print(paste('height1',h))
#if(rows < 5){	h = 5 }
h = 8
#print(paste('height2',h))

w_svg=ds_count*0.5
h_svg=rows*0.1
# with must be related to md1 count
md1_unique_count <- length(levels(MAP[[md1]]))
w_png = 200 + (md1_unique_count*50)
#w_png=300
h_png = rows*5


svg(image_file, width=w_svg, height=5, pointsize=11, family = "sans")

gpac <- subset_taxa(physeq, Phylum==phy)

# #gpac = prune_samples(sample_sums(gpac) > 50, gpac)
# #plot_heatmap(gpac)
gpac <- prune_taxa(names(sort(taxa_sums(gpac), TRUE)[1:50]), gpac)
gpac <- tryCatch({ 
		  			prune_samples(sample_sums(gpac) > 50, gpac)   # prune
		  			
			}, 
			error = function(err) {
					  cat(paste("ERROR -- no data available for '",phy,"' after subsetting\n",sep=''))
				  	q()
			},
			finally = { 
				
		})


print(gpac)
plot_title = paste('Phylum:',phy, sep=' ')
image_type <- 'ordination'  ## heatmap, ordination, bar, tree
if(image_type == 'heatmap'){
    p <- plot_heatmap(gpac, method=ord_type, distance=dist, title=plot_title, sample.label=md1, taxa.label=taxa_label, low="#000033", high="#CCFF66")
    #p <- plot_heatmap(gpac, method=ord_type, distance=dist, title=plot_title,  sample.label='X.SampleID', taxa.label=taxa_label, na.value = "black")
}else if(image_type == 'ordination'){
    ordu = ordinate(gpac, "NMDS", dist)
    p<-plot_ordination(gpac, ordu, type="taxa", color=md1)
    #p + facet_wrap(~Phylum, 3)
}
print(p$scales)
print(p)
# Ordination:  http://joey711.github.io/phyloseq/plot_ordination-examples.html
# GP.ord <- ordinate(physeq, "NMDS", "bray")

# 1- Just OTUs
# p1 = plot_ordination(physeq, GP.ord, type = "taxa", color = "Phylum", title = "taxa")
# print(p1)
# p1 + facet_wrap(~Phylum, 9)  # 9 rows of graphs

# 2- Just Samples
# metadata item to show shapes
# shape_item <- "env_biome"   # metadata item in map file
# color_item <- "env_feature" # metadata item in map file
# fill_item  <- "env_feature" # often same as color_item "BUT NO PARENS"
# p2 = plot_ordination(physeq, GP.ord, type = "samples", color = color_item, shape = shape_item)
# p2 + geom_polygon(aes(fill = fill_item)) + geom_point(size = 5) + ggtitle("samples")


dev.off()