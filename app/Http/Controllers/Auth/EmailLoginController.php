<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Services\AuthService;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class EmailLoginController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private OtpService $otpService,
    ) {}

    public function __invoke(SendOtpRequest $request): RedirectResponse
    {
        $email = $request->input('email');

        if ($this->otpService->isCooldownActive($email)) {
            throw ValidationException::withMessages([
                'email' => 'Please wait before requesting another OTP.',
            ]);
        }

        $this->authService->initiateOtpLogin($email);

        $this->otpService->markCooldown($email);
        session(['otp_email' => $email]);

        return redirect()->route('auth.otp')
            ->with('success', 'OTP sent to your email.');
    }
}
