#!/usr/bin/env perl

#########################################
#
# uclust2mtx: converts the UClust otus *.uc file to a matrix
#
# Author: Susan Huse, shuse@mbl.edu
#
# Date: Fri Aug 19 09:49:26 EDT 2011
#
# Copyright (C) 2011 Marine Biological Laborotory, Woods Hole, MA
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# For a copy of the GNU General Public License, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
# or visit http://www.gnu.org/copyleft/gpl.html
#
# Keywords: otu otupipe uclust cluster matrix mtx
#
# Assumptions:
#
# Revisions:
#
# Programming Notes:
#
########################################
use strict;
use warnings;
use DBI;

#######################################
#
# Set up usage statement
#
#######################################
my $script_help = "
 uclust2mtx - reads the UClust output *.uc file and
              creates a new matrix file mapping each otu to its occurrence in
              the available datasets.
\n";

my $usage = "
   Usage:  uclust2mtx readmap.uc > output.mtx
              -site vamps or vampsdev [required]
\n";
# Options:
#           -i  the readmap.uc or equivalent output from otupipe.bash
#           -o  new output otu - dataset matrix file

#######################################
#
# Definition statements
#
#######################################
#Commandline parsing
my $verbose = 0;
my $self_cmd = join(" ", $0, @ARGV);

#Runtime variables
my $in_filename;
my $out_filename;
my $site = 'vampsdev';
my $db_hostname_vamps;
my $dbName_vamps;
my $db_hostname_user;
my $dbName_user;
my $web_user;
my $db_source = 'all';
my $reads_table1;
my $reads_table2;
#my $reads_table = 'trimseq as t join dataset as d using(dataset_id) join project as p using(project_id)';
my $base='';
my $id_field = 'read_id';
my $dsfile;
#my $log_filename = "./" . $0 . ".log";
my $log_filename = $0;
$log_filename =~ s/^.*\///;
$log_filename = "./" . $log_filename . ".log";

#######################################
#
# Test for commandline arguments
#
#######################################

if (! $ARGV[0] )
{
	print $script_help;
	print $usage;
	exit -1;
}


while ((scalar @ARGV > 0) && ($ARGV[0] =~ /^-/))
{
	if ($ARGV[0] =~ /-h/)
	{
		print $script_help;
		print $usage;
		exit 0;
	} elsif ($ARGV[0] eq "-uc") {
		shift @ARGV;
		$in_filename = shift @ARGV;
	} elsif ($ARGV[0] eq "-site") {
		shift @ARGV;
		$site = shift @ARGV;
	} elsif ($ARGV[0] eq "-dbsource") {
		shift @ARGV;
		$db_source = shift @ARGV;
	} elsif ($ARGV[0] eq "-base") {
		shift @ARGV;
		$base = shift @ARGV;
	}  elsif ($ARGV[0] eq "-dsfile") {
		shift @ARGV;
		$dsfile = shift @ARGV;
	} elsif ($ARGV[0] eq "-v") {
		$verbose = 1;
		shift @ARGV;
	} elsif ($ARGV[0] =~ /^-/) { #unknown parameter, just get rid of it
		print "Unknown commandline flag \"$ARGV[0]\".\n";
		print $usage;
		exit -1;
	}
}


my $home;
if ($site eq 'vamps' ){

   # for vamps:
   $db_hostname_vamps = "vampsdb";
   $dbName_vamps = 'vamps';
   $db_hostname_user = "bpcdb2";
   $dbName_user = 'vamps_user_uploads';
   $web_user = "vampshttpd";

   $home = "/xraid2-2/vampsweb/vamps/";
}elsif($site eq 'vampsdev' ){

   # for vampsdev
   $db_hostname_vamps = "vampsdev";
   $dbName_vamps = 'vamps';
   $db_hostname_user = "bpcdb2";
   $dbName_user = 'vampsdev_user_uploads';
   $web_user = "vampsdevhttpd";

   $home = "/xraid2-2/vampsweb/vampsdev/";
}else{
    print "No useful database host selected: $site exiting\n";
    exit;
}
#######################################
#
# Parse commandline arguments, ARGV
#
#######################################

