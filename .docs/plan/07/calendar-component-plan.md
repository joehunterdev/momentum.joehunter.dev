### Questions before planning

**1. Slot granularity per view**
You said daily should show 30-min slots. Weekly currently shows hourly. Monthly — should it show time slots at all, or just **dots/counts per day** (like a heatmap/calendar grid)?

- Well i actually prefer 20mins
- Should it show timeslots ? yes but maby not necessarily time 
    - Weekly and Daily yes
    - Monthly should show days right ?

**2. Interaction model per view**
- **Daily**: swipe-to-complete is the main action. Keep that?
- **Weekly**: tap empty slot → configure (FrequencyBar). Keep that?
- **Monthly**: what's the primary action? Tap a day to drill into daily view? Or should you be able to toggle completions directly?
    - So the primary action for monthly should essentially be the same asweekly 
    all the same funcionality with a focus on the freequency

**3. Shared vs unique slot cells**
Right now `DailyTimeSlotCell` has swipe logic and `weekly/TimeSlotCell` has ghost/configure logic. These feel like **two genuinely different interactions**, not the same component with different props. Do you agree these should stay as separate **slot renderers** plugged into a shared layout, or do you want one unified cell?
- Yes i have two types of interactions. One to action a moment and another to actually assist in configuration of the moment being weekly and monthly

**4. Monthly data**
Monthly needs much less detail per day (no 30-min breakdown). Are you happy sending a lighter DTO from the backend for monthly (e.g. `{ date, completedCount, totalCount, moments: [...] }`) or do you want the same `WeekDayData` with full slots?
- yes for sure, it would help with optimizatoin, do we have the correct structure for this im guessing frequency is just based on ranges no ? 

**5. Navigation**
Currently daily has `DateSelectorBar` with day nav, weekly has `WeekSelectorBar`. Monthly would need a month nav. Should all three share one `<CalendarNav mode="daily|weekly|monthly" />` component?
- I like the idea of making it reusable similar to pagination type nav right ? But not at the expense of writign complicated logic if its easier to just create a new component. Lets go for mid flexibility

**6. View switching**
The toggle at the top currently switches daily ↔ weekly. With monthly added, should it become a 3-way toggle (📅 📊 📆) or a dropdown?
- 3 buttons will do nicely
---

### Where I'm leaning architecturally

```
<Calendar mode="daily | weekly | monthly">
  ├── <CalendarNav />          ← shared date navigation
  ├── <CalendarHeader />       ← day names, today badge, etc.
  └── <CalendarBody>           ← delegates to the right layout:
       ├── <DailyLayout />     ← single column, 30-min slots, swipe cells
       ├── <WeeklyLayout />    ← multi-day columns, hourly slots, configure cells
       └── <MonthlyLayout />   ← day grid, summary cells
```

**Shared kernel:** types (`TimeSlot`, `WeekDay`, `CalendarConfig`), the nav bar, slot time utilities (snapping, office hours, windowing).

**Per-view:** layout component + slot cell component. These are the parts that genuinely differ — cramming swipe, ghost, and heatmap into one cell with `if (mode === ...)` would be the opposite of the React way.

Answer those questions and I'll write the full plan into your doc.

Yes i like your architecture, i think the calendar body children makes sense as we may need to handle responsive