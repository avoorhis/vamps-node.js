/*
 * ClassificationProcessBean.java
 *
 * Created on November 7, 2003, 2:49 PM
 */

package edu.msu.cme.rdp.classifier.comparison;

import edu.msu.cme.rdp.classifier.rrnaclassifier.*;
import edu.msu.cme.rdp.classifier.readseqwrapper.*;
import java.util.ArrayList;
import java.io.*;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Iterator;
import java.util.Date;
import java.util.Calendar;
/**
 *
 * @author  siddiq15
 */
public class ComparisonManager extends Thread{
    
    private static ClassifierFactory classifierFactory ;
    private Date lastCheckTime;
    private Timer timer;
    private int totalNumOfSequence = 0;
    private boolean exceedLimit = false;
    private int numOfDone = 0;
    private ComparisonBrowserBean browserBean = null;
    private ArrayList s1SeqList;
    private ArrayList s2SeqList;
    private String s1Filename;
    private String s2Filename;
    
    private static final String SAMPLE1 = "sample1";
    private static final String SAMPLE2 = "sample2";
    
    private static final String COMPLETED = "completed";
    private static final String NOT_STARTED = "not started";
    private static final String RUNNING = "running";
    private static final String ABORTED = "aborted";
    private static final String FAILED = "failed";
    
    private String status = NOT_STARTED;
    
    
    static {
        try {
            classifierFactory = ClassifierFactory.getFactory();
        }catch( IOException ex){
            throw new RuntimeException(ex);
        }catch( TrainingDataException ex){
            throw new RuntimeException(ex);
        }
    }
    
    public ComparisonManager(InputStream inputStream1, String f1, InputStream inputStream2, String f2) {
        s1Filename = f1;
        s2Filename = f2;
        int sampleTotal = 0;
        SequenceParser parser = null;

        try{
            s1SeqList = new ArrayList();
            try {
                parser = new SequenceParser( inputStream1 );
                while ( true ) {
                    ParsedSequence pSeq = parser.getNextSequence();
                    if ( pSeq == null ) {
                        break;
                    }
                    if ( sampleTotal++ > ComparisonBrowserBean.getSeqCountLimit() ) {
                        throw new IllegalArgumentException("Number of sequences in sample 1 exceeds upper limit: " + ComparisonBrowserBean.getSeqCountLimit());
                    }
                    s1SeqList.add(pSeq);
                    totalNumOfSequence++;
                }
            } catch(SequenceParserException e){
                throw new IllegalArgumentException(" From file " + s1Filename + " : " + e.getMessage()) ;
            }
            parser.close();
            
                        
            sampleTotal = 0;
            s2SeqList = new ArrayList();
            try{
                parser = new SequenceParser( inputStream2 );
                while ( true ) {
                    ParsedSequence pSeq = parser.getNextSequence();
                    if ( pSeq == null ) {
                        break;
                    }
                    if ( sampleTotal++ > ComparisonBrowserBean.getSeqCountLimit() ) {
                        throw new IllegalArgumentException("Number of sequences in sample 2 exceeds " + ComparisonBrowserBean.getSeqCountLimit());
                        
                    }
                    s2SeqList.add(pSeq);
                    totalNumOfSequence++;
                }
            }catch(SequenceParserException e){
                throw new IllegalArgumentException("From file " + s2Filename + " : " + e.getMessage() );
            }
            parser.close();
            
            
        }catch( IOException ex){
            throw new RuntimeException(ex);
        }
    }
    
    
    public void start(){
        this.setStatus(RUNNING);
        setCheckTime(30);
        super.start();
    }
    
    public String getS1Filename(){
        return s1Filename;
    }
    
    public String getS2Filename(){
        return s2Filename;
    }
    
    
    private synchronized void setStatus(String s) {
        this.status = s;
    }
    
    public synchronized String getStatus() {
        return this.status;
    }
    
    /*
     * Sets the checkTime for the timer (used by jsp)
     */
    public void setCheckTime(int sec) {
        Calendar  aCal = Calendar.getInstance();
        aCal.add(Calendar.SECOND, sec);
        this.setLastCheckTime( aCal.getTime());
    }
    
    private synchronized Date getLastCheckTime(){
        return this.lastCheckTime;
    }
    
    public synchronized int getProgress() {
        return (100 * numOfDone) /totalNumOfSequence;
    }
    
    
    public synchronized boolean isAborted() {
        return this.status.equals(ABORTED);
    }
    
    public synchronized boolean isCompleted() {
        return this.status.equals(COMPLETED);
    }
    
    public synchronized boolean isRunning() {
        return this.status.equals(RUNNING);
    }
    