# Test for both files specified
if (! $in_filename)
{
	print "Incorrect number of arguments.\n";
	print "$usage\n";
	exit;
}

# Test validity of commandline arguments
if ( ($in_filename ne "stdin") && (! -f $in_filename) )
{
	print "Unable to locate input otupipe.bash readmap.uc file: $in_filename.\n";
	exit -1;
}

open(LOG, ">>$log_filename")  || warn "Unable to open log file, $log_filename, for writing.  Exiting...\n";
print LOG "$self_cmd\n";

#######################################
#
# Open the files
#
#######################################

if ($in_filename eq "stdin")
{
    open(IN, "-") ;
} else {
    open(IN, "<$in_filename") || die("Unable to read input file: $in_filename.  Exiting.\n");
}

#######################################
#
# Connect to the database
#
#######################################

#require("/xraid2-2/vampsweb/".$site."/apps/mysql_connection_vamps");
#my ($vampsdbh, $userdbh) = get_connection($home, $db_hostname_vamps, $dbName_vamps, $db_hostname_user, $dbName_user);

#######################################
#
# projects,datasets list
#
#######################################
# open(DATASETS, "<$dsfile") || die("Unable to read datasets file: $dsfile.  Exiting.\n");
# my $pjds="(";
# my %dataset_names;  # list of otu names
# my $project_dataset;
# while (my $line = <DATASETS>)
# {
#
#     chomp $line;
#     #print "$line\n";
#     my @items = split(/\t/, $line);
#     $pjds .= " (project='$items[0]' and dataset='$items[1]') or";
#     $project_dataset = $items[0] . "--" . $items[1];
#     $dataset_names{$project_dataset}++;
# }
# # convert trailing 'or' to ')'
# $pjds =~ s/or$/\)/;


#######################################
#
# SQL statements
#
#######################################

#Select
# $reads_table1 = 'vamps_export_pipe';
# $reads_table2 = 'vamps_export';
# my $select_query;
# my $select_query_h;
# if($db_source eq 'user'){
#     $select_query = "SELECT project, dataset FROM $reads_table1 WHERE $id_field = ? and $pjds";
# }elsif($db_source eq 'bpc'){
#     $select_query = "SELECT project, dataset FROM $reads_table2 WHERE $id_field = ? and $pjds";
# }else{
#     #default is 'all'
#     $select_query = "SELECT project, dataset FROM $reads_table1 WHERE $id_field = ? and $pjds
#                     UNION
#                     SELECT project, dataset FROM $reads_table2 WHERE $id_field = ? and $pjds";
# }
# $select_query_h = $vampsdbh->prepare($select_query) or die "Unable to prepare statement: $select_query. Error: " . $vampsdbh->errstr . "\n";
#print "$select_query\n";

#######################################
#
# Step through the hits and assign to OTUs
#
#######################################
my %otu_counts; # otu counts by dataset dictionary

my %closest_otu; # for each read the best matching OTU
my %closest_otu_size; # for each read size of the best matching OTU (used for ties)
my %best_similarity; # for each read, the highest percent similarity


