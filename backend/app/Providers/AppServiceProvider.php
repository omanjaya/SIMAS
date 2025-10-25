<?php

namespace App\Providers;

use App\Services\EmployeeCodeService;
use App\Services\EmployeePasswordService;
use App\Services\SimplifiedImportService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind services to the container
        $this->app->singleton(EmployeeCodeService::class, function ($app) {
            return new EmployeeCodeService;
        });

        $this->app->singleton(EmployeePasswordService::class, function ($app) {
            return new EmployeePasswordService;
        });

        $this->app->bind(SimplifiedImportService::class, function ($app) {
            return new SimplifiedImportService(
                $app->make(EmployeeCodeService::class),
                $app->make(EmployeePasswordService::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
