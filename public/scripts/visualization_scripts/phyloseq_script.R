#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path <- args[1]
prefix   <-  args[2]
plot_type<- args[3]
md1 <- args[5]
md2 <- args[6]
biom_file <- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
tax_file <-  paste(tmp_path,'/',prefix,'_taxonomy.txt',sep='')
map_file <-  paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

dist     <-  'bray'

if(args[4]  == "morisita_horn"){
	dist = 'horn'
	disp = "Morisita-Horn"
}else if(args[4] == "jaccard"){
	dist = 'jaccard'
	disp = "Jaccard"
}else if(args[4] == "kulczynski"){
	dist = 'kulczynski'
	disp = "Kulczynski"
}else if(args[4] == "canberra"){
	dist = 'canberra'
	disp = "Canberra"
}else if(args[4] == "bray_curtis"){
	dist = 'bray'
	disp = "Bray_Curtis"
}

#biom_file<- "andy_1443630794574_count_matrix.biom"
#tax_file <- "andy_1443630794574_taxonomy.txt"
#map_file <- "andy_1443630794574_metadata.txt"

library(phyloseq)
library(ggplot2)
library(vegan)
TAX<-as.matrix(read.table(tax_file,header=TRUE, sep = "\t",row.names = 1,as.is=TRUE))
OTU <- import_biom(biom_file)
MAP <- import_qiime_sample_data(map_file)
TAX <- tax_table(TAX)
OTU <- otu_table(OTU)
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

w = 14
h = 11
w = 7
h = 5
#theme_set(theme_bw())
# pal = "Set1"
# scale_colour_discrete <- function(palname = pal, ...) {
#     scale_colour_brewer(palette = palname, ...)
# }
# scale_fill_discrete <- function(palname = pal, ...) {
#     scale_fill_brewer(palette = palname, ...)
# }
theme_set(theme_bw())

if(plot_type == 'bar'){
	out_file = paste("tmp/",prefix,"_phyloseq_bar.svg",sep='')
	svg(out_file, width=w, pointsize=6, family = "sans", bg = "black")
	plot_bar(physeq, fill = "Phylum")

}else if(plot_type == 'heatmap'){
	out_file = paste("tmp/",prefix,"_phyloseq_heatmap.svg",sep='')
	#svg(out_file, width=w, height=h)
	#png(out_file, width=w, height=h)
	svg(out_file,width=w)
	gpac <- subset_taxa(physeq, Phylum=="Acidobacteria")
	gpt <- subset_taxa(physeq, Domain=="Bacteria")
	plot_heatmap(gpt)
}else if(plot_type == 'network'){
	out_file = paste("tmp/",prefix,"_phyloseq_network.svg",sep='')
	svg(out_file, width=w, pointsize=6, family = "sans", bg = "black")
	plot_net(physeq, maxdist = 0.3, color = md2, shape = md1)

}else if(plot_type == 'ord1'){

	# 3- PCoA on 'bray' Distance
	#ord_type = 'NMDS'
	ord_type = 'PCoA'
	out_file = paste("tmp/",prefix,"_phyloseq_ord1.svg",sep='')
	svg(out_file, width=w, pointsize=6, family = "sans", bg = "black")
	ordu = ordinate(physeq, ord_type, dist)
	p = plot_ordination(physeq, ordu, color = md2, shape = md1)
	p = p + geom_point(size = 7, alpha = 0.75)
	p = p + scale_colour_brewer(type = "qual", palette = "Paired")
	#p = p + scale_colour_brewer()
	p + ggtitle(paste(ord_type, "on distance:", disp, sep=' '))

}else if(plot_type == 'tree'){
	out_file = paste("tmp/",prefix,"_phyloseq_tree.svg",sep='')
	svg(out_file, width=w, pointsize=6, family = "sans", bg = "black")
}else{
    cat("plot_type must be one of: 'bar', 'heatmap', 'network', 'ord1' or 'tree' -- Exiting\n")
    quit()
}
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