/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package edu.msu.cme.rdp.classifier.rrnaclassifier;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

/**
 *
 * @author wangqion
 */
public class ClassificationResultFormatter {
	// no rank is for the root of the hierarchy
    public static String[] RANKS = {"no rank", "domain", "phylum", "class", "order", "family", "genus"};
    public enum FORMAT {
    	allRank, fixRank, dbformat;
    }
    
    public static String getOutput(ClassificationResult result, FORMAT format){
    	switch (format){
	    	case allRank:
	    		return getAllRankOutput(result); 
	    	case fixRank:
	    		return getFixRankOutput(result); 
	    	case dbformat:
	    		return getDBOutput(result);
	    	default:
	    		getAllRankOutput(result); 
    	}
    	return null;
    }
    
    public static String getAllRankOutput(ClassificationResult result){
    	StringBuffer assignmentStr = new StringBuffer(result.getSequence().getName() + "\t");
        if (result.getSequence().isReverse()) {
            assignmentStr.append("-" );
        } 
        for (RankAssignment assignment : (List<RankAssignment>) result.getAssignments()) {
            assignmentStr.append("\t" + assignment.getName() + "\t" + assignment.getRank() + "\t" + assignment.getConfidence());
        }
        assignmentStr.append("\n");
        return assignmentStr.toString();
    }
    
    public static String getFixRankOutput(ClassificationResult result){
         return getFixRankOutput(RANKS, result);
    }

    public static String getFixRankOutput(String[] ranks, ClassificationResult result){
        StringBuffer assignmentStr = new StringBuffer(result.getSequence().getName() + "\t");
        if (result.getSequence().isReverse()) {
            assignmentStr.append("-");
        } else {
            assignmentStr.append("");
        }

        HashMap<String,RankAssignment> rankMap = new HashMap<String,RankAssignment>();
        for (RankAssignment assignment : (List<RankAssignment>) result.getAssignments()) {
            rankMap.put(assignment.getRank(), assignment);
        }
        // except the root with "no rank", the rest ranks are unique, we need make sure the root is still there
        RankAssignment assignment = ((List<RankAssignment>) result.getAssignments()).get(0);
        rankMap.put(assignment.getRank(), assignment);

        for ( String rank: ranks){
            RankAssignment assign =  rankMap.get(rank);
            if ( assign != null){
                assignmentStr.append("\t" + assign.getName() + "\t" + assign.getRank() + "\t" + assign.getConfidence());
            }else {
               assignmentStr.append("\t" + "\t" + "\t");
            }
        }
        assignmentStr.append("\n");
        return assignmentStr.toString();

    }
    
    public static String getDBOutput( ClassificationResult result){
    	StringBuffer assignmentStr = new StringBuffer();
    	Iterator<RankAssignment> it  = result.getAssignments().iterator();
	   
	    while (it.hasNext()){
	    	RankAssignment assign = it.next();
	    	assignmentStr.append( result.getSequence().getName()+ "\t" + result.getTrainsetNo() + "\t" + assign.getTaxid() + "\t" +
	            assign.getConfidence() + "\n" );
	    }
	   
	    return assignmentStr.toString();  
    }

}
