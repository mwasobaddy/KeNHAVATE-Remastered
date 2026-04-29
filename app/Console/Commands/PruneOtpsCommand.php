<?php

namespace App\Console\Commands;

use App\Models\Otp;
use Illuminate\Console\Command;

class PruneOtpsCommand extends Command
{
 /** @var string */
 protected $signature = 'otps:prune';

 /** @var string */
 protected $description = 'Delete expired OTP records older than 24 hours';

 public function handle()
 {
 $count = Otp::where('expires_at', '<', now()->subDay())
 ->orWhere('used_at', '<=', now()->subDay())
 ->delete();

 $this->info("Deleted {$count} expired OTP records.");
 return 0;
 }
}