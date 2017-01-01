
const SHOW_DELAY = 2000;
const SIZE_RATIO = 0.75;
const ROTATION_MAX = 5;


function Slideshow(selector, urls)
{
    this.selector = selector;
    this.urls = urls;
    this.index = 0;
}

Slideshow.prototype.start = function()
{
    this.image = new Image();
    var _this = this;
    this.image.onload = function() { _this.loaded() };
    this.preload();
}

Slideshow.prototype.stop = function()
{
    if (this.image != null)
    {
        this.image.onload = null;
        this.image = null;
    }
}

Slideshow.prototype.preload = function()
{
    if (this.image != null)
        this.image.src = this.urls[this.index % this.urls.length];
}

Slideshow.prototype.loaded = function()
{
    var gallerypane = $(this.selector);
    var pane_width = gallerypane.width();
    var pane_height = gallerypane.height();
    var pane_offset = gallerypane.offset();
    var n = this.urls.length;
    var url = this.image.src;
    if ( this.index >= n )
    {
        var image = $('#image' + (this.index % n));
        image.detach();
    }
    var image_width = this.image.width;
    var image_height = this.image.height;
    var max_height = pane_height * SIZE_RATIO;
    var max_width = pane_width * SIZE_RATIO;
    if ( image_height > max_height )
    {
        image_width /= image_height / max_height;
        image_height = max_height;
    }
    if ( image_width > max_width )
    {
        image_height /= image_width / max_width;
        image_width = max_width;
    }
    var image_top = Math.floor(Math.random() * (pane_height - image_height)) + pane_offset.top;
    var image_left = Math.floor(Math.random() * (pane_width - image_width)) + pane_offset.left;
    var image_rotation = Math.round((Math.random() * 20 - 10) * ROTATION_MAX) / 10;
    var imageid = "image" + (this.index % n);
    gallerypane.append('<img id="' + imageid + '" class="galleryimage" src="' + url + 
                       '" width="' + image_width + '" height="' + image_height +
                       '" style="top: ' + image_top + 'px; left: ' + image_left + 
                       'px; -webkit-transform: rotate(' + image_rotation + 
                       'deg); -moz-transform: rotate(' + image_rotation + 'deg);"/>');
    this.index++;
    var image = $('#' + imageid);
    var _this = this;
    image.fadeIn('slow').delay(SHOW_DELAY).queue(function() { _this.preload() });
}


