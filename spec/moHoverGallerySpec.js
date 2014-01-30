$(document).ready(function() {
    // initialize test html and styles
    $(document.body).append('<div class="mo-hover-gallery"></div>');
    readFile('fixtures/html/moHoverGallery.html', function(data) {
        $('div.mo-hover-gallery').html(data);
    });
    readFile('fixtures/css/moHoverGallery.css', function(data) {
        $('head').append('<style>' + data + '</style>');
    });

    // write spec
    describe('moHoverGallery', function() {
        var elements = $('.hover-element'),
            gallery  = new moHoverGallery({elements: elements, popupClass: 'mo-hover-gallery-popup'});
        beforeEach(function() {
            jQuery.fx.off = true;
        });
        afterEach(function() {
            jQuery.fx.off = false;
        });
        
        describe('when created', function() {
            it('contains a set of elements', function() {
                expect(gallery.elements).toBe(elements);
            });
            it('the elements are empty by default', function() {
                var emptyGallery = new moHoverGallery({popupId: 'empty-mo-hover-gallery-popup'});
                expect(emptyGallery.elements).toEqual({});
                emptyGallery.destroy();
            });
            it('contains a current open element (null by default)', function() {
                expect(gallery.currentElement).toBeNull();
            });
            it('contains a popup class (null by default)', function() {
                var noClassGallery = new moHoverGallery({popupId: 'no-class-mo-hover-gallery-popup'});
                expect(noClassGallery.popupClass).toBeNull();
                noClassGallery.destroy();
            });
            it('contains a popup id (\'mo-hover-gallery-popup\' by default)', function() {
                expect(gallery.popupId).toBe('mo-hover-gallery-popup');
            });
            it('contains an image wildcard (\'%IMAGEPATH%\' by default)', function() {
                expect(gallery.imageWildcard).toBe('%IMAGEPATH%');
            });
            it('contains a popup html template reloaded on each opening', function() {
                expect(gallery.popupTemplate).toBeDefined();
            });
            it('the popup template contains an img tag with the image wildcard by default', function() {
                expect(gallery.popupTemplate).toBe('<img src="' + gallery.imageWildcard + '" alt="mo-hover-gallery-image">');
            });
            it('contains a position popup method name that is called before popup opening', function() {
                expect(gallery.positionPopup).toBe('positionPopupInScreenCenter');
            });
            it('contains an image cache object', function() {
                expect(gallery.imageCache).toBeDefined();
            });
            it('contains an element\'s index to initialize the popup with (null by default)', function() {
                expect(gallery.initialIndex).toBeNull();
            });
            it('contains a disable create popup flag (false by default)', function() {
                expect(gallery.disableCreatePopup).toBeDefined();
                expect(gallery.disableCreatePopup).toBeFalsy();
            });
            it('contains a disable close popup flag (false by default)', function() {
                expect(gallery.disableClosePopup).toBeDefined();
                expect(gallery.disableClosePopup).toBeFalsy();
            });
            it('creates a popup div appended to the body', function() {
                expect(gallery.selectPopup().length).not.toBe(0);
            });
            it('loads the image cache', function() {
                expect(gallery.imageCache.length).toBe(3);
            });
            it('binds the on mouse move event with the corresponding method', function() {
                spyOn(gallery, 'onMouseMove');
                $(document).mousemove();
                expect(gallery.onMouseMove.calls.count()).toBe(1);
            });
            it('initializes the gallery if the initial index is valid', function() {
                var initGallery = new moHoverGallery({elements: elements, popupId: 'init-mo-hover-gallery-popup', initialIndex: 0});
                expect(initGallery.currentElement).toBe(initGallery.elements[0]);
                initGallery.destroy();
            });
            it('does not initialize the gallery if the initial index is invalid', function() {
                var initGallery = new moHoverGallery({elements: elements, popupId: 'init-mo-hover-gallery-popup', initialIndex: 4});
                expect(initGallery.currentElement).toBeNull();
                initGallery.destroy();
            });
        });    
        
        describe('can create a popup for hovered images', function() {
            it('appended to the body', function() {
                gallery.selectPopup().remove();
                gallery.createPopup();
                expect(gallery.selectPopup().length).toBe(1);
            });
            it('that has a certain class', function() {
                expect(gallery.selectPopup().hasClass('mo-hover-gallery-popup')).toBeTruthy();
            });
            it('that is invisible at first', function() {
                expect(gallery.selectPopup().css('visibility')).toBe('hidden');
            });
            it('but throws an exception if such popup already exists', function() {
                var secondGallery = new moHoverGallery({popupId: 'second-mo-hover-gallery-popup'});
                expect(function() {
                    secondGallery.createPopup();
                }).toThrow();
                secondGallery.destroy();
            });
            it('that is actually not created if the disable create popup flag is true', function() {
                var noPopupGallery = new moHoverGallery({popupId: 'no-popup-mo-hover-gallery-popup', disableCreatePopup: true});
                expect(noPopupGallery.selectPopup().length).toBe(0);
                noPopupGallery.destroy();
            });
        });
        
        describe('can open the popup', function() {
            afterEach(function() {
                gallery.closePopup();
            });
            it('by extracting the image path from the passed element', function() {
                spyOn(gallery, 'getImageFromElement');
                gallery.openPopup(gallery.elements[0]);
                gallery.closePopup();
                gallery.openPopup({});
                expect(gallery.getImageFromElement.calls.count()).toBe(2);
            });
            describe('when an image path has been found', function() {
                beforeEach(function() {
                    gallery.openPopup(gallery.elements[0]);
                });
                it('by setting the current element to the passed element', function() {
                    expect(gallery.currentElement).toBe(gallery.elements[0]);
                });
                it('by replacing the popup html with the combined popup template and target image', function() {
                    var popupImg     = $(gallery.selectPopup().html()),
                        generatedImg = $(gallery.popupTemplate.replace(gallery.imageWildcard, 'images/barbarian.jpg'));
                    expect(popupImg.attr('src')).toEqual(generatedImg.attr('src'));
                });
                it('by calling the configured position popup method', function() {
                    spyOn(gallery, 'positionPopupInScreenCenter');
                    gallery.closePopup();
                    gallery.openPopup(gallery.elements[0]);
                    expect(gallery.positionPopupInScreenCenter.calls.count()).toBe(1);
                });
                it('by making it visible', function() {
                    expect(gallery.selectPopup().css('visibility')).toBe('visible');
                });
            });
            describe('or... not really open it when an image path is not found', function() {
                beforeEach(function() {
                    gallery.openPopup({});
                });
                it('by not setting the current element', function() {
                    expect(gallery.currentElement).not.toBe({});
                });
                it('by not replacing the popup html', function() {
                    expect(gallery.selectPopup().html()).toBe('');
                });
                it('by not calling the configured position popup method', function() {
                    spyOn(gallery, 'positionPopupInScreenCenter');
                    gallery.closePopup();
                    gallery.openPopup({});
                    expect(gallery.positionPopupInScreenCenter.calls.count()).toBe(0);
                });
                it('by not making it visible', function() {
                    expect(gallery.selectPopup().css('visibility')).toBe('hidden');
                });
            });
        });
        
        describe('can close the popup', function() {
            beforeEach(function() {
                gallery.openPopup(gallery.elements[0]);
                gallery.closePopup();
            });
            it('only if the disable close popup flag is false', function() {
                gallery.disableClosePopup = true;
                gallery.openPopup(gallery.elements[0]);
                gallery.closePopup();
                expect(gallery.currentElement).not.toBeNull();
                expect(gallery.selectPopup().html()).not.toEqual('');
                expect(gallery.selectPopup().css('visibility')).toBe('visible');
                gallery.disableClosePopup = false;
                gallery.closePopup();
            });
            it('by setting the current element to null', function() {
                expect(gallery.currentElement).toBeNull();
            });
            it('by removing it\'s content', function() {
                expect(gallery.selectPopup().html()).toBe('');
            });
            it('by making it invisible', function() {
                expect(gallery.selectPopup().css('visibility')).toBe('hidden');
            });
        });
        
        describe('can position the popup', function() {
            afterEach(function() {
                gallery.closePopup();
                gallery.positionPopup = 'positionPopupInScreenCenter';
            });
            it('in the center of the screen', function() {
                var winHeight    = $(window).height(),
                    winWidth     = $(window).width(),
                    popup        = gallery.selectPopup(),
                    expectedTop  = 0,
                    expectedLeft = 0,
                    realTop      = 0,
                    realLeft     = 0;
                gallery.openPopup(gallery.elements[0]);
                expectedTop  = (winHeight - popup.height()) / 2;
                expectedLeft = (winWidth - popup.width()) / 2;
                realTop      = popup.css('top').replace('px', '') * 1;
                realLeft     = popup.css('left').replace('px', '') * 1;
                expect(Math.floor(realTop)).toBe(Math.floor(expectedTop));
                expect(Math.floor(realLeft)).toBe(Math.floor(expectedLeft));
            });
            it('next to a gallery element', function() {
                var popup    = gallery.selectPopup(),
                    position = null;
                gallery.positionPopup = 'positionPopupRelativeToElement';
                gallery.openPopup(gallery.elements[0]);
                position = $(gallery.elements[0]).position();
                expect(popup.css('top')).toBe((position.top + 30) + 'px');
                expect(popup.css('left')).toBe((position.left + 40) + 'px');
            });
            it('right where it is', function() {
                var popup = gallery.selectPopup();
                popup.css('top', '10px');
                popup.css('right', '10px');
                gallery.positionPopup = 'positionPopupStatically';
                gallery.openPopup(gallery.elements[0]);
                expect(popup.css('top')).toBe('10px');
                expect(popup.css('right')).toBe('10px');
            });
        });
        
        describe('can select the popup', function() {
            it('based on it\'s id', function() {
                expect(gallery.selectPopup()).toEqual($('div#' + gallery.popupId));
            });
        });
        
        describe('can identify a certain element in the set', function() {
            it('based on a pair of coordinates', function() {
                expect(gallery.getElementByCoords(25, 30)).toEqual(elements[0]);
            });
            it('and returns null if no match is found', function() {
                expect(gallery.getElementByCoords(200, 200)).toBeNull();
            });
        });
        
        describe('can get an image path from a certain element in the set', function() {
            it('based on the href of it\'s child anchor by default', function() {
                expect(gallery.getImageFromElement(elements[0])).toBe('images/barbarian.jpg');
            });
            it('and returns null if nothing could be found', function() {
                expect(gallery.getImageFromElement('sgogurmos')).toBeNull();
            });
        });
        
        describe('can check a custom is over element rule - a method with the same name', function() {
            it('that returns true by default', function() {
                expect(gallery.customIsOverElement()).toBeTruthy();
            });
        });
        
        describe('can handle mouse moves', function() {
            afterEach(function() {
                gallery.closePopup();
            });
            it('by checking if the mouse is over an element', function() {
                spyOn(gallery, 'getElementByCoords');
                gallery.onMouseMove({pageX: 200, pageY: 200});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.getElementByCoords.calls.count()).toBe(2);
            });
            it('by checking if the custom is over element rule is ok with the current mouse coordinates', function() {
                spyOn(gallery, 'customIsOverElement');
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.customIsOverElement.calls.count()).toBe(1);
            });
            it('by opening the popup if the mouse is over an element', function() {
                spyOn(gallery, 'openPopup');
                gallery.onMouseMove({pageX: 200, pageY: 200});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.openPopup.calls.count()).toBe(1);
            });
            it('by not opening the popup if the mouse is over an already open element', function() {
                spyOn(gallery, 'openPopup').and.callThrough();
                gallery.onMouseMove({pageX: 20, pageY: 20});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.openPopup.calls.count()).toBe(1);
            });
            it('by closing the popup if the mouse is not over an element', function() {
                spyOn(gallery, 'closePopup');
                gallery.onMouseMove({pageX: 20, pageY: 20});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                gallery.onMouseMove({pageX: 200, pageY: 200});
                expect(gallery.closePopup.calls.count()).toBe(1);
            });
            it('always being sure to not switch the places of X and Y', function() {
                spyOn(gallery, 'getElementByCoords');
                gallery.onMouseMove({pageX: 25, pageY: 20});
                expect(gallery.getElementByCoords).toHaveBeenCalledWith(20, 25);
            });
        });
        
        describe('can load images into cache', function() {
            it('by creating an image object for each element', function() {
                var expectedImg = new Image();
                expectedImg.src = 'images/barbarian.jpg';
                gallery.loadImageCache();
                expect(gallery.imageCache[0].src).toEqual(expectedImg.src);
                expect(gallery.imageCache.length).toBe(3);
            });
        });
        
        describe('can be destroyed when not needed', function() {
            it('by removing all related properties', function() {
                var popupId     = gallery.popupId,
                    docEvents   = null,
                    eventExists = false,
                    counter     = 0;
                gallery.destroy();
                docEvents = $._data($(document)[0], 'events');
                expect(gallery.elements).toEqual({});
                expect(gallery.selectPopup().length).toBe(0);
                if (typeof docEvents !== 'undefined') {
                    for (counter; counter < docEvents['mousemove'].length; counter++) {
                        if (docEvents['mousemove'][counter]['namespace'] === popupId) {
                            eventExists = true;
                        }
                    }
                }
                expect(eventExists).toBeFalsy();
            });
        });
    });
    
    // instantiate a human testable gallery
    new moHoverGallery({
        elements: $('.hover-element'), 
        popupId: 'test-mo-hover-gallery', 
        popupClass: 'static-mo-hover-gallery-popup',
        positionPopup: 'positionPopupStatically',
        disableClosePopup: true,
        initialIndex: 0
    });
});

function readFile(url, callback) {
    // must be synchronous to guarantee that no tests are run before fixture is loaded
    $.ajax({
        async: false,
        cache: false,
        url: url,
        success: function(data) {
            callback(data);
        }
    });
}

// new feature
// - have a flag for disabling the create popup method
