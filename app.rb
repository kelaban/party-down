require 'sinatra'
require 'sinatra-websocket'
require 'slim'
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

set :root, File.dirname(__FILE__)
set :static, true
set :public_folder, Proc.new { File.join(root, "app",  "public") }
set :views, Proc.new { File.join(root, "app",  "views") }
set :scss, Compass.sass_engine_options
set :sass, Compass.sass_engine_options

set :connections, []

set :bind, '0.0.0.0'
set :port, 4567

player = Audite.new


Compass.configuration do |config|
  config.project_path = File.dirname(__FILE__)
  config.sass_dir = 'app/public/stylesheets'
end

player.events.on(:position_change) do |pos|
  settings.connections.each do |ws|
    ws.send({current_pos: player.position, length: player.length_in_seconds}.to_json)
  end
end

get '/stylesheets/:name.css' do
  content_type 'text/css', :charset => 'utf-8'
  scss(:"#{params[:name]}")
end

get '/' do
  if !request.websocket?
     #player.load(settings.mp3s + "/machine_gun.mp3")
     slim :index
  else
    request.websocket do |ws|
      ws.onopen do
        settings.connections << ws
      end
      ws.onclose do
        warn("wetbsocket closed")
        settings.connections.delete(ws)
      end
    end
  end
end

post '/player/toggle' do
  player.toggle
  slim :index
end

get '/player/status' do
  if player.active
    "I'm playing"
  else
    "Play me!!!"
  end
end

get '/artists' do
 Jukebox::Artist.all.to_json(only: [:id, :name])
end

get '/artists/:id/albums' do
 Jukebox::Artist.get(params[:id]).albums.to_json(only: [:id, :name])
end

get '/artists/:artist_id/albums/:id/songs' do
 Jukebox::Album.get(params[:id]).songs.to_json(only: [:id, :title, :location, :track])
end

post '/player' do
  player.stop_stream if player.active
  player.load(params[:path])
  player.start_stream
end

patch '/player' do
  player.toggle
end

get '/player' do
  {playing: player.active}.to_json
end
