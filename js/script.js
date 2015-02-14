// start anonymous scope
;(function() {
'use strict';

var dataRef = new Firebase("https://vidsync.firebaseio.com/");
var chatRef = new Firebase("https://vidsync.firebaseio.com/**chats**");
var id = Math.random().toString(16).slice(2);

var ytplayer;
var mp4player;
var controls;

var roomName;
var tokboxSession;
var tokboxToken;


var last_command;

// variables to modify behavior of incoming on room creation
var first_run; 
var creating;

// how far behind a standardized time our local clock is
var realTimeOffset;

// setup
function init(){
  // listeners 
  $("#create").click(function() {
    makeRoom($("#room")[0].value)
  });
  $("#join").click(function() {
    joinRoom($("#room")[0].value)
  });

  if (window.location.hash != "")
    joinRoom(window.location.hash.substring(1));

  filepicker.setKey("AzauR2MBSBeslVoQIcZ8gz");

  $.getJSON("php/time.php", function(res){
    realTimeOffset = parseInt(res.timestamp) - now()
  })

  toggleSidebar();
  $("#slide").click(toggleSidebar);

  if (window.location.hash != "")
    joinRoom(window.location.hash.substring(1));
}


// initiate room creation
function makeRoom (name) {
  dataRef = dataRef.root();
  creating = true;
  // get tokbox credentials
  $.getJSON("php/generate.php", function(res){
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
    });
    chatRef = chatRef.child(name);
    chatRef.set(null);
    chatRef.on('child_added', chatIn);
    first_run = true;
    roomName = name;
  });
}

