#
# Base image for Code Farm node applications
#
# In containers that inherit this file, EXPOSE ports and set CMD.
#
# Example Dockerfile:
# FROM codefarm/appnodebase:0.0.0
#

FROM codefarm/nodebase:0.0.0
LABEL Description="Base image for Code Farm node applications including libraries" Version="1.0"
ENV depTmpRoot ${farmerHome}/deps
RUN mkdir -p ${depTmpRoot}/src
ADD deps/deps.tgz ${depTmpRoot}/src
USER root
RUN chown -R ${user} ${depTmpRoot}
USER ${user}

# Add build-support dependency
RUN cp -r ${depTmpRoot}/src/bs ${appRoot}/src && cp -r ${depTmpRoot}/src/lib ${appRoot}/src && rm -rf ${depTmpRoot}

# 1. Add app dependency specification. This is done first to utilize docker caching.
ONBUILD COPY [ "package.json", "package-lock.json", "${appRoot}/src/app/me/" ]

ONBUILD USER root
ONBUILD RUN chown $user --recursive ${appRoot}
ONBUILD USER $user

# Install all libraries with package.json
ONBUILD RUN for i in $(ls -1 ${appRoot}/src/lib/*/package.json); do \
    moduleDir=$(echo $i|sed -e 's/\/package\.json//g'); \
    echo "Installing library package $moduleDir"; \
    cd ${moduleDir}; \
    npm install --production; \
  done

ONBUILD RUN test -f package.json && \
  npm install --production || \
  echo "No package.json"

# 2. Add app source
ONBUILD COPY . ${appRoot}/src/app/me

ONBUILD USER root
ONBUILD RUN find ${appRoot}/src/app/me -path './node_modules' -prune -o -print0 | xargs -0 chown $user
ONBUILD USER $user

ENV gitroot ${appRoot}
CMD [ "npm", "run", "start-rel" ]
