# Echo Arena Streaming Tool

## About 

EAST is an open source project to help streamers around the echo arena community to cast.
This project includes an auto scene manager, overlays for echo, auto spectate and VRML/Mixed support

## DEMO

(To do)

## How to install

Prerequisites : 
- Enable echo arena API

Download and install :
- EAST latest release (https://github.com/NotBlue-Dev/EAST/releases)
- OBS (https://obsproject.com/fr/download)
- ECHOVR (https://www.oculus.com/echo-vr/?locale=fr_FR)
- OBS WEBSOCKET 4.9.1 (https://github.com/obsproject/obs-websocket/releases/tag/4.9.1)

Extract and run EAST executable
Fill EchoVR Path with the game path (ex: C:\Program Files\Oculus\Software\Software\ready-at-dawn-echo-arena\bin\win10\echovr.exe)
Run OBS, Go to Tools, Websocket, and set a password
Fill OBS path on EAST app (ex: C:/Program Files/obs-studio/bin/64bit)

## How to use

### OBS Configuration

Create a stinger transition if you want EAST transition
To create the scene/overlays sources click create in OBS section on EAST
To have the default replay timing, enable replay buffer in OBS (File, settings, output) and set duration to 7s
When scene are created, go to main scene, replay, right click : Hide transition, Fade, 1100ms ; Show transition, Fade, 700mss

### EchoVR Configuration

PC :
- Input your pc IP (default is 127.0.0.1), and change the port if you need it

Quest :
- Input your quest IP

You can join a session with the session id
You can spectate your game by clicking spectate me

### MIXED

Input team name in the last section
You can program stream to start at a precise time in Scenes tab, Timer (EAST)

### VRML

Select a team and click stream incoming match


