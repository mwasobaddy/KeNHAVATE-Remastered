@php
    $url = url('/ideas/'.$changeRequest->idea->slug);
@endphp

<x-mail::message>
# Change Request Rejected

Your proposed changes to **{{ $changeRequest->idea->title }}** have been reviewed but were not approved.

**Reviewer's feedback:** {{ $changeRequest->feedback }}

<x-mail::button :url="$url">
View Idea
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
