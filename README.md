# Mishedone's JavaScript hover gallery

### Short description

This class creates a "hover" gallery from a set of HTML elements (thumbs). When 
the user hovers one of those elements a corresponding image is loaded in a popup. 
This way the user can view the whole gallery with no mouse clicks at all.

The class currently supports 3 different popup positioning methods - in the center 
of the screen, next to the hovered thumb and in a statically positioned element. 
Custom positioning methods can be easily created and applied.

An image caching mechanism is implemented for faster image loading.

The class is fully covered with Jasmine specs.

### Dependencies

The class is using basic jQuery functionality like selectors. It has been tested 
with jQuery 1.10.2. 

### Browsers

I've tried running the Jasmine tests on Firefox, IE (7 and above), Chrome, Opera 
and Safari and got only greens.

### Example

To apply the hover gallery you need an HTML and a JavaScript part. In the HTML 
part you must provide a list of elements (thumbs). Each of those elements should 
contain an anchor tag with a href pointing to the image you want to load in the 
popup on hover. This is the default behaviour of the class but it's easily 
changeable - just override the getImageFromThumb(thumb) method and you're good 
to go with your custom HTML structure. Here is a short example HTML code:

```php
<ul>
    <li class="hover-thumb">
        <a href="images/barbarian.jpg">
            <img src="images/thumbs/barbarian.jpg" width="80" height="60" alt="barbarian" />
        </a>
    </li>
    <li class="hover-thumb">
        <a href="images/last-battle.jpg">
            <img src="images/thumbs/last-battle.jpg" width="80" height="60" alt="last-battle" />
        </a>
    </li>
    <li class="hover-thumb">
        <a href="images/map.jpg">
            <img src="images/thumbs/map.jpg" width="80" height="60" alt="map" />
        </a>
    </li>
</ul>
```

And... That's all with the HTML. Now the JavaScript - you just have to create an 
instance of the gallery class. You can configure the gallery by passing an 
options JSON when creating it or by directly changing it's properties afterwards 
(look below for a list of the supported class variables and methods). Here is a 
short example JavaScript code:

```javascript
new moHoverGallery({
    thumbs: $('.hover-thumb')
});
```

### How it works

Basically it's really simple. When a hover gallery object is created it does a 
couple of things - creates the popup, loads the image cache and binds a mouse 
move event to the document. When the user moves the mouse the class checks if it 
is over one of the thumbs or not. If so an open popup sequence starts - popup
content is loaded, the popup is positioned and made visible. When the mouse 
leaves the thumb - the popup is closed. This is the default behaviour which can 
be tweaked in many ways either by the out of the box options or by replacing 
some class methods.

### Class variables

| Variable        | Description 
| --------------- | -----------
| thumbs          | A list of the elements that open the popup when hovered.
| current         | Contains the currently opened thumb.
| popupClass      | Class of the popup container (default: null).
| popupId         | Id of the popup container (must be unique for each gallery, default: mo-hover-gallery-popup).
| imageWildcard   | It is used for creating the HTML content of the popup container while opening.
| popupTemplate   | A template that replaces the HTML of the popup container each time it is opened, here the image wildcard is replaced with a path to the opened image.
| positionPopup   | The name of the positioning function that will be used before each popup opening (default: positionPopupInScreenCenter).
| imageCache      | Container for the cached images.
| startIndex      | The index of the thumb that should be opened when the gallery is created.
| skipCreatePopup | Forces the gallery NOT to create it's own popup (default: false).
| skipClosePopup  | Forces the gallery NOT to close the popup when the mouse leaves a thumb (default: false).

### Class methods

| Method                                  | Description 
| --------------------------------------- | -----------
| createPopup()                           | Creates a new div element appended to the body if it's missing. Can be skipped by the skipCreatePopup flag.
| openPopup(thumb)                        | Loads the popup content and makes it visible only if an image can be extracted from the thumb parameter. 
| closePopup()                            | Hides the popup. Can be skipped by the skipClosePopup flag.
| positionPopupInScreenCenter()           | Puts the popup in the center of the screen.
| positionPopupRelativeToThumb()          | Puts the popup relative to the hovered thumb starting from it's center.
| positionPopupStatically()               | Leaves the popup where it is.
|                                         | You can define all kinds of other position methods and set the positionPopup variable of the class to use them.
| selectPopup()                           | Tries to select the popup of the current gallery.
| getElementCoords(element)               | Returns the coordinates of a DOM element as JSON - top, bottom, left, right.
| isPositionInElement(left, top, element) | Checks whether a certain position is within a certain DOM element.
| getThumbByCoords(left, top)             | Extracts a thumb out of the gallery thumbs collection if the passed coordinates are within it.
| getImageFromThumb(thumb)                | Extracts an image out of a thumb. Override this method if you want to make custom image path extractions.
| isOverThumb(event)                      | Can provide extra rules when checking whether the mouse is over a thumb or not. This is useful if you want a scrolling gallery for example.
| onMouseMove(event)                      | Handles mouse move events.
| loadImageCache()                        | Caches the images that are going to be loaded so things are done faster.
| destroy()                               | Removes all external relations of the gallery instance (as we know there is no easy object deletion in JavaScript). 

### How to run the tests

It can't be simpler - just open the provided tests/SpecRunner.html in your browser.

### Something has to be fixed?

This is v1.0 of the class so I'm open for all kinds of feedback - comments, 
constructive criticism, bug reports etc. I'm looking forward for improving the 
features and adding new ones when needed.
