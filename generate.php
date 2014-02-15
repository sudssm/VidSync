<?php
    require_once 'SDK/API_Config.php';
    require_once 'SDK/OpenTokSDK.php';

    //Generate session
    $apiObj = new OpenTokSDK(API_Config::API_KEY, API_Config::API_SECRET);
    $session = $apiObj->create_session();

    //Generate token
    $sdk = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);

    $creds = array();
    $creds['sessionId'] = $session->getSessionId();
    $creds['token'] = $sdk->generate_token($session->getSessionId());
    
    echo json_encode($creds);
?>

