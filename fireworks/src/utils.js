
/*
 * Copyright 2012 (C) Jonathan Hogg
 * www.jonathanhogg.com
 * All rights reserved.
 */


function random(min, max)
{
    return Math.random() * (max-min) + min;
}

function normal()
{
    return Math.sqrt(-2*Math.log(Math.random())) * Math.cos(2*Math.PI*Math.random())
}

function choose(xs)
{
    return xs[Math.floor(random(0, xs.length-0.001))];
}

function wrap(i, n)
{
    return i < 0 ? (i % n) + n : i % n;
}

function millis()
{
    return (new Date()).getTime();
}

function angle(dx, dy)
{
    if (dx == 0)
        return dy < 0 ? 0.5*Math.PI : 1.5*Math.PI;

    return dx < 0 ? Math.atan(dy/dx) + Math.PI : Math.atan(dy/dx);
}


function FrameCounter(depth)
{
    this.max_depth = depth;
    this.frame_times = [];
    this.depth = 0;
    this.last_time = undefined;
    this.average_interval = undefined;
    this.frame_rate = undefined;
    this.full = false;
}

FrameCounter.prototype.push = pushFrameCounter;
function pushFrameCounter(time)
{
    if (this.full)
        this.frame_times.shift();
    else
        this.full = ++this.depth == this.max_depth;
    this.frame_times.push(time);
    if (this.depth > 1)
    {
        this.average_interval = (this.frame_times[this.depth-1] - this.frame_times[0]) / (this.depth-1)
        this.frame_rate = 1000 / this.average_interval;
    }
    this.last_time = time;
}

FrameCounter.prototype.test = testFrameCounter;
function testFrameCounter(time)
{
    if (this.depth > 0)
        return 1000 / (time - this.frame_times[0]) * this.depth;
    return undefined;
}

FrameCounter.prototype.reset = resetFrameCounter;
function resetFrameCounter()
{
    this.frame_times = [];
    this.depth = 0;
    this.last_time = undefined;
    this.average_interval = undefined;
    this.frame_rate = undefined;
    this.full = false;
}

