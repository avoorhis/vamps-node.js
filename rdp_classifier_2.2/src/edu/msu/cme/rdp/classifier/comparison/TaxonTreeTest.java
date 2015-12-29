/*
 * TaxonTreeTest.java
 * JUnit based test
 *
 * Created on November 17, 2003, 12:32 PM
 */

package edu.msu.cme.rdp.classifier.comparison;


import junit.framework.*;
import java.util.Iterator;


/**
 *
 * @author wangqion
 */
public class TaxonTreeTest extends TestCase {
  
  public TaxonTreeTest(java.lang.String testName) {
    super(testName);
  }
  
  public static void main(java.lang.String[] args) {
    junit.textui.TestRunner.run(suite());
  }
  
  public static Test suite() {
    TestSuite suite = new TestSuite(TaxonTreeTest.class);
    return suite;
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
    desulfOrder.addS1Score(new Score((float)0.41, seq2, desulfOrder));
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
    desulfFam.addS2Score(new Score((float)0.5, seq1_b, desulfFam));
    desulfGen.addS2Score(new Score((float)0.5, seq1_b, desulfGen));
    
     
    SeqInfo seq2_b = new SeqInfo("seq2_b", "sequence 2 from sample b");
    root.addS2Score(new Score((float)1.0, seq2_b, root));
    prot.addS2Score(new Score((float)0.9, seq2_b, prot));
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
    assertEquals(2, myxOrder.getS1Count());
  //  System.err.println("root=" + root.getSignificance() + " delta=" + delta.getSignificance()) ;
    assertEquals(3, root.getS2Count());
    assertEquals(3, delta.getS2Count());
    assertEquals(1, myxOrder.getS2Count());
    
    cal = new SigCalculator(4, 3, (float)0.5);
    root.changeConfidence(cal);
    assertEquals(4, root.getS1Count());
    assertEquals(2, delta.getS1Count());
    assertEquals(1, myxOrder.getS1Count());
    
    assertEquals(2, delta.getS2Count());
    assertEquals(0, myxOrder.getS2Count());
    
    System.err.println("test findNode()");
    TaxonTree node = (TaxonTree)root.findNode(788);
    assertEquals(node.getTaxid(), 788);
    
    node = (TaxonTree)root.findNode(0);
    assertNull(node);
    
    System.out.println("test getLineageIterator()");
    Iterator it = polyFam.getLineageIterator();
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
    
    System.out.println("test getFirstScore()");
    Score firstScore = desulfOrder.getFirstS1Score();
    assertEquals(0.15, firstScore.getScore(), 0.01);
       
    Score nextSeqScore = firstScore.getNextSeqScore();
    assertEquals(0.41, nextSeqScore.getScore(), 0.01);
    SeqInfo aSeq = nextSeqScore.getSeqInfo();
    assertEquals("seq2_a", aSeq.getName());
         
    Score firstS2Score = desulfOrder.getFirstS2Score();
    assertEquals(0.5, firstS2Score.getScore(), 0.01);
    
    System.out.println("test getDetailIterator()");
    it = desulfOrder.getDetailIterator((float)0.4);
    assertTrue(it.hasNext());
    SeqInfo info = (SeqInfo) it.next();
    assertEquals("seq2_a", info.getName());
    
    info = (SeqInfo) it.next();
    assertEquals("seq1_b", info.getName());
    
    info = (SeqInfo) it.next();
    assertEquals("seq2_b", info.getName());
    
    Iterator scoreIt = info.getScoreList();
    Score aScore = (Score)scoreIt.next();
    assertEquals(1.0, aScore.getScore(), 0.01);
    aScore = (Score)scoreIt.next();
    assertEquals(0.9, aScore.getScore(), 0.01);
    
    it = chonGen.getDetailIterator((float)0.5);
    assertTrue(it.hasNext());
    it.next();
    assertTrue( !it.hasNext());
    
    it = chonGen.getDetailIterator((float)0.6);
    assertTrue( !it.hasNext());
   
   
  }
  
  
}
