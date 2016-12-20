#!/usr/bin/env perl

#########################################
#
# otu2tax: assign consensus taxonomic strings to read_ids in the tables
#
# Author: Susan Huse, shuse@mbl.edu
#
# Date: Sat Oct 20 18:00:50 EDT 2007
#
# Copyright (C) 2008 Marine Biological Laboratory, Woods Hole, MA
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
# Keywords: 454 database taxonomy ref16s dotur otu cluster
#
# Assumptions:
#
# Revisions:  Removed the boot levels, defaulting to 80, but reftable now uses other
#             sources, too.  We can put the boot scores back in later.
#
# Programming Notes:
#
########################################
use strict;
use warnings;
use DBI;

#my $path = $ENV{'PATH'};
#$ENV{'PATH'} = "$path:/bioware/perlmodules/";



#######################################
#
# Set up usage statement
#
#######################################
my $scriptHelp = "
 otu2tax - assign consensus taxonomy to dotur clusters
\n";

my $usage = "
   Usage:  otu2tax -l list_file -uc uc_file -w cluster_width -t sourceTaxTable -m majority > outputfile
      ex:  otu2tax -l ENV1.fa.m2.fn.list -w unique -t tagtax -m 66 > clustertax.txt
           otu2tax -l ENV1.fa.m2.fn.list -w 0.03  > clustertax.txt
           otu2tax -u ENV1.readmap.uc  > clustertax.txt
           otu2tax -c mydata.otu.dist_03.txt  > clustertax.txt

 Options:
           -l   name of the mothur list file containing the read_ids for each cluster
           -uc  name of a UClust (USearch) readmap.uc file, no -w required
           -c   name of a cdhit otu.dist_*.txt file (specify only one mothur list of cdhit dist file)
           -w   mothur width to calculate (unique, 0.01, 0.02 ... 0.10).
           -m   percent required for a majority consensus [default: 66]
           -t   source taxonomy table [default: tagtax]
           -g   source gast distance table [default: gast_concat]
           -u   include number of unique sequences per OTU in the output [default: false]
           -db  database name to lookup reads [default: env454]
           -site vamps or vampsdev [default: vampsdev]
           -prefix user_code; To prevent vamps cluster name collision
\n";

#######################################
#
# Definition statements
#
#######################################
my $db_host = "newbpcdb2";
my $db_name = "env454";
my $tax_table = "tagtax_view";
my $seq_table = "trimseq_view";
my $gast_table = "gast_concat";
my $majority = 66;
my $list_filename;
my $cdhit_filename;
my $uc_filename;
my $out_table;
my $nodes = 40;
my $limit = "";
my $cluster_width;
my %clusterTax;
my $do_uniques = 0;
my $site = 'vampsdev';
my $db_hostname;
my $dbName;
my $web_user;
my $home;
my $otu_prefix='';
my $db_source = 'all';
my $reads_table1;
my $reads_table2;
my $tax_db='';
#######################################
#
# Test for commandline arguments
#
#######################################

if (! $ARGV[0] )
{
    print $scriptHelp;
    print $usage;
    exit -1;
}

while ((scalar @ARGV > 0) && ($ARGV[0] =~ /^-/))
{
    if ($ARGV[0] =~ /-h/) {
        print $scriptHelp;
        print $usage;
        exit 0;
    } elsif ($ARGV[0] eq "-l") {
        shift @ARGV;
        $list_filename = shift @ARGV;
    } elsif ($ARGV[0] eq "-uc") {
        shift @ARGV;
        $uc_filename = shift @ARGV;
    } elsif ($ARGV[0] eq "-c") {
        shift @ARGV;
        $cdhit_filename = shift @ARGV;
    } elsif ($ARGV[0] eq "-w") {
        shift @ARGV;
        $cluster_width = shift @ARGV;
    } elsif ($ARGV[0] eq "-t") {
        shift @ARGV;
        $tax_table = shift @ARGV;
    } elsif ($ARGV[0] eq "-g") {
        shift @ARGV;
        $gast_table = shift @ARGV;
    } elsif ($ARGV[0] eq "-m") {
        shift @ARGV;
        $majority = shift @ARGV;
    } elsif ($ARGV[0] eq "-db") {
        shift @ARGV;
        $db_name = shift @ARGV;
    } elsif ($ARGV[0] eq "-host") {
        shift @ARGV;
        $db_host = shift @ARGV;
    } elsif ($ARGV[0] eq "-site") {
        shift @ARGV;
        $site = shift @ARGV;
    } elsif ($ARGV[0] eq "-dbsource") {
        shift @ARGV;
        $db_source = shift @ARGV;
    } elsif ($ARGV[0] eq "-prefix") {
        shift @ARGV;
        $otu_prefix = shift @ARGV;
    } elsif ($ARGV[0] eq "-n") {
        shift @ARGV;
        $nodes = shift @ARGV;
    } elsif ($ARGV[0] eq "-tax_db") {
        shift @ARGV;
        $tax_db = shift @ARGV;
    }elsif ($ARGV[0] eq "-u") {
        shift @ARGV;
        $do_uniques = 1;
    } elsif ($ARGV[0] =~ /^-/) { #unknown parameter, just get rid of it
        print "Unknown commandline flag \"$ARGV[0]\".";
        print $usage;
        exit -1;
    }
}



