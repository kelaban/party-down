var app = app || {};

jQuery.noConflict();
(function($){
  'use strict';

  var Player = Backbone.Model.extend({
    urlRoot: '/player',


    initialize: function(){
      this.set("playing", false);
      this.set("nowPlaying", {});
    },

    play: function(song){
      $.ajax({
        url: this.urlRoot,
        context: this,
        type: 'POST',
        data:{path: song.get("location")}
      }).success(function(){
       this.set("nowPlaying", song);
       this.set("playing", true);
      });
    },

    toggle: function(){
      $.ajax({
        url: this.urlRoot,
        context: this,
        type: 'PATCH',
      }).success(function(){
        var playing = this.get("playing");
        this.set("playing", !playing);
      });
    },
  });

  app.player = new Player();

  app.Song = Backbone.Model.extend({});

  var Songs = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: app.Song,
    url: function(){ '/songs'; }
  });

  app.Album = Backbone.Model.extend({
    defaults: { songs: [] },

    initialize: function () {
      var self = this;
      this.songs = new Songs(this);
      this.songs.url = function() {
        return self.url() + '/songs';
      };

      this.listenTo(this.songs, 'reset', this.addSongs);
    },

    addSongs: function(){
      app.songsView.addAll(this.songs);
    }

  });

  var Albums = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: app.Album,
    url: function(){ '/albums'; },
  });


  app.Artist = Backbone.Model.extend({
    defaults: { albums: [] },

    initialize: function () {
      var self = this;
      this.albums = new Albums(this);
      this.albums.url = function() {
        return self.url() + '/albums';
      };

      this.listenTo(this.albums, 'reset', this.addAlbums);
    },

    urlRoot: '/artists',

    addAlbums: function(){
      app.albumsView.addAll(this.albums);
      app.songsView.clearAll();
    }

  });

  var Artists = Backbone.Collection.extend({
    // Reference to this collection's model.
    model: app.Artist,
    url: '/artists'
  });



  app.artists = new Artists();
  //
  //************************************
  //       Single   Views
  //************************************
  //

  app.PlayerView = Backbone.View.extend({
    el: "#player",

    events: {
      "click #status": "toggleStatus",
      "click #playerTab": "toggleQueue"
    },

    initialize: function(){
      this.listenTo(app.player, 'change:playing', this.setStatus);
      this.listenTo(app.player, 'change:nowPlaying', this.setNowPlaying);
    },

    setStatus: function(){
      var $s = this.$("#status")
      var playing = app.player.get("playing");
      if(playing === true){
        $s.text("Playing");
      }
      else{
        $s.text("Paused");
      }
    },

    setNowPlaying: function(){
      this.$("#nowSong").text(app.player.get("nowPlaying").get("title"));
    },

    toggleStatus: function(){
      app.player.toggle();
    },

    toggleQueue: function(){
      this.$el.toggleClass("expand");
    }


  });

  app.ArtistView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($('#artistRowTemplate').html()),

    events: {
      "click": "fetchAlbums"
    },

    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    fetchAlbums: function(){
      this.model.albums.fetch({reset: true});
      app.appView.setSectionAlbums(this.model.get("name"), this.model.albums)
    }

  });

  app.AlbumView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($('#albumRowTemplate').html()),

    events: {
      "click td": "fetchSongs"
    },

    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    fetchSongs: function(){
      this.model.songs.fetch({reset: true});
      app.appView.setSectionSongs(this.model.get("name"))
    }

  });

  app.SongView = Backbone.View.extend({
    tagName: 'tr',

    template: _.template($('#songRowTemplate').html()),

    events: {
      "click td": "loadSong"
    },

    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },


    loadSong: function(){
      app.player.play(this.model)
    }

  });

  //
  //************************************
  //       List  Views
  //************************************
  //
  app.ArtistsView = Backbone.View.extend({
    el: '#artists tbody',

    initialize: function(){
      this.listenTo(app.artists, 'reset', this.addAll);

      app.artists.fetch({reset: true});
    },

    // Add all items in the **Artists** collection at once.
    addAll: function () {
      this.$el.html('');
      app.artists.each(this.addOne, this);
    },

    addOne: function(item) {
      var view = new app.ArtistView({model: item});
      this.$el.append(view.render().el)

    }

  });


  app.AlbumsView = Backbone.View.extend({
    el: '#albums tbody',

    initialize: function(){
    },

    // Add all items in the **Albums** collection at once.
    addAll: function (albums) {
      this.$el.html('');
      albums.each(this.addOne, this);
    },

    addOne: function(item) {
      var view = new app.AlbumView({model: item});
      this.$el.append(view.render().el)

    }

  });

  app.SongsView = Backbone.View.extend({
    el: '#songs tbody',

    // Add all items in the **Albums** collection at once.
    addAll: function (songs) {
      this.$el.html('');
      songs.each(this.addOne, this);
    },

    addOne: function(item) {
      var view = new app.SongView({model: item});
      this.$el.append(view.render().el)

    },

    clearAll: function(item){
      this.$el.empty();
    }

  });


  app.AppView = Backbone.View.extend({
    el: "body",

    events: {
      "click #currentArtist": "backToArtists",
      "click #currentAlbum": "backToAlbums"

    },

    initialize:function(){
      app.artistsView = new app.ArtistsView();
      app.albumsView = new app.AlbumsView();
      app.songsView = new app.SongsView();
      app.playerView = new app.PlayerView();
    },


    setSectionAlbums: function(artist){
      $("#currentArtist").removeClass("in").text(artist);
      $("#albums").removeClass("in");
      $("#artists").addClass("in");
      $("#currentSection").text("Albums");
    },

    setSectionSongs: function(album){
      $("#currentAlbum").removeClass("in").text(album)
      $("#songs").removeClass("in");
      $("#albums").addClass("in");
      $("#currentSection").text("Songs");
    },

    backToArtists: function(){
      $("#currentSection").text("Artists");
      $("#songs").addClass("in");
      $("#albums").addClass("in");
      $("#currentArtist").addClass("in");
      $("#currentAlbum").addClass("in");

      $("#artists").removeClass("in");
    },

    backToAlbums: function(){
      $("#currentSection").text("Albums");
      $("#songs").addClass("in"); //hide songs
      $("#currentAlbum").addClass("in"); //hide current album breadcrumb

      $("#albums").removeClass("in"); //show albums
    }


  });

  app.appView = new app.AppView();
})(jQuery)
