function runWebcam(sessionId, token){
    var apiKey = 44651662;
    TB.addEventListener("exception", exceptionHandler);
    var session = TB.initSession(sessionId);
    
    TB.setLogLevel(TB.DEBUG);
    session.addEventListener("sessionConnected", sessionConnectedHandler);
    session.addEventListener("streamCreated", streamCreatedHandler);

    session.addEventListener("streamDestroyed", streamDestroyedHandler);

    session.connect(apiKey, token);
    
    function sessionConnectedHandler(event) {
        console.log("connected");
        subscribeToStreams(event.streams);
	var pubOptions = {publishAudio:false, publishVideo:true, width:100, height:75};
        var publisher = TB.initPublisher(apiKey, "cam0", pubOptions);
//	publisher.publishAudio(false);
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
		var options = {subscribeToAudio:false, subscribeToVideo:true, width:200, height:150};
		//		$("#cams").append('<div id=\''+i+'\'</div>');
		session.subscribe(stream, 'cam1', options);
		//		subscriber.subscribeToAudio(false);
		//		subscriber.subscribeToVideo(true);
		//		session.publish(publisher);
		//		session.subscribe(stream);
	    }

	    
        }
    }

    function streamDestroyedHandler(event) {
	for (var i = 0; i < event.streams.length; i++) {
            var stream = event.streams[i];
            if (stream.connection != session.connection) {
		event.preventDefault();
		var subscribers = session.getSubscribersForStream();
		$("#cams").append("<div id='cam1'></div>");
            }
	}
    }
    
    
    function exceptionHandler(event) {
        alert(event.message);
    }
}
