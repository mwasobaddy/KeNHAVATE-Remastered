<?php

use App\Console\Commands\CloseBudgetLoggedIdeas;
use Illuminate\Support\Facades\Schedule;

Schedule::command(CloseBudgetLoggedIdeas::class)->daily();
