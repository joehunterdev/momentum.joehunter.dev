## 7) Information Architecture
- **/daily** — schedule view
- **/weekly** — planning & moment setup
- **/dashboard** — metrics
- **/config** — user schedule
- **/create-moment** — moment builder


https://reactbits.dev/text-animations/true-focus

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
            - Feels similar to a tag bubble add right ?
    
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
