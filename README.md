# README

##PARTY.down

About This app
----------------
WORK IN PROGRESS!!!

using sinatra.rb, angular.js, and websockets

This app is intended to be hosted on a raspberry Pi or the likes of it. It is (or will be) a server side
music player that can be controlled from an client, keeping the queue in sync with websockets. I intend to
continue this app to eventually feature multiple queues for multiple rooms and possibly to be configurable to some sort of
nfs.

Currently, running a script will index all of your musics metadata into a sqlite db which will be used
to serve up all of the client side requests. This part of the app should eventually be pretty pluggable for
what ever backend I feel neccessary.

Next Features: Queueing, Refactoring code, Styling views to better fit mobile

Next Next Features: Upload from client, Rooms, foobars


## TODO

### Features

#### Choose Song
* ~~ I want to be able to see all the artists and choose a song ~~
  * Done
* I want to be able to see all the songs and choose a song
 * Done
* I want to be able to see all the albums and choose a song
 * Done
* I want to be able to see all filter by all of the above

##### Tasks
* Parser to get all metadata and index it
* Artists Page
* Songs Page
* Albums Page

#### Song playback
* I need to start a song (play)
  * Done
* I need to stop a song (stop)
  * Done
* I want to be able to seek a position within the song
* I should be able to add songs to a queue
* I should be able to rearrange the queue
* I should be able to remove songs from the queue

#### Upload
* I want to be able to upload a song from my personal device




