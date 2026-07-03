@php
    $url = url('/ideas/'.$idea->slug);
@endphp

<x-mail::message>
# New Idea Submitted

A new idea has been submitted on KeNHAVATE.

**Title:** {{ $idea->title }}

**Submitted by:** {{ $idea->author->name }}

**Category:** {{ $idea->category?->name }}

<x-mail::button :url="$url">
View Idea
</x-mail::button>

@if($idea->description)
---
{{ $idea->description }}
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
