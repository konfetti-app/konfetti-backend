# Konfetti Backend

This is the work-in-progress rewrite of the Konfetti App backend.
Find the App (frontend) at [https://github.com/konfetti-app/konfetti-app](https://github.com/konfetti-app/konfetti-app)
and the current (production) version at [https://github.com/rootzoll/konfetti-app](https://github.com/rootzoll/konfetti-app)

## Usage

To run the app, make sure docker is installed on your system on a version that includes docker-compose. Then bring it up with:
```
$ docker-compose up
```

If that fails because of dependencies not being available, do a: 
```
$ docker-compose down && docker-compose build --no-cache && docker-compose up
```

To run the server outside of a docker-container (for connecting a debugger), you still have to run a mongodb and expose the database-port to :27017 (e.g. via docker-compose override) and have nodejs (>v8.5) installed, then do: 
```
$ docker-compose up -d mongo && node --inspect bin/www
```
An example docker-compose.override.yml file for development is provided as _docker-compose.override.yml. Just rename that one to docker-compose.override.yml

## Features

* The server exposes an rest-api and socket.io on port 3000 
* Authentication is based on http-basic-auth and JWT for both rest and socket.io. If you receive an http 403, you have to require a new token first. There is a JWT in /stuff/ which does not expire.
* Examples are provided in /stuff/ (i.e. a Postman-collection containing example requests for adding the first user and for acquireing tokens and sample requests against the rest-api; an example for socket.io connections and authentication is located exposed at http://localhost:3000/chattest.html)
* Socket.io content is triggerd via mongodb pubish/subscribe 
* This is work in progress and is not ready for production yet.

## API

You can find a detailed description of available api-routes here: [API-docs](API.md)

## Join

The find out more about the project and our motivation, visit [https://konfettiapp.de](https://konfettiapp.de).

## License

The program is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information.
