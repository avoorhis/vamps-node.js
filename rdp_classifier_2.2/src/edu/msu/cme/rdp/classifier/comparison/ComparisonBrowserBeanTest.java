/*
 * ComparisonBrowserBeanTest.java
 * JUnit based test
 *
 * Created on February 14, 2005, 10:36 AM
 */

package edu.msu.cme.rdp.classifier.comparison;

import junit.framework.*;
import edu.msu.cme.rdp.classifier.rrnaclassifier.ClassifierFactory;
import java.io.*;
import java.util.*;

/**
 *
 * @author wangqion
 */
public class ComparisonBrowserBeanTest extends TestCase {
    
    public ComparisonBrowserBeanTest(java.lang.String testName) {
        super(testName);
    }
    
    public static Test suite() {
        TestSuite suite = new TestSuite(ComparisonBrowserBeanTest.class);
        return suite;
    }
    
    public static void main(java.lang.String[] args) {
        junit.textui.TestRunner.run(suite());
    }
    
   public void testGetTabularTaxonList() throws Exception {
       System.err.println("testGetTabularTaxonList");
       String testProp = "/test/classifier/testClassifier.properties";
       ClassifierFactory.setDataProp(testProp, true);
       
       String f1 = "/test/classifier/testQuerySeq.fasta";
       String f2 = "/test/classifier/sample2.fasta";
       InputStream in1 = System.class.getResourceAsStream(f1);
       InputStream in2 = System.class.getResourceAsStream(f2);
       
       ComparisonManager manager = new ComparisonManager(in1, f1, in2, f2);
       manager.start();
       
       while( manager.isRunning()){
           Thread.currentThread().sleep(100);
       }
       
       assertTrue(manager.isCompleted());
       ComparisonBrowserBean browserBean = manager.getBrowserBean();
       assertNotNull(browserBean);
       
       assertEquals(browserBean.getS1Total(), 7);
       assertEquals(browserBean.getS2Total(), 3);
       assertEquals(browserBean.getConfidence(), "0.8");
       
       Iterator it = browserBean.getTabularTaxonList();
       AbstractNode taxon = (AbstractNode)it.next();
       assertEquals(taxon.getName(), "Vibrionaceae");
       assertEquals(taxon.getS1Count(),2);
       assertEquals(taxon.getS2Count(),2);
       /*
       System.err.println(taxon.getRank() + " " + taxon.getName() + " " + taxon.getS1Count() + " " + taxon.getS2Count() + " " + taxon.getSignificance());
       Iterator detailIt = taxon.getDetailIterator(0.8f);
       while( detailIt.hasNext()){
           SeqInfo seq = (SeqInfo)detailIt.next();
            System.err.print(seq.getName() + " ");
           Iterator scoreIt = seq.getScoreList(); 
          
           while ( scoreIt.hasNext()){
               Score score = (Score)scoreIt.next();
               System.err.print(score.getName() + " " + score.getScore());
           }
           System.err.println("");
           
       }       
       while(it.hasNext()){
           Taxon taxon = (Taxon)it.next();
           System.err.println(taxon.getRank() + " " + taxon.getName() + " " + taxon.getS1Count() + " " + taxon.getS2Count() + " " + taxon.getSignificance());
       } */
       
       String confidence = "0.95";
       browserBean.setConfidence(confidence);
              
       AbstractNode root = (AbstractNode) browserBean.getCurrentBrowserRoot();
       assertEquals(root.getName(), "Bacteria");
       
       browserBean.setRoot(root.findNode(433));
       root = (AbstractNode) browserBean.getCurrentBrowserRoot();
       assertEquals(root.getName(), "Gammaproteobacteria");
       
       it = root.getLineageIterator();
       assertEquals( ((Taxon)it.next()).getName(), "Bacteria" );
       assertEquals( ((Taxon)it.next()).getName(), "Proteobacteria" );
       
   }
    
    
}
