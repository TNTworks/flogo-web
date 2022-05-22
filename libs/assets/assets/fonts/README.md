# For new icons:

## Import the icomoon project

Use icomoon app in:https://icomoon.io/app/#/select/font

Import `icomoon-project.json` located in `src/client` of this project.

Add new icons or make your modifications. It is important that you keep the same settings for the font name and the class prefixes to prevent existing use of the icons in the application.

## Exporting

1. Export the font from icomoon app
2. Unzip the icomoon package and copy the flogo-icon.\* fonts into `src/client/assets/fonts` of this project
3. From the icomoon package copy `style.css` and move it to `src/client/assets/flogo-icons.less`
4. From the icomoon package copy `selection.json` and move it to `src/client/icomoon-project.json`
