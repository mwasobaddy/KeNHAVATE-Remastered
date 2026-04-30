<?php

namespace App\Http\Responses;

use App\Actions\Fortify\CompleteOnboardingAfterEmailVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;
use Symfony\Component\HttpFoundation\Response;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  Request  $request
     * @return Response
     */
    public function toResponse($request)
    {
        // Complete onboarding after email verification for Kenha users
        app(CompleteOnboardingAfterEmailVerification::class)->handle($request);

        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        // Clear any session redirect data to prevent loops
        $request->session()->forget('url.intended');

        // Redirect to dashboard - onboarding is now complete
        return redirect()->to('/dashboard?verified=1');
    }
}
