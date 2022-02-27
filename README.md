# EchoArena-Overlay
echo arena overlay


## Events

### Configuration

#### `config.loaded`

```
{
    vrml: {}
    echoArena: {}
    obs: {}
    overlay: {}
}
```

### VRML events

#### `vrml.isVrmlMatch`

```js
{
    teamId: string
}
```

#### `vrml.teamListLoaded`

```js
{
    teams: Array({
        id: string,
        name: string
    })
}
```

#### `vrml.teamSelected`

```js
{
    teamId: string
}
```

#### `vrml.matchDataLoaded`

```js
{
    time: Date,
    teams: {
        home: {
            name: string,
            logo: string,
        },
        away: {…}
    },
}
```

#### `vrml.matchDataNotFound`

```js
{
    teamId: string
}
```

### Overlay WebService

#### `overlayWs.launchServer`

```js
{
    autoLaunch: bool,
    port: int
}
```

#### `overlayWs.listening`

```js
{}
```

### OBS WebSocket

#### `obsWebsocket.connect`

```js
{
    ip: string,
    port: int,
    password: string,
    autoConnect: bool,
}
```

### Echo Arena

#### `echoArena.connect`

```js
{
    ip: string,
    port: int,
    autoConnect: bool,
}
```

#### `echoArena.connected`

```js
{}
```
