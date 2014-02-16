var dataRef = new Firebase("https://sudarshan.firebaseio.com/");
var ytplayer = null;
var mp4player = null;

var roomName = null;
var tokboxSession = null;
var tokboxToken = null;

var disableUntil;

var last_in = null;

var cams = 0;

function runWebcam(sessionId, token){
    var apiKey = 44651662;
    TB.addEventListener("exception", exceptionHandler);
    var session = TB.initSession(sessionId);

    TB.setLogLevel(TB.DEBUG);
    session.addEventListener("sessionConnected", sessionConnectedHandler);
    session.addEventListener("streamCreated", streamCreatedHandler);
    session.connect(apiKey, token);

    function sessionConnectedHandler(event) {
        console.log("connected");
        subscribeToStreams(event.streams);
        var publisher = TB.initPublisher(apiKey, "cam1", {width:100, height:75});
	session.publish(publisher);
    }

    function streamCreatedHandler(event) {
        console.log("created");
        subscribeToStreams(event.streams);
    }

    function subscribeToStreams(streams) {
        for (var i = 0; i < streams.length; i++) {
            var stream = streams[i];
            if (stream.connection.connectionId != session.connection.connectionId) {
		$("#cams").append('<div id=\''+'cam'+cams+'\'</div>');
                var subscriber = session.subscribe(stream, '\'cam'+cams+'\'', {width:200, height:150});
                session.publish(subscriber);
            }
        }
    }
    function exceptionHandler(event) {
        alert(event.message);
    }
}


function makeRoom (name) {
  $.getJSON("http://www.smuralidhar.com/pennapps2014s/generate.php", function(res){
    dataRef = dataRef.root();
    dataRef = dataRef.child(name);
    dataRef.on('value', incoming);
    dataRef.update(
      {"type": null, "video": null, seek: 0, timestamp: now(), playing: false, "sessionId": res.sessionId, "token": res.token}
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
    showWelcomeMessage();
  }

  if (data.type == "YT") {
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
  $("#inputs").html("Choose a video: "+
    "<input id='vid' type='text' placeholder='Choose a video'></input>" +
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
      alert ("Link not recognized");
  });
}

function makeYtPlayer(vid) {
  disableUntil = -1;
  var params = { allowScriptAccess: "always" };
  var atts = { id: "myytplayer" };
  swfobject.embedSWF("http://www.youtube.com/v/" + vid + "?version=3&controls=1&enablejsapi=1&playerapiid=ytplayer&allowfullscreen=1", 
    "ytapiplayer", "100%", "100%", "8", null, null, params, atts);           
  runWebcam(tokboxSession, tokboxToken);
}
function makeMp4Player(data) {
  disableUntil = null;
  jwplayer("ytapiplayer").setup({file: data.video, width: "100%", height: "100%"});
  mp4player = jwplayer();
  mp4player.onReady(function() {
    var instastop = true;
    mp4player.onPlay(function(){
      if (instastop){
        console.log('setup');
        instastop = false;
        mp4player.pause(true);

        //mp4player.onSeek(mp4SeekListener);
        mp4player.onPlay(function() {mp4PlayPauseListener(true)});
        mp4player.onPause(function() {mp4PlayPauseListener(false)});

        handleMp4Inc(data);
      }
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
  console.log("HANDLE");
  disableUntil = data.playing;
  if (data.playing)
    data.seek += now() - data.timestamp;

  //mp4player.seek(data.seek);

  mp4player.play(data.playing);

  setTimeout(hack, 100);

  function hack (){
    console.log("hacking");
    if (disableUntil == data.playing){
      mp4player.play(data.playing);
      setTimeout(hack, 100);
    }
  }

  console.log('done handle');
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
    console.log("ignoring " + play)
    if (disableUntil == play)
      disableUntil = null;
    return;
  }

  console.log(play);
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
