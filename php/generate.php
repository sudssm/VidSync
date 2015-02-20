<?php
    require "openTok-settings.php";
    require "vendor/autoload.php";
    use OpenTok\OpenTok;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://api.opentok.com/session/create"); 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        "X-TB-PARTNER-AUTH: $key:$secret"
    )); 

    curl_setopt($ch, CURLOPT_POST, 1);
    $output = curl_exec($ch); 

    // close curl resource to free up system resources 
    curl_close($ch); 
    
    // parse response
    $p = xml_parser_create();
    xml_parse_into_struct($p, $output, $vals, $index);
    xml_parser_free($p);

    $creds = array();

    foreach ($vals as $entry){
        if ($entry["tag"] == "SESSION_ID")
            $creds['sessionId'] = $entry['value'];
    }

    // return empty on failure
    if(!isset($creds['sessionId'])){
        $creds['sessionId'] = 0;
        $creds['token'] = 0;
    }
    else {
        // create token
        $openTok = new OpenTok($key, $secret);

        $creds['token'] = $openTok->generateToken($creds['sessionId']);
    }
    echo json_encode($creds);    
?>

