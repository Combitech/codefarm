FROM codefarm/appnodebase:0.0.0

RUN yarn run compile-client -- --env.global_modules_dir ${farmerHome}/.node_modules && \
  rm -rf babel_cache

CMD [ \
    "node", \
    "--harmony_async_await", \
    ".", \
    "--bus", "amqp://rabbitmq/codefarm" \
]
