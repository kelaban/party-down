require 'dm-core'
require 'dm-serializer'
require 'dm-validations'

module Jukebox
  class Artist
    include DataMapper::Resource
    property :id,     Serial
    property :name,   Text

    has n, :songs
    has n, :albums

    validates_uniqueness_of :name
  end
end
