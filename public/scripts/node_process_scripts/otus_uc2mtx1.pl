#!/usr/bin/env perl

#########################################
#
# uclust_otus: Create OTUs with USearch --uclust
#
# Author: Susan Huse, shuse@mbl.edu
#
# Date: Thu Jun  9 14:04:17 EDT 2011
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
# Keywords: otu cluster uclust usearch
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

#######################################
#
# Set up usage statement
#
#######################################
my $script_help = "
 uclust_otus - reads a fasta of sequences and runs \"USearch --uclust\" to create
               final consensus sequences and clusters.
\n";

my $usage = "
   Usage:  uclust_otus -i input.fa -p pct_similarity

      ex:  uclust_otus -i lsmv6v4.fa -p 0.96

 Options:
           -i input fasta file, not uniqued
           -p percent identity of sequences in a cluster [default: 0.97]
           -go  gap open penalty, default = 6
           -v verbose only, print out uclust pipeline, but don't run it
           -site vamps or vampsdev

 Current pipeline entails:

            usearch --sort myfile.fa --output myfile.sort.fa --stable_sort --log uclust_otus.log

            usearch --cluster myfile.sort.fa --derep_subseq --seedsout myfile.derep.fa --sizeout --stable_sort --log uclust_otus.log

            usearch --sortsize myfile.derep.fa --output myfile.derep.sort.fa --stable_sort --log uclust_otus.log

       -->  usearch --cluster myfile.derep.sort.fa --id 0.97 --consout myfile.cons.pre97.fa --iddef 3 --xdrop_nw 0 --gapopen \"6.0I/1.0E\" --w 20 --slots 16769023 --sizein --sizeout --usersort --stable_sort --log uclust_otus.log

            usearch --sortsize myfile.cons.pre97.fa --output myfile.cons.pre97.sort.fa --stable_sort --log uclust_otus.log

            usearch --cluster myfile.cons.pre97.sort.fa --id 0.97 --seedsout myfile.seeds.97.fa --consout myfile.cons.97.fa --iddef 3 --xdrop_nw 0 --gapopen \"6.0I/1.0E\" --usersort --sizein --sizeout --stable_sort --w 20 --slots 16769023 --log uclust_otus.log

            usearch64 --query myfile.fa --db myfile.seeds.97.fa --log uclust_otus.log --id 0.97 --global --uc myfile.otus.97.uc --iddef 3 --gapopen \"6.0I/1.0E\"

            uclust2mtx myfile.otus.97.uc > myfile.otus.97.mtx

\n";

#######################################
#
# Definition statements
#
#######################################
#Commandline parsing
#my $arg_count = 3;
my $min_arg_count = 2;
my $max_arg_count = 4;
my $verbose = 0;
my $self_cmd = join(" ", $0, @ARGV);
my $db_source = 'all';
#Runtime variables
my $in_filename;
my $pct_id;
my $gap_open = 6;
#my $usearch_cmd = "usearch64";  # commands run using system();

my $log_filename = '';
#my $tax_available=0;
my $final_max_accepts = 20;
my $final_max_rejects = 500;
my $base='';

my $site = 'vampsdev';
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
	} elsif ($ARGV[0] eq "-i") {
		shift @ARGV;
		$in_filename = shift @ARGV;
	} elsif ($ARGV[0] eq "-site") {
		shift @ARGV;
		$site = shift @ARGV;
	} elsif ($ARGV[0] eq "-dbsource") {
		shift @ARGV;
		$db_source = shift @ARGV;
	} elsif ($ARGV[0] eq "-go") {
		shift @ARGV;
		$gap_open = shift @ARGV;
	} elsif ($ARGV[0] eq "-p") {
		shift @ARGV;
		$pct_id = shift @ARGV;
	} elsif ($ARGV[0] eq "-base") {
		shift @ARGV;
		$base = shift @ARGV;
	} elsif ($ARGV[0] eq "-v") {
		$verbose = 1;
		shift @ARGV;
	} elsif ($ARGV[0] =~ /^-/) { #unknown parameter, just get rid of it
		print "Unknown commandline flag \"$ARGV[0]\".\n";
		print $usage;
		exit -1;
	}
}


#######################################
#
# Parse commandline arguments, ARGV
#
#######################################

#if (scalar @ARGV != $arg_count)
#if ((scalar @ARGV < $min_arg_count) || (scalar @ARGV > $max_arg_count))
if ( (! $pct_id) || (! $in_filename) )
{
	print "Incorrect number of arguments.\n";
	print "$usage\n";
	exit;
}

#Test validity of commandline arguments
if ( ($in_filename ne "stdin") && (! -f $in_filename) )
{
	print "Unable to locate input fasta file: $in_filename.\n";
	exit -1;
}

