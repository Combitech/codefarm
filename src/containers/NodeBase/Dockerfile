#
# Base image for Code Farm node applications
#
# In containers that inherit this file, EXPOSE ports and set CMD.
#
# Example Dockerfile:
# FROM codefarm/nodebase:0.0.0
#

FROM node:8
LABEL Description="Base image for Code Farm node applications" Version="1.0"

ENV http_proxy http://httppxgot.srv.volvo.com:8080
ENV ftp_proxy http://httppxgot.srv.volvo.com:8080
ENV https_proxy http://httppxgot.srv.volvo.com:8080
ENV no_proxy localhost,127.0.0.1,.volvo.net

#ENV http_proxy ${http_proxy:-}
#ENV https_proxy ${https_proxy:-}
#ENV no_proxy ${no_proxy:-}
RUN env | grep proxy

ENV user farmer
ENV farmerHome /home/$user
ENV appRoot ${farmerHome}/codefarm


RUN groupadd --system $user && useradd --system --create-home --gid $user $user

# Dependency weak-value-map needs node-gyp
RUN npm install -g node-gyp

# Upgrade npm to latest version
#RUN ls -al $(npm root -g)
#RUN cd $(npm root -g)/../ && npm install npm@latest && npm -v
#RUN exit 1
#RUN export npm_home=$(npm root -g)/npm && mkdir -p $farmerHome/temp && cd $farmerHome/temp && npm install npm@latest && rm -rf $npm_home && mv $farmerHome/temp/node_modules/npm $npm_home && npm -v && exit 1


USER ${user}

# Create data directory where default volume can be mounted
RUN mkdir -p $farmerHome/data && chown -R $user $farmerHome/data -R && chgrp -R $user $farmerHome/data

# Create app directory
RUN mkdir -p ${appRoot}/src/app/me
WORKDIR ${appRoot}/src/app/me

# 1. Add app dependency specification. This is done first to utilize docker caching.
ONBUILD COPY [ "package.json", "${appRoot}/src/app/me/" ]

ONBUILD USER root
ONBUILD RUN chown $user --recursive ${appRoot}
ONBUILD USER $user
ONBUILD ENV gitroot ${appRoot}
ONBUILD RUN test -f package.json && \
  npm install --production || \
  echo "No package.json"

# 2. Add app source
ONBUILD COPY . ${appRoot}/src/app/me
ONBUILD USER root
ONBUILD RUN find ${appRoot}/src/app/me -path './node_modules' -prune -o -print0 | xargs -0 chown $user
ONBUILD USER $user

CMD [ "npm", "run", "start-rel" ]
