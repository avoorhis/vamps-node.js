#!/bioware/perl/bin/perl

#########################################
#
# rdp_file_creator  (was rdp2taxonomy): Converts rdp.out file to taxon_string file and
#               Summed taxon file for vamps
#               Specific for rdp_classifier2.1 rdp.out files
#
# Author: Susan Huse, shuse@mbl.edu
#        Editied by Andrew Voorhis
#                   to create taxacounts and summedcounts files for entry into vamps tables
# Date: Mon Jun 18 07:37:01 EDT 2007
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
# Keywords: parse taxonomy v6ref rdp
# 
# Assumptions:	IMPORTANT NOTE!!!!
#				Assumes taxonomy as per Bergey's Outline:
#				Taxonomic Outline of the Bacteria and Archaea
#				(Bergey's Manual of Systematic Bacteriology, 2nd Edition)
#				George M. Garrity, Timothy G. Lilburn, James R. Cole, 
#				Scott H. Harrison, Jean Euzeby, adn Briand J. Tindall
#				Release 7.7 March 6, 2007
#  
#
# Revisions:
#
# Programming Notes:
#
########################################
use strict;
use warnings;
#use lib '/usr/local/www/vamps/special/perl/lib';
# Bergeys is here /groups/vampsweb/$site/seqinfobin/perlmodules
use Bergey; # a php module for translating RDP taxa to MBL taxa


#######################################
#
# Set up usage statement
#
#######################################
my $scriptHelp = "
 rdp_file_creator - reads an rdp output file and translates it to a new tab-
                delimited file that includes the sequence id, rank, 
                taxononomy, and boot scores.  

                Uses Bergey's Manual, 2004, Release 5.0

                Without a minimum bootscore, all values will be reported, 
                RDP recommends only using taxonomic assignments with a 
                minimum boot score of 80.
\n";

my $usage = "
   Usage:  rdp_file_creator -s file -b 80 -f1 file1.txt -f2 file2.txt -project proj -dataset dataset rdp.outfile

      ex:  rdp_file_creator -s file -b 80 -f1 taxacountfile.txt -f2 summedfile.txt -project  \"Sulfides\" -dataset \"Loihi Arch\"
           
           

 Options:  
           -b minium_bootscore - this will export only taxonomic values >= boot score [default: 80]
           
           -f1   first taxonomy output file, data not summed up through the tree (for vamps_data_cube_uploads)

           -f2   second taxonomy output file, data is summed up through the tree (for vamps_junk_data_cube_pipe)

           -project project name for the data
		   
           -dataset dataset name for the data (all data in the file will have the 
                    same project and dataset name).
                    
           -s   data source: either 'file' or 'database' (REQUIRED)
                  if the data is sequences from the database (via fasta2tax): use -s database
                  if the data is from an RDP taxonomy file (either Classifier text format
                        or Fasta-style): use -s file
                 
           -log  logfilename
\n";
#           -p parse taxon and boot strings by taxonomic levels.  Output would have 
#              columns for superkingdom, phylum, class, order, family, and genus for both
#              taxonomy and for bootscore values
#
#           -d database name
#
#           -t table name -- be sure that the chosen format matches the table structure
#
#######################################
#
# Definition statements
#
#######################################
#Commandline parsing
my $argNum = 1;
#my $minargNum = 2;
#my $maxargNum = 4;
my $verbose = 0;
my $quiet=0;
my $project;
my $dataset;
#Runtime variables
my $datasource;
my $inFilename;
my $minBoot = 80;
my $pass=1;
my $out_taxa_file;
my $out_summed_file;
my $logFilename="";
my $commandline = join(" ", @ARGV);
# Define ranks (with spacers, for bootscore indices)
#my @ranks = (qw/superkingdom sboot phylum pboot class cboot order oboot family fboot genus gboot/);
my @ranks = ("domain", "phylum", "class", "order", "family", "genus");

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
	} elsif ($ARGV[0] eq "-b") {
		shift @ARGV;
		$minBoot = shift @ARGV;
	} elsif ($ARGV[0] eq "-f1") {
		shift @ARGV;
		$out_taxa_file = shift @ARGV;
	} elsif ($ARGV[0] eq "-f2") {
		shift @ARGV;
		$out_summed_file = shift @ARGV;
	} elsif ($ARGV[0] eq "-v") {
		$verbose = 1;
		shift @ARGV;
	} elsif ($ARGV[0] eq "-q") {
		shift @ARGV;
		$quiet=1;
	} elsif ($ARGV[0] eq "-s") {
		shift @ARGV;
		$datasource = shift @ARGV;
	} elsif ($ARGV[0] eq "-project") {
		shift @ARGV;
		$project = shift @ARGV;
	} elsif ($ARGV[0] eq "-dataset") {
		shift @ARGV;
		$dataset = shift @ARGV;
	} elsif ($ARGV[0] eq "-log") {
		shift @ARGV;
		$logFilename = shift @ARGV;
	} elsif ($ARGV[0] =~ /^-/) { #unknown parameter, just get rid of it
		shift @ARGV;
	}
}


