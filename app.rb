require 'bundler/setup'
require 'sinatra'
require 'sinatra-websocket'
require 'audite'
require 'json'
require 'sass'
require 'compass'


#Require datamapper before require the models
require 'data_mapper'
require './app/models/song.rb'
require './app/models/artist.rb'
require './app/models/album.rb'

# connect datamapper
DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/jukebox.db")
# finalize setup, and run pending migrations
# auto upgrate might not always work, if thats the case
# running DatMapper.finalize.auto_migrate! will drop all tables and set up the
# appropriate schemas
DataMapper.finalize.auto_upgrade!

set :server, 'thin'

set :root, File.dirname(__FILE__)
set :static, true
set :public_folder, Proc.new { File.join(settings.root, "app",  "public") }
set :views, Proc.new { File.join(settings.root, "app",  "views") }
set :scss, Compass.sass_engine_options
set :sass, Compass.sass_engine_options

set :bind, '0.0.0.0'
set :port, 4567

set :logging, Logger::DEBUG

set :connections, []
set :current_song, nil
set :queue, []
set :player, Audite.new


Compass.configuration do |config|
  config.project_path = File.dirname(__FILE__)
  config.sass_dir = 'app/public/stylesheets'
end

def websocket_send(event, msg)
  settings.connections.each do |ws|
    ws.send(msg.merge({event: event}).to_json)
  end
end

def current_song_details
  song = settings.current_song
  return {} if song.nil?
  {
    album_id: song.album_id,
    artist_id: song.artist_id,
    id:  song.id,
    song:  song.track,
    artist:  song.artist.name,
    album:  song.album.name,
    title: song.title,
  }
end

settings.player.events.on(:toggle) do |active|
  websocket_send("player:toggle", {playing: active, song: current_song_details})
end

settings.player.events.on(:position_change) do |pos|
  websocket_send("player:positionChange", {length: settings.player.length_in_seconds, current_pos: settings.player.position})
end

get '/stylesheets/:name.css' do
  content_type 'text/css', :charset => 'utf-8'
  scss(:"#{params[:name]}")
end

get '/' do
  if !request.websocket?
       erb :index
  else
    request.websocket do |ws|
      ws.onopen do
        logger.info "Websocket Opened"
        settings.connections << ws
      end
      ws.onclose do
        logger.info "Websocket Closed"
        settings.connections.delete(ws)
      end
    end
  end
end

get '/artists' do
 Jukebox::Artist.all.to_json(only: [:id, :name])
end

get '/artists/:id' do
  content_type 'application/json'
  Jukebox::Artist.get(params[:id]).to_json(methods: [:albums])
end

get '/artists/:artist_id/albums/:id' do
  content_type 'application/json'
  Jukebox::Album.get(params[:id]).to_json(methods: [:songs])
end

#Post to Player to play a new song
post '/player' do
  params = JSON.parse(request.body.read, symbolize_names: true)
  settings.current_song = Jukebox::Song.get(params[:song])
  settings.player.stop_stream
  settings.player.load(settings.current_song.location)
  settings.player.start_stream
  200
end

post '/player/toggle' do
  settings.player.toggle
  200
end

post '/player/seek' do
  params = JSON.parse(request.body.read, symbolize_names: true)
  settings.player.seek(params[:seconds])
  200
end

#Gets the current player status
#useful to call when the client loads the page
get '/player' do
  content_type 'application/json'
  {song: current_song_details}.to_json
end
