
<?php include 'SDK/API_Config.php'?>
<?php include 'SDK/OpenTokArchive.php'?>
<?php include 'SDK/OpenTokSDK.php'?>
<?php include 'SDK/OpenTokeSession.php'?>
<?php include 'home.php'?>

<html>
<head>
<script src='http://static.opentok.com/webrtc/v2.0/js/TB.min.js' ></script>
<?php
    require_once 'API_Config.php';
    require_once 'OpenTokSDK.php';
 
    $apiObj = new OpenTokSDK(API_Config::API_KEY, API_Config::API_SECRET);
    $session = $apiObj->create_session();
    echo $session->getSessionId();
?>
</head>

<body>
<script type="text/javascript">
  var apiKey = <?php print API_Config::API_KEY?>;
  var sessionId = '<?php print $session; ?>';
  var token = '<?php print $apiObj->generate_token($session); ?>';
 
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
