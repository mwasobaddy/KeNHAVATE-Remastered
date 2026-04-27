<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\DdReviewController;
use App\Http\Controllers\IdeaController;
use App\Http\Controllers\SmeReviewController;
use App\Http\Controllers\TeamMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Idea resource routes (using slug)
    Route::get('idea', [IdeaController::class, 'index'])->name('idea.index');
    Route::get('idea/create', [IdeaController::class, 'create'])->name('idea.create');
    Route::post('idea', [IdeaController::class, 'store'])->name('idea.store');
    Route::get('idea/{idea:slug}', [IdeaController::class, 'show'])->name('idea.show');
    Route::get('idea/{idea:slug}/edit', [IdeaController::class, 'edit'])->name('idea.edit');
    Route::put('idea/{idea:slug}', [IdeaController::class, 'update'])->name('idea.update');

    // Comments routes
    Route::get('idea/{idea}/comments', [CommentController::class, 'index'])->name('idea.comments.index');

    // Team Members routes
    Route::get('idea/{idea}/team-members', [TeamMemberController::class, 'index'])->name('idea.team-members.index');
    Route::get('idea/{idea}/team-members/create', [TeamMemberController::class, 'create'])->name('idea.team-members.create');
    Route::post('idea/{idea}/team-members', [TeamMemberController::class, 'store'])->name('idea.team-members.store');
    Route::get('idea/{idea}/team-members/{teamMember}', [TeamMemberController::class, 'show'])->name('idea.team-members.show');
    Route::get('idea/{idea}/team-members/{teamMember}/edit', [TeamMemberController::class, 'edit'])->name('idea.team-members.edit');
    Route::put('idea/{idea}/team-members/{teamMember}', [TeamMemberController::class, 'update'])->name('idea.team-members.update');
    Route::delete('idea/{idea}/team-members/{teamMember}', [TeamMemberController::class, 'destroy'])->name('idea.team-members.destroy');

    // SME Review routes
    Route::get('idea/sme-review', [SmeReviewController::class, 'index'])->name('idea.smeReview.index');
    Route::get('idea/sme-review/create', [SmeReviewController::class, 'create'])->name('idea.smeReview.create');
    Route::post('idea/sme-review', [SmeReviewController::class, 'store'])->name('idea.smeReview.store');
    Route::get('idea/sme-review/{smeReview}', [SmeReviewController::class, 'show'])->name('idea.smeReview.show');
    Route::get('idea/sme-review/{smeReview}/edit', [SmeReviewController::class, 'edit'])->name('idea.smeReview.edit');
    Route::put('idea/sme-review/{smeReview}', [SmeReviewController::class, 'update'])->name('idea.smeReview.update');

    // DD Review routes
    Route::get('idea/dd-review', [DdReviewController::class, 'index'])->name('idea.ddReview.index');
    Route::get('idea/dd-review/create', [DdReviewController::class, 'create'])->name('idea.ddReview.create');
    Route::post('idea/dd-review', [DdReviewController::class, 'store'])->name('idea.ddReview.store');
    Route::get('idea/dd-review/{ddReview}', [DdReviewController::class, 'show'])->name('idea.ddReview.show');
});
