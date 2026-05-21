## Refactor to enums
app\Enums\Frequency.php:
9 {
10: case Daily = 'daily';
11 case Weekly = 'weekly';

app\Http\Controllers\MomentController.php:
50 $moment->schedule()->create([
51: 'frequency' => $data['frequency'] ?? 'daily',
52 'days_of_week' => $data['days_of_week'] ?? null,

121 [
122: 'frequency' => $data['frequency'] ?? 'daily',
123 'days_of_week' => $data['days_of_week'] ?? null,

app\Models\Moment.php:
71 return match ($schedule->frequency) {
72: 'daily' => true,
73 'weekly',

app\Services\CalendarService.php:
69 $due = match ($schedule?->frequency) {
70: 'daily' => true,
71 'weekly', 'custom' => $schedule->days_of_week !== null

config\logging.php:
67
68: 'daily' => [
69: 'driver' => 'daily',
70 'path' => storage_path('logs/laravel.log'),

database\migrations\2026_04_05_000004_create_moment_schedules_table.php:
13 $table->foreignId('moment_id')->unique()->constrained()->cascadeOnDelete();
14: $table->enum('frequency', ['daily', 'weekly', 'custom', 'once'])->default('daily');
15 $table->json('days_of_week')->nullable(); // e.g. [1,2,3,4,5]

database\seeders\DemoUserMomentSeeder.php:
153 return match ($frequency) {
154: 'daily' => true,
155 'weekly', 'custom' => $daysOfWeek !== null && in_array($date->dayOfWeek, $daysOfWeek, strict: true),

database\seeders\MomentSeeder.php:
135 return match ($frequency) {
136: 'daily' => true,
137 'weekly' => $daysOfWeek !== null && in_array($date->dayOfWeek, $daysOfWeek, strict: true),

database\seeders\TestUserMomentSeeder.php:
153 return match ($frequency) {
154: 'daily' => true,
155 'weekly', 'custom' => $daysOfWeek !== null && in_array($date->dayOfWeek, $daysOfWeek, strict: true),

resources\css\app.scss:
11 @import 'weekly';
12: @import 'daily';
13 @import 'welcome';

resources\js\features\moments\types.ts:
18 // Schedule
19: frequency: 'daily' | 'weekly' | 'custom';
20 days_of_week: number[];

resources\js\features\moments\components\ScheduleFields.tsx:
48
49: {frequency !== 'daily' && (
50 <div>

    resources\js\features\moments\hooks\useMomentForm.ts:
    11 is_active: true,
    12: frequency: 'daily',
    13 days_of_week: [],

    33 is_active: moment.is_active,
    34: frequency: moment.schedule?.frequency ?? 'daily',
    35 days_of_week: moment.schedule?.days_of_week ?? [],

    resources\js\features\weekly\components\DaySection.tsx:
    7 time: string;
    8: frequency: 'daily' | 'weekly' | 'custom' | 'once';
    9 daysOfWeek: number[];

    resources\js\features\weekly\components\RecurrenceBar.tsx:
    2
    3: type Frequency = 'daily' | 'weekly' | 'custom' | 'once';
    4

    17 const FREQ_OPTIONS: { label: string; value: Frequency }[] = [
    18: { label: 'Daily', value: 'daily' },
    19 { label: 'Weekdays', value: 'weekly' },

    36 function handleFrequency(freq: Frequency) {
    37: if (freq === 'daily') {
    38: onChange('daily', ALL_DAYS);
    39 } else if (freq === 'weekly') {

    resources\js\features\weekly\components\WeeklyGrid.tsx:
    6 time: string;
    7: frequency: 'daily' | 'weekly' | 'custom' | 'once';
    8 daysOfWeek: number[];

    resources\js\Layouts\AuthenticatedLayout.tsx:
    9 function ViewToggle() {
    10: const isDaily = route().current('daily');
    11 const isWeekly = route().current('weekly');

    16
    <Link
        17: href={route('daily')}
        18 className={[

        80 <NavLink
        81: href={route('daily')}
        82: active={route().current('daily')}
        83>

    197 <ResponsiveNavLink
        198: href={route('daily')}
        199: active={route().current('daily')}
        200>

        resources\js\Pages\Weekly\Index.tsx:
        18 time: string;
        19: frequency: 'daily' | 'weekly' | 'custom' | 'once';
        20 daysOfWeek: number[];

        70
        71: function handleSchedulingChange(frequency: 'daily' | 'weekly' | 'custom' | 'once', daysOfWeek: number[]) {
        72 setScheduling((prev) => prev ? { ...prev, frequency, daysOfWeek } : null);

        resources\js\shared\components\calendar\DateSelectorBar.tsx:
        85 router.get(
        86: route('daily'),
        87 { date: format(date, 'yyyy-MM-dd') },

        resources\js\shared\constants\moments.ts:
        31 export const SCHEDULE_FREQUENCIES = [
        32: { label: 'Daily', value: 'daily' },
        33 { label: 'Weekly', value: 'weekly' },

        routes\web.php:
        66 // ─── App ─────────────────────────────────────────────────────────────────
        67: Route::get('/daily', [DailyController::class, 'index'])->name('daily');
        68 Route::get('/weekly', [WeeklyController::class, 'index'])->name('weekly');