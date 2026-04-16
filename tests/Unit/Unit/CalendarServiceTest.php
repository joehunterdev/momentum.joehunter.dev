<?php

namespace Tests\Unit;

use App\Services\CalendarService;
use PHPUnit\Framework\TestCase;

class CalendarServiceTest extends TestCase
{
    private CalendarService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CalendarService();
    }

    // ── buildTimeSlots ────────────────────────────────────────────────────────

    public function test_build_time_slots_default_30_min(): void
    {
        $slots = $this->service->buildTimeSlots('07:00:00', '09:00:00');

        $this->assertSame(['07:00', '07:30', '08:00', '08:30', '09:00'], $slots);
    }

    public function test_build_time_slots_20_min(): void
    {
        $slots = $this->service->buildTimeSlots('07:00:00', '08:00:00', intervalMinutes: 20);

        $this->assertSame(['07:00', '07:20', '07:40', '08:00'], $slots);
    }

    public function test_build_time_slots_20_min_snaps_wake_time(): void
    {
        // 07:05 should snap down to 07:00
        $slots = $this->service->buildTimeSlots('07:05:00', '07:40:00', intervalMinutes: 20);

        $this->assertContains('07:00', $slots);
        $this->assertContains('07:20', $slots);
        $this->assertContains('07:40', $slots);
    }

    public function test_build_time_slots_60_min(): void
    {
        $slots = $this->service->buildTimeSlots('08:00:00', '12:00:00', intervalMinutes: 60);

        $this->assertSame(['08:00', '09:00', '10:00', '11:00', '12:00'], $slots);
    }

    // ── snapToSlot ────────────────────────────────────────────────────────────

    public function test_snap_to_slot_30_min_rounds_down(): void
    {
        $this->assertSame('07:00', $this->service->snapToSlot('07:10:00'));
    }

    public function test_snap_to_slot_30_min_rounds_up(): void
    {
        $this->assertSame('07:30', $this->service->snapToSlot('07:20:00'));
    }

    public function test_snap_to_slot_30_min_rounds_up_to_next_hour(): void
    {
        $this->assertSame('08:00', $this->service->snapToSlot('07:50:00'));
    }

    public function test_snap_to_slot_20_min_rounds_down(): void
    {
        $this->assertSame('07:00', $this->service->snapToSlot('07:08:00', 20));
    }

    public function test_snap_to_slot_20_min_rounds_up(): void
    {
        $this->assertSame('07:20', $this->service->snapToSlot('07:12:00', 20));
    }

    public function test_snap_to_slot_20_min_rounds_up_to_next_boundary(): void
    {
        $this->assertSame('07:40', $this->service->snapToSlot('07:32:00', 20));
    }

    public function test_snap_to_slot_20_min_rolls_over_hour(): void
    {
        $this->assertSame('08:00', $this->service->snapToSlot('07:52:00', 20));
    }

    public function test_snap_to_slot_on_exact_boundary_is_unchanged(): void
    {
        $this->assertSame('09:20', $this->service->snapToSlot('09:20:00', 20));
        $this->assertSame('09:00', $this->service->snapToSlot('09:00:00', 30));
    }
}
