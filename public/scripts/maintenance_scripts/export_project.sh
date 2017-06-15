#!/bin/bash
# USAGE ./export.sh PROJECT_NAME [MBL:USER] [vampsdb:vampsdev]
P=$1

if [ "$2" = "USER" ]
then
    SOURCE="_pipe"
    echo "Source USER"
else
    SOURCE=""
    echo "Source MBL"
fi
if [ "$3" = "vampsdev" ]
then
    SITE="vampsdev"
    echo "Site $SITE"
else
    SITE="vampsdb"
    echo "Site $SITE"
fi
# METADATA
mysql -B -h $SITE vamps -e "SELECT * FROM vamps_metadata where project = '$P';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > metadata_$P.csv
# SEQUENCES
mysql -B -h $SITE vamps -e "SELECT * FROM vamps_sequences$SOURCE where project = '$P';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > sequences_$P.csv
#PROJECT
mysql -B -h $SITE vamps -e "SELECT project, title, project_description, funding, env_sample_source_id, contact, email, institution FROM new_project LEFT JOIN new_contact using(contact_id) WHERE project = '$P' UNION SELECT project_name AS project, title, description AS project_description, 0 AS funding, env_source_id AS env_sample_source_id, contact, email, institution FROM vamps_upload_info WHERE project_name = '$P';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > project_$P.csv
#DATASET
mysql -B -h $SITE vamps -e "SELECT distinct dataset, dataset_description, env_sample_source_id, project from new_dataset join new_project using(project_id) WHERE project = '$P' UNION SELECT distinct dataset, dataset_info, 100 as env_sample_source_id, project from vamps_projects_datasets_pipe WHERE project = '$P';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > dataset_$P.csv
# USER
mysql -B -h $SITE vamps -e "SELECT distinct contact, user as username, email, institution, first_name, last_name, active, security_level, passwd as encrypted_password from new_user_contact join new_user using(user_id) join new_contact using(contact_id) where first_name is not NULL and first_name <> '';" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" >> user_contact_$P.csv
    