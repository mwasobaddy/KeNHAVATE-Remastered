<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamMemberInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $inviterName,
        private string $ideaTitle,
        private string $role,
        private string $permission,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $permissionText = $this->permission === 'edit' ? 'edit the idea' : 'view the idea';

        return (new MailMessage)
            ->subject("Invitation to collaborate on '{$this->ideaTitle}'")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$this->inviterName} has invited you to collaborate on the idea '{$this->ideaTitle}'.")
            ->line("**Role:** {$this->role}")
            ->line("**Permission:** You can {$permissionText}.")
            ->action('Join the Team', url('/login'))
            ->line('If you already have an account, you can log in to access the idea.')
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