    public synchronized void setAbort(boolean a) {
        setStatus(this.ABORTED);
    }
    
    
    private synchronized void setLastCheckTime(Date d){
        this.lastCheckTime = d;
        if ( timer == null){
            timer = new Timer();
            timer.start();
        }
    }
    
    
    public void run() {
        Classifier aClassifier = null;
        List sequenceErrorList = new ArrayList();
        try {
            aClassifier = classifierFactory.createClassifier();
        } catch(IllegalStateException ex) {
            sequenceErrorList.add(ex.getMessage());
        }
        browserBean = new ComparisonBrowserBean(classifierFactory.getHierarchyVersion(), classifierFactory.getClassifierVersion());
        
        TaxonTree root  = null;
        
        // do classification for sample 1
        Iterator inputSeqIt = s1SeqList.iterator();
        
        while ( inputSeqIt.hasNext() ) {
            if (this.isAborted()){
                browserBean = null;
                return ;
            }
            
            try {
                ParsedSequence pSeq = (ParsedSequence)inputSeqIt.next();
                
                ClassificationResult aClassificationResult = aClassifier.classify(pSeq);
                root = reconstructTree(aClassificationResult, root, SAMPLE1);
            } catch(ShortSequenceException e) {
                sequenceErrorList.add( new SeqErrorBean(e.getSeqDoc(), e.getMessage()) );
            }
            numOfDone++;
        }
        
        // do classification for sample 2
        inputSeqIt = s2SeqList.iterator();
        
        while ( inputSeqIt.hasNext() ) {
            if (this.isAborted()){
                browserBean = null;
                return ;
            }
            
            try {
                ParsedSequence pSeq = (ParsedSequence)inputSeqIt.next();
                
                ClassificationResult aClassificationResult = aClassifier.classify(pSeq);
                root = reconstructTree(aClassificationResult, root, SAMPLE2);
            } catch(ShortSequenceException e) {
                sequenceErrorList.add( new SeqErrorBean(e.getSeqDoc(), e.getMessage()) );
            }
            numOfDone++;
        }
        
        browserBean.setS1Filename(s1Filename);
        browserBean.setS2Filename(s2Filename);
        
        browserBean.setSeqErrorList(sequenceErrorList);
        browserBean.setSubmitDate( new Date() );
        if ( root != null ) {
            SigCalculator cal = new SigCalculator( root.getS1Count(), root.getS2Count(), browserBean.getFloatConfidence());
            root.changeConfidence( cal );
        }
        browserBean.setRoot(root);
        this.setStatus(COMPLETED);
        
    }
    
    private TaxonTree reconstructTree(ClassificationResult result, TaxonTree root, String sample){
        List assignments = result.getAssignments();
        
        Iterator assignIt = assignments.iterator();
        int nodeCount = 0;
        SeqInfo seqInfo = new SeqInfo(result.getSequence().getName(), result.getSequence().getTitle());
        seqInfo.setReverse(result.getSequence().isReverse());
        
        TaxonTree curTree = null;
        while (assignIt.hasNext()){
            RankAssignment assign = (RankAssignment) assignIt.next();
            
            if (nodeCount == 0){
                if (root == null){     // the parent of the root is null
                    root = new TaxonTree(assign.getTaxid(),assign.getName(), assign.getRank(), null);
                } else{
                    if (root.getTaxid() != assign.getTaxid()){
                        // this should never occur
                        throw new IllegalStateException("Error: the root " + assign.getTaxid() +
                        " of assignment for " + result.getSequence().getName() +
                        " is different from the other sequences " + root.getTaxid());
                    }
                }
                curTree = root;
                
            } else{
                curTree = curTree.getChildbyTaxid(assign.getTaxid(),assign.getName(), assign.getRank());
            }
            Score score = new Score(assign.getConfidence(), seqInfo, curTree);
            if ( sample.equals(SAMPLE1)){
                curTree.addS1Score(score);
            }else {
                curTree.addS2Score(score);
            }
            nodeCount++;
        }
        return root;
    }
    
    
  /*
   * Returns a valid BrowserBean if process is completed.
   * Returns null if not completed.
   */
    public ComparisonBrowserBean getBrowserBean(){
        if ( !this.isCompleted()){
            return null;
        }
        return browserBean;
    }
    
    
    /**
     * The timer will wake up and check the time set by jsp, if the time expired,
     * which indicates the jsp page has been refreshed for a long time,
     * abort the current seqmatch thread.
     */
    class Timer extends Thread {
        long waitTime = 1000;
        
        public void run(){
            
            while ( isRunning() && getLastCheckTime().after(new Date())){
                try{
                    sleep(waitTime);
                }catch (InterruptedException e) {
                    ;
                }
            }
            if (isRunning()){
                setAbort(true);
            }
            
        }
        
    }
    
}
