# Query: 'missed'
# ContextLines: 1

3 results - 3 files

app\Services\CalendarService.php:
  110              $instance?->completed_at !== null => 'completed',
  111:             $isPast => 'missed',
  112              $isToday => 'pending',

resources\js\features\weekly\types.ts:
  3  
  4: export type SlotStatus = 'completed' | 'missed' | 'pending' | null;
  5  

resources\js\features\weekly\components\SlotMomentIcon.tsx:
  14      const isCompleted = moment.status === 'completed';
  15:     const isPast = moment.status === 'completed' || moment.status === 'missed';
  16  
