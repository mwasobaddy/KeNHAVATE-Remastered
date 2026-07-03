@php
    $url = url('/ideas/'.$idea->slug);
@endphp

<x-mail::message>
# Your Idea Has Been Classified

Your idea **{{ $idea->title }}** has been classified by the RI&KM Officer.

**Classification:** {{ $classification->name }}
@if($classification->description)

{{ $classification->description }}
@endif

<x-mail::button :url="$url">
View Your Idea
</x-mail::button>

The next steps will depend on the classification type. You will be notified of any further decisions.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
