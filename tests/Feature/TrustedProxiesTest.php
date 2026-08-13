<?php

use Illuminate\Support\Facades\Route;

use function Pest\Laravel\get;

it('generates https urls when behind a tls-terminating proxy', function () {
    Route::get('/__proxy_probe', fn () => response()->json([
        'root' => url('/'),
        'asset' => asset('build/assets/app.css'),
        'route' => route('home'),
    ]))->middleware('web');

    $response = get('/__proxy_probe', headers: ['X-Forwarded-Proto' => 'https']);

    $response->assertOk();

    expect($response->json('root'))->toStartWith('https://')
        ->and($response->json('asset'))->toStartWith('https://')
        ->and($response->json('route'))->toStartWith('https://');
});
