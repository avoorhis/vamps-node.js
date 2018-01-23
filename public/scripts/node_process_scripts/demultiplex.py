#!/usr/bin/env python
import sys, os, getopt
import shutil
import json
#import IlluminaUtils.lib.fastalib as fastalib

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
                    #print('FFFFound1',line)
                    #self.h.seek(-len(line), 1)
                    break
                    
                else:
                    ret += line.strip()
                    #print('FFFFound2-seq',ret)                    
                    #ret = ret.decode('utf-8').strip()
                    
            #return ret.decode("utf-8")
            #print('ret',ret)
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
    print('''python demultiplex_qiita.py -i <inputfile>
             ''')

  def get_args(self, argv):
  
    try:
      opts, args = getopt.getopt(argv, "hi:d:f:", ["ifile="])
      #print "opts = %s, args = %s" % (opts, args)
    except getopt.GetoptError:
      sys.exit(2)
    self.fastaunique_cmd = None
    for opt, arg in opts:
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
    #print "get_out_file_names"
    n = 0
    #f_input  = fastalib.SequenceSource(inputfile)
    f_input = FastaReader(inputfile)
    while f_input.next():
      n+=1
      if (n % 100000 == 0 or n == 1):
        #sys.stderr.write('\r[demultiplex] Reading FASTA into memory: %s\n' % (n))
        #sys.stderr.flush()
        pass
      #print('f_input.id',f_input.id)
      f_out_name = self.make_file_name(f_input.id)
      self.out_file_names.add(f_out_name)
  # real  0m4.446s
  

  # def get_out_file_names_readf(self):
  #   print "get_out_file_names_readf"
  #   inputfile_content   = fastalib.ReadFasta(inputfile)
  #   self.out_file_names = [id.split("_")[0] + ".fa" for id in inputfile_content.ids]
  # real  0m16.198s
    
  def open_out_sample_files(self):
    #print "open_out_sample_files"
    self.get_out_file_names()
    for sample in self.sample_names:
      file_name = sample+'.fa'
      file_path = os.path.join(self.project_path,file_name)
      self.out_files[file_name] = open(file_path, "a")

  def close_sample_files(self):
      [o_file[1].close() for o_file in self.out_files.items()] 
      return
      
  def make_file_name(self, id):
    # adjust to your specific defline
    sampleName = id.split("|")[0].split('_')[0]
    fileName = sampleName + ".fa"
    self.sample_names.add(sampleName)
    #print(fileName)
    return fileName
  
  def demultiplex_input(self, inputfile):
    #print "demultiplex_input"
    #f_input  = fastalib.SequenceSource(inputfile)
    f_input = FastaReader(inputfile)
    i = 0
    while f_input.next():
      i += 1
      id = f_input.id
      
      f_out_name = self.make_file_name(f_input.id)
      
      f_output   = self.out_files[f_out_name]
      self.write_id(f_output, id)
      self.write_seq(f_output, f_input.seq)
      if (i % 100000 == 0 or i == 1):
        #sys.stderr.write('\r[demultiplex] Writing entries into files: %s\n' % (i))
        #sys.stderr.flush()
        pass
    self.close_sample_files()
    
  def create_directories(self):
    analysis_dir = os.path.join(self.project_path,'analysis')
    if (os.path.exists(analysis_dir)):
        shutil.rmtree(analysis_dir)
    os.makedirs(analysis_dir)
    for sample in self.sample_names:
        sample_dir = os.path.join(analysis_dir,sample)
        os.makedirs(sample_dir)
        
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
        
        result = subprocess.check_output(' '.join(fastaunique_cmd_list), shell=True)
        
        sum_unique_seq_count += int(result.strip())
        
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
    
    """
    
    demult = Demultiplex()
    (inputfile) = demult.get_args(sys.argv[1:])
    #print 'Input file is "%s"' % inputfile
    if inputfile == '':
        print(usage)
        sys.exit()
    
    
    demult.open_out_sample_files()
    demult.demultiplex_input(inputfile)
    demult.create_directories()
    if demult.fastaunique_cmd:
        sum_unique_seq_count = demult.unique_files()
        #print(sum_unique_seq_count)
    demult.cleanup()
    
    

