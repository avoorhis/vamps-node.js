#!/bin/bash

#
# VAMPS-node.js start script
# 
#

LOG=logs/node-server.log
ERRLOG=logs/node-error.log
PROG=bin/www

function usage() {
	cat <<-EOF
	`basename $0` (start|stop|restart|status)

	Starts and stops the vamps-node.js service.
	EOF
}

function is_running() {
	#EPID=`/usr/bin/pgrep -xf "/usr/local/www/vampsdev/software/node/bin/node /usr/local/www/vampsdev/projects/node-server/webserver.js"`
	EPID=`/usr/bin/pgrep -xf "node $PROG"`
	echo $EPID
}

function start_server() {

	# if [ "$EUID" != "70102" ]; then
	# 	echo "ERROR: server should be run as vampsdevhttpd user."
	# 	exit 1
	# fi
	echo "Trying to start server.....See logs in './logs/*'"
	node $PROG 2>>$ERRLOG 1>>$LOG &
	#npm start
}

function stop_server() {
	# if [ "$EUID" != "70102" ]; then
	# 	echo "ERROR: You must sudo vampsdevhttpd to stop this server."
	# 	exit 1
	# fi
	echo "Stopping server"
	#/usr/bin/pkill -xf "/usr/local/www/vampsdev/software/node/bin/node /usr/local/www/vampsdev/projects/node-server/webserver.js"
	/usr/bin/pkill -xf "node $PROG"

}
function restart_server() {
	
	echo "Stopping server"
	#/usr/bin/pkill -xf "/usr/local/www/vampsdev/software/node/bin/node /usr/local/www/vampsdev/projects/node-server/webserver.js"
	/usr/bin/pkill -xf "node $PROG"

	echo "Re-Starting server"
	node $PROG 2>>$ERRLOG 1>>$LOG &

}
case $1 in
	restart)
		EPID=`is_running`
		if [ "$EPID" != "" ]; then
			restart_server
		else
			echo "Service is not running."
			start_server
		fi
		;;
	start)
		EPID=`is_running`
		if [ "$EPID" == "" ]; then
			echo "Starting Service"
			start_server
		else
			echo "Service already running with PID $EPID"
		fi
		;;
	status)
		EPID=`is_running`
		if [ "$EPID" != "" ]; then
			echo "Service is running with PID $EPID"
		else
			echo "Service is not running."
		fi
		;;
	stop)
		stop_server
		;;
	*)
		echo "Unknown command"
		usage
		;;
esac

