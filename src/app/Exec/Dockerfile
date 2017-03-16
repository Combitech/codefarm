FROM codefarm/appnodebase:0.0.0

RUN yarn compile -- --env.global_modules_dir ${farmerHome}/.node_modules && \
  rm -rf babel_cache
