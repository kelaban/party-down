require 'dm-core'
require 'dm-serializer'
require 'dm-validations'

module Jukebox
  class Song
    include DataMapper::Resource
    property :id,           Serial
    property :title,        Text
    property :location,     Text
    property :track,        Integer

    belongs_to :artist
    belongs_to :album
  end
end
