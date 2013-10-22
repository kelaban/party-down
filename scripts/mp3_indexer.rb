require 'taglib'
require 'data_mapper'
require_relative '../app/models/song.rb'
require_relative '../app/models/song.rb'
require_relative'../app/models/artist.rb'
require_relative'../app/models/album.rb'


if ARGV.length < 2 ||
   ! ["create", "append"].include?(ARGV[0].downcase)

  puts <<-USAGE
    Usage: #{File.basename(__FILE__)} append|create <music_library_directory> ...

      This will walk the directory specified and index all the mp3 files it encounters

      append: appends the directory/directories to the current index
      create: will clobber the current index and create a new one with the given directory/directories
  USAGE
  exit 1
end

clobber = ARGV.shift.downcase == "create"

# connect datamapper
DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/jukebox.db")
# finalize setup, and run pending migrations
# auto upgrate might not always work, if thats the case
# running DatMapper.finalize.auto_migrate! will drop all tables and set up the
# appropriate schemas
DataMapper.finalize
if clobber
  DataMapper.auto_migrate!
else
  DataMapper.auto_upgrade!
end

ARGV.each do |arg|
  Dir.glob(File.join(arg, "**", "*.mp3")) do |file|
    TagLib::FileRef.open(file) do |f|
      unless f.null?
        tag = f.tag
        artist = Jukebox::Artist.first_or_create({name: tag.artist})
        album = Jukebox::Album.first_or_create({name: tag.album, artist: artist})
        song = Jukebox::Song.create!( {
                              title: tag.title,
                              location: file,
                              track: tag.track,
                              artist: artist,
                              album: album
                            } )
      end
    end
  end
end
