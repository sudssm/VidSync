<?php
    require_once 'SDK/API_Config.php';
    require_once 'SDK/OpenTokSDK.php';

    //API Key
    echo "apiKey: ";
    echo API_Config::API_KEY;

    //Generate session
    $apiObj = new OpenTokSDK(API_Config::API_KEY, API_Config::API_SECRET);
    $session = $apiObj->create_session();
//    echo "\nsession: ";
//    echo $session->getSessionId();

    //Generate token
    $sdk = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);

    string json_encode(string $creds [, string $sessionId = $session->getSessionId() [, string $token = $sdk->generate_token($session->getSessionId())]]);
?>

