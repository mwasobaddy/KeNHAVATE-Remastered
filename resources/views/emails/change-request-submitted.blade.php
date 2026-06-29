@php
    $url = url('/ideas/'.$changeRequest->idea->slug.'/changes/'.$changeRequest->id);
@endphp

<x-mail::message>
# Change Request Submitted

{{ $changeRequest->proposer->name }} has proposed changes to your idea **{{ $changeRequest->idea->title }}**.

**Fields changed:** {{ count($changeRequest->proposed_data) }}

@if($changeRequest->notes)
**Proposer's notes:** {{ $changeRequest->notes }}
@endif

<x-mail::button :url="$url">
Review Changes
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
