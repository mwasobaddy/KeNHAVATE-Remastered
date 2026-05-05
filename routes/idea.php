<?php

use App\Http\Controllers\CollaboController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DdReviewController;
use App\Http\Controllers\IdeaController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SmeReviewController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Idea resource routes (using slug)
    Route::get('idea', [IdeaController::class, 'index'])->name('idea.index');

    // Collabo routes
    Route::post('idea', [IdeaController::class, 'store'])->name('idea.store');
    Route::get('idea/create', [IdeaController::class, 'create'])->name('idea.create');
    Route::get('idea/collabo', [CollaboController::class, 'index'])->name('idea.collabo.index');
    Route::get('idea/{idea:slug}/collabo', [CollaboController::class, 'show'])->name('idea.collabo.show');

    // Collaboration requests
    Route::post('idea/{idea:slug}/collabo/request', [CollaboController::class, 'requestCollaboration'])->name('idea.collabo.request');
    Route::delete('idea/{idea:slug}/collabo/request', [CollaboController::class, 'cancelRequest'])->name('idea.collabo.cancel');
    Route::post('idea/{idea:slug}/collabo/requests/{collaborationRequest}/approve', [CollaboController::class, 'approveRequest'])->name('idea.collabo.approve');
    Route::post('idea/{idea:slug}/collabo/requests/{collaborationRequest}/decline', [CollaboController::class, 'declineRequest'])->name('idea.collabo.decline');
    Route::delete('idea/{idea:slug}/collabo/collaborators/{collaborator}', [CollaboController::class, 'removeCollaborator'])->name('idea.collabo.remove');
    // Likes route
    Route::post('likes', [LikeController::class, 'store'])->name('likes.store');

    // Comments routes
    Route::get('idea/{idea:slug}/comments', [CommentController::class, 'index'])->name('idea.comments.index');
    Route::post('comments', [CommentController::class, 'store'])->name('comments.store');

    // Notifications route
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/count', [NotificationController::class, 'count'])->name('notifications.count');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');

    // Accept team member invitation (signed URL)
    Route::get('/idea/{invitation}/accept', [TeamMemberController::class, 'accept'])
        ->name('idea.team-members.accept')
        ->middleware(['signed']);
    Route::get('idea/{idea}/team-members', [TeamMemberController::class, 'index'])->name('idea.team-members.index');
    Route::get('idea/{idea}/team-members/create', [TeamMemberController::class, 'create'])->name('idea.team-members.create');
    Route::post('idea/{idea}/team-members', [TeamMemberController::class, 'store'])->name('idea.team-members.store');
    Route::get('idea/{idea}/team-members/{teamMember}', [TeamMemberController::class, 'show'])->name('idea.team-members.show');
    Route::get('idea/{idea}/team-members/{teamMember}/edit', [TeamMemberController::class, 'edit'])->name('idea.team-members.edit');
    Route::put('idea/{idea}/team-members/{teamMember}', [TeamMemberController::class, 'update'])->name('idea.team-members.update');
    Route::delete('idea/{idea}/team-members/{teamMember}', [TeamMemberController::class, 'destroy'])->name('idea.team-members.destroy');

    // Suggestions routes
    Route::post('idea/{idea:slug}/suggestions', [SuggestionController::class, 'store'])->name('idea.suggestions.store');
    Route::post('idea/{idea:slug}/suggestions/{suggestion}/approve', [SuggestionController::class, 'approve'])->name('idea.suggestions.approve');
    Route::post('idea/{idea:slug}/suggestions/{suggestion}/decline', [SuggestionController::class, 'decline'])->name('idea.suggestions.decline');

    // SME Review routes
    Route::get('idea/sme-review', [SmeReviewController::class, 'index'])->name('idea.smeReview.index');
    Route::get('idea/sme-review/create', [SmeReviewController::class, 'create'])->name('idea.smeReview.create');
    Route::post('idea/sme-review', [SmeReviewController::class, 'store'])->name('idea.smeReview.store');
    Route::get('idea/sme-review/{smeReview}', [SmeReviewController::class, 'show'])->name('idea.smeReview.show');
    Route::get('idea/sme-review/{smeReview}/edit', [SmeReviewController::class, 'edit'])->name('idea.smeReview.edit');
    Route::put('idea/sme-review/{smeReview}', [SmeReviewController::class, 'update'])->name('idea.smeReview.update');

    // DD Review routes
    Route::get('idea/dd-review', [DdReviewController::class, 'index'])->name('idea.ddReview.index');
    Route::get('idea/dd-review/dashboard', [DdReviewController::class, 'dashboard'])->name('idea.ddReview.dashboard');
    Route::get('idea/dd-review/reviewer', [DdReviewController::class, 'dashboard'])->name('idea.ddReview.reviewer');
    Route::get('idea/dd-review/create', [DdReviewController::class, 'create'])->name('idea.ddReview.create');
    Route::post('idea/dd-review', [DdReviewController::class, 'store'])->name('idea.ddReview.store');
    Route::get('idea/dd-review/{ddReview}', [DdReviewController::class, 'show'])->name('idea.ddReview.show');

    // DD Review workflow
    Route::post('idea/{idea:slug}/dd-review/unlock', [DdReviewController::class, 'unlock'])->name('idea.ddReview.unlock');
    Route::post('idea/{idea:slug}/dd-review/comment', [DdReviewController::class, 'addComment'])->name('idea.ddReview.comment');
    Route::post('idea/{idea:slug}/dd-review/feedback', [DdReviewController::class, 'sendFeedback'])->name('idea.ddReview.feedback');
    Route::post('idea/{idea:slug}/dd-review/approve', [DdReviewController::class, 'approve'])->name('idea.ddReview.approve');
    Route::post('idea/{idea:slug}/dd-review/reject', [DdReviewController::class, 'reject'])->name('idea.ddReview.reject');

    Route::get('idea/{idea:slug}', [IdeaController::class, 'show'])->name('idea.show');
    Route::get('idea/{idea:slug}/edit', [IdeaController::class, 'edit'])->name('idea.edit');
    Route::put('idea/{idea:slug}', [IdeaController::class, 'update'])->name('idea.update');
});
