<?php

use function Pest\Laravel\post;

it('redirects back with a validation error when the otp email cannot be sent', function () {
    config()->set('mail.default', 'smtp');
    config()->set('mail.mailers.smtp.host', '127.0.0.1');
    config()->set('mail.mailers.smtp.port', 1);
    config()->set('mail.mailers.smtp.timeout', 1);

    $response = post(route('auth.email'), ['email' => 'kente@example.com']);

    $response->assertSessionHasErrors('email')
        ->assertSessionHas('errors');
});
