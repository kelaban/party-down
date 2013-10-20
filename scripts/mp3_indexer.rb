require 'taglib'
require 'data_mapper'
require_relative '../app/models/song.rb'
require_relative '../app/models/song.rb'
require_relative'../app/models/artist.rb'
require_relative'../app/models/album.rb'


if ARGV.length < 1
  puts <<-USAGE
    Usage: #{File.basename(__FILE__)} <music_library_directory>
      This will walk the directory specified and index all the mp3 files it encounters
  USAGE
  exit 1
end

# connect datamapper
DataMapper::setup(:default, "sqlite3://#{Dir.pwd}/jukebox.db")
# finalize setup, and run pending migrations
# auto upgrate might not always work, if thats the case
# running DatMapper.finalize.auto_migrate! will drop all tables and set up the
# appropriate schemas
DataMapper.finalize.auto_migrate!

Dir.glob(File.join(ARGV.shift, "**", "*.mp3")) do |file|

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
