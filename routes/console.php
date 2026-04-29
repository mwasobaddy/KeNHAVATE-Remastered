<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('otps:prune')->daily();
