# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.

# the netwok line below should have the guest port set 
# to the same port that is set in bin/www from the vamps-node.js installation
Vagrant.configure("2") do |config|
  #config.vm.box = "hashicorp/precise32"
  config.vm.box = "hashicorp/precise64"
  #config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, path: "Vagrantboot4568.sh"
  config.vm.network :forwarded_port, guest: 3000, host: 4568
  
  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--memory", "2024"]
  end
end