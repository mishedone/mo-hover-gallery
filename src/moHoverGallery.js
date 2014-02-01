/**
 * Trying to do something that has been possibly done many times before...
 * 
 * @class moHoverGallery
 * @param {Object} options Configures the gallery.
 * @constructor
 */
function moHoverGallery(options) {
    var self = this, start = null;
    
    // define default options
    self.thumbs          = {};
    self.current         = null;
    self.popupClass      = null;
    self.popupId         = 'mo-hover-gallery-popup';
    self.imageWildcard   = '%IMAGEPATH%';
    self.popupTemplate   = '<img src="' + self.imageWildcard + '" alt="mo-hover-gallery-image">';
    self.positionPopup   = 'positionPopupInScreenCenter';
    self.imageCache      = [];
    self.startIndex      = null;
    self.skipCreatePopup = false;
    self.skipClosePopup  = false;
    
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
    
    // open the popup if there is a valid start index
    start = self.startIndex !== null && typeof self.thumbs[self.startIndex] !== 'undefined';
    if (start) {
        this.openPopup(self.thumbs[self.startIndex]);
    }
}

/**
 * Creates a new div element appended to the body if it's missing. Can be skipped
 * by the skipCreatePopup flag.
 * 
 * @throws {Exception} When the popup has been already created. 
 * @returns {undefined}
 */
moHoverGallery.prototype.createPopup = function() {
    var htmlClass;
    if (this.skipCreatePopup === false) {
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
 * extracted from the thumb parameter.
 * 
 * @param {Object} thumb
 * @returns {undefined}
 */
moHoverGallery.prototype.openPopup = function(thumb) {
    var popup     = this.selectPopup(),
        imagePath = this.getImageFromThumb(thumb);
    if (imagePath !== null) {
        this.current = thumb;
        popup.html(this.popupTemplate.replace(this.imageWildcard, imagePath));
        this[this.positionPopup]();
        popup.css({opacity: 0, visibility: 'visible'}).animate({opacity: 1.0}, 200);
    }
};

/**
 * Hides the popup. Can be skipped by the skipClosePopup flag.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.closePopup = function() {
    var popup = this.selectPopup();
    if (this.skipClosePopup === false) {
        this.current = null;
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
 * Puts the popup relative to the hovered thumb starting from it's center.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.positionPopupRelativeToThumb = function() {
    var thumb    = $(this.current),
        position = thumb.position(),
        popup    = this.selectPopup(),
        top      = position.top + (thumb.height() / 2),
        left     = position.left + (thumb.width() / 2);
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
 * Returns the coordinates of a DOM element - top, bottom, left, right.
 * 
 * @param {Object} element
 * @returns {Object}
 */
moHoverGallery.prototype.getElementCoords = function(element) {
    var object = $(element),
        offset = object.offset();
    
    return {
        top: offset.top,
        left: offset.left,
        bottom: offset.top + object.height(),
        right: offset.left + object.width()
    };
};

/**
 * Checks whether a certain position is within a certain DOM element.
 * 
 * @param {Number} top The Y position.
 * @param {Number} left The X position.
 * @param {Object} element
 * @returns {Boolean}
 */
moHoverGallery.prototype.isPositionInElement = function(top, left, element) {
    var coords = this.getElementCoords(element),
        fitsX  = left >= coords.left && left <= coords.right,
        fitsY  = top >= coords.top && top <= coords.bottom;

    return fitsX && fitsY ? true : false;
};

/**
 * Extracts a thumb out of the gallery thumbs collection if the passed 
 * coordinates are within it.
 * 
 * @param {Number} top The Y coordinate to search in.
 * @param {Number} left The X coordinate to search in.
 * @returns {Object|null}
 */
moHoverGallery.prototype.getThumbByCoords = function(top, left) {
    var self         = this,
        matchedThumb = null;
    if (typeof this.thumbs.get === 'function') {
        this.thumbs.each(function(index, value) {
            if (self.isPositionInElement(top, left, value)) {
                matchedThumb = value;
            }
        });
    }
    
    return matchedThumb;
};

/**
 * Extracts an image out of a thumb. Override this method if you want to make
 * custom image path extractions.
 * 
 * @param {Object} thumb The thumb to extract image from.
 * @returns {Object|null}
 */
moHoverGallery.prototype.getImageFromThumb = function(thumb) {
    var imagePath = $(thumb).find('a').attr('href');
        
    return typeof imagePath === 'undefined' ? null : imagePath;
};

/**
 * Adds a custom check so extra rules can defined for when the mouse is over a 
 * thumb or not. This is usefull if you want a scrolling gallery for example.
 * 
 * @param {Object} event A mouse move event.
 * @returns {Boolean}
 */
moHoverGallery.prototype.isOverThumb = function(event) {
    return true;
};

/**
 * Handles mouse move events.
 * 
 * @param {Object} event A mouse move event.
 * @returns {undefined}
 */
moHoverGallery.prototype.onMouseMove = function(event) {
    var thumb         = this.getThumbByCoords(event.pageY, event.pageX),
        isOverThumb   = thumb !== null && this.isOverThumb(event),
        isAlreadyOpen = isOverThumb && thumb === this.current;
    if (isOverThumb) {
        if (!isAlreadyOpen) {
            this.openPopup(thumb);
        }
    } else {
        this.closePopup();
    }
};

/**
 * Caches the images that are going to be loaded so things are loaded quickly.
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.loadImageCache = function() {
    var self = this;
    if (typeof this.thumbs.get === 'function') {
        this.thumbs.each(function(index, value) {
            var imagePath = self.getImageFromThumb(value),
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
 * Removes all external relations of the gallery instance (as we know there
 * is no easy object deletion in JavaScript). 
 * 
 * @returns {undefined}
 */
moHoverGallery.prototype.destroy = function() {
    this.selectPopup().remove();
    $(document).off('mousemove.' + this.popupId);
    this.thumbs = {};
};
