//<?php
//require_once 'SDK/API_Config.php';
//require_once 'SDK/OpenTokSDK.php';
 
//$apiObj = new OpenTokSDK(API_Config::API_KEY,
 //                        API_Config::API_SECRET);
 
//$session = $apiObj->create_session($_SERVER["REMOTE_ADDR"], 
//    array(SessionPropertyConstants::P2P_PREFERENCE=>"enabled"));
//echo $session->getSessionId();
 
//Generate token 
//$sdk = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);
//print $sdk->generate_token($session);
//?>

<?php
    require_once 'SDK/API_Config.php';
    require_once 'SDK/OpenTokSDK.php';
 
    $apiObj = new OpenTokSDK(API_Config::API_KEY, API_Config::API_SECRET);
    $session = $apiObj->create_session();
    echo $session->getSessionId();
?>