## Calendar Components Plan
 - From what i can see we havent got a crystal clear plan for the calendar components i really dont see them as reusable the way they should so to recap

 Pages:
 - Daily
 - Weekly
 - Monthly

See the image for refactor proposal, lets not worry about the desktop grid yet, essentially with thin the page that defines the data set, which populates 3 components. So the calendar should use child props no ? 
the Calendar nav is the same as a prev / current / back should also take pagination style generic props, and the moment freequency config the same. Lets also just bare in mind that within a calendar section article ccomplex logic will live there. So lets not get too bogged down in that side. But yes the inner CalendarSectionArticles will have logic common to all Mobile or Row views no ?¿ the action sliders the ghost config. Please think like an expert react architect / spec writer. Maby go look at day calendar or other popular calendar components, then my current architecture and lets write a full plan, then we'll write a full brief. See my anatomy-of-a-calendar.png


Daily Page:

Today:
09:30
10:00

Weekly Page :
Monday 1st
16:00
17:00
Tuesday 2nd


Monthy Views:
Week 1st
WeeK 8th

## Cross Component Refactor
My current concern is we have lost the pattern a little bit adn gone wild with naming and stucture across weekly,daily monthly views

Im considering adding those folders into features/calendar/ so their grouped does that make sense or too much granularity ?

Lets look at what we variants we actually need, for simplicty i have removed the "grid" variations, they will always be rows or considered rows for now i dont think we need it.

Then secondarily and more imporantly i want a really clean rethink and refactor of the "MomentAction"
