@php
    $url = url('/ideas/'.$collaborationRequest->idea->slug.'/collaborations');
@endphp

<x-mail::message>
# Collaboration Request

{{ $collaborationRequest->user->name }} wants to collaborate on your idea **{{ $collaborationRequest->idea->title }}**.

**Message from requester:**

{{ $collaborationRequest->message }}

<x-mail::button :url="$url">
Review Request
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
