FROM codefarm/nodebase:0.0.0

USER root
RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd

WORKDIR $farmerHome

RUN mkdir -p $farmerHome/.ssh

# Copy authorized_keys and set access for $user
COPY [ "authorized_keys", "$farmerHome/.ssh/" ]
RUN chmod 644 .ssh/authorized_keys && chown -R $user $farmerHome/.ssh && chgrp -R $user $farmerHome/.ssh

EXPOSE 22

CMD [ "/usr/sbin/sshd", "-D" ]