if ($site eq 'vamps' ){

   # for vamps:
   $db_hostname = "vampsdb";
   $dbName = 'vamps';
   $web_user = "vampshttpd";

   #$cluster_path= "/groups/vampsweb/vamps";
   $home = "/groups/vampsweb/vamps/";
}elsif($site eq 'vampsdev' ){

   # for vampsdev
   $db_hostname = "vampsdev";
   $dbName = 'vamps';
   $web_user = "vampsdevhttpd";

   #$cluster_path= "/groups/vampsweb/vampsdev";
   $home = "/groups/vampsweb/vampsdev/";
}else{
    print "No useful database host selected: $site exiting\n";
    exit;
}


#######################################
#
# Parse commandline arguments, ARGV
#
#######################################

if ( (! $list_filename) && (! $cdhit_filename) && (! $uc_filename) )
{
    print "Please specify an input mothur list, uclust readmap or cdhit otu file\n";
    print "$usage\n";
    exit;
}

if ( ($uc_filename) && ( ($list_filename) || ($cluster_width) ) )
{
    print "Please use either a mothur list file with a cluster width or a UClust readmap file, not both\n";
    print "$usage\n";
    exit;
}

if ( ($cdhit_filename) && ( ($list_filename) || ($cluster_width) ) )
{
    print "Please use either a mothur list file with a cluster width or a cdhit file, not both\n";
    print "$usage\n";
    exit;
}

if ( ($cdhit_filename) && ($uc_filename) )
{
    print "Please use either a uclust readmap file or a cdhit file, not both\n";
    print "$usage\n";
    exit;
}

if ( ($cluster_width) && ( ($cdhit_filename) || ($uc_filename) ) )
{
    print "Please do not use a cluster width specification with either cdhit or uclust readmap files.\n";
    print "$usage\n";
    exit;
}

if ( ($list_filename) && (! $cluster_width) )
{
    print "A mothur list file requires a clustering width selection\n";
    print "$usage\n";
    exit;
}

#######################################
#
# SQL
#
#######################################
require("/groups/vampsweb/$site/seqinfobin/perlmodules/Taxonomy.pm");
require("/groups/vampsweb/".$site."/apps/mysql_connection_vamps");
my ($vampsdbh, $userdbh) = get_connection($home, $db_hostname, $dbName);
my $conn;
#if($source eq 'user'){
#    $conn = $userdbh;
#}else{
    $conn = $vampsdbh;
#}

