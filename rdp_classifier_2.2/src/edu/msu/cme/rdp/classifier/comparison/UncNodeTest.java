/*
 * UncNodeTest.java
 * JUnit based test
 *
 * Created on February 10, 2005, 3:01 PM
 */

package edu.msu.cme.rdp.classifier.comparison;

import junit.framework.*;
import java.util.Iterator;

/**
 *
 * @author wangqion
 */
public class UncNodeTest extends TestCase {
    
    public UncNodeTest(java.lang.String testName) {
        super(testName);
    }
    
    public static Test suite() {
        TestSuite suite = new TestSuite(UncNodeTest.class);
        return suite;
    }
    
    public static void main(java.lang.String[] args) {
        junit.textui.TestRunner.run(suite());
    }
    
    /** Test of changeConfidence method*/
    public void testChangeConfidence() {
        System.out.println("testChangeConfidence");
        TaxonTree root = new TaxonTree(1, "BACTERIA", "DOMAIN", null);
        TaxonTree prot = new TaxonTree(166, "PROTEOBACTERIA", "PHYLUM", root);
        root.addChild(prot);
        TaxonTree delta = new TaxonTree(702, "DELTAPROTEOBACTERIA", "CLASS", prot);
        prot.addChild(delta);
        TaxonTree desulfOrder = new TaxonTree(720, "DESULFOBACTERALES", "ORDER", delta);
        delta.addChild(desulfOrder);
        TaxonTree desulfFam = new TaxonTree(721, "DESULFOBACTERACEAE", "FAMILY", desulfOrder);
        desulfOrder.addChild(desulfFam);
        TaxonTree desulfGen = new TaxonTree(728, "DESULFOFABA", "GENUS", desulfFam);
        desulfFam.addChild(desulfGen);
        TaxonTree myxOrder = new TaxonTree(774, "MYXOCOCCALES", "ORDER", delta);
        delta.addChild(myxOrder);
        TaxonTree sorSuborder = new TaxonTree(787, "SORANGINEA", "SUBORDER", myxOrder);
        myxOrder.addChild(sorSuborder);
        TaxonTree polyFam = new TaxonTree(788, "POLYANGIACEAE", "FAMILY", sorSuborder);
        sorSuborder.addChild(polyFam);
        TaxonTree chonGen = new TaxonTree(791, "CHONDROMYCES", "GENUS", polyFam);
        polyFam.addChild(chonGen);
        
        //add the sequence assignment for root
        SeqInfo seq1 = new SeqInfo("seq1_a", "sequence 1 from sample a");
        root.addS1Score(new Score((float)1.0, seq1, root));
        prot.addS1Score(new Score((float)0.58, seq1, prot));
        delta.addS1Score(new Score((float)0.31, seq1, delta));
        desulfOrder.addS1Score(new Score((float)0.15, seq1, desulfOrder));
        desulfFam.addS1Score(new Score((float)0.15, seq1, desulfFam));
        desulfGen.addS1Score(new Score((float)0.1, seq1, desulfGen));
        
        //add the sequence assignment for seq2
        SeqInfo seq2 = new SeqInfo("seq2_a", "sequence 2 from sample a");
        root.addS1Score(new Score((float)1.0, seq2, root));
        prot.addS1Score(new Score((float)0.9, seq2, prot));
        delta.addS1Score(new Score((float)0.86, seq2, delta));
        desulfOrder.addS1Score(new Score((float)0.51, seq2, desulfOrder));
        desulfFam.addS1Score(new Score((float)0.33, seq2, desulfFam));
        desulfGen.addS1Score(new Score((float)0.3, seq2, desulfGen));
        
        //add the sequence assignment for seq3
        SeqInfo seq3 = new SeqInfo("seq3_a", "sequence 3 from sample a");
        root.addS1Score(new Score((float)1.0, seq3, root));
        prot.addS1Score(new Score((float)0.31, seq3, prot));
        delta.addS1Score(new Score((float)0.24, seq3, delta));
        myxOrder.addS1Score(new Score((float)0.13, seq3, myxOrder));
        sorSuborder.addS1Score( new Score((float)0.13, seq3, sorSuborder));
        polyFam.addS1Score(new Score((float)0.13, seq3, polyFam));
        chonGen.addS1Score(new Score((float)0.13, seq3, chonGen));
        
        //add the sequence assignment for seq4
        SeqInfo seq4 = new SeqInfo("seq4_a", "sequence 4 from sample a");
        root.addS1Score(new Score((float)1.0, seq4, root));
        prot.addS1Score(new Score((float)0.6, seq4, prot));
        delta.addS1Score(new Score((float)0.56, seq4, delta));
        myxOrder.addS1Score(new Score((float)0.53, seq4, myxOrder));
        sorSuborder.addS1Score(new Score((float)0.53, seq4, sorSuborder));
        polyFam.addS1Score(new Score((float)0.53, seq4, polyFam));
        chonGen.addS1Score(new Score((float)0.5, seq4, chonGen));
        
        SeqInfo seq1_b = new SeqInfo("seq1_b", "sequence 1 from sample b");
        root.addS2Score(new Score((float)1.0, seq1_b, root));
        prot.addS2Score(new Score((float)0.8, seq1_b, prot));
        delta.addS2Score(new Score((float)0.71, seq1_b, delta));
        desulfOrder.addS2Score(new Score((float)0.5, seq1_b, desulfOrder));
        desulfFam.addS2Score(new Score((float)0.39, seq1_b, desulfFam));
        desulfGen.addS2Score(new Score((float)0.3, seq1_b, desulfGen));
        
        
        SeqInfo seq2_b = new SeqInfo("seq2_b", "sequence 2 from sample b");
        root.addS2Score(new Score((float)1.0, seq2_b, root));
        prot.addS2Score(new Score((float)0.97, seq2_b, prot));
        delta.addS2Score(new Score((float)0.86, seq2_b, delta));
        desulfOrder.addS2Score(new Score((float)0.41, seq2_b, desulfOrder));
        desulfFam.addS2Score(new Score((float)0.33, seq2_b, desulfFam));
        desulfGen.addS2Score(new Score((float)0.3, seq2_b, desulfGen));
        
        SeqInfo seq3_b = new SeqInfo("seq3_b", "sequence 3 from sample b");
        root.addS2Score(new Score((float)1.0, seq3_b, root));
        prot.addS2Score(new Score((float)0.51, seq3_b, prot));
        delta.addS2Score(new Score((float)0.44, seq3_b, delta));
        myxOrder.addS2Score(new Score((float)0.13, seq3_b, myxOrder));
        sorSuborder.addS2Score( new Score((float)0.13, seq3_b, sorSuborder));
        polyFam.addS2Score(new Score((float)0.13, seq3_b, polyFam));
        chonGen.addS1Score(new Score((float)0.13, seq3_b, chonGen));
        
        // test changeCount()
        SigCalculator cal = new SigCalculator(4, 3, (float)0);
        root.changeConfidence(cal);
        assertEquals(4, root.getS1Count());
        assertEquals(4, delta.getS1Count());
        AbstractNode uncDeltaNode = delta.getFirstChild();
        while ( uncDeltaNode.getNextSibling() != null){           
            uncDeltaNode = uncDeltaNode.getNextSibling();
        }          
        assertEquals(0, uncDeltaNode.getS1Count());
        assertEquals(0, uncDeltaNode.getS2Count());
        
        assertEquals(2, myxOrder.getS1Count());        
        AbstractNode uncMyxOrderNode = myxOrder.getFirstChild();
        while ( uncMyxOrderNode.getNextSibling() != null){           
            uncMyxOrderNode = uncMyxOrderNode.getNextSibling();
        }      
        assertEquals(0, uncMyxOrderNode.getS2Count());
        
        cal = new SigCalculator(4, 3, (float)0.52);
        root.changeConfidence(cal);
        assertEquals(4, root.getS1Count());
        assertEquals(2, delta.getS1Count()); 
        uncDeltaNode = delta.getFirstChild();
        while ( uncDeltaNode.getNextSibling() != null){           
            uncDeltaNode = uncDeltaNode.getNextSibling();
        } 
        
        assertEquals(1, uncDeltaNode.getS1Count());
        assertEquals(2, uncDeltaNode.getS2Count());
        assertEquals(1, myxOrder.getS1Count());
        
        
        System.err.println("test findNode()");
        UncNode node = (UncNode)root.findNode(-788);
        assertEquals(node.getTaxid(), -788);
        
        System.out.println("test getLineageIterator()");
        Iterator it = polyFam.getFirstChild().getLineageIterator();
        Taxon aNode = (Taxon)it.next();
        assertEquals("BACTERIA", aNode.getName());
        aNode = (Taxon)it.next();
        assertEquals("PROTEOBACTERIA", aNode.getName());
        aNode = (Taxon)it.next();
        assertEquals("DELTAPROTEOBACTERIA", aNode.getName());
        aNode = (Taxon)it.next();
        assertEquals("MYXOCOCCALES", aNode.getName());
        aNode = (Taxon)it.next();
        assertEquals("SORANGINEA", aNode.getName());
        aNode = (Taxon)it.next();
        assertEquals("POLYANGIACEAE", aNode.getName());
        
        
        System.out.println("test getDetailIterator()");
        
        AbstractNode uncNode = desulfOrder.getFirstChild();      
        while ( uncNode.getNextSibling() != null){           
            uncNode = uncNode.getNextSibling();
        }  
        
        assertEquals(uncNode.getTaxid(), (0- desulfOrder.getTaxid()));
        
        it = uncNode.getDetailIterator((float)0.5);
        assertTrue(it.hasNext());
        SeqInfo info = (SeqInfo) it.next();
        assertEquals("seq2_a", info.getName());
        
        info = (SeqInfo) it.next();
        assertEquals("seq1_b", info.getName());
        
        Iterator scoreIt = info.getScoreList();
        Score aScore = (Score)scoreIt.next();
        assertEquals(1.0, aScore.getScore(), 0.01);
        aScore = (Score)scoreIt.next();
        assertEquals(0.8, aScore.getScore(), 0.01);
        
        it = uncNode.getDetailIterator((float)0.6);
        assertTrue( !it.hasNext());
        
        
    }
    
    
    
}
