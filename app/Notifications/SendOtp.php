<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOtp extends Notification
{
    // use Queueable;

    public function __construct(
        public string $otp,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your KeNHA OTP Code')
            ->greeting('Hello!')
            ->line('Your one-time password (OTP) for accessing the KeNHA Innovation Portal is:')
            ->line("**{$this->otp}**")
            ->line('This code expires in 10 minutes.')
            ->line('If you did not request this code, please ignore this email.');
    }
}
