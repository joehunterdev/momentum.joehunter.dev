<?php

namespace Tests\Unit;

use App\Services\CalendarService;
use Tests\TestCase;

class CalendarServiceTest extends TestCase
{
    private CalendarService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CalendarService;
    }

    public function test_builds_time_slots_for_normal_day(): void
    {
        $slots = $this->service->buildTimeSlots('07:00:00', '22:00:00');

        $this->assertNotEmpty($slots, 'Should generate time slots');
        $this->assertContains('07:00', $slots, 'Should include wake time');
        $this->assertContains('21:30', $slots, 'Should include slots before sleep time');

        // Should have 30 minute intervals: 7:00 to 22:00 = 15 hours = 30 slots
        $this->assertCount(31, $slots); // 31 slots (including both endpoints)
    }

    public function test_builds_time_slots_crossing_midnight(): void
    {
        // 08:15 gets snapped to 08:00, 00:15 gets rounded to 00:30
        $slots = $this->service->buildTimeSlots('08:15:00', '00:15:00');

        $this->assertNotEmpty($slots, 'Should generate time slots crossing midnight');
        $this->assertContains('08:00', $slots, 'Should include snapped wake time');
        $this->assertContains('23:00', $slots, 'Should include late evening');
        $this->assertContains('23:30', $slots, 'Should include 23:30');
        $this->assertContains('00:00', $slots, 'Should include midnight');
        $this->assertContains('00:30', $slots, 'Should include past midnight');

        // 08:00 to 00:30 next day = 16.5 hours = 34 slots
        $this->assertCount(34, $slots, 'Should have 34 slots (08:00 to 00:30)');
    }

    public function test_builds_time_slots_with_15_minute_intervals(): void
    {
        $slots = $this->service->buildTimeSlots('09:00:00', '10:00:00', 15);

        $this->assertContains('09:00', $slots);
        $this->assertContains('09:15', $slots);
        $this->assertContains('09:30', $slots);
        $this->assertContains('09:45', $slots);
        $this->assertContains('10:00', $slots);
        $this->assertCount(5, $slots);
    }

    public function test_snaps_time_to_slot(): void
    {
        $this->assertEquals('09:00', $this->service->snapToSlot('09:05:00'));
        $this->assertEquals('09:00', $this->service->snapToSlot('09:14:59'));
        $this->assertEquals('09:30', $this->service->snapToSlot('09:15:00'));
        $this->assertEquals('09:30', $this->service->snapToSlot('09:29:59'));
        $this->assertEquals('10:00', $this->service->snapToSlot('09:45:00'));
    }
}
