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

ENV user codefarm
ENV farmerHome /home/$user
ENV npmDir ${farmerHome}/npm
ENV appRoot ${farmerHome}/codefarm

RUN groupadd --system $user && useradd --system --create-home --gid $user $user

# Dependency weak-value-map needs node-gyp
RUN npm install -g node-gyp

USER ${user}

ENV DISABLE_LINK_LIBS "npm installation disabled"

# Create data directory where default volume can be mounted
RUN mkdir -p $farmerHome/data && chown -R $user $farmerHome/data -R && chgrp -R $user $farmerHome/data

# Create app directory
RUN mkdir -p ${appRoot}/src/app/me
WORKDIR ${appRoot}/src/app/me

# 1. Add app dependency specification. This is done first to utilize docker caching.
ONBUILD COPY [ "package.json", "yarn.lock", "${appRoot}/src/app/me/" ]

ONBUILD USER root
ONBUILD RUN chown $user --recursive ${appRoot}
ONBUILD USER $user

# Create a link .node_modules in home directory to let nodejs require()
# resolve globally installed modules.
# See https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
ONBUILD RUN ln -s ${farmerHome}/.config/yarn/global/node_modules ${farmerHome}/.node_modules

ONBUILD ENV gitroot ${appRoot}
ONBUILD RUN test -f package.json && \
  yarn --production || \
  echo "No package.json"

# 2. Add app source
ONBUILD COPY . ${appRoot}/src/app/me
ONBUILD USER root
ONBUILD RUN find ${appRoot}/src/app/me -path './node_modules' -prune -o -print0 | xargs -0 chown $user
ONBUILD USER $user

CMD [ "yarn", "run", "start-rel" ]
