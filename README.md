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

#### `obs request`
```
AddFilterToSource
AddSceneItem
Authenticate
BroadcastCustomMessage
CreateScene
CreateSource
DeleteSceneItem
DisableStudioMode
DuplicateSceneItem
EnableStudioMode
ExecuteBatch
GetAudioActive
GetAudioMonitorType
GetAudioTracks
GetAuthRequired
GetBrowserSourceProperties
GetCurrentProfile
GetCurrentScene
GetCurrentSceneCollection
GetCurrentTransition
GetFilenameFormatting
GetMediaDuration
GetMediaSourcesList
GetMediaState
GetMediaTime
GetMute
GetOutputInfo
GetPreviewScene
GetRecordingFolder
GetRecordingStatus
GetReplayBufferStatus
GetSceneItemList
GetSceneItemProperties
GetSceneList
GetSceneTransitionOverride
GetSourceActive
GetSourceDefaultSettings
GetSourceFilterInfo
GetSourceFilters
GetSourceSettings
GetSourcesList
GetSourceTypesList
GetSpecialSources
GetStats
GetStreamingStatus
GetStreamSettings
GetStudioModeStatus
GetSyncOffset
GetTextFreetype2Properties
GetTextGDIPlusProperties
GetTransitionDuration
GetTransitionList
GetTransitionPosition
GetTransitionSettings
GetVersion
GetVideoInfo
GetVirtualCamStatus
GetVolume
ListOutputs
ListProfiles
ListSceneCollections
MoveSourceFilter
NextMedia
OpenProjector
PauseRecording
PlayPauseMedia
PreviousMedia
RefreshBrowserSource
ReleaseTBar
RemoveFilterFromSource
RemoveSceneTransitionOverride
ReorderSceneItems
ReorderSourceFilter
ResetSceneItem
RestartMedia
ResumeRecording
SaveReplayBuffer
SaveStreamSettings
ScrubMedia
SendCaptions
SetAudioMonitorType
SetAudioTracks
SetBrowserSourceProperties
SetCurrentProfile
SetCurrentScene
SetCurrentSceneCollection
SetCurrentTransition
SetFilenameFormatting
SetHeartbeat
SetMediaTime
SetMute
SetPreviewScene
SetRecordingFolder
SetSceneItemCrop
SetSceneItemPosition
SetSceneItemProperties
SetSceneItemRender
SetSceneItemTransform
SetSceneTransitionOverride
SetSourceFilterSettings
SetSourceFilterVisibility
SetSourceName
SetSourceRender
SetSourceSettings
SetStreamSettings
SetSyncOffset
SetTBarPosition
SetTextFreetype2Properties
SetTextGDIPlusProperties
SetTransitionDuration
SetTransitionSettings
SetVolume
Sleep
StartOutput
StartRecording
StartReplayBuffer
StartStopRecording
StartStopReplayBuffer
StartStopStreaming
StartStopVirtualCam
StartStreaming
StartVirtualCam
StopMedia
StopOutput
StopRecording
StopReplayBuffer
StopStreaming
StopVirtualCam
TakeSourceScreenshot
ToggleMute
ToggleStudioMode
TransitionToProgram
TriggerHotkeyByName
TriggerHotkeyBySequence
```

