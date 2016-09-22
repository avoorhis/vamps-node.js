import sys, getopt
import IlluminaUtils.lib.fastalib as fastalib

class Demultiplex:

  def __init__(self):
    self.out_file_names = set()
    self.inputfile      = ''
    self.out_files      = {}


  def usage(self):
    print '''python demultiplex_qiita.py -i <inputfile>
             '''

  def get_args(self, argv):
  
    try:
      opts, args = getopt.getopt(argv, "hi:", ["ifile="])
      # print "opts = %s, args = %s" % (opts, args)
    except getopt.GetoptError:
      sys.exit(2)
    
    for opt, arg in opts:
      if opt == '-h':
        usage()
        sys.exit()
      elif opt in ("-i", "--ifile"):
        self.inputfile = arg
            
    return (self.inputfile)
      
      
  def write_id(self, output_file_obj, id):
    output_file_obj.write('>%s\n' % id)

  def write_seq(self, output_file_obj, seq):
    output_file_obj.write('%s\n' % seq)
      
  def get_out_file_names(self):
    print "get_out_file_names"
    n = 0
    f_input  = fastalib.SequenceSource(inputfile)
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
    print "open_out_sample_files"
    self.get_out_file_names()
    for sample in self.out_file_names:
      self.out_files[sample] = open(sample, "a")

  def close_sample_files(self, out_files):
      [o_file[1].close() for o_file in out_files.items()] 
      return
      
  def make_file_name(self, id):
    return id.split("_")[0] + ".fa"
  
  def demultiplex_input(self, inputfile):
    print "demultiplex_input"
    f_input  = fastalib.SequenceSource(inputfile)
    i = 0
    while f_input.next():
      i += 1
      id = f_input.id
      
      f_out_name = self.make_file_name(f_input.id)
      f_output   = self.out_files[f_out_name]
      self.write_id(f_output, id)
      self.write_seq(f_output, f_input.seq)
      if (i % 100000 == 0 or i == 1):
        sys.stderr.write('\r[demultiplex] Writing entries into files: %s\n' % (i))
        sys.stderr.flush()

if __name__ == "__main__":
    
    demult = Demultiplex()

    (inputfile) = demult.get_args(sys.argv[1:])
    print 'Input file is "%s"' % inputfile
    
    demult.open_out_sample_files()
    demult.demultiplex_input(inputfile)
