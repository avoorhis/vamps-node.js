#!/usr/bin/env python
import sys, os, getopt
import shutil
import json
#import IlluminaUtils.lib.fastalib as fastalib
import fastalibAV as u
class FastaReader:
    def __init__(self,file_name=None):
        self.file_name = file_name
        self.h = open(self.file_name,'rb')
        #self.h = open(self.file_name)
        self.seq = ''
        self.id = None

    def next(self): 
        def read_id():
            return self.h.readline().decode('utf-8').strip()[1:]

        def read_seq():
            #ret = bytearray(b'')
            ret = ''
            #ret = ''
            while True:
                line = self.h.readline().decode('utf-8')
                
                while len(line) and not len(line.strip()):
                    # found empty line(s)
                    line = self.h.readline().decode('utf-8')
                
                if not len(line):
                    # EOF
                    break
                
                if line.startswith('>'):
                    # found new defline: move back to the start
                    self.h.seek(-len(line), os.SEEK_CUR)
                    break
                    
                else:
                    ret += line.strip()
                    
            return ret
        
        self.id = read_id()
        self.seq = read_seq()
        
        if self.id:
            return True
class Demultiplex:

  def __init__(self):
    self.out_file_names = set()
    self.sample_names   = set()
    self.inputfile      = ''
    self.project_path   = ''
    self.out_files      = {}


  def usage(self):
    print ('''python demultiplex_qiita.py -i <inputfile>
             ''')

  def get_args(self, argv):
  
    try:
      opts, args = getopt.getopt(argv, "hi:d:f:", ["ifile="])
      print( "opts = %s, args = %s" % (opts, args))
    except getopt.GetoptError:
      sys.exit(2)
    self.fastaunique_cmd = None
    for opt, arg in opts:
      print ('got',opt,arg)
      if opt == '-h':
        self.usage()
        sys.exit()
      elif opt in ("-i", "--ifile"):
        self.inputfile = arg
      elif opt in ("-d", "--dir"):
        self.project_path = arg
      elif opt in ("-f", "--faunique"):
        self.fastaunique_cmd = arg                
    return (self.inputfile)
      
      
  def write_id(self, output_file_obj, id):
    output_file_obj.write('>%s\n' % id)

  def write_seq(self, output_file_obj, seq):
    output_file_obj.write('%s\n' % seq)
      
  def get_out_file_names(self):
    print ("get_out_file_names")
    n = 0
    #f_input  = fastalib.SequenceSource(inputfile)
    f_input = u.SequenceSource(inputfile)
    while f_input.next():
      n+=1
      if (n % 100000 == 0 or n == 1):
        sys.stderr.write('\r[demultiplex] Reading FASTA into memory: %s\n' % (n))
        sys.stderr.flush()
      f_out_name = self.make_file_name(f_input.id)
      self.out_file_names.add(f_out_name)
  # real  0m4.446s
  

  # def get_out_file_names_readf(self):
  #   print "get_out_file_names_readf"
  #   inputfile_content   = fastalib.ReadFasta(inputfile)
  #   self.out_file_names = [id.split("_")[0] + ".fa" for id in inputfile_content.ids]
  # real  0m16.198s
    
  def open_out_sample_files(self):
    print ("open_out_sample_files")
    self.get_out_file_names()
    for sample in self.sample_names:
      file_name = sample+'.fa'
      file_path = os.path.join(self.project_path,file_name)
      self.out_files[file_name] = open(file_path, "a")
    return len(self.sample_names)

  def close_sample_files(self):
      [o_file[1].close() for o_file in self.out_files.items()] 
      return
      
  def make_file_name(self, id):
    # adjust to your specific defline
    sampleName_items = id.split()[0].split('_')
    test = sampleName_items[-1]
    try:
        int(test)
        sampleName = '_'.join(sampleName_items[:-1])
        #print('INT',sampleName_items[-1])
    except:
        sampleName = '_'.join(sampleName_items)
        #print('NO INT',sampleName_items[-1])
    
    print(sampleName)
    fileName = sampleName + ".fa"
    self.sample_names.add(sampleName)
    #print(fileName)
    return fileName
  
  def demultiplex_input(self, inputfile):
    print ("demultiplex_input")
    #f_input  = fastalib.SequenceSource(inputfile)
    f_input = FastaReader(inputfile)
    i = 0
    total_seq_count = 0
    while f_input.next():
      i += 1
      total_seq_count += 1
      
      read_id = f_input.id.split()[1]  # remove ds and all after the <space>
      
      #>H34Kc.735939_0 HWI-ST753:99:C038WACXX:1:1101:1614:2150 1:N:0: orig_bc=ACTAGCTCCATA new_bc=ACTAGCTCCATA bc_diffs=0
      print(f_input.id)
      print(read_id)
      f_out_name = self.make_file_name(f_input.id)
      
      f_output   = self.out_files[f_out_name]
      self.write_id(f_output, read_id)
      self.write_seq(f_output, f_input.seq)
      if (i % 100000 == 0 or i == 1):
        sys.stderr.write('\r[demultiplex] Writing entries into files: %s\n' % (i))
        sys.stderr.flush()
    self.close_sample_files()
    return total_seq_count
    
  def create_directories(self):
    analysis_dir = os.path.join(self.project_path,'analysis')
    if (os.path.exists(analysis_dir)):
        shutil.rmtree(analysis_dir)
    oldmask = os.umask(000)
    os.makedirs(analysis_dir, 0o775)
    for sample in self.sample_names:
        sample_dir = os.path.join(analysis_dir,sample)
        os.makedirs(sample_dir, 0o775)
    os.umask(oldmask)   
     
  def unique_files(self):
    analysis_dir = os.path.join(self.project_path,'analysis')
    import subprocess
    sum_unique_seq_count = 0
    for i,sample in enumerate(self.sample_names):
        infile = os.path.join(self.project_path,sample+'.fa')
        sample_dir = os.path.join(analysis_dir,sample)
        out_fasta = os.path.join(sample_dir,'seqfile.unique.fa')
        out_name = os.path.join(sample_dir,'seqfile.unique.name')
        
        fastaunique_cmd_list = [ self.fastaunique_cmd,'-o', out_fasta, '-n', out_name, infile]        
        print(' '.join(fastaunique_cmd_list))
        result = subprocess.check_output(' '.join(fastaunique_cmd_list), shell=True)
        
        sum_unique_seq_count += int(result.decode().strip())
        os.chmod(out_fasta, 0o664)
        os.chmod(out_name, 0o664)
        
    return sum_unique_seq_count
    
        
  def cleanup(self):
     for sample in self.sample_names:
        file_name = sample+'.fa'
        file_path = os.path.join(self.project_path,file_name)
        try:
            os.remove(file_path)
        except:
            pass
          
if __name__ == "__main__":
    import argparse
    usage = """
    USAGE: demultiplex.py -i FASTA.fa
            -f path_to_fastaunique
            -d path_to_output_directory    
    """
    
    demult = Demultiplex()
    (inputfile) = demult.get_args(sys.argv[1:])
    print ('Input file is "%s"' % inputfile)
    if inputfile == '':
        print(usage)
        sys.exit()
    
    sum_unique_seq_count = 0
    sample_count = demult.open_out_sample_files()
    total_seq_count = demult.demultiplex_input(inputfile)
    demult.create_directories()
    #sys.exit()
    if demult.fastaunique_cmd:
        sum_unique_seq_count = demult.unique_files()
        #print('UNIQUE_SEQ_COUNT='+str(sum_unique_seq_count))
    counts = {"UNIQUE_SEQ_COUNT":str(sum_unique_seq_count),"TOTAL_SEQ_COUNT":str(total_seq_count),"SAMPLE_COUNT":str(sample_count)}
    print(json.dumps(counts))
    demult.cleanup()
    
    

