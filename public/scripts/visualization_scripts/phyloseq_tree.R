#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path 		<- args[1]
prefix   		<- args[2]
out_file 		<- args[3]
dist_metric	<- args[4]
md1					<- args[5]
biom_file 	<- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
tax_file 		<- paste(tmp_path,'/',prefix,'_taxonomy.txt',sep='')
map_file 		<- paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

dist     <-  'bray'

if(dist_metric  == "morisita_horn"){
	dist = 'horn'
	disp = "Morisita-Horn"
}else if(dist_metric == "jaccard"){
	dist = 'jaccard'
	disp = "Jaccard"
}else if(dist_metric == "kulczynski"){
	dist = 'kulczynski'
	disp = "Kulczynski"
}else if(dist_metric == "canberra"){
	dist = 'canberra'
	disp = "Canberra"
}else if(dist_metric == "bray_curtis"){
	dist = 'bray'
	disp = "Bray_Curtis"
}



#biom_file<- "andy_1443630794574_count_matrix.biom"
#tax_file <- "andy_1443630794574_taxonomy.txt"
#map_file <- "andy_1443630794574_metadata.txt"

library(phyloseq)
library(ggplot2)
library(vegan)
library(ape)

TAX<-as.matrix(read.table(tax_file,header=TRUE, sep = "\t",row.names = 1,as.is=TRUE))
OTU <- import_biom(biom_file)
MAP <- import_qiime_sample_data(map_file)
TAX <- tax_table(TAX)
OTU <- otu_table(OTU)
#physeq <- phyloseq(OTU,TAX,MAP)
#TopNOTUs <- names(sort(taxa_sums(physeq), TRUE)[1:10])
#biods=t(OTU)
biods=OTU
stand=decostand(data.matrix(biods),"total")
d=vegdist(stand, method=dist,upper=FALSE,binary=FALSE)

###################################################
# WRITE DISTANCE TABLE
distance_file <- paste(tmp_path,'/',prefix,'_distance.R',sep='')
write.table(as.matrix(d), file=distance_file)
####################################################
hc<-hclust(d)
phylo<-as.phylo(hc);
physeq <- phyloseq(OTU,TAX,MAP,phylo)

tree_file<-paste(tmp_path,'/',prefix,'_outtree.tre',sep='')
write.tree(phylo, file=tree_file)
#dend <- as.dendrogram(hc)
#physeq1 = merge_phyloseq(physeq, phylo)
# get rid of datasets with zero sum over all the taxa:
#data_matrix<-data_matrix[,colSums(data_matrix) > 0]
#biods = t(data_matrix); #
#print(biods);
#require(vegan,quietly=TRUE);
#stand <-decostand(data.matrix(biods),"total");
#  http://cc.oulu.fi/~jarioksa/softhelp/vegan/html/vegdist.html
# must use upper=FALSE so that get_distanceR can parse the output correctly
#dis <- 0
#if(metric == "horn"){
#   dis<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
#}
#library(ape);
#hc = upgma(dd);
#hc<-hclust(dis); 

# ape as.phylo is a generic function which converts an object into a tree of class "phylo".
#phc<-as.phylo(hc);
#dend <- as.dendrogram(hc)
#  write tree to: 
#tree_file<-paste('/usr/local/www/vamps/tmp/',prefix,'_outtree.tre',sep='')
#write.tree(phc, file=tree_file)
tx_count<-nrow(OTU)
h = floor(tx_count/8)
if(h <= 5)
{
    h = 5
}
w = 8

#theme_set(theme_bw())
# pal = "Set1"
# scale_colour_discrete <- function(palname = pal, ...) {
#     scale_colour_brewer(palette = palname, ...)
# }
# scale_fill_discrete <- function(palname = pal, ...) {
#     scale_fill_brewer(palette = palname, ...)
# }
#theme_set(theme_bw())


out_file = paste(tmp_path,'/',out_file,sep='')
svg(out_file, width=w, height=h, pointsize=6, family = "sans", bg = "black")
plot_title=paste('Taxonomy Tree; distance: ',disp,sep='')
#plot_tree(physeq,  color = md1, title = 'Tree Title', ladderize = "left")
plot_tree(physeq,  color = md1, title = plot_title)

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