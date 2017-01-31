FROM codefarm/appnodebase:0.0.0

RUN git config --global user.email "farmer@nowhere.all"
RUN git config --global user.name "The Farmer"

USER root

RUN set -x \
	&& apt-get update \
	&& apt-get install -y netcat-openbsd

USER ${user}
