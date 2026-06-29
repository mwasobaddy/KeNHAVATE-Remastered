@php
    $url = url('/invitations/'.$invitation->token);
@endphp

<x-mail::message>
# You're invited to contribute!

{{ $invitation->invitedBy->name }} has invited you to contribute to an idea on KeNHAVATE.

**Idea:** {{ $invitation->idea->title }}

Click the button below to accept the invitation and join the team.

<x-mail::button :url="$url">
Accept Invitation
</x-mail::button>

If you did not expect this invitation, you can ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
