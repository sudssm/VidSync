<?php
    require_once 'SDK/API_Config.php';
    require_once 'SDK/OpenTokSDK.php';

    //API Key
    echo "apiKey: ";
    echo API_Config::API_KEY;

    //Generate session
    $apiObj = new OpenTokSDK(API_Config::API_KEY, API_Config::API_SECRET);
    $session = $apiObj->create_session();
    echo "\nsession: ";
    echo $session->getSessionId();

    //Generate token
    $sdk = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);

<<<<<<< HEAD
$creds = array();
$creds['sessionId'] = $session->getSessionId();
$creds['token'] = $sdk->generate_token($session->getSessionId());
//$creds = array('sessionId'=>($session->getSessionId()), 'token'=>($sdk->generate_token($session->getSessionId()));
//    echo $creds;
//    echo json_encode($creds);
   
 
=======

    $creds = array('sessionId'=>$session->getSessionId(), 'token'=>$sdk->generate_token($session->getSessionId()));
    echo $creds;
    echo json_encode($creds);
>>>>>>> 938e2f503a90928c842414fbe64b5b14eb85dd4c
?>

