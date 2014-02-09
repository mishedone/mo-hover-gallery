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
        var thumbs  = $('.hover-thumb'),
            gallery = new moHoverGallery({thumbs: thumbs, popupClass: 'mo-hover-gallery-popup'});
        beforeEach(function() {
            jQuery.fx.off = true;
        });
        afterEach(function() {
            jQuery.fx.off = false;
        });
        
        describe('when created', function() {
            it('contains a set of thumbs', function() {
                expect(gallery.thumbs).toBe(thumbs);
            });
            it('the thumbs are empty by default', function() {
                var emptyGallery = new moHoverGallery({popupId: 'empty-mo-hover-gallery-popup'});
                expect(emptyGallery.thumbs).toEqual({});
                emptyGallery.destroy();
            });
            it('contains a current open thumb (null by default)', function() {
                expect(gallery.current).toBeNull();
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
            it('contains a thumb\'s index to start the gallery with (null by default)', function() {
                expect(gallery.startIndex).toBeNull();
            });
            it('contains a skip create popup flag (false by default)', function() {
                expect(gallery.skipCreatePopup).toBeDefined();
                expect(gallery.skipCreatePopup).toBeFalsy();
            });
            it('contains a skip close popup flag (false by default)', function() {
                expect(gallery.skipClosePopup).toBeDefined();
                expect(gallery.skipClosePopup).toBeFalsy();
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
            it('initializes the gallery if the start index is valid', function() {
                jasmine.clock().install();
                var startGallery = new moHoverGallery({thumbs: thumbs, popupId: 'init-mo-hover-gallery-popup', startIndex: 0});
                jasmine.clock().tick(150);
                expect(startGallery.current).toBe(startGallery.thumbs[0]);
                startGallery.destroy();
                jasmine.clock().uninstall();
            });
            it('does not initialize the gallery if the start index is invalid', function() {
                var startGallery = new moHoverGallery({thumbs: thumbs, popupId: 'init-mo-hover-gallery-popup', startIndex: 4});
                expect(startGallery.current).toBeNull();
                startGallery.destroy();
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
            it('that is actually not created if the skip create popup flag is true', function() {
                var noPopupGallery = new moHoverGallery({popupId: 'no-popup-mo-hover-gallery-popup', skipCreatePopup: true});
                expect(noPopupGallery.selectPopup().length).toBe(0);
                noPopupGallery.destroy();
            });
        });
        
        describe('can open the popup', function() {
            afterEach(function() {
                gallery.closePopup();
            });
            it('by extracting the image path from the passed thumb', function() {
                spyOn(gallery, 'getImageFromThumb');
                gallery.openPopup(gallery.thumbs[0]);
                gallery.closePopup();
                gallery.openPopup({});
                expect(gallery.getImageFromThumb.calls.count()).toBe(2);
            });
            describe('when an image path has been found', function() {
                beforeEach(function() {
                    gallery.openPopup(gallery.thumbs[0]);
                });
                it('by setting the current thumb to the passed thumb', function() {
                    expect(gallery.current).toBe(gallery.thumbs[0]);
                });
                it('by replacing the popup html with the combined popup template and target image', function() {
                    var popupImg     = $(gallery.selectPopup().html()),
                        generatedImg = $(gallery.popupTemplate.replace(gallery.imageWildcard, 'images/barbarian.jpg'));
                    expect(popupImg.attr('src')).toEqual(generatedImg.attr('src'));
                });
                it('by calling the configured position popup method', function() {
                    spyOn(gallery, 'positionPopupInScreenCenter');
                    gallery.closePopup();
                    gallery.openPopup(gallery.thumbs[0]);
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
                it('by not setting the current thumb', function() {
                    expect(gallery.current).not.toBe({});
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
                gallery.openPopup(gallery.thumbs[0]);
                gallery.closePopup();
            });
            it('only if the skip close popup flag is false', function() {
                gallery.skipClosePopup = true;
                gallery.openPopup(gallery.thumbs[0]);
                gallery.closePopup();
                expect(gallery.current).not.toBeNull();
                expect(gallery.selectPopup().html()).not.toEqual('');
                expect(gallery.selectPopup().css('visibility')).toBe('visible');
                gallery.skipClosePopup = false;
                gallery.closePopup();
            });
            it('by setting the current thumb to null', function() {
                expect(gallery.current).toBeNull();
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
                gallery.openPopup(gallery.thumbs[0]);
                expectedTop  = (winHeight - popup.height()) / 2;
                expectedLeft = (winWidth - popup.width()) / 2;
                realTop      = popup.css('top').replace('px', '') * 1;
                realLeft     = popup.css('left').replace('px', '') * 1;
                expect(Math.floor(realTop)).toBe(Math.floor(expectedTop));
                expect(Math.floor(realLeft)).toBe(Math.floor(expectedLeft));
            });
            it('next to a gallery thumb', function() {
                var popup    = gallery.selectPopup(),
                    position = null;
                gallery.positionPopup = 'positionPopupRelativeToThumb';
                gallery.openPopup(gallery.thumbs[0]);
                position = $(gallery.thumbs[0]).position();
                expect(popup.css('top')).toBe((position.top + 30) + 'px');
                expect(popup.css('left')).toBe((position.left + 40) + 'px');
            });
            it('right where it is', function() {
                var popup = gallery.selectPopup();
                popup.css('top', '10px');
                popup.css('right', '10px');
                gallery.positionPopup = 'positionPopupStatically';
                gallery.openPopup(gallery.thumbs[0]);
                expect(popup.css('top')).toBe('10px');
                expect(popup.css('right')).toBe('10px');
            });
        });
        
        describe('can select the popup', function() {
            it('based on it\'s id', function() {
                expect(gallery.selectPopup()).toEqual($('div#' + gallery.popupId));
            });
        });
        
        describe('can get the coordinates of an element', function() {
            it('based on it\'s properties', function() {
                var offset = $('body').offset();
                expect(gallery.getElementCoords(thumbs[0])).toEqual({
                    top: offset.top,
                    left: offset.left, 
                    bottom: offset.top + 60,
                    right: offset.left + 80
                });
            });
        });
        
        describe('can check if a certain position (X, Y) is in an element', function() {
            it('and returns true if so', function() {
                expect(gallery.isPositionInElement(25, 30, thumbs[0])).toBeTruthy();
            });
            it('and returns false if not', function() {
                expect(gallery.isPositionInElement(25, 230, thumbs[0])).toBeFalsy();
            });
            it('by using the get element coordinates method', function() {
                spyOn(gallery, 'getElementCoords').and.callThrough();;
                gallery.isPositionInElement(25, 30, thumbs[0]);
                expect(gallery.getElementCoords.calls.count()).toBe(1);
            });
        });
        
        describe('can identify a certain thumb in the set', function() {
            it('based on a pair of coordinates', function() {
                expect(gallery.getThumbByCoords(25, 30)).toEqual(thumbs[0]);
            });
            it('and returns null if no match is found', function() {
                expect(gallery.getThumbByCoords(200, 200)).toBeNull();
            });
            it('by using the is position in element method', function() {
                spyOn(gallery, 'isPositionInElement').and.callThrough();;
                gallery.getThumbByCoords(25, 30);
                expect(gallery.isPositionInElement.calls.count()).toBe(thumbs.length);
            });
        });
        
        describe('can get an image path from a certain thumb in the set', function() {
            it('based on the href of it\'s child anchor by default', function() {
                expect(gallery.getImageFromThumb(thumbs[0])).toBe('images/barbarian.jpg');
            });
            it('and returns null if nothing could be found', function() {
                expect(gallery.getImageFromThumb('sgogurmos')).toBeNull();
            });
        });
        
        describe('can check a custom is over thumb rule', function() {
            it('that returns true by default', function() {
                expect(gallery.isOverThumb()).toBeTruthy();
            });
        });
        
        describe('can handle mouse moves', function() {
            afterEach(function() {
                gallery.closePopup();
            });
            it('by checking if the mouse is over a thumb', function() {
                spyOn(gallery, 'getThumbByCoords');
                gallery.onMouseMove({pageX: 200, pageY: 200});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.getThumbByCoords.calls.count()).toBe(2);
            });
            it('by checking if the custom is over thumb rule is ok with the current mouse coordinates', function() {
                spyOn(gallery, 'isOverThumb');
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.isOverThumb.calls.count()).toBe(1);
            });
            it('by opening the popup if the mouse is over a thumb', function() {
                spyOn(gallery, 'openPopup');
                gallery.onMouseMove({pageX: 200, pageY: 200});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.openPopup.calls.count()).toBe(1);
            });
            it('by not opening the popup if the mouse is over an already open thumb', function() {
                spyOn(gallery, 'openPopup').and.callThrough();
                gallery.onMouseMove({pageX: 20, pageY: 20});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                expect(gallery.openPopup.calls.count()).toBe(1);
            });
            it('by closing the popup if the mouse is not over a thumb', function() {
                spyOn(gallery, 'closePopup');
                gallery.onMouseMove({pageX: 20, pageY: 20});
                gallery.onMouseMove({pageX: 20, pageY: 20});
                gallery.onMouseMove({pageX: 200, pageY: 200});
                expect(gallery.closePopup.calls.count()).toBe(1);
            });
            it('always being sure to not switch the places of X and Y', function() {
                spyOn(gallery, 'getThumbByCoords');
                gallery.onMouseMove({pageX: 25, pageY: 20});
                expect(gallery.getThumbByCoords).toHaveBeenCalledWith(25, 20);
            });
        });
        
        describe('can load images into cache', function() {
            it('by creating an image object for each thumb', function() {
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
                expect(gallery.thumbs).toEqual({});
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
        thumbs: $('.hover-thumb'), 
        popupId: 'test-mo-hover-gallery', 
        popupClass: 'static-mo-hover-gallery-popup',
        positionPopup: 'positionPopupStatically',
        skipClosePopup: true,
        startIndex: 0
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
