<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;

beforeEach(function () {
    Config::set('deploy.token', 'test-deploy-token');
});

test('deploy routes are forbidden without a valid token', function (string $route) {
    $this->post(route($route))->assertForbidden();

    $this->post(route($route), headers: ['X-Deploy-Token' => 'wrong-token'])->assertForbidden();

    $this->post(route($route, ['token' => 'wrong-token']))->assertForbidden();
})->with(['deploy.build', 'deploy.clear', 'deploy.migrate', 'deploy.migrate-fresh']);

test('deploy routes return 403 when no token is configured', function (string $route) {
    Config::set('deploy.token', null);

    $this->post(route($route), headers: ['X-Deploy-Token' => 'test-deploy-token'])->assertForbidden();
})->with(['deploy.build', 'deploy.clear', 'deploy.migrate', 'deploy.migrate-fresh']);

test('deploy clear route clears the Laravel caches', function () {
    $this->post(route('deploy.clear'), headers: ['X-Deploy-Token' => 'test-deploy-token'])
        ->assertOk()
        ->assertJson(['success' => true]);
});

test('deploy build route installs and builds the frontend assets', function () {
    Process::fake();

    $this->post(route('deploy.build'), headers: ['X-Deploy-Token' => 'test-deploy-token'])
        ->assertOk()
        ->assertJson(['success' => true]);

    Process::assertRan(fn ($process) => str_contains((string) $process->command, 'pnpm install'));
});

test('deploy migrate route runs pending migrations', function () {
    $this->post(route('deploy.migrate'), headers: ['X-Deploy-Token' => 'test-deploy-token'])
        ->assertOk()
        ->assertJson(['success' => true]);
});

test('deploy migrate fresh route drops, migrates and seeds the database', function () {
    Artisan::shouldReceive('call')
        ->with('deploy:migrate-fresh', [])
        ->andReturn(0);
    Artisan::shouldReceive('output')->andReturn('');

    $this->post(route('deploy.migrate-fresh'), headers: ['X-Deploy-Token' => 'test-deploy-token'])
        ->assertOk()
        ->assertJson(['success' => true]);
});

test('deploy:migrate-fresh command drops, migrates and seeds the database', function () {
    $dbPath = tempnam(sys_get_temp_dir(), 'deploy_test_').'.sqlite';
    touch($dbPath);

    Config::set('database.default', 'deploytest');
    Config::set('database.connections.deploytest', [
        'driver' => 'sqlite',
        'database' => $dbPath,
    ]);
    DB::purge('deploytest');

    try {
        $this->artisan('deploy:migrate-fresh')->assertSuccessful();

        $this->assertDatabaseHas('users', ['email' => 'kelvinramsiel@gmail.com']);
    } finally {
        unlink($dbPath);
    }
});
