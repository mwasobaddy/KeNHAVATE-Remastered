@php
    $url = url('/ideas/'.$idea->slug);
@endphp

<x-mail::message>
# Idea Submitted Successfully

Your idea **{{ $idea->title }}** has been submitted successfully on KeNHAVATE.

<x-mail::button :url="$url">
View Your Idea
</x-mail::button>

Here's a summary of what happens next:

- Your idea will be reviewed by the evaluation team
- You can track the status of your idea from your dashboard
- You'll be notified of any updates or requests for additional information

If you have any questions, please contact the support team.

Thanks for contributing,<br>
{{ config('app.name') }}
</x-mail::message>
