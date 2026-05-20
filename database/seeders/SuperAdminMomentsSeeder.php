<?php

namespace Database\Seeders;

use App\Models\Moment;
use App\Models\User;
use Illuminate\Database\Seeder;

class SuperAdminMomentsSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'joe.hunter.dev@gmail.com')->first();

        if (! $user) {
            $this->command->error('Super admin user not found!');

            return;
        }

        // Copy moments from admin user (ID 2) to super admin (ID 1)
        $adminMoments = Moment::where('user_id', 2)
            ->with(['schedule', 'cue', 'reward'])
            ->get();

        foreach ($adminMoments as $m) {
            $new = $m->replicate();
            $new->user_id = $user->id;
            $new->save();

            if ($m->schedule) {
                $s = $m->schedule->replicate();
                $s->moment_id = $new->id;
                $s->save();
            }

            if ($m->cue) {
                $c = $m->cue->replicate();
                $c->moment_id = $new->id;
                $c->save();
            }

            if ($m->reward) {
                $r = $m->reward->replicate();
                $r->moment_id = $new->id;
                $r->save();
            }
        }

        $this->command->info('✅ Created '.Moment::where('user_id', $user->id)->count().' moments for super admin');
    }
}
