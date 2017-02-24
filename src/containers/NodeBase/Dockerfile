#
# Base image for Code Farm node applications
#
# In containers that inherit this file, EXPOSE ports and set CMD.
#
# Example Dockerfile:
# FROM codefarm/nodebase:0.0.0
#

FROM node:7
LABEL Description="Base image for Code Farm node applications" Version="1.0"

ENV user farmer
ENV farmerHome /home/$user
ENV npmDir ${farmerHome}/npm
ENV appRoot ${farmerHome}/codefarm

RUN groupadd --system $user && useradd --system --create-home --gid $user $user

# Install yarn (lock version to 0.19.1 due to bug in later versions. Confirmed in 0.20.3)
RUN apt-get clean && apt-get update && apt-get install -y --no-install-recommends apt-transport-https && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y --no-install-recommends yarn=0.19.1-1 && \
  rm -rf /var/lib/apt/lists/*

USER ${user}

ENV DISABLE_LINK_LIBS "npm installation disabled"

# Create app directory
RUN mkdir -p ${appRoot}/src/app/me
WORKDIR ${appRoot}/src/app/me

# Bundle app source
ONBUILD COPY . ${appRoot}/src/app/me

ONBUILD USER root
ONBUILD RUN chown $user --recursive ${appRoot}
ONBUILD USER $user

# Create a link .node_modules in home directory to let nodejs require()
# resolve globally installed modules.
# See https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
ONBUILD RUN ln -s ${farmerHome}/.config/yarn/global/node_modules ${farmerHome}/.node_modules

ONBUILD ENV gitroot ${appRoot}
ONBUILD RUN test -f package.json && \
# yarn --production doesn't work for some reason...
  yarn --production || \
  echo "No package.json"

CMD [ "yarn", "run", "start-rel" ]
