#!/bin/bash

#
# VAMPS-node.js start script
# 
#

vagrant ssh -c "cd vamps-node.js;echo 'Restarting VAMPS (VirtualBox)';ls;./vamps-launcher.sh stop;"