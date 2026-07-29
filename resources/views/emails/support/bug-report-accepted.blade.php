<x-mail::message>
# Bug Report Accepted

Your bug report **"{{ $report->title }}"** has been reviewed and accepted.

You have been awarded **20 points** as a Bug Bounty!

@if ($notes)
**Reviewer Notes:**
{{ $notes }}
@endif

<x-mail::button :url="route('bug-reports.index')">
View My Reports
</x-mail::button>

Thanks for helping improve {{ config('app.name') }},<br>
{{ config('app.name') }} Team
</x-mail::message>
