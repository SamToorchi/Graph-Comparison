# KP Graph Comparison

Topic: Graph Comparison on Mobile Devices Supervisor: Tom Horak

## About

As part of the practical course [KPAUI](https://imld.de/en/study/teaching/ss_20/kp-aui_20/)/[KPVIT](https://imld.de/en/study/teaching/ss_20/kp-vit_20/) we were to develop a prototype web app for comparing multiple graphs on multiple combined tablet devices.

## Usage

### Serving Locally

Modern browsers prevent loading local .csv files due to cross-origin rules. This
can be circumvented by setting up a local server to run the application. The only
prerequisite for this is having the `python` package installed.

From the repository's root directory, go to the folder `src`.

```bash
cd src/
```

From here run the python module `SimpleHTTPServer` if you have Python 2 installed.

```bash
python -m SimpleHTTPServer
```

Instead, if you have Python 3 installed, the command slightly changes.

```bash
python -m http.server
```

The web application will be served on port 8000 and can be accessed [here](localhost:8000).

### Websockets/Socket.io

#### installation

1. install ```node.js``` from https://nodejs.org/en/download/
2. install ```nodemon``` as global instance: ```npm install -g nodemon```
3. install socket.io ```sudo npm install socket.io --save```
4. install express.js ```sudo npm install express --save```

#### run

```nodemon index```

open ```localhost:4000```

insert your own username in ```handle``` field and click on ```register```

second user does same

first user can add the aimed-user for connection in ```to```

start to type your```message``` and ```send``` it


#### source:

https://stackoverflow.com/questions/11356001/socket-io-private-message


## Built with

* [hammer.js](https://hammerjs.github.io/) - framework for enabling (multi-)touch interaction
* [D3.js](https://d3js.org/) - framework for loading data and rendering visualizations
* [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) - API for client-server communication and state sharing

## Authors

* **Jonas Leupold** - *Prototype Development* - [@jole906b](https://git.imld.de/jole906b)
* **Sam Toorchi** - *Prototype Development* - [@s3922626](https://git.imld.de/s3922626)
* **Vincent Thiele** - *Prototype Development* - [@s0411084](https://git.imld.de/s0411084)

## Acknowledgements

* **Tom Horak** - *project supervision and guidance* - [@tom.horak](https://git.imld.de/tom.horak)