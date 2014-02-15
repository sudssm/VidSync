<?php include 'SDK/API_Config.php'?>
<?php include 'SDK/OpenTokArchive.php'?>
<?php include 'SDK/OpenTokSDK.php'?>
<?php include 'SDK/OpenTokeSession.php'?>
<?php include 'home.php'?>

<html>
<head>
<script src='http://static.opentok.com/webrtc/v2.0/js/TB.min.js' ></script>
</head>

<body>
<script type='text/javascript'>
var apiKey = <?php print API_Config::API_KEY?>;
var sessionId = '<?php print $sessionId; ?>';
var token = '<?php print $apiObj->generate_token($sessionId); ?>';

console.log(apiKey);
console.log(sessionId);
console.log(token);

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

hello??
</body>

</html>
