/*
 * SigCalculatorTest.java
 * JUnit based test
 *
 * Created on February 10, 2005, 4:20 PM
 */

package edu.msu.cme.rdp.classifier.comparison;

import junit.framework.*;
import java.lang.Math;

/**
 *
 * @author wangqion
 */

public class SigCalculatorTest extends TestCase {
    
    public SigCalculatorTest(java.lang.String testName) {
        super(testName);
    }
    
    public static Test suite() {
        TestSuite suite = new TestSuite(SigCalculatorTest.class);
        return suite;
    }
    
    public static void main(java.lang.String[] args) {
        junit.textui.TestRunner.run(suite());
    }
    
    public void testCalFactorial(){
        System.err.println("testCalFactorial");
        SigCalculator cal = new SigCalculator(100, 100, 0.8f);
        double result = cal.calFactorial(1, 1);
        assertEquals(2, Math.exp(result), 0.01);
        result = cal.calFactorial(2, 2);
        assertEquals(6, Math.exp(result), 0.01);
        result = cal.calFactorial(5, 6);
        assertEquals(462, Math.exp(result), 0.01);
    }
    
    
    public void testCalculateSig(){
        System.err.println("testCalculateSig");
        SigCalculator cal = new SigCalculator(100, 100, 0.8f);
        double sig = cal.calculateSig(2, 2);
        assertEquals(sig, 1, 0.0001);
        
        sig = cal.calculateSig(20, 40);
        assertEquals(sig, 0.0020, 0.0001);
        
        sig = cal.calculateSig(0, 0);
        assertEquals(sig, 1.0, 0.01);
        
        sig = cal.calculateSig(100, 100);
        
        assertEquals(sig, 1.0, 0.1);
        
        
        cal = new SigCalculator(845, 845, 0.8f);
        sig = cal.calculateSig(11, 0);
        assertEquals(sig, 0.0005, 0.0001);
        sig = cal.calculateSig(0, 8);
        assertEquals(sig, 0.004, 0.001);
        
        cal = new SigCalculator(736, 888, 0.8f);
        sig = cal.calculateSig(275, 86);
        
        sig = cal.calculateSig(14, 81);
        
        sig = cal.calculateSig(376, 618);
        
        sig = cal.calculateSig(10, 8);
        
        cal = new SigCalculator(10000, 10000, 0.8f);
        sig = cal.calculateSig(6, 18);
        
        sig = cal.calculateSig(2, 9);
        
        sig = cal.calculateSig(2, 8);
        
        sig = cal.calculateSig(0, 7);
        
        sig = cal.calculateSig(0, 6);
        
        sig = cal.calculateSig(0, 5);
        
        sig = cal.calculateSig(0, 4);
        
        sig = cal.calculateSig(0, 3);
        
        sig = cal.calculateSig(0, 4);
        
        sig = cal.calculateSig(0, 3);
        
        sig = cal.calculateSig(6, 19);
        
        sig = cal.calculateSig(6, 20);
    }
    
    
    public void testSimulation(){
        
        int total1 = 1000;
        int total2 = 1000;
        int numOfRuns = 1;
        double[] threshold = {0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99};
        
        double sig000001 = 0.00001;
        double sig00001 = 0.0001;
        double sig0001 = 0.001;
        double sig001 = 0.01;
        double sig01 = 0.1;
        double sig05 = 0.5;
        
        
        SigCalculator cal = new SigCalculator(total1, total2, 0.8f);
        
        for ( int t = 0; t < threshold.length; t++){
            int sig000001Count = 0;
            int sig00001Count = 0;
            int sig0001Count = 0;
            int sig001Count = 0;
            int sig01Count = 0;
            int sig05Count = 0;
            
            int sig000001Count2 = 0;
            int sig00001Count2 = 0;
            int sig0001Count2 = 0;
            int sig001Count2 = 0;
            int sig01Count2 = 0;
            int sig05Count2 = 0;
            
            for ( int run = 0; run < numOfRuns; run++){
                int s1Count = 0;
                
                for(int i=0; i< total1; i++ ){
                    double rdm = Math.random();
                    if (rdm >= threshold[t]){
                        s1Count ++;
                    }
                }
                
                int s2Count = 0;
                for(int i=0; i< total2; i++ ){
                    double rdm = Math.random();
                    if (rdm >= threshold[t]){
                        s2Count ++;
                    }
                }
                // for small proportion test
                double sig = cal.smallProportionTest(s1Count, s2Count);
                
                if( sig <= sig000001){
                    sig000001Count++;
                }
                if( sig <= sig00001){
                    sig00001Count++;
                }
                if( sig <= sig0001){
                    sig0001Count++;
                }
                if( sig <= sig001){
                    sig001Count++;
                }
                if( sig <= sig01){
                    sig01Count++;
                }
                if( sig <= sig05){
                    sig05Count++;
                }
                
                sig = cal.largeProportionTest(s1Count, s2Count);
                
                if( sig <= sig000001){
                    sig000001Count2++;
                }
                if( sig <= sig00001){
                    sig00001Count2++;
                }
                if( sig <= sig0001){
                    sig0001Count2++;
                }
                if( sig <= sig001){
                    sig001Count2++;
                }
                if( sig <= sig01){
                    sig01Count2++;
                }
                if( sig <= sig05){
                    sig05Count2++;
                }
            }
            /*
            System.err.println("\n threshold: " + threshold[t] + " s1=" + total1 + " s2=" + total2 + "\n");
            System.err.println("number of sig <=" + sig000001 + " : " + (double)sig000001Count/(double)numOfRuns + "      "  + (double)sig000001Count2/(double)numOfRuns);
            System.err.println("number of sig <=" + sig00001 + " : " + (double)sig00001Count/(double)numOfRuns + "      "  + (double)sig00001Count2/(double)numOfRuns);
            System.err.println("number of sig <=" + sig0001 + " : " + (double)sig0001Count/(double)numOfRuns + "      "  + (double)sig0001Count2/(double)numOfRuns);
            System.err.println("number of sig <=" + sig001 + " : " + (double)sig001Count/(double)numOfRuns + "      "  + (double)sig001Count2/(double)numOfRuns);
            System.err.println("number of sig <=" + sig01 + " : " + (double)sig01Count/(double)numOfRuns + "      "  + (double)sig01Count2/(double)numOfRuns);
            System.err.println("number of sig <=" + sig05 + " : " + (double)sig05Count/(double)numOfRuns + "      "  + (double)sig05Count2/(double)numOfRuns);
            */
        }
        
    }
    
    
}
