/*
 * ComparisonSuite.java
 *
 * Created on February 17, 2005, 9:49 AM
 */

package edu.msu.cme.rdp.classifier.comparison;
    
import junit.framework.*;
         
/**
 *
 * @author wangqion
 */
public class ComparisonSuite extends TestCase {

    public ComparisonSuite(java.lang.String testName) {
        super(testName);
    }        
        
    public static void main(java.lang.String[] args) {
        junit.textui.TestRunner.run(suite());
    }
    
    public static Test suite() {
      
      TestSuite suite = new TestSuite("ComparisonSuite");
      suite.addTest(ComparisonBrowserBeanTest.suite());
      suite.addTest(SigCalculatorTest.suite());
      suite.addTest(ZtableTest.suite());
      suite.addTest(TaxonTreeTest.suite());
      suite.addTest(UncNodeTest.suite());
     
      return suite;
    }
    
    
}
