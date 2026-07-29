<x-mail::message>
# Bug Report Update

Your bug report **"{{ $report->title }}"** has been reviewed.

Unfortunately, it was not accepted as a valid bug report at this time.

**Reason:**
{{ $reason }}

<x-mail::button :url="route('bug-reports.index')">
View My Reports
</x-mail::button>

Thank you for your contribution,<br>
{{ config('app.name') }} Team
</x-mail::message>
