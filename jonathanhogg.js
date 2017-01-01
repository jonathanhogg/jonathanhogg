
/*
 * (C) Copyright Jonathan Hogg, 2012
 * www.jonathanhogg.com
 * All rights reserved
 */


var display = null;
var showing = null;
var slideshow = null;

var galleryurls = [
    "gallery/harp02.jpg",
    "gallery/harp03.jpg",
    "gallery/here01.jpg",
    "gallery/here02.jpg",
    "gallery/here03.jpg",
    "gallery/lost01.jpg",
    "gallery/lost02.jpg",
    "gallery/lost03.jpg",
    "gallery/message01.jpg",
    "gallery/school01.jpg",
    "gallery/school02.jpg",
    "gallery/studio01.jpg",
    "gallery/studio02.jpg",
    "gallery/tweet01.jpg",
    "gallery/tweet02.jpg",
    "gallery/tweet03.jpg",
];


$(document).ready(init);

function init()
{
    var email = 'me'+unescape('%40')+'jonathanhogg.com', link = $('#email>a');
    link.text(email);
    link.attr('href', 'mailto:'+email);

    show_section();
    if (Modernizr.hashchange)
        $(window).bind('hashchange', show_section);
    else
        $('a').click(show_section);

    if (Modernizr.touch)
    {
        $('header').click(function() {$('body').addClass('hovering');
                                      if (display) display.hideInterface();});
        $('#page').click(function() {$('body').removeClass('hovering'); window.location.hash = '#';});
    }
    else
    {
        $('header').hover(function() {$('body').addClass('hovering');
                                      if (display) display.hideInterface();},
                          function() {$('body').removeClass('hovering');});
        $('#page').click(function(e) {if (e.target == $('#page')[0]) window.location.hash = '#';});
    }

    if (Modernizr.canvastext)
        Modernizr.load({load: 'fireworks/fireworks.min.js',
                        complete: function() { display = new FireworksDisplay("#background", "#mood"); }});

    if (Modernizr.applicationcache)
        window.applicationCache.addEventListener('updateready', cache_updated);

    if (navigator.appName == 'Microsoft Internet Explorer')
        $(document.documentElement).addClass('ie');
    else
        $(document.documentElement).addClass('no-ie');

    $(window).resize(fix_height);
    fix_height();
}

function fix_height()
{
    if (!showing)
        $('header').css({top: (window.innerHeight - 150) / 2});
}

function mood(mood)
{
    if (Modernizr.touch)
        $('body').removeClass('hovering');
    if (display)
        display.changeMood(mood);
}

function show_section()
{
    $("section.targeted").removeClass('targeted');
    $("nav>a.targeter").removeClass('targeter');

    var hash = window.location.hash;
    var section = hash && hash != "#" ? $("section" + hash) : [];
    if (section.length == 1)
    {
        if (!showing)
            $('header').animate({top: '40px'}, 'fast', 'linear', finish_section);
        else
            finish_section();
        showing = section[0];
    }
    else if (showing)
    {
        $('header').animate({top: (window.innerHeight - 150) / 2});
        $("body").removeClass('activated');
        showing = null;
    }

    if (hash != '#pictures' && slideshow != null)
    {
        slideshow.stop();
    }
}

function finish_section()
{
    var hash = window.location.hash;
    var section = hash && hash != "#" ? $("section" + hash) : [];
    if (section.length == 1)
    {
        $("nav>a[href=" + hash + "]").addClass('targeter');
        $("body").addClass('activated');
        section.addClass('targeted');
        if (display)
            display.hideInterface();
        if (hash == '#pictures')
        {
            if (slideshow == null)
                slideshow = new Slideshow("#gallerypane", galleryurls);
            slideshow.start();
        }
    }
}

function cache_updated()
{
    if (window.applicationCache && window.applicationCache.status == window.applicationCache.UPDATEREADY)
    {
        window.applicationCache.swapCache();
        var title = $('header>h1>a')[0];
        if (title.innerText.substr(-1, 1) != '*')
        {
            title.innerText += "*";
            $('header a').click(link_reload);
        }
    }
}

function link_reload(e)
{
    var href = e.target.getAttribute('href');
    if (href.substr(0, 1) == '#')
    {
        e.preventDefault();
        window.location.hash = href;
        window.location.reload();
    }
}

