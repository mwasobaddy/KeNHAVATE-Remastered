<?php

namespace App\Http\Controllers;

use App\Models\CollaborationRequest;
use App\Models\Idea;
use App\Services\Ideas\IdeaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Response;

class PublicController extends Controller
{
    public function __construct(
        private IdeaService $ideaService,
    ) {}

    public function home(): Response
    {
        $totalIdeas = Idea::whereNotIn('status', ['draft'])->count();
        $implemented = Idea::whereIn('status', ['completed', 'implemented'])->count();
        $collaborators = CollaborationRequest::where('status', 'approved')
            ->distinct('user_id')
            ->count('user_id');

        return inertia('public/home', [
            'stats' => [
                'totalIdeas' => $totalIdeas,
                'implemented' => $implemented,
                'collaborators' => $collaborators,
            ],
        ]);
    }

    public function explore(Request $request): Response
    {
        $search = $request->query('search');
        $categoryId = $request->query('category_id');
        $filters = [];

        if ($categoryId) {
            $filters['category_id'] = $categoryId;
        }

        $ideas = $this->ideaService->getPublic($search, $filters);

        return inertia('public/explore', [
            'ideas' => $ideas,
        ]);
    }

    public function show(string $slug): Response
    {
        $idea = Idea::with(['author', 'category', 'documents', 'ipRight.documents'])
            ->where('slug', $slug)
            ->whereNotIn('status', ['draft'])
            ->firstOrFail();

        return inertia('public/ideas-show', [
            'idea' => $idea,
        ]);
    }

    public function contact(Request $request): RedirectResponse|Response
    {
        if ($request->isMethod('post')) {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255'],
                'subject' => ['required', 'string', 'max:255'],
                'message' => ['required', 'string', 'max:5000'],
            ]);

            try {
                Mail::raw(
                    "Name: {$validated['name']}\nEmail: {$validated['email']}\nSubject: {$validated['subject']}\n\n{$validated['message']}",
                    fn ($message) => $message
                        ->to(config('mail.from.address'))
                        ->subject("KeNHAVATE Contact: {$validated['subject']}")
                );
            } catch (\Throwable $e) {
                Log::error('Contact form failed', ['error' => $e->getMessage()]);
            }

            return redirect()->back()->with('success', 'Thank you for your message. We will get back to you shortly.');
        }

        return inertia('public/contact');
    }
}
