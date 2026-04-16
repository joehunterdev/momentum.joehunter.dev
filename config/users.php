<?php

return [

    'super_admin' => [
        'first_name' => env('SUPER_ADMIN_FIRST_NAME', 'Super'),
        'last_name' => env('SUPER_ADMIN_LAST_NAME', 'Admin'),
        'email' => env('SUPER_ADMIN_EMAIL'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'password'),
    ],

    'admin' => [
        'first_name' => env('ADMIN_FIRST_NAME', 'Admin'),
        'last_name' => env('ADMIN_LAST_NAME', 'User'),
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD', 'password'),
    ],

    'basic' => [
        'first_name' => env('BASIC_FIRST_NAME', 'Test'),
        'last_name' => env('BASIC_LAST_NAME', 'User'),
        'email' => env('BASIC_EMAIL'),
        'password' => env('BASIC_PASSWORD', 'password'),
        'role' => env('BASIC_ROLE', 'basic'),
    ],

    'demo' => [
        'first_name' => env('DEMO_FIRST_NAME', 'Demo'),
        'last_name' => env('DEMO_LAST_NAME', 'User'),
        'email' => env('DEMO_EMAIL'),
        'password' => env('DEMO_PASSWORD', 'password'),
        'role' => env('DEMO_ROLE', 'basic'),
    ],

];
