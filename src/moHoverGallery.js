/**
 * Trying to do something that has been possibly done many times before...
 * 
 * @class moHoverGallery
 * @param {Object} options Configures the gallery.
 * @constructor
 */
function moHoverGallery(options) {
    var self = this, shouldInitialize = null;
    
    // define default options
    self.elements           = {};
    self.currentElement     = null;
    self.popupClass         = null;
    self.popupId            = 'mo-hover-gallery-popup';
    self.imageWildcard      = '%IMAGEPATH%';
    self.popupTemplate      = '<img src="' + self.imageWildcard + '" alt="mo-hover-gallery-image">';
    self.positionPopup      = 'positionPopupInScreenCenter';
    self.imageCache         = [];
    self.initialIndex       = null;
    self.disableCreatePopup = false;
    self.disableClosePopup  = false;
    
    // update the options based on the passed JSON
    for (var key in options) {
        if (self.hasOwnProperty(key)) {
            self[key] = options[key];
        }
    }
    
    // create the gallery popup
    self.createPopup();
    
    // load the image cache
    self.loadImageCache();
    
    // bind the mousemove event
    $(document).on('mousemove.' + self.popupId, function(event) {
        self.onMouseMove(event);
    });
    
    // open the popup if there is a valid initial index
    shouldInitialize = self.initialIndex !== null && typeof self.elements[self.initialIndex] !== 'undefined';
    if (shouldInitialize) {
        this.openPopup(self.elements[self.initialIndex]);
    }
}

/**
 * Creates a new div element appended to the body if it's missing. Can be disabled
 * by the disableCreatePopup flag.
 * 
 * @throws {Exception} When the popup has been already created. 
 * @returns {undefined}
 */
moHoverGallery.prototype.createPopup = function() {
    var htmlClass;
    if (this.disableCreatePopup === false) {
        if (this.selectPopup().length === 0) {
            htmlClass = this.popupClass === null ? '' : ' class="' + this.popupClass + '"';
            $(document.body).append('<div id="' + this.popupId + '"' + htmlClass + ' style="visibility: hidden;"></div>');
        } else {
            throw 'Popup with id \'' + this.popupId + '\' already exists.';
        }
    }
};

/**
 * Loads the popup content and makes it visible only if an image can be
 * extracted from the element parameter.
 * 
 * @param {Object} element
 * @returns {undefined}
 */
moHoverGallery.prototype.openPopup = function(element) {
    var popup     = this.selectPopup(),
        imagePath = this.getImageFromElement(element);
    if (imagePath !== null) {
        this.currentElement = element;
        popup.html(this.popupTemplate.replace(this.imageWildcard, imagePath));
        this[this.positionPopup]();
        popup.css({opacity: 0, visibility: 'visible'}).animate({opacity: 1.0}, 200);
    }
};

/**
 * Hides the popup. Can be disabled by the disableClosePopup flag.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.closePopup = function() {
    var popup = this.selectPopup();
    if (this.disableClosePopup === false) {
        this.currentElement = null;
        popup.html('');
        popup.css('visibility', 'hidden');
    }
};

/**
 * Puts the popup in the center of the screen.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.positionPopupInScreenCenter = function() {
    var winHeight = $(window).height(),
        winWidth  = $(window).width(),
        popup     = this.selectPopup(),
        top       = (winHeight - popup.height()) / 2,
        left      = (winWidth - popup.width()) / 2;
    popup.css('top', top);
    popup.css('left', left);
};

/**
 * Puts the popup relative to the hovered element starting from it's center.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.positionPopupRelativeToElement = function() {
    var element  = $(this.currentElement),
        position = element.position(),
        popup    = this.selectPopup(),
        top      = position.top + (element.height() / 2),
        left     = position.left + (element.width() / 2);
    popup.css('top', top);
    popup.css('left', left);
};

/**
 * Leaves the popup where it is.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.positionPopupStatically = function() {
    // nothing to do here really...
};

/**
 * Tries to select the popup of the current gallery.
 * 
 * @returns {Object}
 */
moHoverGallery.prototype.selectPopup = function() {
    return $('div#' + this.popupId);
};

/**
 * Extracts an element out of the gallery elements collection if the passed 
 * coordinates are within it.
 * 
 * @param {Number} top The Y coordinate to search in.
 * @param {Number} left The X coordinate to search in.
 * @returns {Object|null}
 */
moHoverGallery.prototype.getElementByCoords = function(top, left) {
    var matchedElement = null;
    if (typeof this.elements.get === 'function') {
        this.elements.each(function(index, value) {
            var element  = $(value),
                position = element.offset(),
                elTop    = position.top,
                elLeft   = position.left,
                elRight  = elLeft + element.width(),
                elBottom = elTop + element.height(),
                fitsX    = left >= elLeft && left <= elRight,
                fitsY    = top >= elTop && top <= elBottom;
            if (fitsX && fitsY) {
                matchedElement = value;
            }
        });
    }
    
    return matchedElement;
};

/**
 * Extracts an image out of an element. Override this method if you want to make
 * custom image path extractions.
 * 
 * @param {Object} element The element to extract image from.
 * @returns {Object|null}
 */
moHoverGallery.prototype.getImageFromElement = function(element) {
    var imagePath = $(element).find('a').attr('href');
        
    return typeof imagePath === 'undefined' ? null : imagePath;
};

/**
 * Adds a custom check so extra rules can defined for when the mouse is over an
 * element. This is usefull if you want a scrolling gallery for example.
 * 
 * @param {Object} event A mouse move event.
 * @returns {Boolean}
 */
moHoverGallery.prototype.customIsOverElement = function(event) {
    console.log('damn');
    
    return true;
};

/**
 * Handles mouse move events.
 * 
 * @param {Object} event A mouse move event.
 * @returns {undefined}
 */
moHoverGallery.prototype.onMouseMove = function(event) {
    var element       = this.getElementByCoords(event.pageY, event.pageX),
        isOverElement = element !== null && this.customIsOverElement(event),
        isAlreadyOpen = isOverElement && element === this.currentElement;
    if (isOverElement) {
        if (!isAlreadyOpen) {
            this.openPopup(element);
        }
    } else {
        this.closePopup();
    }
};

/**
 * Caches the images that are going to be loaded so things loaded quickly.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.loadImageCache = function() {
    var self = this;
    if (typeof this.elements.get === 'function') {
        this.elements.each(function(index, value) {
            var imagePath = self.getImageFromElement(value),
                img       = null;
            if (imagePath !== null) {
                img     = new Image();
                img.src = imagePath;
                self.imageCache[index] = img;
            }
        });
    }
};

/**
 * Removes all external relations of the gallery instance (as we know you there
 * is no easy object deletion in JavaScript). 
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.destroy = function() {
    this.selectPopup().remove();
    $(document).off('mousemove.' + this.popupId);
    this.elements = {};
};
