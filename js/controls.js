// controls.js
window.Controls = function(container, duration, callbacks){
'use strict';

var elements;

function init(){
  container = $("#" + container)

  elements = {};

  elements.control = $('<div>',{class:'controlDiv play'}).appendTo(container);
  elements.progress = $('<div>',{class:'progressBar'}).appendTo(container);
  elements.elapsed = $('<div>',{class:'elapsed'}).appendTo(elements.progress);

  elements.progress.click(function(e){
    var ratio = (e.pageX-elements.progress.offset().left)/elements.progress.outerWidth();

    seek(null, ratio, callbacks.onSeek)
  });
  elements.control.click(function(e){
    playPause(elements.control.hasClass('play'), callbacks.onPlayPause)
  });

}


function seek(time, ratio, callback){
  if (time)
    ratio = time / duration;

  elements.elapsed.width(ratio*100+'%');

  if (callback)
    callback(Math.round(duration*ratio));
}

function playPause (play, callback){
  if (play){
    elements.control.removeClass('play')
    elements.control.addClass('pause')
  }
  else {
    elements.control.removeClass('pause')
    elements.control.addClass('play')
  }

  if (callback)
    callback(play);
}

init();

return {
  seek: seek,
  playPause: playPause
}

}