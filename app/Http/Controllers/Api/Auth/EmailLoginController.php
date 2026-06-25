<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Services\AuthService;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;

class EmailLoginController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private OtpService $otpService,
    ) {}

    public function __invoke(SendOtpRequest $request): JsonResponse
    {
        $email = $request->input('email');

        if ($this->otpService->isCooldownActive($email)) {
            return response()->json([
                'message' => 'Please wait before requesting another OTP.',
                'cooldown_remaining' => $this->otpService->getRemainingCooldown($email),
            ], 429);
        }

        $this->authService->initiateOtpLogin($email);
        $this->otpService->markCooldown($email);

        return response()->json([
            'message' => 'OTP sent to your email.',
            'cooldown_remaining' => 60,
        ]);
    }
}
