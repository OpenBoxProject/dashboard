FROM node
ADD . /openbox/
WORKDIR /openbox/
RUN npm install
RUN npm install -g @angular/cli
CMD ng serve --host 0.0.0.0