# Load the OTU assignments for each read
# because reads can map to more than one OTU,
# we have to map all reads to a single OTU before we can tally by dataset
# READ UC FILE
while (my $line = <IN>)
{

    #
    # Parse the line
    # 0 = H hit or N nonhit, 3 = pct identity, 8 = read id, 9 = OTU or Chimera name
    #
	chomp $line;
    if ($line =~ /^#/) {next;}  # Skip comment lines at the top
    my @line_data = split(/\t/, $line);
    if ($line !~ /^H/ && $line !~ /^N/) {next;}
    # Grab the read id and OTU#
    my $read_id='';


    my $otu = $line_data[9];
    if ( ($line_data[0] eq "H") && ($otu =~ /^CHIMERA/) )
    {
        $otu = "ZZChimeras";  # To force to the bottom of the matrix
        $read_id = $line_data[8];

    } elsif ($line_data[0] eq "N") {
        $otu = "Unclustered";

    } elsif ($line_data[0] eq "H") {
        $otu =~ s/;.*//;
        $read_id = $line_data[8];

    }
    $read_id =~ s/^QiimeExactMatch\.//;
    $read_id =~ s/\|.*$//;
#    if ($otu =~ /Cluster1021/) {warn "$line\n";}

    my $otu_size = $line_data[9];
    $otu_size =~ s/^.*;size=//;
    my $similarity = $line_data[3];

print "read_id ".$read_id."\n";
    # Need to account for parallel mapping of reads to multiple OTUs,
    # Map each read to the closest OTU, in case of ties, map it to the purported largest otu
    #use Scalar::Util qw(looks_like_number);
    if (exists $best_similarity{$read_id})
    {
        #Argument "*" isn't numeric in numeric gt (>) at /xraid2-2/vampsweb/vamps/apps/uclust2mtx_vamps line 275, <IN> line 38303046.
        if ($similarity =~ /^[+-]?\d+$/ ) {  # check for numeric $similarity
            if ( $similarity > $best_similarity{$read_id})
            {
                $closest_otu{$read_id} = $otu;
                $closest_otu_size{$read_id} = $otu_size;
                $best_similarity{$read_id} = $similarity;
            } elsif ($similarity == $best_similarity{$read_id}) {
                if ($otu_size > $closest_otu_size{$read_id})
                {
                    $closest_otu{$read_id} = $otu;
                    $closest_otu_size{$read_id} = $otu_size;
                }
            }
        }
    } else {
        $closest_otu{$read_id} = $otu;
        $closest_otu_size{$read_id} = $otu_size;
        $best_similarity{$read_id} = $similarity;
    }


}

#
# Close the files, release the hashes
#
if ($in_filename ne "stdin") {close(IN);}
undef %best_similarity; #not needed anymore, can be quite large
undef %closest_otu_size;

my @pjdsid;
my $project_dataset;
my %dataset_names;
#print "In uclust2mtx_vamps\n";
#######################################
#
# Tally the OTU Counts by Dataset
#
#######################################
foreach my $read_id (keys %closest_otu)
{
    my $otu = $closest_otu{$read_id};


    #
    # look up project and dataset for each read
    #  NO: get the project and dataset FROM the read_id

    if($read_id){
        @pjdsid = split(/--/,$read_id);

        $project_dataset = $pjdsid[0] . "--" . $pjdsid[1];

        $otu_counts{$otu}{total}++;
        $otu_counts{$otu}{$project_dataset}++;
        $dataset_names{$project_dataset}++;
    }
}
#print "DS names: ".%dataset_names."\n";
#while (my ($k,$v)=each %dataset_names){print "$k $v\n"}

#######################################
#
# Print out the results
#
#######################################
if ($verbose) {exit;}

# Print out the header
print join("\t", "Cluster ID", sort keys %dataset_names) . "\n";
foreach my $o (sort keys %otu_counts)
{

    #my $count_of_datasets = (scalar keys %{$otu_counts{$o}} ) - 1;

    #print join("\t", $o, $otu_counts{$o}{total}, $count_of_datasets);
    print $o;

    foreach my $pd (sort keys %dataset_names)
    {
        if (exists $otu_counts{$o}{$pd})
        {
            print "\t" . $otu_counts{$o}{$pd} ;
        } else {
            print "\t0";
        }
    }
    print "\n";


    #print join("\t", $o, $otu_counts{$o}{total}, $count_of_datasets);
}

# print 'Cluster9953 '.$otu_tcount{'Cluster9953'};
# print "\n";
my $otu_count = scalar keys %otu_counts;
`echo "otu_count = $otu_count" >> ${base}info.txt`;
