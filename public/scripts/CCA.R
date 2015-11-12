#!/usr/bin/env Rscript


# ============================================================
# Tutorial on drawing a CCA plot with significant environmental variables using ggplot2
# by Umer Zeeshan Ijaz (http://userweb.eng.gla.ac.uk/umer.ijaz)
# =============================================================
 
args <- commandArgs(TRUE)
print(args)

tmp_path 	<- args[1]
prefix   	<- args[2]
metric 		<- args[3]
out_file	<- args[4]
#out_file <- args[3]
#phy   	 <- args[4]
#rank     <- args[5]
biom_file <- paste(tmp_path,'/',prefix,'_count_matrix.biom',sep='')
map_file <- paste(tmp_path,'/',prefix,'_metadata.txt',sep='')

library(phyloseq)
library(vegan)
library(grid)
library(ggplot2)

abund_table <- import_biom(biom_file)
meta_table <- import_qiime_sample_data(map_file)
meta_table <- data.frame(meta_table)

# this gets rid of empty colums:  BarcodeSequence LinkerPrimerSequence
meta_table <- meta_table[,colSums(is.na(meta_table))<nrow(meta_table)]
print(class(meta_table))

print(meta_table)

 
#abund_table<-read.csv("SPE_pitlatrine.csv",row.names=1,check.names=FALSE)
#Transpose the data to have sample names on rows
abund_table<-t(abund_table)
 
#meta_table<-read.csv("ENV_pitlatrine.csv",row.names=1,check.names=FALSE)
 
#Just a check to ensure that the samples in meta_table are in the same order as in abund_table
meta_table<-meta_table[rownames(abund_table),]
 
#Filter out any samples taxas that have zero entries 
abund_table<-subset(abund_table,rowSums(abund_table)!=0)
 

#Convert to relative frequencies
abund_table<-abund_table/rowSums(abund_table)
 
#Use adonis to find significant environmental variables
abund_table.adonis <- adonis(abund_table ~ ., data=meta_table)
print(abund_table.adonis)

#> abund_table.adonis
#Call:
#  adonis(formula = abund_table ~ ., data = meta_table) 
#Permutation: free
#Number of permutations: 999
#
#Terms added sequentially (first to last)
#
#Df SumsOfSqs MeanSqs F.Model      R2 Pr(>F)    
#pH          1    0.2600 0.26002  2.1347 0.01974  0.067 .  
#Temp        1    1.6542 1.65417 13.5806 0.12559  0.001 ***
#TS          1    0.8298 0.82983  6.8128 0.06300  0.001 ***
#VS          1    0.3143 0.31434  2.5807 0.02387  0.038 *  
#VFA         1    0.2280 0.22796  1.8715 0.01731  0.109    
#CODt        1    0.1740 0.17400  1.4285 0.01321  0.209    
#CODs        1    0.0350 0.03504  0.2877 0.00266  0.909    
#perCODsbyt  1    0.1999 0.19986  1.6409 0.01517  0.148    
#NH4         1    0.1615 0.16154  1.3262 0.01226  0.236    
#Prot        1    0.3657 0.36570  3.0024 0.02777  0.024 *  
#Carbo       1    0.5444 0.54439  4.4693 0.04133  0.003 ** 
#Residuals  69    8.4045 0.12180         0.63809           
#Total      80   13.1713                 1.00000           
#---
#  Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1
 
#Extract the best variables
bestEnvVariables<-rownames(abund_table.adonis$aov.tab)[abund_table.adonis$aov.tab$"Pr(>F)"<=0.01]
 
#Last two are NA entries, so we have to remove them
bestEnvVariables<-bestEnvVariables[!is.na(bestEnvVariables)]
 
#We are now going to use only those environmental variables in cca that were found significant
#eval(parse(text=paste("sol <- cca(abund_table ~ ", do.call(paste,c(as.list(bestEnvVariables),sep=" + ")),",data=meta_table)",sep="")))
 
#You can use the following to use all the environmental variables
sol<-cca(abund_table ~ ., data=meta_table)
 
scrs<-scores(sol,display=c("sp","wa","lc","bp","cn"))
 
#Check the attributes
# > attributes(scrs)
# $names
# [1] "species"     "sites"       "constraints" "biplot"     
# [5] "centroids"  
 
#Extract site data first
df_sites<-data.frame(scrs$sites,t(as.data.frame(strsplit(rownames(scrs$sites),"_"))))
colnames(df_sites)<-c("x","y","Country","Latrine","Depth")
 
#Draw sites
p<-ggplot()
p<-p+geom_point(data=df_sites,aes(x,y,colour=Country))
 
#Draw biplots
multiplier <- vegan:::ordiArrowMul(scrs$biplot)
 
# Reference: http://www.inside-r.org/packages/cran/vegan/docs/envfit
# The printed output of continuous variables (vectors) gives the direction cosines 
# which are the coordinates of the heads of unit length vectors. In plot these are 
# scaled by their correlation (square root of the column r2) so that "weak" predictors 
# have shorter arrows than "strong" predictors. You can see the scaled relative lengths 
# using command scores. The plotted (and scaled) arrows are further adjusted to the 
# current graph using a constant multiplier: this will keep the relative r2-scaled 
# lengths of the arrows but tries to fill the current plot. You can see the multiplier 
# using vegan:::ordiArrowMul(result_of_envfit), and set it with the argument arrow.mul. 
 
df_arrows<- scrs$biplot*multiplier
colnames(df_arrows)<-c("x","y")
df_arrows=as.data.frame(df_arrows)
 
p<-p+geom_segment(data=df_arrows, aes(x = 0, y = 0, xend = x, yend = y),
                 arrow = arrow(length = unit(0.2, "cm")),color="#808080",alpha=0.5)
 
p<-p+geom_text(data=as.data.frame(df_arrows*1.1),aes(x, y, label = rownames(df_arrows)),color="#808080",alpha=0.5)
 
# Draw species
df_species<- as.data.frame(scrs$species)
colnames(df_species)<-c("x","y")
 
# Either choose text or points
#p<-p+geom_text(data=df_species,aes(x,y,label=rownames(df_species)))
#p<-p+geom_point(data=df_species,aes(x,y,shape="Species"))+scale_shape_manual("",values=2)
 
p<-p+theme_bw()
pdf("CCA.pdf")
print(p)
dev.off()

