@php
    $url = url('/ideas/'.$changeRequest->idea->slug);
@endphp

<x-mail::message>
# Change Request Approved

Your proposed changes to **{{ $changeRequest->idea->title }}** have been approved and applied.

@if($changeRequest->feedback)
**Reviewer's feedback:** {{ $changeRequest->feedback }}
@endif

<x-mail::button :url="$url">
View Idea
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
