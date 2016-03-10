#!/bin/bash

#
# VAMPS-node.js start script
# 
#

vagrant ssh -c "cd vamps-node.js;echo 'Restarting VAMPS (VirtualBox)';./vamps-launcher.sh restart;echo 'Press CTRL+D to finish'"