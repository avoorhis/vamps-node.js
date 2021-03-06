#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path 		<- args[1]
prefix   		<- args[2]
out_file 		<- args[3]
dist_metric	<- args[4]
md1 				<- args[5]
md2 				<- args[6]
ord_type 		<- args[7]
biom_file 	<- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
tax_file 		<-  paste(tmp_path,'/',prefix,'_taxonomy.txt',sep='')
map_file 		<-  paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

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
TAX<-as.matrix(read.table(tax_file, header=TRUE, sep = "\t", row.names = 1, as.is=TRUE))
TAX <- tax_table(TAX)
OTU <- import_biom(biom_file)
OTU <- otu_table(OTU)
MAP <- import_qiime_sample_data(map_file)
physeq <- phyloseq(OTU,TAX,MAP)
#TopNOTUs <- names(sort(taxa_sums(physeq), TRUE)[1:10])

###################################################
# WRITE DISTANCE TABLE
biods <- OTU
stand <- decostand(data.matrix(biods),"total")
d <- vegdist(stand, method=dist,upper=FALSE,binary=FALSE)
distance_file <- paste(tmp_path,'/',prefix,'_distance.R',sep='')
write.table(as.matrix(d), file=distance_file)
####################################################
#w = 14
#h = 11
w = 10
h = 8

md1_unique_count <- length(levels(MAP[[md1]]))
md2_unique_count <- length(levels(MAP[[md2]]))
# if(md1_unique_count + md2_unique_count > 60){
# 	cat("ERROR - Too many unique metadata items\n")
# 	q()
# }

#theme_set(theme_bw())
# pal = "Set1"
# scale_colour_discrete <- function(palname = pal, ...) {
#     scale_colour_brewer(palette = palname, ...)
# }
# scale_fill_discrete <- function(palname = pal, ...) {
#     scale_fill_brewer(palette = palname, ...)
# }
#theme_set(theme_bw())

colourCount = ncol(OTU)
library(RColorBrewer)
cols = colorRampPalette(brewer.pal(9, "Set1"))(colourCount)

	# 3- PCoA on 'bray' Distance
	#ord_type = 'NMDS'
	#ord_type = 'PCoA'
	out_file = paste(tmp_path,'/',out_file,sep='')
	svg(out_file, width=w, height=h, pointsize=4, family = "sans", bg = "black")
	ordu = ordinate(physeq, ord_type, dist)
	#ordu = ordinate(physeq, "PCoA", "unifrac", weighted=TRUE)
	p = plot_ordination(physeq, ordu, color = md2, shape = md1)
	p = p + geom_point(size = 3, alpha = 0.75)
	#p = p + scale_colour_brewer(cols)
	#p = p + scale_colour_brewer()
	p = p + scale_color_manual(values = cols)
	#p = p + theme(legend.text = element_text(size = 6))
	p + ggtitle(paste(ord_type, "on distance:", disp, sep=' '))
	#p + theme_bw() + theme(text = element_text(size = 10))


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