#######################################
#
# Parse commandline arguments, ARGV
#
#######################################
if ($logFilename) { open (LOG, ">>$logFilename") || warn ("Unable to write to output log file: $logFilename.\n");}
my $date = `date`;
if ($logFilename) {print LOG "--------------------\n$date\nRunning rdp_file_creator $commandline\n";}
$inFilename = $ARGV[0];
if (! $inFilename) 
{
	print "Incorrect number of arguments.\n";
	print "$usage\n";
	exit;
} 

#Test validity of commandline arguments
if (! -f $inFilename) 
{
	print "Unable to locate input RDP-formatted file: $inFilename.\n";
	exit;
}

if (! $datasource || ($datasource  ne 'file' && $datasource ne 'database') )
{
	print "You must enter a proper datasource: file or database.\n";
	exit;
}

if ($minBoot !~ /[0-9]+/)
{
	print "Minimum bootscore value ($minBoot) must be a positive integer.  Please try again.\n";
	exit;
}
if ( (! $out_taxa_file) || (! $out_summed_file) )
{
	if (! $quiet)
	{
		print "Incorrect number of arguments.\n";
		print "$usage\n";
	} elsif ($logFilename) {
		print LOG "Incorrect number of arguments.\n";
		print LOG "$usage\n";
	}
	exit -1;
} 
if ( (! $project) || (! $dataset) )
{
	if (! $quiet)
	{
		print "Incorrect number of arguments.\n";
		print "$usage\n";
	} elsif ($logFilename) {
		print LOG "Incorrect number of arguments.\n";
		print LOG "$usage\n";
	}
	exit -1;
} 
#if ($verbose) {print "Running rdp2taxonomy on $inFilename writing to $outFilename, using options: $arg1\n"};

#######################################
#
# Parse the rdp file and insert into the table
#
#######################################
my $id;
my $fileType = 0;
my %taxaCounts;
my %ranks;
my $dscount=0;  # dataset count
open (IN, "<$inFilename") || die ("Unable to read input file: $inFilename.  Exiting.\n");
#print "datasource: $datasource\n";

