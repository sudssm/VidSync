<?php include 'SDK/API_Config.php'?>
<?php include 'SDK/OpenTokArchive.php'?>
<?php include 'SDK/OpenTokSDK.php'?>
<?php include 'SDK/OpenTokeSession.php'?>
<?php include 'home.php'?>

<html>
<head>
<script src='http://static.opentok.com/webrtc/v2.0/js/TB.min.js' ></script>

<script type='text/javascript'>
var apiKey = <?php print API_Config::API_KEY?>;
var sessionId = '<?php print $sessionId; ?>';
var token = '<?php print $apiObj->generate_token($sessionId); ?>';

<?php
echo 'apiKey' + apiKey + "\n";
echo 'sessionId' + sessionId +"\n";
echo 'token' + token+"\n";
?>


var connectionCount = 0;
TB.setLogLevel(TB.DEBUG);
TB.addEventListener('exception', exceptionHandler);
 
function connect() {
    if (TB.checkSystemRequirements() == 1) {
        var session = TB.initSession(sessionId);
        session.addEventListener('connectionCreated',
                                 connectionCreatedHandler);
        session.addEventListener('connectionDestroyed',
                                 connectionDestroyedHandler);
        session.connect(apiKey, token);
 
    } else {
        TB.log('The client does not support WebRTC.');
    }
 
    session.addEventListener('sessionConnected',
                              sessionConnectHandler);
    session.connect(apiKey, token);
}
 
function disconnect() {
    session.addEventListener('sessionDisconnected',
                             sessionDisconnectHandler);
    session.connect(apiKey, token);
}
 
function sessionDisconnectHandler(event) {
    // The event is defined by the SessionDisconnectEvent class
    if (event.reason == 'networkDisconnected') {
        alert('Your network connection terminated.')
    }
}
 
 
function sessionConnectHandler(event) {
    connectionCount = event.connections.length;
    TB.log(connectionCount);
}
 
function connectionCreatedHandler(event) {
    connectionCount += event.connections.length;
    TB.log(connectionCount);
}
 
function connectionDestroyedHandler(event) {
    connectionCount -= event.connections.length;
    TB.log(connectionCount);
}
 
function exceptionHandler(event) {
    if (event.code == 1006) {
        // Connection failed
    }
}


//Session Publisher stuff
var session;
var publisher;
 
if (TB.checkSystemRequirements() == 1) {
    // Replace sessionID with your own values:
    session = TB.initSession(sessionId);
    session.addEventListener('sessionConnected',
                              sessionConnectHandler);
    session.addEventListener('streamCreated',
                              streamCreatedHandler);
    session.addEventListener('streamDestroyed',
                              streamDestroyedHandler);
    session.connect(apiKey, token);
    if (session.capabilities.publish == 1) {
        // Replace apiKey and replacementElementId with your own values:
        publisher = TB.initPublisher(apiKey, replacementElementId); 
    } else {
        alert('You cannot publish an audio-video stream.')
    }
} else {
    TB.log('The client does not support WebRTC.');
}
 
function sessionConnectHandler(event) {
    if publisher {
        session.publish(publisher);
    }
}
 
function streamCreatedHandler(event) {
    for (var i = 0; i < event.streams.length; i++) {
        var stream = event.streams[i];
        if (stream.connection == session.connection) {
             // This Stream object is your own published stream
        }
    }
}
 
function streamDestroyedHandler(event) {
    for (var i = 0; i < event.streams.length; i++) {
        var stream = event.streams[i];
        if (stream.connection == session.connection) {
             alert('Publisher stopped streaming. Reason: '
                    + event.reason)
        }
    }
}

//Subscribing to a stream
session.addEventListener('sessionConnected',
                          sessionConnectHandler);
session.addEventListener('streamCreated',
                          streamCreatedHandler);
// Replace with your API key and token:
session.connect(apiKey, token);
 
function sessionConnectHandler(event) {
    for (var i = 0; i < event.streams.length; i++) {
        var stream = event.streams[i];
        subscribeToStream(stream);
    }
}
 
function streamCreatedHandler(event) {
    for (var i = 0; i < event.streams.length; i++) {
        var stream = event.streams[i];
        subscribeToStream(stream);
    }
}
 
function subscribeToStream(stream) {
    if (stream.connection != session.connection) {
        // Replace replacementElementId with the DOM ID for the subscriber
        session.subscribe(stream, replacementElementId);
    }
}

</head>
<body>
<?php echo 'it works?\n' ?>

<script type='text/javascript'>

function sessionConnectedHandler (event) {
     session.publish( publisher );
     subscribeToStreams(event.streams);
  }
  function subscribeToStreams(streams) {
    for (var i = 0; i < streams.length; i++) {
        var stream = streams[i];
        if (stream.connection.connectionId 
               != session.connection.connectionId) {
            session.subscribe(stream);
        }
    }
  }
  function streamCreatedHandler(event) {
    subscribeToStreams(event.streams);
  }


  // -- Create session 
//  var publisher = TB.initPublisher(apiKey, 'myPublisher', {width:400, height:300});
  var publisher = TB.initPublisher(apiKey);
  var session   = TB.initSession(sessionId);

  session.connect(apiKey, token);
  session.addEventListener("sessionConnected", 
                           sessionConnectedHandler);
 
  session.addEventListener("streamCreated", 
                           streamCreatedHandler);

  session.publish(publisher); 

</script>
</body>
</html>
