#!/usr/bin/env Rscript

args <- commandArgs(TRUE)
print(args)

library(phyloseq)
library(vegan)
library(ape)
library(RColorBrewer)

## Not run:
if (require(vegan)) {
data(mite)  # Community composition data, 70 peat cores, 35 species
 #print(mite)
# Select rows 1:30. Species 35 is absent from these rows. Transform to log
mite.log <- log(mite[1:30,-35]+1)  # Equivalent: log1p(mite[1:30,-35])
#print(class(mite[1:30,-35]+1))
# Principal coordinate analysis and simple ordination plot
d <- vegdist(mite.log, "bray")
#print(mite.D)
#print(d)
#q()
pcoa_data <- pcoa(d)
pcoa_data$values
print(pcoa_data)

biplot(pcoa_data)
 
# Project unstandardized and standardized species on the PCoA ordination plot
mite.log.st = apply(mite.log, 2, scale, center=TRUE, scale=TRUE)
 
par(mfrow=c(1,2))
biplot(pcoa_data, mite.log)
biplot(pcoa_data, mite.log.st)
 
# Reverse the ordination axes in the  plot
#par(mfrow=c(1,2))
#biplot(pcoa_data, mite.log, dir.axis1=-1, dir.axis2=-1)
#biplot(pcoa_data, mite.log.st, dir.axis1=-1, dir.axis2=-1)
}
## End(Not run)
dev.off()



