# Feedback 03

## UI Issues

- some button with icons have no width/height and because of that are not visible
- buttons should have a cursor pointer on hover
- add hints to the quantity, shopping hint fields and brand selection to help the user understand what they represent.
- the close button in the modals are not visible, this is because the button is missing a "flex" class to properly align the icon inside it

## Functionalities not working

- I was not able to add custom categories, or custom brands

## Code improvements

- not only for the existing components, but for future ones as well: Create components for reusable code, for example list items are normally it's own component. You can check for good practices and conventions and follow them.
- avoid using extra unnecessary divs when possible, if a div has only one div as child, check if the code could not be optimized.
- the pages currently have more than one h1 element, that's because the app navigation contains a h1 element for the app name. Use a link instead to redirect the user to the home page.
- is there another way to handle the translations in the useI18n? recreating the whole messages object seems prone to bugs and forgotten keys
