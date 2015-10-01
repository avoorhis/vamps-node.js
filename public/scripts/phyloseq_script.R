#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

biom_file <- args[1]
tax_file <-  args[2]
map_file <-  args[3]
prefix   <-  args[4]
dist     <-  'bray'
plot_type<- args[6]

if(args[5]  == "morisita_horn"){
	dist = 'horn'
}else if(args[5] == "jaccard"){
	dist = 'jaccard'
}else if(args[5] == "kulczynski"){
	dist = 'kulczynski'
}else if(args[5] == "canberra"){
	dist = 'canberra'
}else if(args[5] == "bray_curtis"){
	dist = 'bray'
}

#biom_file<- "andy_1443630794574_count_matrix.biom"
#tax_file <- "andy_1443630794574_taxonomy.txt"
#map_file <- "andy_1443630794574_metadata.txt"

library(phyloseq)
library(ggplot2)
TAX<-as.matrix(read.table(tax_file,header=TRUE, sep = "\t",row.names = 1,as.is=TRUE))
OTU <- import_biom(biom_file)
MAP <- import_qiime_sample_data(map_file)
TAX <- tax_table(TAX)
OTU <- otu_table(OTU)
physeq <- phyloseq(OTU,TAX,MAP)

w = 12
h = 11


if(plot_type == 'bar'){
	svg_file = paste("tmp/",prefix,"_phyloseq_bar.svg",sep='')
	svg(svg_file, width=w, height=h)
	plot_bar(physeq, fill = "Phylum")

}else if(plot_type == 'heatmap'){
	svg_file = paste("tmp/",prefix,"_phyloseq_heatmap.svg",sep='')
	svg(svg_file, width=w, height=h)
}else if(plot_type == 'network'){
	svg_file = paste("tmp/",prefix,"_phyloseq_network.svg",sep='')
	svg(svg_file, width=w, height=h)
}else if(plot_type == 'ord1'){

	# 3- PCoA on 'bray' Distance
	svg_file = paste("tmp/",prefix,"_phyloseq_ord1.svg",sep='')
	svg(svg_file, width=w, height=h)
	ordu = ordinate(physeq, "PCoA", dist, weighted = TRUE)
	p = plot_ordination(physeq, ordu, color = "Description", shape = "latitude")
	p = p + geom_point(size = 7, alpha = 0.75)
	p = p + scale_colour_brewer(type = "qual", palette = "Set1")
	p + ggtitle(paste("MDS/PCoA on",args[5],"distance",sep=' '))

}else if(plot_type == 'tree'){
	svg_file = paste("tmp/",prefix,"_phyloseq_tree.svg",sep='')
	svg(svg_file, width=w, height=h)
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