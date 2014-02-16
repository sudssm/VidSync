var dataRef = new Firebase("https://sudarshan.firebaseio.com/");
var ytplayer = null;
var mp4player = null;

var roomName = null;
var tokboxSession = null;
var tokboxToken = null;

var disableUntil;
var enablehack = false;

var last_in = null;


function makeRoom (name) {
  $.getJSON("http://www.smuralidhar.com/pennapps2014s/generate.php", function(res){
    dataRef = dataRef.root();
    dataRef = dataRef.child(name);
    dataRef.on('value', incoming);
    dataRef.update(
    {   
      type: null, 
      video: null, 
      seek: 0, 
      timestamp: now(), 
      playing: false, 
      sessionId: res.sessionId, 
      token: res.token 
    }
  );
  });
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

  if (roomName == null){
    roomName = name;
    tokboxSession = data.sessionId;
    tokboxToken = data.token;
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
      makeMp4Player(data.video);
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
  $("#ytapiplayer").html("Welcome Choose a video: "+
    "<input id='vid' type='text'></input>" +
    "<button id='choose'>Load</button>");
  $("#choose").click(function(){
    var vid = $("#vid")[0].value + "#";
    if (vid.indexOf("youtube.com")>-1){
      var key = vid.substring(vid.indexOf("v=")+2, vid.indexOf("#"));
      var type = "YT";
      dataRef.update({type: type, video: key});
    }
    else if (vid.indexOf(".mp4") > -1){
      dataRef.update({type:"mp4", video: $("#vid")[0].value});
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
function makeMp4Player(vid) {
  disableUntil = null;
  $("#ytapiplayer").html("");
  $("#ytapiplayer").flowplayer({
    // one video: a one-member playlist
      playlist: [
         [
            { mp4: vid },
         ]
      ],
      ratio: 3/4  // video with 4:3 aspect ratio
   });
}


flowplayer(function (mp4player, root) {
  mp4player.bind("ready", function(e, mp4player) {
    window.mp4player = mp4player;
    mp4player.bind("seek", mp4SeekListener);
    mp4player.bind("resume", function(e, mp4player) {mp4PlayPauseListener(true)});
    mp4player.bind("pause", function(e, mp4player) {mp4PlayPauseListener(false)});
    handleMp4Inc(last_in);
  });
});

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
  console.log("hand")
  if (data.playing)
    data.seek += now() - data.timestamp;

  mp4player.seek(data.seek);
  if (data.playing)
    mp4player.resume();
  else
    mp4player.pause();
  disableUntil = false;
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
  if (disableUntil){
    //if (disableUntil == play)
    //  disableUntil = null;
    //console.log("ignoring " + play);
    return;
  }

  console.log(play);
  disableUntil = true;

  mp4player.toggle();

  disableUntil = false;

  outgoing (play, mp4player.video.time);
}
function mp4SeekListener () {
  if (disableUntil)
    return;
  console.log("seeking");
  var goal = mp4player.playing;
  disableUntil = goal
  outgoing (goal, mp4player.video.time);
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
