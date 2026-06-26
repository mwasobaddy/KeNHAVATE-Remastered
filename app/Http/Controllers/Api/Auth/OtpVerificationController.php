<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\AuthService;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OtpVerificationController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private OtpService $otpService,
    ) {}

    public function store(VerifyOtpRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->verifyOtpLogin(
                $request->input('email'),
                $request->input('otp'),
            );
        } catch (\RuntimeException) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid or expired OTP.',
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'terms_accepted' => (bool) $user->terms_accepted,
            ],
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $email = $request->input('email');

        if ($this->otpService->isCooldownActive($email)) {
            return response()->json([
                'message' => 'Please wait before requesting another OTP.',
                'cooldown_remaining' => $this->otpService->getRemainingCooldown($email),
            ], 429);
        }

        $this->authService->resendOtp($email);
        $this->otpService->markCooldown($email);

        return response()->json([
            'message' => 'A new OTP has been sent to your email.',
            'cooldown_remaining' => 60,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'terms_accepted' => (bool) $user->terms_accepted,
                'roles' => $user->roles->pluck('name'),
            ],
        ]);
    }
}
