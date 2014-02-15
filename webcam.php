<?php include 'SDK/API_Config.php'?>
<?php include 'SDK/OpenTokArchive.php'?>
<?php include 'SDK/OpenTokSDK.php'?>
<?php include 'SDK/OpenTokeSession.php'?>

<html>
<head>
<script src='http://static.opentok.com/webrtc/v2.0/js/TB.min.js' ></script>
</head>

<body>
<script type="text/javascript">
  var apiKey = '44651662'; //<?php print API_Config::API_KEY?>;
  var sessionId = 'fcf66a2cc7ed40498c38b655851f6082717fc48c'; //'<?php print $session; ?>';
  var token = 'T1==cGFydG5lcl9pZD00NDY1MTY2MiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz04NzM0N2FkZjQwZWY1MDY3ZDc2ZmMyOWFjN2U2OTRiNjQ0Yzk1OWQxOnJvbGU9c3Vic2NyaWJlciZzZXNzaW9uX2lkPWZjZjY2YTJjYzdlZDQwNDk4YzM4YjY1NTg1MWY2MDgyNzE3ZmM0OGMmY3JlYXRlX3RpbWU9MTM5MjQ5Njg0NSZub25jZT0wLjgzNTMyODgwMTQ3MDM2NzcmZXhwaXJlX3RpbWU9MTM5NTA4ODgyOCZjb25uZWN0aW9uX2RhdGE9';
//'<?php print $apiObj->generate_token($session); ?>';
 
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
 
  var publisher = TB.initPublisher(apiKey);
  var session   = TB.initSession(sessionId);
 
  session.connect(apiKey, token);
  session.addEventListener("sessionConnected", 
                           sessionConnectedHandler);
 
  session.addEventListener("streamCreated", 
                           streamCreatedHandler);
</script>
</body>
</html>
