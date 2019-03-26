<<<<<<< HEAD
# Openbox Dashboard

## Introduction

The OpenBox Dashboard connects to a running OpenBox Moonlight Controller, and allows to examine the deployed network, the loaded OpenBox applications, and the OpenBox instances.

From the dashboard, you can see the processing graph of each application, and the aggregation results for each network location.

Once an OBI joins the network, you can examine the processing graph and processing blocks deployed on it, and interact with them - send read/write requests, see the blocks configurations, and monitor their performance.

## Installation

### Build the docker image

```bash
docker build . -t moonlight-dashboard
```

### Run the dashboard
```bash
docker run -d -p80:80 --name dashboard -ti moonlight-dashboard
```

The dashboard should be available on http://localhost

#### Note

The dashboard REST server is expected to run on localhost:3635

The dashboard Websocket is expected to run on localhost:8080

If you are using Docker to run the moonlight controller, don't forget to expose these ports

For more details, see Moonlight Controller
=======
dashboard
>>>>>>> github/master
