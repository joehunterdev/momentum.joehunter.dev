<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MonthlyControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_monthly_page_requires_auth(): void
    {
        $this->get(route('monthly'))->assertRedirect(route('login'));
    }

    public function test_monthly_page_renders_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('monthly'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Monthly/Index')
                ->has('month')
                ->has('monthStart')
                ->has('monthEnd')
                ->has('days')
                ->has('config')
            );
    }

    public function test_monthly_page_accepts_month_param(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('monthly', ['month' => '2026-03']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Monthly/Index')
                ->where('month', '2026-03')
                ->where('monthStart', '2026-03-01')
                ->where('monthEnd', '2026-03-31')
            );
    }

    public function test_monthly_days_include_padding_from_adjacent_months(): void
    {
        $user = User::factory()->create();

        // May 2026 starts on a Friday — grid should include Mon 27 Apr – Sun 30 Apr
        $this->actingAs($user)
            ->get(route('monthly', ['month' => '2026-05']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Monthly/Index')
                ->where('monthStart', '2026-05-01')
                ->where(fn ($props) => collect($props['days'])->first()['date'] === '2026-04-27')
                ->where(fn ($props) => ! collect($props['days'])->first()['isCurrentMonth'])
            );
    }

    public function test_monthly_day_has_correct_shape(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('monthly'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Monthly/Index')
                ->has('days.0', fn ($day) => $day
                    ->has('date')
                    ->has('dayName')
                    ->has('isToday')
                    ->has('isWeekend')
                    ->has('isCurrentMonth')
                    ->has('moments')
                    ->has('completedCount')
                    ->has('totalCount')
                )
            );
    }
}
