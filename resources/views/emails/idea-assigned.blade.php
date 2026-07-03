@php
    $url = url('/ideas/'.$idea->slug);
@endphp

<x-mail::message>
# New Idea Assigned for Review

You have been assigned as the RI&KM Officer for a new idea on KeNHAVATE.

**Title:** {{ $idea->title }}

**Submitted by:** {{ $idea->author->name }}

**Category:** {{ $idea->category?->name }}

**Assigned by:** {{ $assignedBy->name }}

<x-mail::button :url="$url">
Review Idea
</x-mail::button>

Please review this idea within **five (5) working days** as per the RI&KM guidelines.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
