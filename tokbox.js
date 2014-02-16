
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