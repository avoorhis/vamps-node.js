#!/usr/bin/env python

##!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (C) 2011, Marine Biological Laboratory
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free
# Software Foundation; either version 2 of the License, or (at your option)
# any later version.
#
# Please read the COPYING file.
#

import os
from stat import * # ST_SIZE etc
import sys
import shutil
import types
import time
import random
import csv
from time import sleep
import ConfigParser




use_local_pipeline = False
py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')
print py_pipeline_path
sys.path.append(py_pipeline_path)
from pipeline.run import Run
from pipelineprocessor import process
from pipeline.db_upload import MyConnection
from pipeline.utils import Dirs, PipelneUtils       
    

def start_rdp(args):
    """
      Doc string
    """
   os.chdir(args.baseoutputdir)
    

            
if __name__ == '__main__':
    import argparse
    
   
    
    myusage = """usage: rdp.py  [options]
         
         This is will start the (customized) python_pipeline
         for the GAST process, creating the vamps_* files
         for input to the new_vamps database.
         
         where
            
            -c/--config    REQUIRED path to config file.
                            
                    SHOULD be the only thing needed
                    (create config file with 1-vamps-load.py   )   
           
    
    
    """
  
