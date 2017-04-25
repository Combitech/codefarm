FROM codefarm/appnodebase:0.0.0
CMD [ \
    "node", \
    "--harmony_async_await", \
    ".", \
    "--bus", "amqp://rabbitmq:5672/codefarm", \
    "--mongo", "mongodb://mongo:27017" \
]
