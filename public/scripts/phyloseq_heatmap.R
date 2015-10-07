#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path <- args[1]
prefix   <-  args[2]
dist_metric<-args[3]
phy   <- args[4]
md1 <- args[5]
ord_type <- args[6]
fill <- args[7]
biom_file <- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
tax_file <-  paste(tmp_path,'/',prefix,'_taxonomy.txt',sep='')
map_file <-  paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

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
library(scales)
library(phyloseq)
#library(ggplot2)

TAX<-as.matrix(read.table(tax_file,header=TRUE, sep = "\t",row.names = 1,as.is=TRUE))
OTU <- import_biom(biom_file)
MAP <- import_qiime_sample_data(map_file)
TAX <- tax_table(TAX)
OTU <- otu_table(OTU)
physeq <- phyloseq(OTU,TAX,MAP)

#TopNOTUs <- names(sort(taxa_sums(physeq), TRUE)[1:10])

#w = 14
#h = 11
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


	out_file = paste("tmp/",prefix,"_phyloseq_heatmap.svg",sep='')
	unlink(out_file)
	#svg(out_file, width=w, height=h)
	#png(out_file, width=w, height=h)
	svg(out_file)
	gpac <- subset_taxa(physeq, Phylum==phy)
	gpac = prune_samples(sample_sums(gpac) > 50, gpac)
	#gpac50 <-names(sort(taxa_sums(gpac),TRUE)[1:50])
	#gpac50<-prune_taxa(gpac50, gpac)
	plot_heatmap(gpac, method=ord_type, distance=dist, sample.label=md1, taxa.label=fill, na.value = "black",)

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