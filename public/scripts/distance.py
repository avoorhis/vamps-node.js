#!/usr/bin/python

""" 
	distance.py


"""
import sys,os
import scipy
import argparse
import csv

def distance(args):
	print 'made it'
	print args
	with open(args.file, 'rb') as csvfile:
		reader = csv.reader(csvfile, delimiter=',')
		for row in reader:
			print row
#
#
#
if __name__ == '__main__':

	usage = """

	"""
	parser = argparse.ArgumentParser(description="Calculates distance from input matrix file" ,usage=usage)
	parser.add_argument('-in','--in',   required=True, action="store",   dest='file', help = '') 
	parser.add_argument('-max','--max',   required=False, action="store",   dest='max_length', help = 'for trimming', default='') 
 	parser.add_argument('-chi','--chi',   required=False, action="store_true",   dest='chimera', help = 'chimera check', default=False) 
 	args = parser.parse_args()


	distance(args) 
