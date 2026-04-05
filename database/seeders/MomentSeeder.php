<?php

namespace Database\Seeders;

use App\Models\Cue;
use App\Models\Moment;
use App\Models\MomentSchedule;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Database\Seeder;

class MomentSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', env('SUPER_ADMIN_EMAIL'))->firstOrFail();

        $moments = [
            [
                'name'               => 'Drink water',
                'description'        => 'Start the day hydrated',
                'color'              => '#3B82F6',
                'icon'               => '💧',
                'identity_statement' => 'I am someone who takes care of my body',
                'frequency'          => 'daily',
                'days_of_week'       => null,
                'preferred_time'     => '07:30',
                'cue'                => 'When I wake up, I drink a full glass of water before checking my phone',
                'reward'             => 'Feel energised and clear-headed',
            ],
            [
                'name'               => 'Read a book',
                'description'        => '30 minutes of non-fiction reading',
                'color'              => '#8B5CF6',
                'icon'               => '📚',
                'identity_statement' => 'I am a lifelong learner',
                'frequency'          => 'daily',
                'days_of_week'       => null,
                'preferred_time'     => '21:00',
                'cue'                => 'After dinner, I sit in my reading chair and open my book',
                'reward'             => 'Track one insight in my journal',
            ],
            [
                'name'               => 'Meditate 5 mins',
                'description'        => 'Mindfulness meditation',
                'color'              => '#10B981',
                'icon'               => '🧘',
                'identity_statement' => 'I am someone who is present and calm',
                'frequency'          => 'daily',
                'days_of_week'       => null,
                'preferred_time'     => '07:00',
                'cue'                => 'When I sit at my desk, I close my eyes for 5 minutes first',
                'reward'             => 'Enjoy a coffee mindfully after',
            ],
            [
                'name'               => 'Go to the gym',
                'description'        => 'Strength training session',
                'color'              => '#EF4444',
                'icon'               => '🏋️',
                'identity_statement' => 'I am an athlete',
                'frequency'          => 'weekly',
                'days_of_week'       => [1, 3, 5], // Mon, Wed, Fri
                'preferred_time'     => '08:00',
                'cue'                => 'On gym days, my kit is packed the night before by the door',
                'reward'             => 'Post-workout protein shake',
            ],
            [
                'name'               => 'Journal',
                'description'        => 'Daily reflection — 3 gratitudes + 1 intention',
                'color'              => '#F59E0B',
                'icon'               => '✍️',
                'identity_statement' => 'I am someone who reflects and grows',
                'frequency'          => 'daily',
                'days_of_week'       => null,
                'preferred_time'     => '22:00',
                'cue'                => 'After brushing my teeth, I write in my journal',
                'reward'             => 'Reading time as a wind-down',
            ],
        ];

        foreach ($moments as $i => $data) {
            /** @var Moment $moment */
            $moment = Moment::create([
                'user_id'            => $user->id,
                'name'               => $data['name'],
                'description'        => $data['description'],
                'color'              => $data['color'],
                'icon'               => $data['icon'],
                'identity_statement' => $data['identity_statement'],
                'is_active'          => true,
                'sort_order'         => $i,
            ]);

            MomentSchedule::create([
                'moment_id'      => $moment->id,
                'frequency'      => $data['frequency'],
                'days_of_week'   => $data['days_of_week'],
                'preferred_time' => $data['preferred_time'],
            ]);

            Cue::create([
                'moment_id'                => $moment->id,
                'implementation_intention' => $data['cue'],
            ]);

            Reward::create([
                'moment_id'   => $moment->id,
                'description' => $data['reward'],
            ]);
        }
    }
}
