var dataRef = new Firebase("https://sudarshan.firebaseio.com/");
var chatRef = new Firebase("https://sudarshan.firebaseio.com/**chats**");
var id = Math.random().toString(16).slice(2);

filepicker.setKey("AzauR2MBSBeslVoQIcZ8gz");

var ytplayer = null;
var mp4player = null;

var roomName = null;
var tokboxSession = null;
var tokboxToken = null;

var disableUntil;

var last_in = null;

var first_run; 


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
        token: res.token,
        owner: id
      }
    );
    chatRef = chatRef.child(name);
    chatRef.on('child_added', chatIn);
    first_run = true;
    roomName = name;
  });
}

function joinRoom (name) {
  dataRef = dataRef.root();
  dataRef = dataRef.child(name);
  dataRef.on('value', incoming);
  chatRef = chatRef.child(name);
  chatRef.on('child_added', chatIn)
  first_run = true;
  roomName = name;
}

function chatIn (fb) {
  var data = fb.val();
  var date = new Date(data.timestamp).toLocaleTimeString()
  var me = data.id == id ? " class='self'" : "";
  var html = "<li" + me + ">" +
                "<span class='name'>" + data.name + "</span> " + 
                "<span class='time'>" + 
                date.substring(0, date.length - 6) + "</span> " + 
                "<span class='msg'>" + data.message + "</span>" + 
            "</li>";
  $("#chat ul").append(html);
}

function chatOut (msg) {
  var nickname = $("#nickname")[0].value;
  chatRef.push({
    id: id,
    name: (nickname ? nickname : id),
    message: msg,
    timestamp: new Date().getTime()
  })
}


function incoming (fb) {
  var data = fb.val();
  console.log("inc");
  console.log(data);

  if (data == null){
    alert("room does not exist");
  }

  if (last_in && (data.video != last_in.video || data.type != last_in.type)){
    $("#container").html("<div id='ytapiplayer'></div>");
    ytplayer = null;
    mp4player = null;
  }

  last_in = data;

  if (first_run){
    tokboxSession = data.sessionId;
    tokboxToken = data.token;
    showWelcomeMessage();
    $("#chat").prepend("<h1 id='roomName'>"+roomName+"</h1>");
    $("#chat").show();
    runWebcam(tokboxSession, tokboxToken);
    first_run = false;
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
    {playing: playing, seek: seek, timestamp: now(), owner: id}
  );
}

function showWelcomeMessage () {
  $("#inputs").html("<tr><td><img src='vidsync.png' height='40px' width='165px'></td>" +
    "<td><input id='vid' type='text' placeholder='Choose a video (Youtube or MP4)'></input></td>" +
    "<td><button id='choose'>Load</button><button id='upload'>Upload</button></td></tr>");
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
  $("#upload").click(function(){
    filepicker.pickAndStore(
      {extension: '.mp4', multiple:false},
      {location: 'S3'},
      function(InkBlobs){
        console.log(InkBlobs);
        var key = InkBlobs[0].key;
        var url = "http://s3-us-west-2.amazonaws.com/vidsync/" + key;
        dataRef.update({type: "mp4", video: url});
        $(".cover").hide();
      },
      function(FEError){
        $(".cover").hide();
      });
    coverUp();
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
  disableUntil = false;
  jwplayer("ytapiplayer").setup({file: data.video, width: "80%", height: "90%"});
  mp4player = jwplayer();
  mp4player.onReady(function() {
    console.log('setup');

    mp4player.onSeek(mp4SeekListener);
    mp4player.onPlay(function() {mp4PlayPauseListener(true)});
    mp4player.onPause(function() {mp4PlayPauseListener(false)});

    handleMp4Inc(data);

    setInterval(function(){
      dataRef.once('value', function(data){
        var pres = now();
        var curr = mp4player.getPosition();
        data = data.val();
        if (data.playing)
          loc = data.seek + pres - data.timestamp;
        else
          loc = data.seek;
        var playing = mp4player.getState() == "PLAYING";

        console.log(curr - loc);
        if (Math.abs (curr - loc) > 2 || 
            data.playing != playing){
          if (data.owner == id)
            outgoing(playing, mp4player.getPosition());
          else
            handleMp4Inc(data);
      }
      })
    }, 2000);
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
  if(data.owner == id){
    console.log("ignoring own")
    return;
  }
  if (data.playing)
    data.seek += now() - data.timestamp;

  // ignore 2 events (assume it take under .05 seconds)
  disableUntil = true;
  console.log("disabling handlers");
  setTimeout(function(){
    disableUntil = false;
    console.log("TIME UP!")
  }, 50)
  mp4player.seek(data.seek);
  mp4player.play(data.playing);

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
  if (disableUntil){
    console.log("ignoring " + play);
    return;
  }

  console.log(play);

  //mp4player.pause(play);
  outgoing (play, mp4player.getPosition());
}
function mp4SeekListener () {
  if (disableUntil){
    console.log("ignoring seek");
    return;
  }
  console.log("seek");
  outgoing (false, mp4player.getPosition(), function(){
    mp4player.pause();
  });
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

  $("#message").keyup(function(e){
    e.preventDefault();
    var key = window.event ? e.keyCode : e.which;
    if (key == '13') {
        chatOut($("#message")[0].value);
	$("#message")[0].value = null;
    }
  })
})

function coverUp() {
  var iframe = $("#filepicker_dialog")
  var x = iframe.offset().left;
  var y = iframe.offset().top;
  var cover = $("<div class='cover' style=\"z-index: 99999999999999; position:absolute;background:white; width:200px; height:75px;top:"+y+";left:"+x+"\"</div>").appendTo("body")

}
