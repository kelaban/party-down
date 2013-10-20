require 'dm-core'
require 'dm-serializer'
require 'dm-validations'

module Jukebox
  class Album
    include DataMapper::Resource
    property :id,     Serial
    property :name,   Text

    belongs_to :artist
    has n, :songs
  end
end
