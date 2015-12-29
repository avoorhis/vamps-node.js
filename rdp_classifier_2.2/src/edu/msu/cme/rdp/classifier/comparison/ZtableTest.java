/*
 * ZtableTest.java
 *
 * Created on April 12, 2005, 5:10 PM
 */

package edu.msu.cme.rdp.classifier.comparison;
import junit.framework.*;
import java.lang.Math;
/**
 *
 * @author  wangqion
 */
public class ZtableTest extends TestCase{
    
   
     public ZtableTest(java.lang.String testName) {
        super(testName);
    }
    
    public static Test suite() {
        TestSuite suite = new TestSuite(ZtableTest.class);
        return suite;
    }
    
    public static void main(java.lang.String[] args) {
        junit.textui.TestRunner.run(suite());
    }
    
    public void testGetPvalue(){
        System.err.println("testGetPvalue()");
        Ztable ztable= new Ztable();
        double pvalue = ztable.getPvalue(0.00);
        assertEquals(pvalue, 1.0, 0.001);
        pvalue = ztable.getPvalue(0.09);
        assertEquals(pvalue, 0.928, 0.001);
        pvalue = ztable.getPvalue(4.0);
        assertEquals(pvalue, 0.000063, 0.000001);
        pvalue = ztable.getPvalue(5.05);
        assertEquals(pvalue, 0.00000057, 0.00000001);
        pvalue = ztable.getPvalue(12);
        assertEquals(pvalue, 0.0, 0.001);
        pvalue = ztable.getPvalue(3.99);
        assertEquals(pvalue, 0.00006, 0.00001);
        
        pvalue = ztable.getPvalue(7.566);
        assertEquals(pvalue, 0.0, 0.00001);
        
        pvalue = ztable.getPvalue(6);     
        assertEquals(pvalue, 0.000000002, 0.00001);
    }
}
