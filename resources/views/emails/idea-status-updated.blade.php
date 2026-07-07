@php
    $url = url('/ideas/'.$idea->slug);

    $statusLabels = [
        'approved' => 'Approved',
        'deferred' => 'Deferred',
        'declined' => 'Declined',
        'budget_logged' => 'Logged for Budget Consideration',
        'closed' => 'Closed',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'implemented' => 'Implemented',
        'revision_requested' => 'Revision Requested',
        'resubmitted' => 'Resubmitted',
    ];

    $label = $statusLabels[$newStatus] ?? ucfirst($newStatus);
@endphp

<x-mail::message>
# Idea Status Update

Your idea **{{ $idea->title }}** has been updated.

**New Status:** {{ $label }}

<x-mail::button :url="$url">
View Your Idea
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
