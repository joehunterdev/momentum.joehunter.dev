## Moment Action
My current concern is we have lost the pattern a little bit adn gone wild with naming and stucture across weekly,daily monthly views



Im considering adding those folders into features/calendar/ so their grouped does that make sense or too much granularity ?

E:\www\momentum.joehunter.dev\resources\js\features\daily
E:\www\momentum.joehunter.dev\resources\js\features\monthly
E:\www\momentum.joehunter.dev\resources\js\features\weekly

Lets look at what we variants we actually need, for simplicty i have removed the "grid" variations, they will always be rows or considered rows for now i dont think we need it. So the naming should be really clear and make sense, from my perspectiv e there sso much reusablility here we actually dont need that many variations per page view do we ?

Then secondarily and more imporantly i want a really clean rethink and refactor of the "MomentAction" the whole point of this app is to demonstrate clean clear react reusability so im happy to refactor. Dont worry if some of the views get crowded or how the current inner row items are as we can start from fresh. 

The aim in short is to do a quick analysis moment-action-plan.md here and then start creating a reusable moment action component for each article row. Lets just asume werre starting from scratch if it helps E:\www\momentum.joehunter.dev\.docs\calendar-components\moment-action\the-row-currently.png forget any complex ui interactions lets just simply display information to start with. The icons, the title & description. The progress bar now will be highlighted as the whole background row. moment-action-plan.md lets get startted wit hthe plan. ask me any questoins

Slot moment data so slot feels alot more like MomentActionData ? or should we stick with slot domain wise
- `app/Data/SlotMomentData.php`


MonthlyMomentData
E:\www\momentum.joehunter.dev\app\Data\MomentData.php

    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public ?string $color,
        public ?string $icon,
        public bool $is_active,
        public int $sort_order,
        public ?MomentScheduleData $schedule,
        public ?CueData $cue,
        public ?RewardData $reward,
    ) {}
