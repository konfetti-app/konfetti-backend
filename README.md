# Konfetti Backend

This is the work-in-progress rewrite of the Konfetti App backend.
Find the current production version at [https://github.com/rootzoll/konfetti-app](https://github.com/rootzoll/konfetti-app)

## Usage

To run the app, make shure docker is installed on your system on a version that includes docker-compose. Then bring it up with:
```
$ docker-compose up
```

To trigger a rebuild after a code-change enter 
```
$ docker-compose up --build
```

If that fails because of dependencies not being available, do a: 
```
$ docker-compose build --no-cache && docker-compose up
```

To run the server outside of a docker-container (for connecting a debugger), you still have to run a mongodb and expose the database-port to :27017 (e.g. via docker-compose override) and have nodejs (>v8.5) installed, then do: 
```
$ docker-compose up -d mongo && node --inspect bin/www
```
An example docker-compose.override.yml file for this case in provided as _docker-compose.override.yml. Just rename that one to docker-compose.override.yml

## Features

* The server exposes an unsecured rest-api and socket.io on port 3000 
* Authentication is based on http-basic-auth and JWT for both rest and socket.io. If you receive an http 403, you have to require a new token first.
* Examples are provided in /stuff/ (i.e. a Postman-collection containing example requests for adding users and for acquireing tokens and some requests against rest; an example for socket.io connections and authentication is locates exposed at http://localhost:3000/sockettest.html)
* Socket.io content is triggerd via mongodb pubish/subscribe 
* This is work in progress and is in no way secure for production yet.

## License

The program is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information.