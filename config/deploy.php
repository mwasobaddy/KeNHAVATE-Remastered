<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Deploy Token
    |--------------------------------------------------------------------------
    |
    | The secret token required to trigger the deploy maintenance routes
    | (POST /build, /clear, /migrate, /migrate-fresh). If left blank, the
    | routes are unusable and always return 403.
    |
    */

    'token' => env('DEPLOY_TOKEN'),
];
