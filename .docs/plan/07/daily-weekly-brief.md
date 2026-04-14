# Component separation of concerns
Ok some of the weekly funcionality is great, however i would like to port some of it really to the daily view. Mainly the side swipe funcionality. The views for calendar are also great and should be reusable.
## View switch
- The views essentially are both calendar views so lets provide a simple button like a grid icon to switch between daily weekly

## Daily View

Responsibilities:
- Handling the actioning of the moments
- Uses the swipe funcionality
- Has the text ticker feature: stack env about 
- Has the progress bar feature
- 30 min slots using same calendar down the page
- Green status and other action logic should live here

Here we we will handle only whats happening throughout today. So virtually same logic throughout like weekly view. But per 30 min slots downwards for the whole day.

## Weekly View
Responsibilities:
- Here we will create new moments
- Handle the  shecdule and reocurrance of them
- We can remove sideswipe and any other logic that pertains to the actioning of itesm

Regarding weekly view what do you think would be good to put in that row on the right for better ui to handle its responsibilities ?