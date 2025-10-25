<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::find(1);
if ($user) {
    echo 'User: '.$user->email.PHP_EOL;
    $token = $user->createToken('test_token', ['*']);
    echo 'Token: '.$token->plainTextToken.PHP_EOL;
} else {
    echo 'User not found'.PHP_EOL;
}
