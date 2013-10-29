'use strict';

var jukeboxDirectives = angular.module('jukeboxDirectives', []);

jukeboxDirectives.directive('progressBar', ['$document', 'Player',
  function($document, Player){
    return {
      restrict: 'E',
      template: '<div id="progressionBar"><div id="slider"></div><div id="sliderHead"></div></div>',
      link: function(scope, element, attrs){
        var  bar = element.find("#progressionBar"),
             slider = element.find("#slider"),
             sliderHead = element.find("#sliderHead"),
             maxPosition = 0,
             currentPosition = 0,
             durationWatcher;

        sliderHead.on('mousedown', function(event) {
            // Prevent default dragging of selected content
            event.preventDefault();
            durationWatcher(); //stop watching time udpates
            $document.on('mousemove', moveSlider);
            $document.on('mouseup', mouseup);
        });

        bar.on('click', function(event){
          event.preventDefault();
          durationWatcher(); //stop watching time udpates
          moveSlider(event);
          Player.seek({seconds: currentPosition});
          durationWatcher = scope.$watch('duration', updateTimeView); //rewatch time updates
        });

        function moveSlider(event) {
          var max_pos = bar.width(),
              min_pos = bar.offset().left;

          var current_pos = event.clientX - min_pos;

          var pos = Math.max(0,current_pos).toFixed(2); // Limit position to the left axis of the bar

          pos = Math.min(pos, max_pos); //Limit position to the right axis of the bar

          currentPosition = (pos / max_pos) * maxPosition;

          slider.css({width: pos + "px"});
          sliderHead.css({left: pos+"px"});
        }

        function mouseup() {
          Player.seek({seconds: currentPosition});
          durationWatcher = scope.$watch('duration', updateTimeView); //rewatch time updates
          $document.unbind('mousemove', moveSlider);
          $document.unbind('mouseup', mouseup);
        }

        durationWatcher = scope.$watch('duration', updateTimeView);

        function updateTimeView(value){
          currentPosition = value['current'];
          maxPosition = value['total'];
          var maxPosSlider = bar.width();
          var offset = bar.offset().left;
          var currentPositionPxl = ((currentPosition / maxPosition) * maxPosSlider) + offset;

          slider.css({width: currentPositionPxl + "px"});
          sliderHead.css({left: currentPositionPxl +"px"});
        };

      }
    }
  }]);
