# Echo Arena Streaming Tool

## About 

EAST is an open source project to help streamers around the echo arena community to cast.
This project includes an auto scene manager, overlays for echo, auto spectate and VRML/Mixed support

## Preview

![Replay + Score](https://user-images.githubusercontent.com/64601123/174887113-14113375-59a8-4afe-8de8-ddd222d30b04.png)
![Main_Screen](https://user-images.githubusercontent.com/64601123/174887118-20ba3b0d-6b78-4b52-9387-3a09b29d05af.png)
![Half time stats](https://user-images.githubusercontent.com/64601123/174887120-87be8952-d420-48ea-8984-73b3450e1168.png)
![Between round](https://user-images.githubusercontent.com/64601123/174887123-d0ba0e16-e325-48d1-bbf3-31388403c6dd.png)
![Starting](https://user-images.githubusercontent.com/64601123/174887126-ad1ffe9e-0e72-49a2-9c1a-ba0286676b2a.png)
![Waiting](https://user-images.githubusercontent.com/64601123/174887129-e38c343c-a016-4736-829a-f2750298e42a.png)

## How to install Video



## How to install Text

Prerequisites : 
- Enable echo arena API

Download and install :
- EAST latest release (https://github.com/NotBlue-Dev/EAST/releases)
- OBS (https://obsproject.com/fr/download)
- ECHOVR (https://www.oculus.com/echo-vr/?locale=fr_FR)
- OBS WEBSOCKET 4.9.1 (https://github.com/obsproject/obs-websocket/releases/tag/4.9.1)
- VLC (https://www.videolan.org/vlc/index.fr.html)

Then

- Extract and run EAST executable
- Fill EchoVR Path with the game path (ex: C:\Program Files\Oculus\Software\Software\ready-at-dawn-echo-arena\bin\win10\echovr.exe)
- Fill OBS path on EAST app (ex: C:/Program Files/obs-studio/bin/64bit)
- Run OBS, Go to Tools, Websocket, and set a password
- Change the screen size in OBS section on EAST (make it the size in File>Settings>Video>Base Canvas Resolution in OBS app)
- Optional : Enable auto starts in EAST

## How to use

### OBS Configuration

- Create an empty stinger transition if you want EAST transition,<br />
- Enable replay buffer in OBS File>settings>output and set duration to 7s,<br />
- Go to File>Settings>Advanced> and set file formating to %CCYY<br />
- Enable overwrite
- Start replay buffer and click the save button<br />
- Click create in OBS section on EAST, (if audio or source are missing, click again)<br />
- Go to the "replay" source in "Main scene" and set the file you saved as playlist (should be named Replay 2022)<br />
- Go to "Main scene", "replay" source, right click : Hide transition>Fade>1100ms and Show transition>Fade>700ms<br />
- If you had to change the screen size in EAST app you might have to adjust some sources like "replay" or "EchoCapture"

### EchoVR section Configuration

- Input your pc IP (default is 127.0.0.1), and change the port if you need it or input your quest IP

You can join a session with the session id <br />
You can spectate your game by clicking spectate me

### MIXED

Input team name in the mixed section<br />
You can program stream to start at a precise time in Scenes tab>Timer on EAST app

### VRML

Select a team and click stream incoming match

### Run everything

Click connect next to EchoVR IP to connect to the API 
Click launch for overlays
Click connect to OBS
Click start replay buffer
And finally, join session or spectate

(you can enable auto connect for almost every component)
