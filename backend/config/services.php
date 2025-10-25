<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'face_recognition' => [
        'api_url' => env('FACE_RECOGNITION_API_URL', 'http://localhost:5000'),
        'api_key' => env('FACE_RECOGNITION_API_KEY', ''),
        'enabled' => env('FACE_RECOGNITION_ENABLED', true),
        'threshold' => env('FACE_RECOGNITION_THRESHOLD', 0.6),
        'fallback_enabled' => env('FACE_RECOGNITION_FALLBACK_ENABLED', true),
        'liveness_detection' => env('FACE_RECOGNITION_LIVENESS', true),
    ],

];
