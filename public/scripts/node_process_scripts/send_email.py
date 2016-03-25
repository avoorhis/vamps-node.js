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
from smtplib import SMTP
#import smtplib
import string

def send_email(args):
    
    TO          = args.toemail
    subject     = args.subject
    message     = args.message
    file_base   = args.file_base
    run         = args.runcode
    
    status_file = os.path.join(file_base,'STATUS.txt')
    error = False
    
    SUBJECT = subject
    HOST = "mail.mbl.edu"
    FROM = args.fromemail
    BODY = string.join((
            "From: %s" % FROM,
            "To: %s" % TO,
            "Subject: %s" % SUBJECT ,
            "",
            MESSAGE
            ), "\r\n")
            
    server = SMTP(HOST)
    server.sendmail(FROM, [TO], BODY)
    server.quit()
    
if __name__ == '__main__':

    import argparse  

    
    myusage = """usage: send_email.py -email email_address -sub "Subject Text" -msg "Message Text" 
         
         Sends email to address
         There must be quotes around text
    
    """


    parser = argparse.ArgumentParser(description="Sends Email to address when process is complete" ,usage=myusage)
                                                    
    parser.add_argument("-to","--toemail",        required=True,  action="store",   dest = "toemail", 
                                                    help="")                                   
    parser.add_argument("-from","--fromemail",    required=True,  action="store",   dest = "fromemail", 
                                                    help="")
    parser.add_argument("-sub","--subject",        required=True,  action="store",   dest = "subject", default='Missing Subject',
                                                    help="")    
                                                    
    parser.add_argument("-msg","--message",        required=True,  action="store",   dest = "message", default='Missing Message',
                                                    help="")                                                     
                                                  
    args = parser.parse_args()
    send_email(args)
    