# SELECT taxa
my $selectTax;
my $selectSeq;
my $selectSeq_h;
my $selectTax_h;
$reads_table1 = 'vamps_export';
$reads_table2 = 'vamps_export_pipe';
if($tax_db){

}else{
    if($db_source eq 'user' ){
		$reads_table2 = 'vamps_sequences_pipe';
        $selectTax = "SELECT taxonomy, distance from $reads_table2 where rep_id = ? and project=? and dataset=?";
        $selectSeq = "SELECT sequence from $reads_table2 where rep_id = ? and project=? and dataset=?";
    }elsif($db_source eq 'bpc'){
        $selectTax = "SELECT taxonomy, distance from $reads_table1 where read_id = ? and project=? and dataset=?";
        $selectSeq = "SELECT sequence from $reads_table1 where read_id = ? and project=? and dataset=?";
    }else{
        print "in otu2tax:: db_source error: $db_source.  Exiting\n\n";
        exit;
    }

    $selectTax_h = $conn->prepare($selectTax) or die "Unable to prepare statement: $selectTax. Error: " . $conn->errstr . "\n";

    # SELECT sequence

    if ($do_uniques)
    {
        $selectSeq_h = $conn->prepare($selectSeq) or die "Unable to prepare statement: $selectSeq. Error: " . $conn->errstr . "\n";
    }
}
#######################################
#
# Read the mothur list file and load up the clusters
#
#######################################
my $loaded = 0;
my $clusterID = 1;


# Print out the header information
print join("\t", "Cluster_ID", "Taxonomy", "Rank", "Cluster_Size", "Min_GDist", "Avg_GDist", "Vote", "Min_rank", "Taxa_counts", "Max_pcts", "Na_pcts");
if ($do_uniques) { print "\tCount_Uniq_Seqs";}
print "\n";

