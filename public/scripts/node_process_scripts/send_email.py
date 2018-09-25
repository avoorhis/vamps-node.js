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
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from urllib.parse import unquote
import string

def send_email(args):
    
    TO          = "To: %s" % args.toemail
    MESSAGE     = str(args.message) + '\n\nFrom: '+ str(args.name)
    
    error = False
    msg = MIMEMultipart()
    
    SUBJECT = "VAMPS Query: %s" % args.subject
    HOST = "smtp.mbl.edu"
    #HOST = "mail.mbl.edu"
    #FROM = "From: %s" % args.fromemail
    #BODY = str(' '.join([FROM, TO, SUBJECT, " ", MESSAGE]))
    #print(BODY) 
    msg['From'] = args.fromemail
    msg['To'] = args.toemail
    msg['Subject'] = SUBJECT      
    text = "VAMPS Query Message:\n"+args.message+"\n\nFrom: "+ args.name+"\n"+args.fromemail
    
    part1 = MIMEText(unquote(text.strip('"')), 'plain')   #.encode('utf-8', 'surrogateescape')
    #part2 = MIMEText(html, 'html')
    msg.attach(part1)
    #msg.attach(part2)
    server = SMTP(host=HOST) 
    #server.sendmail(args.fromemail, args.toemail, BODY.encode('utf-8', 'surrogateescape'))
    #server.sendmail(args.fromemail, args.toemail, BODY.replace(u'\xa0', u' '))
    server.sendmail(args.fromemail, args.toemail, msg.as_string())
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
    parser.add_argument("-name","--name",        required=False,  action="store",   dest = "name", default='',
                                                    help="")                                               
    parser.add_argument("-msg","--message",        required=True,  action="store",   dest = "message", default='Missing Message',
                                                    help="")                                                     
                                                  
    args = parser.parse_args()
    send_email(args)
    
