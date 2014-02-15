<!DOCTYPE HTML>
<html>
    <head>
        <meta http-equiv="X-UA-Compatible" content="chrome=1">
        <script src="https://swww.tokbox.com/webrtc/v2.0/js/TB.min.js" type="text/javascript" charset="utf-8"></script>
        <script type="text/javascript" charset="utf-8">

<?php
    require_once 'SDK/API_Config.php';
    require_once 'SDK/OpenTokSDK.php';
 

    //Generate session
    $apiObj = new OpenTokSDK(API_Config::API_KEY, API_Config::API_SECRET);
    $session = $apiObj->create_session();
    echo $session->getSessionId();

    //Generate token
    $sdk = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);
    // Replace with the correct session ID:
    print $sdk->generate_token(sessionId);
    ?>

        var apiKey = <?php print API_Config::API_KEY?>;
        var sessionId = '<?php print $sessionId; ?>';
        var token = '<?php print $apiObj->generate_token($sessionId); ?>';

            TB.addEventListener("exception", exceptionHandler);
            var session = TB.initSession(sessionId); // Replace with your own session ID. See https://dashboard.tokbox.com/projects
            TB.setLogLevel(TB.DEBUG);
            session.addEventListener("sessionConnected", sessionConnectedHandler);
            session.addEventListener("streamCreated", streamCreatedHandler);
            session.connect(apiKey, token); // Replace with your API key and token. See https://dashboard.tokbox.com/projects

            function sessionConnectedHandler(event) {
                 console.log("connected");
                 subscribeToStreams(event.streams);
                 session.publish();
            }

            function streamCreatedHandler(event) {
                console.log("created");
                subscribeToStreams(event.streams);
            }

            function subscribeToStreams(streams) {
                for (var i = 0; i < streams.length; i++) {
                    var stream = streams[i];
                    if (stream.connection.connectionId != session.connection.connectionId) {
                        session.subscribe(stream);
                    }
                }
            }

            function exceptionHandler(event) {
                alert(event.message);
            }


        </script>
    </head>
    <body>
    </body>
</html>

