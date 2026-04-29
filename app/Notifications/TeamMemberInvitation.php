<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class TeamMemberInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $inviterName,
        private string $ideaTitle,
        private int $ideaId,
        private string $role,
        private string $permission,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $permissionText = $this->permission === 'edit' ? 'edit the idea' : 'view the idea';
        $signedUrl = URL::temporarySignedRoute(
            'idea.team-members.accept',
            now()->addMinutes(30),
            ['invitation' => $this->ideaId]
        );

        return (new MailMessage)
            ->subject("Invitation to collaborate on '{$this->ideaTitle}'")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$this->inviterName} has invited you to collaborate on the idea '{$this->ideaTitle}'.")
            ->line("**Role:** {$this->role}")
            ->line("**Permission:** You can {$permissionText}.")
            ->action('Join the Team', $signedUrl)
            ->line('This invitation is valid for 30 minutes.')
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'inviter_name' => $this->inviterName,
            'idea_title' => $this->ideaTitle,
            'role' => $this->role,
            'permission' => $this->permission,
        ];
    }
}
