'use strict';

/* Controllers */


var jukeboxControllers = angular.module('jukeboxControllers', []);


jukeboxControllers.controller('NavCtrl', ['$scope', '$route',
  function($scope, $route) {
    $scope.route = $route;
  }]);

jukeboxControllers.controller('ArtistsCtrl', ['$scope', 'Artist',
  function($scope, Artist) {
    $scope.artists = Artist.query();
    $scope.title = "Artists"

  }]);

jukeboxControllers.controller('AlbumsCtrl', ['$scope', '$routeParams', 'Artist',
  function($scope, $routeParams, Artist) {
    $scope.artist = Artist.get({artistId: $routeParams.artistId});
    $scope.title = "Albums"
  }]);

jukeboxControllers.controller('SongsCtrl', ['$scope', '$routeParams', 'Artist','Album', 'Player',
  function($scope, $routeParams, Artist, Album, Player) {
    $scope.artist = Artist.get({artistId: $routeParams.artistId});
    $scope.album = Album.get({artistId: $routeParams.artistId, albumId: $routeParams.albumId});
    $scope.title = "Songs"


    $scope.playSong = function(song) {
      Player.play({song: song.id});
    }

  }]);

jukeboxControllers.controller('PlayerCtrl', ['$scope', '$route', 'socket', 'Player',
  function($scope, $route, socket, Player) {

    $scope.player = Player.get();
    $scope.duration = {current: 0, total: 0};

    socket.on("player:toggle", function(msg){
      $scope.player = msg;
    });

    socket.on("player:positionChange", function(msg){
      $scope.duration = {current: msg['current_pos'], total: msg['length']};
    });

    $scope.playerToggle = function(){
      Player.toggle();
    }
  }]);
