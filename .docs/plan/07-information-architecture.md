## 7) Information Architecture
- **/daily** — schedule view
- **/weekly** — planning & moment setup
- **/dashboard** — metrics
- **/config** — user schedule
- **/create-moment** — moment builder

## Weekly View
    - Is a full weekly view
    - Starting with monday to sunday always in this format monday top sunday bottom
    - The day current can be highlighted as row
    - Time slots col
        - Horizontally streched across broken into 30 mins
        - Have either the icon of the moment or
        - A slot to add a new moment
          - Moment then can popup a modal to  moment/create
        - The current moment of the day could also be highlighted 
        - Passed days moments can have the icon as either green for done or red for not or grey to as required action
    - Day row Out of office hours a 1/3 grey shadow 50
    - Weekends a 1/2 grey bkg 50

## Create Moment
    - Create moment should be in a modal component
    - Lets add a full pallet of icons to chose from font aweomse maby ?
    - The schedule section can go last
    - Moment 
        - icon add fixes
            - current implementation is good the categoires need spacing and should be badges
            - the flow should be if icon not fount there should inplace of the text area or below (add as new) and not a text input underneath
            - THe inputs should match the others too no black border

## Config
    - [x] Have a helper when adding start / end of day for 8hrs sleep
    - [x] Office hours define
    - [x] Needs an identity statement area
    - [] Define healthy schedule 8hrs sleep
    - [x] Rather than m,t. Use proper days of the week
    - [] What is an identity statement
    V2
    - [] Use tool tips to highlight text
    - [] Use nicer icons
    - [] Sleep time should be defined automatically
    - [] Config needs its own moment or category creation area 
## Overview

Nice start—you’ve captured the core structure well. Based on the dashboard in your image, here’s a more complete and organized feature breakdown you can build on:
 
## 🧩 **Dashboard Features (Expanded)**

### 📅 **1. Date / Range Card**

* Select **month + year** (dropdown or arrows)
* Changing it updates **all dashboard data**
* Optional:

  * Quick presets (This Month, Last Month)
  * Custom date range

---

### 📈 **2. Progress Over Time (Line Chart)**

* Shows habit completion trend across the month
* Helps visualize:

  * Consistency
  * Peaks/drops (momentum)
* Enhancements:

  * Tooltip with daily % completion
  * Highlight best/worst days
  * Toggle between daily / weekly view

---

### 🎯 **3. Daily Habits Summary (Donut Chart)**

* Displays **overall completion rate**
* Based on:

  * Completed habits / total habits
* Enhancements:

  * Compare vs last week
  * Color zones (low/medium/high performance)

---

### ✅ **4. Habit Grid (Calendar View)**

* Each habit tracked per day (checkbox grid)
* Organized by weeks (Week 1–5)
* Visual indicators:

  * Checked = completed
  * Empty = missed
* Enhancements:

  * Hover to show notes
  * Streak highlighting

---

### 📊 **5. Habit Progress Bars**

* Shows completion % per habit
* Helps identify:

  * Strong habits
  * Weak habits
* Enhancements:

  * Sort by performance
  * Filter (top / bottom habits)

---

### 🏆 **6. Top Habits List**

* Ranks best-performing habits
* Could be based on:

  * Completion %
  * Longest streak
* Enhancements:

  * “Most improved” badge

---

### 📉 **7. Weekly Progress Section**

* Weekly completion % (mini donut charts)
* Shows consistency across weeks
* Enhancements:

  * Weekly comparison trend
  * Highlight best week

---

### 📦 **8. Summary Cards**

* Key stats at a glance:

  * Total habits completed
  * Completion rate %
  * Longest streak
  * Missed days
* Enhancements:

  * Small icons + color coding

---

### 🔥 **9. Streak Tracking (Add This)**

* Track consecutive days per habit
* Global streak (all habits)
* Visual:

  * Fire icon 🔥
* Great for motivation

---

### 🧠 **10. Insights / Smart Feedback (Advanced)**

* Auto-generated insights like:

  * “You’re most consistent on weekdays”
  * “You tend to miss habits on Sundays”
* Could evolve later with AI

---

### ⚙️ **11. Habit Management**

* Add / edit / delete habits
* Set:

  * Frequency (daily / weekly)
  * Category (health, learning, etc.)
  * Goal target

---

### 🎨 **12. UI/UX Enhancements**

* Card-based layout (as you noted ✅)
* Soft color system (greens for success)
* Responsive design
 
 