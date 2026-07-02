@php
    $url = url('/ideas/'.$collaborationRequest->idea->slug);
@endphp

<x-mail::message>
# Collaboration Request Approved

Your request to collaborate on **{{ $collaborationRequest->idea->title }}** has been approved!

You can now view the idea and propose changes.

<x-mail::button :url="$url">
View Idea
</x-mail::button>

@if($collaborationRequest->feedback)
**Feedback from the author:**

{{ $collaborationRequest->feedback }}
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
