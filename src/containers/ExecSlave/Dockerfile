FROM codefarm/nodebase:0.0.0

USER root
RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd

WORKDIR $farmerHome

RUN mkdir -p $farmerHome/.ssh && mkdir -p $farmerHome/execKeys

# Copy keys to use and set access for $user
COPY [ "id_rsa", "id_rsa.pub", "$farmerHome/execKeys/" ]

RUN cat $farmerHome/execKeys/id_rsa.pub >> $farmerHome/.ssh/authorized_keys

# Set correct rights on execKeys
RUN chown -R $user $farmerHome/execKeys && chgrp -R $user $farmerHome/execKeys

# Some tests require that the slave can SSH to itself, setup keys
RUN ssh-keygen -N "" -f $farmerHome/.ssh/id_rsa && cat $farmerHome/.ssh/id_rsa.pub >> $farmerHome/.ssh/authorized_keys

# Set correct rights on .ssh
RUN chmod 644 $farmerHome/.ssh/authorized_keys && chown -R $user $farmerHome/.ssh && chgrp -R $user $farmerHome/.ssh

EXPOSE 22

CMD [ "/usr/sbin/sshd", "-D" ]
