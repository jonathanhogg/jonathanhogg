
const ScrollPeriod = 300,
      ScrollWait = 200,
      ScrollInterval = 20,
      ScrollUp = document.getElementById('scroll-up'),
      ScrollDown = document.getElementById('scroll-down');

var scrolling = false,
    scrollStartTime,
    scrollStartPosition,
    scrollDestination,
    scrollTimeout = undefined;

function scroller()
{
    var now = performance.now();
    if (now > scrollStartTime)
    {
        var t = Math.min(1, (now-scrollStartTime)/ScrollPeriod),
            position = (scrollDestination-scrollStartPosition)*(1-Math.cos(t*Math.PI))/2 + scrollStartPosition;
        scrolling = true;
        window.scrollTo(0, position);
    }
    if (now < scrollStartTime+ScrollPeriod)
        scrollTimeout = setTimeout(scroller, ScrollInterval);
    else
    {
        scrollTimeout = undefined;
        scrolling = false;
    }
}

function scrollPage(direction)
{
    scrollStartTime = performance.now();
    scrollStartPosition = window.pageYOffset;
    scrollDestination = Math.trunc(scrollStartPosition/window.innerHeight+direction)*window.innerHeight;
    scroller();
}

function update()
{
    var pageHeight = window.innerHeight,
        scrollTop = window.pageYOffset,
        offset = scrollTop % pageHeight;
    if (document.body.clientHeight != pageHeight)
        document.body.style.height = pageHeight.toString() + "px";
    if (offset > pageHeight/2)
        offset -= pageHeight;
    if (!scrolling)
    {
        scrollStartTime = performance.now() + ScrollWait;
        scrollStartPosition = scrollTop;
        scrollDestination = scrollStartPosition - offset;
        if (scrollTimeout != undefined)
            clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(scroller, ScrollWait);
    }
    var opacity = Math.max(0, 0.5-Math.abs(2*offset/pageHeight));
    ScrollUp.style.opacity = opacity;
    ScrollUp.style.display = scrollTop > pageHeight/2 ? 'block' : 'none';
    ScrollDown.style.opacity = opacity;
    ScrollDown.style.display = scrollTop < document.body.scrollHeight-pageHeight*1.5 ? 'block' : 'none';
}

window.addEventListener('scroll', update);
window.addEventListener('resize', update);

ScrollUp.onclick = () => scrollPage(-1);
ScrollDown.onclick = () => scrollPage(+1);

update();