# Read in text file
while (my $line = <IN>)
{
	#print $line;
	chomp $line;
	if (! $line) {next;}
	
    if($datasource eq 'file'){   # data is from uploaded taxonomy RDP file
                                 # 2 types: fasta and Classifier style
		

			$line =~ s/\s+//;  #collapse spaces			
			if (! $fileType) 
			{
				if ($line =~ /^>/) {$fileType = "fasta";}
				elsif ($line =~ /^Details/) {$fileType = "web"; next;}
				else {next;}
			}
			
			my $rank = "unknown";
			my @taxData;
			my @taxes;
		
			if ( ($fileType eq "fasta") && ($line =~ /^>/) )
			{
				# Definition line, set the ID and skip to the data line
				($id) = split(/\s+/, $line);
				$id =~ s/^>//;
				next;
		
				#
				# Parse the Taxonomy line
				# 0=Domain, 2=Phylum 4=Class 6=Order 8=Family 10=Genus
				#
			} elsif ($fileType eq "fasta") {
				#filetype is fasta, taxonomy on separate line from id
				$line =~ s/;$//;
				$line =~ s/"//g;
				@taxData = split(/; /, $line);
				shift @taxData; # remove root;
				shift @taxData; # remove root boot
		
			} else { 
				#
				# Parse the Taxonomy line
				# 0=Domain, 2=Phylum 4=Class 6=Order 8=Family 10=Genus
				#
				#filetype is web, taxonomy on the same line as id
				#print "$line\n";
				$line =~ s/"//g;
				@taxData = split(/;/, $line);
				$id = shift @taxData;
				#print "$id\n";
				shift @taxData; # remove blank
				shift @taxData; # remove root;
				shift @taxData; # remove root boot
			}
		
		
			#
			# Step through the taxa (and boots) and build the arrays
			#
			for (my $i=0; $i<= $#taxData - 1; $i=$i+2)
			{
				# Be sure the boot values are from 0 to 100, no '%' sign
				if ($fileType eq "fasta") {$taxData[$i+1] = $taxData[$i+1] * 100;}
				if ($fileType eq "web") {$taxData[$i+1] =~ s/%//;}
		
				# Skip known subclasses
				if ( ($taxData[$i] eq "Actinobacteridae") || ($taxData[$i] eq "Coriobacteridae") ) {next;}
		
				# Skip known suborders
				if ( ($taxData[$i] eq "Actinomycineae") || ($taxData[$i] eq "Corynebacterineae") || ($taxData[$i] eq "Micrococcineae") 
					|| ($taxData[$i] eq "Propionibacterineae") || ($taxData[$i] eq "Coriobacterineae") ) {next}
				if ($taxData[$i+1] >= $minBoot)
				{
					push (@taxes, $taxData[$i]);
				} else {
					# once the boot value is too low, skip out.
					last;
				}
			}
		
			# Create the taxonomic string
			my $taxonString = join(";",@taxes);
		    
			#
			# Check against Bergeys Taxonomy
			#
			my  $BergeyTaxa = Bergey::new();
			
		
			if ( ($taxonString) && (! exists $BergeyTaxa->{$taxonString}) )
			{
				my $warnStr = "Skipping $id, $taxonString on $line that is not consistent with $BergeyTaxa->{version}.\n";
				if ($logFilename) { print LOG $warnStr; } else {warn $warnStr;}
				next;
			} else {
				$taxonString = $BergeyTaxa->{$taxonString};
			}
		
			# If no taxonomy is left, reset to no_ref_taxonomy
			if ( scalar @taxes < 1) 
			{ 
				$taxonString = "Unknown"; 
				$rank = 0;
			} else {
				#
				# set the rank
				#
				my $tmpString = $taxonString;
				$rank = $tmpString =~ tr/;//;
			}
		
			# load up the hashes 
			if ($taxonString eq '') {warn "Print warning, its a problem\n";}
			#print LOG "taxonString: $taxonString\n";
			$taxaCounts{$taxonString}++;
			$ranks{$taxonString} = $rank;			
	


     }elsif($datasource eq 'database'){   # data is from sequences in the database (via fasta2tax)
		
# 7262187		Bacteria	domain	0.99	Proteobacteria	phylum	0.86	Deltaproteobacteria	class	0.79	Bdellovibrionales	order	0.79	Bacteriovoracaceae	family	0.79	Peredibacter	genus	0.79
			$line =~ s/^\s+//; # remove leading spaces
			$line =~ s/\s+$//; # remove trailing spaces
			$line =~ s/"//g;  # get rid of random quotation marks.
					
			## 0 ID, 1blank, 2-4(Root, norank, 1), 5-7(S), 8-10(Phylum), 11-13(C), 14-16(O), 17-19(F), 20-22(G)
			my @rdp_data = split(/\t/, $line);
			
			#
			# Step through the taxa (and boots) and build the strings
			#
			my @taxes;
			my @boots;
			my $last_boot;
			my $taxonString=''; 
			my $idfreq;
			my $id = $rdp_data[0];
			#print "$id\n";
			# if id is like this: HN3A67J02JNERK_2|frequency:113
			# must split and retain count
			if(index($id,'|frequency:') != -1){
			    my @idsplit = split(/\|frequency:/,$id);
			    $id=$idsplit[0];
			    $idfreq = $idsplit[1];
			}else{
			    $idfreq = 1;
			    
			}
			$dscount += $idfreq;
			#print "$idfreq\n";
			for (my $i=2; $i<= $#rdp_data - 2; $i=$i+3)
			{
				my $tax = $rdp_data[$i];
				my $boot = $rdp_data[$i+2];
				if ($boot) {$boot = $boot * 100;}
		
				# Check for missing levels
				if ( (! $tax) || ($tax =~ /incertae_sedis/) )
				{
					# if no assignment, call Unassigned, and inherit the previous boot score
					$tax = "Unassigned";
					$boot = $last_boot;
				}
		
				# Check for chloroplasts
				if ($tax eq "Chloroplast") { $taxes[0] = "Organelle"; }
		
				# If qualifed boot value, then add to the string
				if ($boot >= $minBoot) 
				{
					push (@taxes, $tax);
					push (@boots, $boot);
				} else {
					last;
				}
				$last_boot = $boot;
			}
		
			# If no taxonomy assign as Unknown
			if (scalar @taxes == 0) 
			{
				push (@taxes,"Unknown");
				push (@boots,"");
			}
		
			# Clear out any trailing Unassigned
			while ( $taxes[$#taxes] eq "Unassigned" ) 
			{
				pop @taxes;
				pop @boots;
			}
		
			# Calculate the rank
			#my @ranks = ("superkingdom", "phylum", "class", "order", "family", "genus");
			my $rank = $ranks[ $#taxes ];
		
			#
			# Export the results
			#
			if(! $quiet){ print join ("\t", $id, join(";", @taxes), join(";", @boots), $rank) . "\n"; }
			
			my $fulltaxes="\t";
			for(my $n=0;$n<=7;$n++){
				if($taxes[$n]){
					$fulltaxes .= $taxes[$n] . "\t";
				}else{
					$fulltaxes .= "NA\t";
				}
			}
			
			# Project, Dataset, taxon_string, Project, Dataset, superkingdom, phylum, class, orderx, family, 
			#          genus, species, strain, rank, count, frequency, dataset_count, entry_date
			
			# need count, freq and dataset_count
			$taxonString = join(";", @taxes);
			#$taxaCounts{$taxonString}++;
			
			$taxaCounts{$taxonString} += $idfreq;
			#print "$taxonString $taxaCounts{$taxonString}\n";
			$ranks{$taxonString} = $#taxes;   
		  
		   
		}
}
close(IN);

if($logFilename){ print LOG "finished reading $inFilename\n"; }

#
# Print out the taxonomy data
#
#print LOG "OUT1 = $out_taxa_file\n";
open(OUT1, ">$out_taxa_file") || exit -2;
my %summed_count_of; # for summing the taxa up the tree 
my %rank_of; # rank of summed taxa

my $freq = 0; # frequency

if( ! $dscount) {
    foreach my $t (sort keys %taxaCounts) {
        $dscount += $taxaCounts{$t};
    }
}

#print "$dscount\n";
foreach my $t (sort keys %taxaCounts)
{
    
	# Project, Dataset, taxon_string, superkingdom, class, order, family, genus, species, strain, count
    #20090122# ProjectDataset, taxon_string, Project, Dataset, superkingdom, phylum, class, orderx, family, 
    #          genus, species, strain, rank, count, frequency, dataset_count, entry_date
	# Print out the Project and Dataset fields
	
	(my $sec,my $min,my $hour,my $mday,my $mon,my $year,my $wday,my $yday,my $isdst)=localtime(time);
    my $today = sprintf "%4d-%02d-%02d %02d:%02d:%02d",$year+1900,$mon+1,$mday,$hour,$min,$sec;
    
  	# Print the taxonomy as one string
   	# start with \t as first field is id(auto increment)
   	if ( ($project) && ($dataset) ) { print OUT1 "\t$project\t$dataset\t"; }
    print OUT1 "$t\t" ;
    
	my $r = $ranks{$t};
	my $split_taxonomy = $t;
	$split_taxonomy =~ s/;/\t/g;
	
	# Print the taxonomy split into ranks, padded with taxa_NA to strain
	my @full_ranks = (@ranks,'species','strain');

	# For each rank (superkingdom --> strain) insert NAs for missing taxonomy off the end
	for (my $i = 0; $i <= 7; $i++)
	{
		if ($r < $i) { $split_taxonomy .= "\t" . $full_ranks[$i] . "_NA"; }
	}
	

   	print OUT1 "$split_taxonomy\t";
    #print join(";", @taxes);
	
    #
    # Calculate the summed taxonomy for all taxa
    #
    
    my $tax_index = q{};
    my @full_taxonomy = split("\t", $split_taxonomy);
    for (my $i=0; $i<= 7; $i++) {
        if ($i == 0) { $tax_index = $full_taxonomy[0]; } else { $tax_index .= ";" . $full_taxonomy[$i]; }
        if (exists $summed_count_of{$tax_index} ) {
            $summed_count_of{$tax_index} += $taxaCounts{$t};
        }
        else {
            $summed_count_of{$tax_index} = $taxaCounts{$t};
        }
        $rank_of{$tax_index} = $i;
    }
 
    
    # Print the count for that taxonomy
    #rank, count, frequency, dataset_count
    $freq=$taxaCounts{$t}/$dscount;
   
    print OUT1 join("\t", $r, $taxaCounts{$t}, $freq, $dscount, $today);
    print OUT1 "\n";
}
close(OUT1);

if($logFilename){ print LOG "finished printing to first file: $out_taxa_file\n"; }

#############################################################################################
#
# Print out the summed taxonomy for all taxa
#
#20090122# ProjectDataset, taxon_string, knt, frequency, dataset_count, rank, project, dataset

open(OUT2, ">$out_summed_file") || exit -2;

$freq = 0; # frequency

#$dc=%summed_count_of;
foreach my $t (sort keys %summed_count_of) {

    my $rk1=0;
	
	$freq = ($summed_count_of{$t})/$dscount;
	
	# strart with initial "\t" because first field is id(auto increment)
	print OUT2 "\t";
    print OUT2 join("\t", $t, $summed_count_of{$t}, $freq, $dscount, $rank_of{$t});    
	if ( ($project) && ($dataset) ) { print OUT2 "\t$project\t$dataset\t$project--$dataset"; }
    print OUT2 "\n";
}
close(OUT2);

if($logFilename){ print LOG "finished printing to second file: $out_summed_file\n"; }

exit 0;

