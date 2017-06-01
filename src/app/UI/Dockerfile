FROM codefarm/appnodebase:0.0.0

RUN npm run compile-client -- --env.global_modules_dir ${farmerHome}/.node_modules && \
  rm -rf babel_cache

ENV NODE_ENV production
CMD [ \
    "node", \
    ".", \
    "--bus", "amqp://rabbitmq:5672/codefarm" \
]
