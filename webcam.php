<!DOCTYPE HTML>
<html>
<title>test</title>
    <head>

<?php
    require_once 'SDK/API_Config.php';
    require_once 'SDK/OpenTokSDK.php';


    echo "apiKey: ";
    echo API_Config::API_KEY;


    //Generate session
    $apiObj = new OpenTokSDK(API_Config::API_KEY, API_Config::API_SECRET);
    $session = $apiObj->create_session();
    echo "\nsession: ";
    echo $session->getSessionId();

    //Generate token
    $sdk = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);
    // Replace with the correct session ID:
    echo "\ntoken: ";
    echo $sdk->generate_token($session->getSessionId());
    ?>

        <meta http-equiv="X-UA-Compatible" content="chrome=1">
        <script src="https://swww.tokbox.com/webrtc/v2.0/js/TB.min.js" type="text/javascript" charset="utf-8"></script>
        <script type="text/javascript" charset="utf-8">

        var apiKey = <?php print API_Config::API_KEY?>;
        var sessionId = '<?php print $session->getSessionId(); ?>';
        var token = '<?php print $sdk->generate_token($session->getSessionId()); ?>';

            TB.addEventListener("exception", exceptionHandler);
            var session = TB.initSession('fcf66a2cc7ed40498c38b655851f6082717fc48c'); // Replace with your own session ID. See https://dashboard.tokbox.com/projects
            TB.setLogLevel(TB.DEBUG);
            session.addEventListener("sessionConnected", sessionConnectedHandler);
            session.addEventListener("streamCreated", streamCreatedHandler);
            session.connect(apiKey, token);

//44651662, 'T1==cGFydG5lcl9pZD00NDY1MTY2MiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz04NzM0N2FkZjQwZWY1MDY3ZDc2ZmMyOWFjN2U2OTRiNjQ0Yzk1OWQxOnJvbGU9c3Vic2NyaWJlciZzZXNzaW9uX2lkPWZjZjY2YTJjYzdlZDQwNDk4YzM4YjY1NTg1MWY2MDgyNzE3ZmM0OGMmY3JlYXRlX3RpbWU9MTM5MjQ5Njg0NSZub25jZT0wLjgzNTMyODgwMTQ3MDM2NzcmZXhwaXJlX3RpbWU9MTM5NTA4ODgyOCZjb25uZWN0aW9uX2RhdGE9'); // Replace with your API key and token. See https://dashboard.tokbox.com/projects

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
STUFF
    </body>
</html>


