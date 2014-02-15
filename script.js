var dataRef = new Firebase("https://sudarshan.firebaseio.com/");
var ytplayer = null;
var mp4player = null;

var disableUntil;

var last_in = null;


function makeRoom (name) {
  dataRef = dataRef.root();
  dataRef = dataRef.child(name);
  dataRef.on('value', incoming);
  dataRef.update(
    {"type": null, "video": null, seek: 0, timestamp: now(), playing: false}
  );
}

function joinRoom (name) {
  dataRef = dataRef.root();
  dataRef = dataRef.child(name);
  dataRef.on('value', incoming);
}

function incoming (fb) {
  var data = fb.val();
  last_in = data;
  console.log("inc");
  console.log(data);

  if (data == null){
    alert("room does not exist");
  }

  if (data.type == null){
    showWelcomeMessage();
  }
  else if (data.type == "YT") {
    if (ytplayer == null)
      makeYtPlayer(data.video);
    else 
      handleYtInc(data);
  }
  else if (data.type == "mp4"){
    if (mp4player == null)
      makeMp4Player(data);
    else
      handleMp4Inc(data);
  }
}

function outgoing (playing, seek) {
  console.log("out");
  console.log({playing:playing, seek:seek});
  dataRef.update(
    {playing: playing, seek: seek, timestamp: now()}
  );
}

function showWelcomeMessage () {
  $("#ytapiplayer").html("<h1>Welcome!</h1><br/>" + 
    "Choose a video: <input id='vid' type='text'></input>" +
    "<button id='choose'>Load</button>");
  $("#choose").click(function(){
    var vid = $("#vid")[0].value + "#";
    if (vid.indexOf("youtube.com")>-1){
      var key = vid.substring(vid.indexOf("v=")+2, vid.indexOf("#"));
      var type = "YT";
      dataRef.update({type: type, video: key});
    }
    else if (vid.indexOf(".mp4") > -1){
      dataRef.update({type:"mp4", video: vid});
    }
    else
      alert ("link not recognized");
  });
}

function makeYtPlayer(vid) {
  disableUntil = -1;
  var params = { allowScriptAccess: "always" };
  var atts = { id: "myytplayer" };
  swfobject.embedSWF("http://www.youtube.com/v/" + vid + "?version=3&controls=1&enablejsapi=1&playerapiid=ytplayer&allowfullscreen=1", 
    "ytapiplayer", "100%", "100%", "8", null, null, params, atts);           
}
function makeMp4Player(data) {
  disableUntil = null;
  jwplayer("ytapiplayer").setup({file: data.video, width: "100%", height: "100%"});
  mp4player = jwplayer();
  mp4player.onReady(function() {
    var instastop = true;
    mp4player.onPlay(function(){
      if (instastop)
        mp4player.pause();
      instastop = false;

      //mp4player.onSeek(mp4SeekListener);
      mp4player.onPlay(function() {mp4PlayPauseListener(true)});
      mp4player.onPause(function() {mp4PlayPauseListener(false)});

      handleMp4Inc(data);
    })
    mp4player.play(true);
  })
}

function onYouTubePlayerReady(playerId) {
  ytplayer = $("#myytplayer")[0];
  ytplayer.addEventListener("onStateChange", "ytListener"); 

  handleYtInc(last_in);

  setInterval(function(){
    dataRef.once('value', function(data){
      var pres = now();
      var curr = ytplayer.getCurrentTime();
      data = data.val();
      if (data.playing)
        loc = data.seek + pres - data.timestamp;
      else
        loc = data.seek;
      var playing = ytplayer.getPlayerState() == 1;

      //console.log(curr - loc);
      if (Math.abs (curr - loc) > 0.5 || 
          data.playing != playing)
        handleYtInc(data);
    })
  }, 2000);
}

function handleYtInc(data) {
  // disable the listener until state is correct
  if (data.playing)
    disableUntil = 1;
  else
    disableUntil = 2;

  if (data.playing)
    data.seek += now() - data.timestamp;

  ytplayer.seekTo(data.seek);

  if (data.playing)
    ytplayer.playVideo();
  else 
    ytplayer.pauseVideo();
}

function handleMp4Inc(data) {
  if (data.playing)
    data.seek += now() - data.timestamp;

  mp4player.seek(data.seek);

  if (data.playing)
    mp4player.play(true);
  else 
    mp4player.pause(true);
}

function ytListener (value){
  if (disableUntil > -1){
    console.log("ignoring- " + value);
    if (disableUntil == value)
      disableUntil = -1;
    return;
  }
  switch (value) {
    case -1:
      console.log("unstarted");
      disableUntil = 2;
      ytplayer.seekTo(0);
      ytplayer.pauseVideo();
      break;
    case 0:
      console.log("ended");
      break;
    case 1:
      console.log("playing");
      disableUntil = 1;
      ytplayer.pauseVideo();
      outgoing (true, ytplayer.getCurrentTime());
      break;
    case 2:
      console.log("paused");
      disableUntil = 2;
      ytplayer.playVideo();
      outgoing (false, ytplayer.getCurrentTime());
      break;
    case 3:
      console.log("buffering");
      break;
    case 5:
      console.log("cued");
      break;
  }
}

function mp4PlayPauseListener (play){
  if (disableUntil != null){
    if (disableUntil == play)
      disableUntil = null;
    return;
  }
  disableUntil = play;

  mp4player.pause(play);
  outgoing (play, mp4player.getPosition());
}

function now () {
  return new Date().getTime() / 1000;
}

$(document).ready (function() {
  $("#create").click(function() {
    makeRoom($("#room")[0].value)
  });
  $("#join").click(function() {
    joinRoom($("#room")[0].value)
  });
})