// join a room
function joinRoom (name) {
  dataRef = dataRef.root();
  dataRef = dataRef.child(name);
  dataRef.on('value', incoming);
  chatRef = chatRef.child(name);
  chatRef.on('child_added', chatIn)
  first_run = true;
  roomName = name;

  if (!$("#slide").hasClass("flip"))
    toggleSidebar();

  window.location.hash=name;
}
function setupRoom(){
  $("#inputs").html("<tr><td><img src='img/vidsync.png' height='40px' width='165px'></td>" +
      "<td><input id='vid' type='text' placeholder='Choose a video (Youtube or MP4)'></input></td>" +
      "<td><button id='choose'>Load</button><button id='upload'>Upload</button>" + 
      "</td></tr></tr>");

  $("#choose").click(function(){
    var vid = $("#vid")[0].value + "#";
    if (vid.indexOf("youtube.com")>-1){
      var key = vid.substring(vid.indexOf("v=")+2, vid.indexOf("#"));
      var type = "YT";
      dataRef.update({type: type, video: key});
    }
    else if (vid.indexOf(".mp4") > -1){
      //TODO
      dataRef.update({type:"mp4", video: $("#vid")[0].value});
    }
    else
      alert ("Link not recognized");
  });

  $("#message").keyup(function(e){
    e.preventDefault();
    var key = window.event ? e.keyCode : e.which;
    if (key == '13') {
      chatOut($("#message")[0].value);
      $("#message")[0].value = null;
    }
  });
  $("#upload").click(function(){
    // hack for filepicker logo
    function coverUp() {
      var iframe = $("#filepicker_dialog")
      var x = iframe.offset().left;
      var y = iframe.offset().top;
      var cover = $("<div class='cover' style=\"z-index: 99999999999999; position:absolute;background:white; width:200px; height:75px;top:"+y+";left:"+x+"\"</div>").appendTo("body")
    }

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

  if ($("#chat h1").length == 0)
    $("#chat").prepend("<h1 id='roomName'>"+roomName+"</h1>");
  $("#chat").show();
  if (tokboxSession == 0)
    alert ("Sorry, our Tokbox trial has expired. Please enjoy VidSync without webcam service for now.");
  else
    runWebcam(tokboxSession, tokboxToken);
  first_run = false;
}
// handle an incoming firebase message
function incoming (fb) {
  var data = fb.val();

  if (!creating && data == null){
    alert("This room does not exist! Creating a new room.");
    makeRoom(roomName);
    return;
  }
  else if (data == null){
    return;
  }
  creating = false;

  if (last_command && (data.video != last_command.video || data.type != last_command.type)){
    $("#players").html("");
    ytplayer = null;
    mp4player = null;
  }

  last_command = data;
  if (first_run){
    tokboxSession = data.sessionId;
    tokboxToken = data.token;
    setupRoom();
  }

  if (data.type == "YT") {
    if (ytplayer == null)
      makeYtPlayer(data.video);
    else 
      handleYtCommand(data);
  }
  else if (data.type == "mp4"){
    if (mp4player == null)
      makeMp4Player(data);
    else
      handleMp4Command(data);
  }
}

function handleYtCommand (data){
  if (data.playing){
    data.seek += now() - data.timestamp + realTimeOffset;
  }
  ytplayer.seekTo(data.seek);   
  controls.seek(data.seek)

  if (data.playing){
    ytplayer.playVideo()
    controls.playPause(true)
    updateSeek()
  }
  else if (!data.playing){
    ytplayer.pauseVideo()
    controls.playPause(false)
  }
}

function handleMp4Command (data){
  if (data.playing){
    data.seek += now() - data.timestamp + realTimeOffset;
  }
  mp4player.currentTime = data.seek;
  controls.seek(data.seek)

  if (data.playing){
    mp4player.play();
    controls.playPause(true)
    updateSeek()
  }
  else if (!data.playing){
    mp4player.pause();
    controls.playPause(false)
  }

}

// send a player action to the server
function outgoing (playing, seek) {
  dataRef.update(
    {playing: playing, seek: seek, timestamp: now(), owner: id}
  );
}


// handle an incoming chat firebase message
function chatIn (fb) {
  var data = fb.val();
  if (!data || !data.name || !  data.message)
    return;
  var date = new Date(data.timestamp).toLocaleTimeString()
  var me = data.id == id ? " class='self'" : "";
  var html = "<li" + me + ">" +
                "<span class='name'>" + data.name + "</span> " + 
                "<span class='time'>" + 
                date.substring(0, date.length - 6) + "</span> " + 
                "<span class='msg'>" + data.message + "</span>" + 
            "</li>";
  $("#chat ul").append(html);

  var chatbox = $("#chatbox")[0];
  chatbox.scrollTop = chatbox.scrollHeight;
}

// send a chat to the server
function chatOut (msg) {
  var nickname = $("#nickname")[0].value;
  if (msg == "" || !msg)
    return;
  chatRef.push({
    id: id,
    name: (nickname ? nickname : id),
    message: msg,
    timestamp: new Date().getTime()
  })
}

function now () {
  return new Date().getTime() / 1000;
}


// player functions

function makeYtPlayer(vid) {
  function onPlayerReady (){
    makeControls(ytplayer.getDuration())
    handleYtCommand(last_command);
  }

  $("#players").html("<div id='ytplayer'></div>");
  ytplayer = new YT.Player('ytplayer', {
    height: '100%',
    width: '100%',
    videoId: vid,
    events: {
      'onReady': onPlayerReady,
    },
    playerVars: {
      'controls': 0,
      'showinfo': 0,
      'modestbranding': 1,
      'enablejsapi': 1,
      'disablekb': 1,
      'fs': 0,

    },
  });
}

function makeMp4Player(data){

  function onPlayerReady(){
    makeControls(mp4player.duration);
    handleMp4Command(last_command);
  }
  $("#players").html(
    "<video id='mp4player' width='100%' height='100%'>" +
    "  <source src='" + data.video + "' type='video/mp4'>" +
    "  Sorry, your browser does not support HTML5 videos!" +
    "</video>")
  mp4player = $("#mp4player")[0];
  mp4player.onloadeddata = onPlayerReady
}

function updateSeek (){
  if (!getPlaying())
    return
  
  controls.seek(getCurrentTime())
  
  setTimeout(updateSeek, 500)
}

function getCurrentTime(){
  if (ytplayer)
    return ytplayer.getCurrentTime();
  else if (mp4player)
    return mp4player.currentTime;
  else 
    return null;
}

function getPlaying(){
  if (ytplayer)
    return ytplayer.getPlayerState() == 1;
  else if (mp4player)
    return !mp4player.paused;
  else 
    return null;
}

function makeControls(duration){
  var player = ytplayer ? ytplayer : mp4player;
  $("#controls").css({
    top: $("#players").offset().top,
    left: $("#players").offset().left,
    width: $("#players").width(),
    height: $("#players").height()
  })
  controls = Controls("controls", duration, {
    onPlayPause: function(playing){
      outgoing(playing, getCurrentTime())
    },
    onSeek: function(seek){
      outgoing(getPlaying(), seek)
    }
  })
  updateSeek()
}

function toggleSidebar (){
  if($("#slide").hasClass("flip"))
    $("#right").animate({width: 50})
  else
    $("#right").animate({width: 200})
  $("#slide").toggleClass('flip');
}


//public functions
window.player = function (){return mp4player}
// start!
$(document).ready(function(){
  init();
})

})(); // end anonymous wrapper
