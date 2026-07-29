<x-mail::message>
# New Bug Report Submitted

**{{ $reporter->name }}** has submitted a new bug report.

**Title:** {{ $report->title }}

**Description:**
{{ $report->description }}

<x-mail::button :url="route('bug-reports.manage')">
View All Reports
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
