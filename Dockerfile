FROM node
ADD . /openbox/
WORKDIR /openbox/
RUN deploy/install.sh

CMD echo "Running OpenBox Dashboard from /openbox/dist"
