FROM node
ADD . /openbox/
WORKDIR /openbox/
RUN deploy/install.sh

CMD ["nginx", "-g", "daemon off;"]
