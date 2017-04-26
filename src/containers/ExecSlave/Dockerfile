FROM codefarm/nodebase:0.0.0

USER root
RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd

WORKDIR $farmerHome

RUN mkdir -p $farmerHome/.ssh

# Copy authorized_keys and set access for $user
COPY [ "authorized_keys", "$farmerHome/.ssh/" ]

# Some tests require that the slave can SSH to itself, setup keys
RUN ssh-keygen -N "" -f $farmerHome/.ssh/id_rsa
RUN cat $farmerHome/.ssh/id_rsa.pub >> $farmerHome/.ssh/authorized_keys

# Set correct rights on .ssh
RUN chmod 644 $farmerHome/.ssh/authorized_keys
RUN chown -R $user $farmerHome/.ssh
RUN chgrp -R $user $farmerHome/.ssh

EXPOSE 22

CMD [ "/usr/sbin/sshd", "-D" ]
