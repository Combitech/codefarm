FROM codefarm/appnodebase:0.0.0
CMD [ \
    "node", \
    "--harmony_async_await", \
    ".", \
    "--bus", "amqp://rabbitmq/codefarm", \
    "--mongo", "mongodb://mongo:27017", \
    "--msgbus", "amqp://rabbitmq:5672" \
]
