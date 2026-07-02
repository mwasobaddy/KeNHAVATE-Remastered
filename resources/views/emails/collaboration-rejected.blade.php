@php
    $url = url('/');
@endphp

<x-mail::message>
# Collaboration Request Update

Your request to collaborate on **{{ $collaborationRequest->idea->title }}** has been reviewed.

**Feedback from the author:**

{{ $collaborationRequest->feedback }}

<x-mail::button :url="$url">
Browse Ideas
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
