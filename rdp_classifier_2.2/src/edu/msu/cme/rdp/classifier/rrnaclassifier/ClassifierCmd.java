/*
 * Created on Feb 20, 2006
 *
 */
/**
 * This is a simple command line class to do classification.
 */
package edu.msu.cme.rdp.classifier.rrnaclassifier;

import java.io.BufferedWriter;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.PosixParser;

import edu.msu.cme.rdp.classifier.readseqwrapper.ParsedSequence;
import edu.msu.cme.rdp.classifier.readseqwrapper.SequenceParser;
import edu.msu.cme.rdp.classifier.readseqwrapper.SequenceParserException;


/**
 * This is the command line class to do the classification.
 * @author wangqion
 */
public class ClassifierCmd {

    private static Options options = new Options();
    // long options
    public static final String QUERYFILE_LONG_OPT = "queryFile";
    public static final String OUTFILE_LONG_OPT = "outputFile";
    public static final String TRAINPROPFILE_LONG_OPT = "train_propfile";
    public static final String FORMAT_LONG_OPT = "format";

    //short options
    public static final String QUERYFILE_SHORT_OPT = "q";
    public static final String OUTFILE_SHORT_OPT = "o";
    public static final String TRAINPROPFILE_SHORT_OPT = "t";
    public static final String FORMAT_SHORT_OPT = "f";

    // description of the options
    public static final String QUERYFILE_DESC = "query file contains sequences in one of the following formats: Fasta, Genbank and EMBL";
    public static final String OUTFILE_DESC = "output file name for classification assignment";
    public static final String TRAINPROPFILE_DESC = "a property file contains the mapping of the training files." +
    			"\nNote: the training files and the property file should be in the same directory." +
    			"\nThe default property file is set to data/classifier/rRNAClassifier.properties.";
    public static final String FORMAT_DESC = "all tab delimited output format: [allrank|fixrank|db]. Default is allrank. " +
				"\n allrank: outputs the results for all ranks applied for each sequence: seqname, orientation, taxon name, rank, conf, ..." +
    			"\n fixrank: only outputs the results for fixed ranks in order: no rank, domain, phylum, class, order, family, genus" +
    			"\n db: outputs the seqname, trainset_no, tax_id, conf. This is good for storing in a database";
    
    static {
        options.addOption(new Option(QUERYFILE_SHORT_OPT, QUERYFILE_LONG_OPT, true, QUERYFILE_DESC));
        options.addOption(new Option(OUTFILE_SHORT_OPT, OUTFILE_LONG_OPT, true, OUTFILE_DESC));
        options.addOption(new Option(TRAINPROPFILE_SHORT_OPT, TRAINPROPFILE_LONG_OPT, true, TRAINPROPFILE_DESC));
        options.addOption(new Option(FORMAT_SHORT_OPT, FORMAT_LONG_OPT, true, FORMAT_DESC));
    }


