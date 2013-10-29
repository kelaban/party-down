'use strict';

var jukeboxApp = angular.module('jukeboxApp', [
  'ngRoute',
  'jukeboxControllers',
  'jukeboxServices',
  'jukeboxDirectives'
]);


jukeboxApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/artists', {
        templateUrl: 'partials/artists.html',
        controller: 'ArtistsCtrl',
      }).
      when('/artists/:artistId', {
        templateUrl: 'partials/artist-albums.html',
        controller: 'AlbumsCtrl',
      }).
      when('/artists/:artistId/albums/:albumId', {
        templateUrl: 'partials/album-songs.html',
        controller: 'SongsCtrl',
      }).
      otherwise({
        redirectTo: '/artists'
      });
  }]);