if ( ( $pct_id !~ /[0-9\.]+/) || ($pct_id >= 1) )
{
	print "Percent identity value needs to be a decimal between 0 and 100\n";
	exit -1;
}
$log_filename = $base.'otus_uc2mtx.log';
open(LOG, ">>$log_filename")  || warn "Unable to open log file, $log_filename, for writing.  Exiting...\n";
print LOG "$self_cmd\n";

my $prefix = $in_filename;
$prefix =~ s/\.fa$//;
$prefix =~ s/\.fasta$//;
$prefix =~ s/\.fas$//;
$prefix =~ s/\.fna$//;

if (int(100 * $pct_id) != 100 * $pct_id)
{
    my $msg = "Running with percent similarity of $pct_id, but using " . int(100 * $pct_id) . " in output file names\n";
    warn $msg;
    print LOG $msg;
}

my $pctid_int = int(100 * $pct_id);
my $preclust_prefix = $prefix . ".p" . $pctid_int;

#my $usearch_cmd = "/groups/vampsweb/$site/seqinfobin/usearch";  # commands run using system();
my $usearch_cmd = "/groups/vampsweb/$site/seqinfobin/vsearch";  # commands run using system();
#######################################
#
# Step through the pipeline of usearch commands
#
#######################################
my $datasets_file = "datasets.txt";  #has to have the projects and datasets (one per row tab separated).
my @uclust_cmds;
#push (@uclust_cmds, $usearch_cmd . " --sortbylength $prefix.fa --output $prefix.sort.fa --log $log_filename");
# -- cluster_fast will sort by length before clustering
push (@uclust_cmds, $usearch_cmd . " --cluster_fast $prefix.fa --sizeout --iddef 3 --id $pct_id --consout $prefix.cons.$pctid_int.fa --uc $prefix.otus.$pctid_int.uc --log $log_filename");

#push (@uclust_cmds, $usearch_cmd . " --sortsize $prefix.derep.fa --output $prefix.derep.sort.fa --stable_sort --log $log_filename");
#push (@uclust_cmds, $usearch_cmd . " --cluster $prefix.derep.sort.fa --id $pct_id --consout $prefix.cons.pre$pctid_int.fa --iddef 3 --xdrop_nw 0 --gapopen \"6.0I/1.0E\" --w 20 --slots 16769023 --sizein --sizeout --usersort --stable_sort --log $log_filename");
#push (@uclust_cmds, $usearch_cmd . " --sortsize $prefix.cons.pre$pctid_int.fa --output $prefix.cons.pre$pctid_int.sort.fa --stable_sort --log $log_filename");
#push (@uclust_cmds, $usearch_cmd . " --cluster $prefix.cons.pre$pctid_int.sort.fa --id $pct_id --seedsout $prefix.seeds.$pctid_int.fa --consout $prefix.cons.$pctid_int.fa --iddef 3 --xdrop_nw 0 --gapopen \"6.0I/1.0E\" --usersort --sizein --sizeout --stable_sort --w 20 --slots 16769023 --log $log_filename");
#push (@uclust_cmds, $usearch_cmd . " --query $prefix.fa --db $prefix.seeds.$pctid_int.fa --log $log_filename --id $pct_id --global --uc $prefix.otus.$pctid_int.uc --iddef 3 --gapopen \"6.0I/1.0E\" --maxaccepts $final_max_accepts --maxrejects $final_max_rejects");

push (@uclust_cmds, "otus_uc2mtx2.pl -base $base -uc $prefix.otus.$pctid_int.uc -site $site -dbsource $db_source -dsfile $datasets_file > $prefix.otus.$pctid_int.mtx");
# This is mainly for user uploaded projects that have no taxonomic assignments
#if($tax_available){
#    push (@uclust_cmds, "/groups/vampsweb/$site/apps/otu2tax_vamps -uc $prefix.otus.$pctid_int.uc -site $site -dbsource $db_source  > $prefix.otus.$pctid_int.tax");
#}

for my $c (@uclust_cmds)
{
    if ($verbose)
    {
        print "\nUSEARCH CMD: $c\n";
    } else {
        my $run_error = run_command($c);
        print "$c\n\n";
        if ($run_error) { exit; }
    }
}


exit;
############################################################
#
# Subroutine: run_command
#       run system commands
#
# #########################################################
sub run_command
{
    my $command = shift;

    #print LOG "$command\n";
    my $echo_cmd_err = system("echo \"$command\" >> $log_filename");
    if ($echo_cmd_err) {print "Error writing to the log file, continuing blithely along, running the command anyway\n";}

    if ($verbose) {print "$command\n";}
    my $command_err = system($command);
    if ($command_err)
    {
        my $err_msg = "Error $command_err encountered while running: \"$command\".";
        #print LOG "$err_msg\n";
        my $echo_err_msg_err = system("echo \"$err_msg\" >> $log_filename");
        if ($echo_err_msg_err) {print "Error writing to the log file\n";}

        warn "$err_msg\n";
        return 1;
    } else {
        return 0;
    }
}
