'use strict';

/* Services */

var jukeboxServices = angular.module('jukeboxServices', ['ngResource']);

jukeboxServices.factory('Artist', ['$resource',
  function($resource){
    return $resource('artists/:artistId', {}, {
      query: {method:'GET', isArray:true, cache: true},
      get: {method: 'GET', cache: true}
    });
  }]);

jukeboxServices.factory('Album', ['$resource',
  function($resource){
    return $resource('artists/:artistId/albums/:albumId', {}, {
      query: {method:'GET', isArray:true, cache: true},
      get: {method: 'GET', cache: true}
    });
  }]);

jukeboxServices.factory('Player', ['$resource',
  function($resource){
    return $resource('player', {}, {
      play: {
          method: 'POST',
          headers: {'Content-Type':'application/json'}
        },

      toggle: {
          method: 'POST',
          url: 'player/toggle',
          responseType: 'json'
        },

      seek: {
          method: 'POST',
          url: 'player/seek',
          headers: {'Content-Type':'application/json'}
        }

      });
  }]);


jukeboxServices.factory('socket', ['$location', '$rootScope', function($location, $rootScope) {
  var ws = new WebSocket('ws://' + location.host );
  var events = {};
  ws.onopen    = function()  { console.log('websocket opened'); };
  ws.onclose   = function()  { console.log('websocket closed'); };
  ws.onmessage = function(msg) {
    var data = $.parseJSON(msg.data);
    var callback = events[data['event']];
    if (callback !== undefined) {
      $rootScope.$apply(function(){
        callback(data);
      });
    }else{
      console.log("unknown callback for msg: '" + JSON.stringify(msg) +"'");
    }
  }
  return  {
    on: function(eventName, callback) {
      events[eventName] = callback;
    }
  }
}]);
