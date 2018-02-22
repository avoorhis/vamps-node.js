#!/usr/bin/env python

#########################################
#
# fasta2tax.py
#
########################################
import sys,os
import argparse
import pymysql as MySQLdb
import json



py_pipeline_path = os.path.expanduser('~/programming/py_mbl_sequencing_pipeline')


#my $rdpFile = "$inputfile.rdp";
print "rdp file: start\n";
#my $rdpFile = dirname($inputfile)."/$project--$dataset.fa.rdp";
rdpFile = inputfile+".rdp";
#my $rdpFile = "$project--$dataset.fa.rdp";
print "rdp file: rdpFile\n";
loadFile1 = inputfile+".load1"
loadFile2 = inputfile+".load2"
outFile = inputfile+".rdpout"
logFile = inputfile+".rdplog"
# $logFile  => /usr/local/www/vamps/tmp/fasta2tax.log

if DEBUG:
	print("DEBUG: Invoked with arguments (post processing):\n")
	print("DEBUG: user: user\n")
	print("DEBUG: inputfile: inputfile\n")
	print("DEBUG: project: project\n")
	print("DEBUG: dataset: dataset\n")
	print("DEBUG: path_to_apps: path_to_apps\n")
	print("DEBUG: database: database\n")
	print("DEBUG: table1: table1\n")
	print("DEBUG: table2: table2\n")
	print("DEBUG: db_user: db_user\n")
	print("DEBUG: db_password: db_password\n")
	print("DEBUG: db_hostname: db_hostname\n")


#######################################
#
# Do sanity checking for presence of 
# values from argument processing...
#
#######################################




#######################################
#
# Run RDP and rdp_file_creator...
#
#######################################
def run(project):
	path_to_rdp = py_pipeline_path+"/bin/rdp"
	print(path_to_rdp)


	rdpCmd = path_to_rdp+' ' +inputfile+' '+rdpFile

	print ("Preparing to execute RDP Command: rdpCmd\n";)

	rdpCmdOutput = subprocess.check_output(rdpCmd, shell=True)




	#my $rdpCheckCmd = "$path_to_apps/rdp_checker -q -log $logFile -b 80 -project \"$project\" -dataset \"$dataset\" -f1 $loadFile1 -f2 $loadFile2 $rdpFile";
	rdpCheckCmd = py_pipeline_path+"/bin/rdp_file_creator -s database -q -log logFile -b 80 -project \"$project\" -dataset \"$dataset\" -f1 $loadFile1 -f2 $loadFile2 $rdpFile";


	rdpCheckOutput = subprocess.check_output(rdpCheckCmd, shell=True)

	# $DEBUG && print "DEBUG: rdp_file_creator exited with result code: $rdpCheckExitCode<br><br>\n";
	# if ($DEBUG) {
	# 	my @rdpCheckOutput_lines = split /\n/, $rdpCheckOutput;
	# 	foreach my $output_line (@rdpCheckOutput_lines) {
	# 		print "DEBUG: $output_line<br>\n";
	# 	}
	# }

	# my $rdpCheckExitString;
	# if ($rdpCheckExitCode == 0) {
	# 	$rdpCheckExitString = "0";
	# } elsif ($rdpCheckExitCode == 253) {
	# 	$rdpCheckExitString = "RDP boot score value is not valid.";
	# } elsif ($rdpCheckExitCode == 254) {
	# 	$rdpCheckExitString = "Taxonomy file is not valid.";
	# } elsif ($rdpCheckExitCode == 255) {
	# 	$rdpCheckExitString = "Internal error: Could not locate taxonomy file.";
	# } else {
	# 	$rdpCheckExitString = "Unknown error.";
	# }
	#
	# if ($rdpCheckExitCode != 0) {
	# 	print "Error performing RDP taxonomic checks: $rdpCheckExitString.  Data has not been uploaded.  Project=\"$project\", Dataset=\"$dataset\", User name=\"$user\"\n";
	# 	exit $rdpCheckExitCode;
	# }

	#######################################
	#
	# Load the final taxonomy into the tables specified in the @tables array...
	# It would be really nice if we could roll this back on failure.
	#
	#######################################

	# my $dsn = "dbi:mysql:$database:$db_hostname";
	# #$DEBUG && print "DEBUG: Connecting to database\n$dsn\n";
	#
	# my $dbh = DBI->connect($dsn, $db_user, $db_password) or die "Unable to connect to $database database\n";
	#
	# if ($use_transactions) {
	#   # Encapsulate the changes to these tables in a transaction...
	#   my $query = "START TRANSACTION";
	#   my $handle = $dbh->prepare($query) or die "Unable to prepare query: $query\n";
	#   $handle->execute or die "Unable to execute query: $query\n";
	# }
	#
	# my %load_files = ($table1 => $loadFile1, $table2 => $loadFile2);
	# foreach (keys %load_files) {
	#   # Get a table...
	#   # Table1 = vamps_data_cube_uploads, Table2 = vamps_junk_data_cube_pipe;
	#   my $table = $_;
	#
	#   # Clear out the old data and replace with the new
	#   #$DEBUG && print "DEBUG: Removing old project/dataset records from table $dsn.$table...\n";
	#   my $cleanQuery = "delete from $table where project='" . $project ."' and dataset = '" . $dataset . "'";
	#   #$DEBUG && print "DEBUG: Preparing query: \"$cleanQuery\"...\n";
	#   my $clean_h = $dbh->prepare($cleanQuery) or die "Unable to prepare query: $cleanQuery\n";
	#   $clean_h->execute or die "Unable to execute query: $cleanQuery\n";
	#
	#   # Add the new data into the table
	#   #$DEBUG && print "DEBUG: Loading final taxonomy into the table $dsn.$table...\n";
	#
	#   # Set up the query to Load the data
	#   my $loadQuery = "load data local infile '" . $load_files{$table} . "' replace into table $table fields terminated by '\t' lines terminated by '\n'
	#   set classifier='RDP'";
	#
	#   #$DEBUG && print "DEBUG: Preparing query: \"$loadQuery\"...\n";
	#
	#   my $load_h = $dbh->prepare($loadQuery) or die "Unable to prepare query: $loadQuery\n";
	#
	#   $load_h->execute or die "Unable to execute query: $loadQuery\n";
	#
	#   if ($dbh->err) {
	#     if ($use_transactions) {
	#       # Encapsulate the changes to these tables in a transaction...
	#       my $query = "ROLLBACK";
	#       my $handle = $dbh->prepare($query) or die "Unable to prepare query: $query\n";
	#       $handle->execute or die "Unable to execute query: $query\n";
	#     }
	#     print "Application Error: An error has occured while trying to load the data into the MySQL database. The following query was used: \"$loadQuery\".\n";
	#     print "The database engine reports the error as: \"".$dbh->errstr."\".\n";
	#     print "This is a fatal error. Exiting.\n";
	#     exit 1;
	#   }
	# }
	#
	# if ($use_transactions) {
	#   # commit the transaction...
	#   my $query = "COMMIT";
	#   my $handle = $dbh->prepare($query) or die "Unable to prepare query: $query\n";
	#   $handle->execute or die "Unable to execute query: $query\n";
	# }






	#$DEBUG && print "DEBUG: Cleaning out tmp files...\n";
	# foreach my $i ($inputfile, $rdpFile, $loadFile1, $loadFile2, $logFile)
	# {
	# 	#my $rmErr = system("rm -f $i");
	# }

	#$DEBUG && print "DEBUG: Execution complete.\n";
	#print "Done and clean from fasta2tax.pl<br>\n";