    private ClassificationResultFormatter.FORMAT defaultFormat = ClassificationResultFormatter.FORMAT.allRank;

    
    /** It classifies query sequences from the input file.
     * If the property file of the mapping of the training files is not null, the default property file will be override.
     * The classification results will be writen to the output file.
     */
    public void doClassify( String inputFile, String outFile, String propfile, ClassificationResultFormatter.FORMAT format) throws IOException, TrainingDataException, SequenceParserException{
    	if ( propfile != null){
    		ClassifierFactory.setDataProp(propfile, false);
    	}
    	if ( format == null){
    		format = defaultFormat;
    	}
		ClassifierFactory factory = ClassifierFactory.getFactory();                
        Classifier aClassifier = factory.createClassifier();       
        SequenceParser parser = new SequenceParser(new FileInputStream(inputFile));
        BufferedWriter wt = new BufferedWriter(new FileWriter(outFile));        
        ParsedSequence pSeq = null;
        
        try{
            while (true){
                try {
                    pSeq = parser.getNextSequence();
                    
                    if ( pSeq == null ) {
                        break;
                    }                  
                    ClassificationResult result = aClassifier.classify(pSeq);                   
                    wt.write(ClassificationResultFormatter.getOutput(result, format));
                    
                } catch ( ShortSequenceException e){
                    System.out.println( e.getMessage());
                } catch (Exception e){
                    e.printStackTrace();
                }
            }
        }finally {
            parser.close();
            wt.close();
        }
       
    }
  
    
    /**
     * Prints the license information to std err.
     */
    public static void printLicense(){
     	  String license = "Copyright 2006-2010 Michigan State University Board of Trustees.\n\n" + 
  	  "This program is free software; you can redistribute it and/or modify it under the " +
  	  "terms of the GNU General Public License as published by the Free Software Foundation; " +
  	  "either version 2 of the License, or (at your option) any later version.\n\n" +   	  
  	  "This program is distributed in the hope that it will be useful, " +
  	  "but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY " +
  	  "or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.\n\n" +
  	  "You should have received a copy of the GNU General Public License along with this program; " +
  	  "if not, write to the Free Software Foundation, Inc., 59 Temple Place, "+
  	  "Suite 330, Boston, MA 02111-1307 USA\n\n" +
  	  "Authors's mailng address:\n" +
  	  "Center for Microbial Ecology\n" +
  	  "2225A Biomedical Physical Science\n" +
  	  "Michigan State University\n" +
  	  "East Lansing, Michigan USA 48824-4320\n" +
  	  "E-mail: James R. Cole at colej@msu.edu\n" +
        "\tQiong Wang at wangqion@msu.edu\n" +
        "\tJames M. Tiedje at tiedjej@msu.edu\n\n";
     	  
     	  System.err.println(license);
     }
    
    /**
     * This is the main method to do classification.
     * <p>Usage: java ClassifierCmd queryFile outputFile [property file].
     * <br>
     * queryFile can be one of the following formats: Fasta, Genbank and EMBL. 
     * <br>
     * outputFile will be used to save the classification output.
     * <br>
     * property file contains the mapping of the training files.
     * <br>
     * Note: the training files and the property file should be in the same directory.
     * The default property file is set to data/classifier/rRNAClassifier.properties.
     */
    public static void main(String[] args) throws Exception{
       
        String queryFile = null;
        String outputFile = null;
        String propFile = null;
        ClassificationResultFormatter.FORMAT format = null;
        
        
        try {
            CommandLine line = new PosixParser().parse(options, args);
           
            if (line.hasOption(QUERYFILE_SHORT_OPT) ) {
            	queryFile = line.getOptionValue(QUERYFILE_SHORT_OPT);             	
            } else {
                throw new Exception("queryFile must be specified");
            }
            if (line.hasOption(OUTFILE_SHORT_OPT) ) {
            	outputFile = line.getOptionValue(OUTFILE_SHORT_OPT);             	
            } else {
                throw new Exception("outputFile must be specified");
            }
            
            if (line.hasOption(TRAINPROPFILE_SHORT_OPT) ) {
            	propFile = line.getOptionValue(TRAINPROPFILE_SHORT_OPT);             	
            } 
            if (line.hasOption(FORMAT_SHORT_OPT) ) {
            	String f = line.getOptionValue(FORMAT_SHORT_OPT); 
            	if ( f.equals("allrank")) {
                    format = ClassificationResultFormatter.FORMAT.allRank;
                }else if ( f.equals("fixrank")) {
                    format = ClassificationResultFormatter.FORMAT.fixRank;
                }else if ( f.equals("db")) {
                    format = ClassificationResultFormatter.FORMAT.dbformat;
                }else {
                    throw new IllegalArgumentException("Not valid output format, only allrank, fixrank and db allowed");
                }
            } 
        } catch (Exception e) {
        	System.out.println("Command Error: " + e.getMessage());
            new HelpFormatter().printHelp(120, "ClassifierCmd", "", options, "", true);
            return;
        }
        
        ClassifierCmd classifierCmd =  new ClassifierCmd();
      
        printLicense();
        classifierCmd.doClassify(queryFile, outputFile,  propFile, format);
        
    }
}
