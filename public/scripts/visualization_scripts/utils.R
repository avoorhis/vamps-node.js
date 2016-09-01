#!/usr/bin/env Rscript

distance2 <- function(stand, metric) {
		if(metric=="horn" || metric=="morisita_horn")
		{
		    d<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
		    text<-"Morisita-Horn"
		}else if(metric=="bray")
		{
		    d<-vegdist(stand, method="bray",upper=FALSE,binary=FALSE);
		    text<-"Bray-Curtis"
		}else if(metric=="jaccard")
		{
		    d<-vegdist(stand, method="jaccard",upper=FALSE,binary=TRUE);
		    #d  <- dist(stand, method="binary")
		    text<-"Jaccard"
		}else if(metric=="yue-clayton")
		{
		    d<-designdist(stand, method="1-(J/(A+B-J))",terms = c( "quadratic"), abcd = FALSE)
		    text<-"Yue-Clayton"
		}else if(metric=="canberra")
		{
		    d<-vegdist(stand, method="canberra",upper=FALSE,binary=FALSE);
		    text<-"Canberra"
		}else if(metric=="kulczynski")
		{
		    d<-vegdist(stand, method="kulczynski",upper=FALSE,binary=FALSE);
		    text<-"Kulczynski"
		}else{
		    d<-vegdist(stand, method="horn",upper=FALSE,binary=FALSE);
		    text<-"Morisita-Horn"
		}
		return(c(d,text))
}