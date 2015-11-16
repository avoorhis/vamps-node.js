#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

tmp_path   <- args[1]
prefix     <- args[2]
out_file   <- args[3]
dist_metric<- args[4]
phy        <- args[5]
md1        <- args[6]
ord_type   <- args[7]
fill       <- args[8]
biom_file  <- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
tax_file   <- paste(tmp_path,'/',prefix,'_taxonomy.txt',sep='')
map_file   <- paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

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
library(ggplot2)
theme_set(theme_bw())
TAX1<-as.matrix(read.table(tax_file,header=TRUE, sep = "\t",row.names = 1,as.is=TRUE))
TAX <- tax_table(TAX1)
OTU <- import_biom(biom_file)
OTU <- otu_table(OTU)
MAP <- import_qiime_sample_data(map_file)

#print(colnames(TAX))
#print(class(TAX))
#print(is.recursive(TAX))
#print(is.atomic(TAX))

df <- as.data.frame(TAX)[fill]
rows <- nrow(df)
print(df)
print(ncol(df))
print(rows)
physeq <- phyloseq(OTU,TAX,MAP)

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
w_png = ds_count*20
h_png = rows*5
	out_file = paste("tmp/",out_file,sep='')
	unlink(out_file)
	#print(physeq)
	#pdf(out_file, width=w, height=h, pointsize=6, family = "sans", bg = "black")
	#png(out_file, width=w_png, height=h_png)
	svg(out_file, width=w_svg, height=h_svg, pointsize=6, family = "sans", bg = "black")
	gpac <- subset_taxa(physeq, Phylum==phy)
	#gpac = prune_samples(sample_sums(gpac) > 50, gpac)

	gpac <- tryCatch({ 
			  prune_samples(sample_sums(gpac) > 50, gpac)
		}, error = function(err) {
 			  cat(paste("ERROR -- no data available for '",phy,"' after subsetting\n",sep=''))
  		  q()
		},
		finally = { 
			
		})
	plot_title = paste('Phylum:',phy, sep=' ')
	print(gpac)
	plot_heatmap(gpac, method=ord_type, distance=dist, title=plot_title, sample.label=md1, taxa.label=fill, na.value = "black",)

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