#
# Step through the mothur list file
#
my $linecount=0;
my $previous_line = '';
my $unique_line;
if ($list_filename)
{
    # Read in the list file
    open (IN, $list_filename) or die "Unable to open mothur list file: $list_filename.  Exiting\n\n";
    while (my $line = <IN>)
    {

        # Check for the chosen cluster width
        $linecount += 1;
        my @line_data = split(/\t/, $line);
        if($line_data[0] eq 'unique'){ $line_data[0] = 0; $unique_line = $line;}
        if ($line =~ /^$cluster_width/ || $line_data[0] > $cluster_width)
        {
            if($line_data[0] > $cluster_width){
                # use previous line (smaller) if the exact value not present
               $line = $previous_line;
            }

            $loaded = process_line($line,$clusterID,$otu_prefix);

        } else {
            $previous_line = $line;
        }

        # Skip remaining lines in the file if you are done
        if ($loaded) {last;}
    }
    # if all else fails catch the uniques line
    if($linecount == 1){
        process_line($unique_line,$clusterID,$otu_prefix);
    }

} elsif ($uc_filename) {

    # create a hash of an array containing the reads for each cluster
    my %reads_in_cluster;
    my %tax_collector;
    # Read in the uclust readmap file
    open (IN, $uc_filename) or die "Unable to open uclust readmap file: $uc_filename.  Exiting\n\n";
    while (my $line = <IN>)
    {
        $linecount += 1;
        if ($line !~ /^H/) {next;}  # skip comment lines at the top, and anything that is not a hit
        chomp $line;
        my @line_data = split(/\t/, $line);

        #clean read id just in case
        my $read_id = $line_data[8];
        $read_id =~ s/^QiimeExactMatch\.//;
        $read_id =~ s/\|.*$//;

        # clean cluster id
        my $cluster_id = $line_data[9];
        $cluster_id =~ s/;.*$//;

        push (@{$reads_in_cluster{$cluster_id}}, $read_id);
    }

    if($tax_db){  # if a tax reference db was in the command line parameters (greengenes)

        open (TAX, $tax_db) or die "Unable to open tax database file: $tax_db.  Exiting\n\n";
        while (my $line = <TAX>)
        {
            chomp $line;
            if($line =~ /^#/){next;}

            my @tax_data = split(/\t/, $line);
            my @ary = split(';',$tax_data[1]);
            my @mytax;
            foreach my $t (@ary)
            {
                $t =~ s/^\s+//;
	            $t =~ s/\s+$//;
                # for tax like:
                # k__Bacteria;p__Proteobacteria;c__Gammaproteobacteria;o__Enterobacteriales;f__Enterobacteriaceae;g__Escherichia;s__
                # But what about:
                # Bacteria;Proteobacteria;Gammaproteobacteria;Enterobacteriales;Enterobacteriaceae;Escherichia
                my $taxa;

                if(index($t,'__') != -1){

                    my @tmp = split('__',$t);
                    $taxa = $tmp[1];
                }else{
                    $taxa = $t;
                }
                if($taxa){
                    push(@mytax,$taxa);
                }

            }
            my $tax_end = join(';',@mytax);

            $tax_collector{$tax_data[0]}=$tax_end;
        }
        close(TAX);
        #print join("\t", "Cluster_ID", "Taxonomy", "Rank", "Cluster_Size", "Min_GDist", "Avg_GDist", "Vote", "Min_rank", "Taxa_counts", "Max_pcts", "Na_pcts");


    }
    # %tax_collector will be populated only if using greengenes db
    if(%tax_collector){
        my $tax_collector_ref = \%tax_collector;
        foreach my $c (sort keys %reads_in_cluster)
        {
            #if(%tax_collector){


                print_taxonomy_for_refdb($c, \@{$reads_in_cluster{$c}}, $otu_prefix, $tax_collector_ref);
            #}else{

               # print_taxonomy($c, \@{$reads_in_cluster{$c}}, $otu_prefix);
            #}
        }
    }else{
        foreach my $c (sort keys %reads_in_cluster)
        {
            #if(%tax_collector){


                print_taxonomy($c, \@{$reads_in_cluster{$c}}, $otu_prefix);
            #}else{

               # print_taxonomy($c, \@{$reads_in_cluster{$c}}, $otu_prefix);
            #}
        }
    }





} else {
    # Read in the cd-hit file
    open (IN, $cdhit_filename) or die "Unable to open cd-hit dist file: $cdhit_filename.  Exiting\n\n";
    while (my $line = <IN>)
    {
        # parse the line.  OTU_ID \t reads separated by semicolons
        chomp $line;
        my @data = split(/\t/, $line);
        my @idArray = split(/;/, $data[1]);

        print_taxonomy($data[0], \@idArray, $otu_prefix);
    }
}


#######################################
#
# Close the files
#
#######################################
close(IN);
if (defined $selectSeq_h) { $selectSeq_h->finish; }
if (defined $selectTax_h) { $selectTax_h->finish; }

exit;

sub process_line
{
     my $line = shift;
     my $clusterID = shift;
     my $otu_prefix = shift;
     # Clean and parse the line
    chomp $line;
    my @line_data = split(/\t/, $line);
    # clusters are separated by tabs
    shift(@line_data); # peel off the clustering width
    shift(@line_data); # peel off the number of clusters

    # Step through each cluster, look up the read taxonomy and calculate the consensus
    foreach my $c (@line_data)
    {
        # reads in a cluster are separated by commas
        my @idArray = split(/,/, $c);

        # Look up the taxonomy for each read
        print_taxonomy($clusterID, \@idArray, $otu_prefix);

        # increment the cluster ID
        $clusterID++;
    }

    # Have calculated the taxonomy
    return 1;
}
#######################################
##
## Subroutine: assign_taxonomy
##       get dupes from the names file and calculate consensus taxonomy
##
########################################
sub print_taxonomy
{
    my $clusterID = shift;
    my $idArrayRef = shift;
    my $otu_prefix = shift;
    my @taxObjects;
    my %freq_of_uniq;
    my $min_distance = 1;
    my $avg_distance = 0;
    my $cid;
    my @pjdsid;
    my @read_split;
    my $project;
    my $dataset;
    my $read_id;
    foreach my $id (@$idArrayRef)
    {
        # id format:  project--dataset--read_id  (uc file)
        @pjdsid = split(/--/,$id);
        $project = $pjdsid[0];
        $dataset = $pjdsid[1];
        $read_id = $pjdsid[2];
        # if read_id contains one underscore (275464464_1) we should crop it to (275464464):
        # but if it contains two underscores (Site1_511953_1) just remove the last:
        #warn "readid1 $read_id\n";

        if(index($read_id,'_') != -1){
            #my $cnt_idx = ($read_id =~ /_/g); # counts underscores
            @read_split = split(/_/,$read_id);
            #$read_id = $read_split[0];
            my $freq = pop @read_split;
            $read_id = join('_',@read_split);
        }

        # Site2_369532|frequency:1
        # no sql call needed if your taxonomy is in a ref db file
        #warn "readid2 $read_id\n";
        if($db_source ne 'user' && $db_source ne 'bpc'){
            $selectTax_h->execute($read_id,$project,$dataset,$read_id,$project,$dataset) || die "Unable to execute SQL statement ($selectTax).  Error: " . $selectTax_h->errstr . "\n";
        }else{
            $selectTax_h->execute($read_id,$project,$dataset) || die "Unable to execute SQL statement ($selectTax).  Error: " . $selectTax_h->errstr . "\n";
        }

        if ($selectTax_h->rows == 0)
        {
            warn "Read $read_id, $project, $dataset was not found in the database using:\n\"$selectTax\" \nContinuing...\n";
        } else {
            while(my ($tax, $distance) = $selectTax_h->fetchrow())
            {
                # Load the taxonomy object
                push (@taxObjects, Taxonomy->new($tax));
                # check for min distance and tally the distances for the average
                if ($min_distance > $distance) {$min_distance = $distance;}
                $avg_distance += $distance;
            }
        }

        # Tally up the unique sequences while we are at it
        if ($do_uniques)
        {
            if($db_source ne 'user' && $db_source ne 'bpc'){
                $selectSeq_h->execute($read_id,$project,$dataset,$read_id,$project,$dataset) || die "Unable to execute SQL statement ($selectSeq).  Error: " . $selectSeq_h->errstr . "\n";
            }else{
                $selectSeq_h->execute($read_id,$project,$dataset) || die "Unable to execute SQL statement ($selectSeq).  Error: " . $selectSeq_h->errstr . "\n";
            }

            my ($seq) = $selectSeq_h->fetchrow();
            $freq_of_uniq{$seq}++;
        }

    }

    # Lookup the consensus taxonomy for the array
    my @taxReturn = Taxonomy->consensus(@taxObjects, $majority);

    # Finish calculating the average gast distance and round the distances
    $avg_distance = $avg_distance / (scalar @$idArrayRef);
    $avg_distance = int(($avg_distance * 10000) + 0.5) / 10000;
    $min_distance = int(($min_distance * 10000) + 0.5) / 10000;
    if($otu_prefix){
        $cid = $otu_prefix.'_'.$clusterID;
    }else{
        $cid = $clusterID;
    }

    # Print out the returns
    # (read_id, taxonomy, rank, altlgi_count, vote, minrank, taxa_counts, max_pcts, na_pcts, uniqseqs)
    print join("\t", $cid, $taxReturn[0]->taxstring, $taxReturn[0]->depth, scalar @taxObjects, $min_distance, $avg_distance, $taxReturn[1], $taxReturn[2], $taxReturn[3], $taxReturn[4], $taxReturn[5]);
    if ($do_uniques) {print "\t" . scalar keys %freq_of_uniq;}
    print "\n";
}
sub print_taxonomy_for_refdb
{
     my $clusterID = shift;
    my $idArrayRef = shift;
    my $otu_prefix = shift;
    my $tax_collector_ref = shift;

    my @taxObjects;
    my %freq_of_uniq;
    my $min_distance = 1;
    my $avg_distance = 0;
    my $cid;
    my @pjdsid;
    my $project;
    my $dataset;
    my $read_id;
    foreach my $id (@$idArrayRef)
    {
        # id format:  project--dataset--read_id  (uc file)
        @pjdsid = split(/--/,$id);
        $project = $pjdsid[0];
        $dataset = $pjdsid[1];
        $read_id = $pjdsid[2];


        # no sql call needed if your taxonomy is in a ref db file
        if(exists($tax_collector_ref->{$clusterID})){
            push (@taxObjects, Taxonomy->new($tax_collector_ref->{$clusterID}));

        }else{

        }

    }

    # Lookup the consensus taxonomy for the array
    my @taxReturn = Taxonomy->consensus(@taxObjects, $majority);


    if($otu_prefix){
        $cid = $otu_prefix.'_'.$clusterID;
    }else{
        $cid = $clusterID;
    }

    # Print out the returns
    # (read_id, taxonomy, rank, altlgi_count, vote, minrank, taxa_counts, max_pcts, na_pcts, uniqseqs)
    print join("\t", $cid, $taxReturn[0]->taxstring, $taxReturn[0]->depth, scalar @taxObjects, $min_distance, $avg_distance, $taxReturn[1], $taxReturn[2], $taxReturn[3], $taxReturn[4], $taxReturn[5]);
    if ($do_uniques) {print "\t" . scalar keys %freq_of_uniq;}
    print "\n";
