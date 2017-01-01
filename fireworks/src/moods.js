
/*
 * Copyright 2012 (C) Jonathan Hogg
 * www.jonathanhogg.com
 * All rights reserved.
 */


var Happy      = { title: "happy",      stability: 100, traits: [Streaker, Burst, Burst, Explosion] };
var InLove     = { title: "in love",    stability: 500, traits: [Rose, Rose, Crackler, Explosion] };
var Brilliant  = { title: "brilliant",  stability: 900, traits: [Crackler] };
var Attractive = { title: "attractive", stability: 500, traits: [Galaxy, Galaxy, Stars, Stars, Stars, BlackHole] };
var Relaxed    = { title: "relaxed",    stability: 500, traits: [Ring] };
var Focused    = { title: "focused",    stability: 900, traits: [Virus] };
var Fine       = { title: "fine",       stability: 900, traits: [Bawble] };
var Broken     = { title: "broken",     stability: 500, traits: [Snow, BlackDeath] };
var Isolated   = { title: "isolated",   stability: 500, traits: [Snow] };
var Depressed  = { title: "depressed",  stability: 500, traits: [Snow, WhiteHole] };
var Wired      = { title: "wired",      stability: 100, traits: [Swarm] };
var Angry      = { title: "angry",      stability: 200, traits: [RedMist, RedFist, RedPissed] };
var Anxious    = { title: "anxious",    stability: 300, traits: [GreenBlob] };
var Frustrated = { title: "frustrated", stability:  50, traits: [Flame, Flame, Flame, Explosion] };

var DefaultMood = { title: "...", traits: [Flame, Virus, Ring, Swarm, Rose, Galaxy, RedFist, GreenBlob, Bawble],
                    stability: 500, max_fireworks: 3 };

var TestMood = { title: "test",
                 traits: [Flame, Virus, Ring, Swarm, Rose, Galaxy, RedFist, GreenBlob, Bawble,
                          Streaker, Burst, Explosion, Crackler, Stars, Snow, RedMist, RedPissed],
                 stability: 200 };

var AllMoods = [Angry, Wired, Brilliant, Anxious, Happy, Frustrated, Attractive,
                InLove, Focused, Fine, Relaxed, Isolated, Depressed, Broken];


function MoodWheel(mood, x, y, scale, style)
{
    this.current = mood;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.push = false;
    this.color = style['color'];
    this.background_color = style['background-color'] || style['backgroundColor'];
    this.font_family = style['font-family'] || style['fontFamily'];
    this.font_weight = style['font-weight'] || style['fontWeight'];
    this.allow_sticky = true;
    this.moods = AllMoods;
    this.px = x;
    this.py = y;
    this.begin = millis();
    this.sticky = false;
    this.dead = false;
    this.selection = null;
    this.strength = 0;
    this.theta_start = 0.8*Math.PI,
    this.theta_step = 1.4*Math.PI / (this.moods.length - 1);
}

MoodWheel.prototype.down = downMoodWheel;
function downMoodWheel(x, y)
{
    if (!this.dead)
        this.sticky = false;
    else
    {
        this.dead = false;
        this.sticky = false;
        this.begin = this.end;
        this.x = x;
        this.y = y;
        this.selection = null;
    }
}

MoodWheel.prototype.move = moveMoodWheel;
function moveMoodWheel(x, y)
{
    if (!this.dead)
    {
        this.px = x;
        this.py = y;

        var dx = this.px - this.x, dy = this.py - this.y,
            distance = Math.sqrt(dx*dx + dy*dy),
            theta = angle(dx, dy) - this.theta_start + this.theta_step/2,
            p = Math.floor(wrap(theta, 2*Math.PI) / this.theta_step),
            inner_edge = 50 * this.scale, outer_edge = 150 * this.scale;

        this.strength = distance > outer_edge ? (inner_edge - Math.min(distance - outer_edge, inner_edge)) / inner_edge
                                              : Math.min(distance, inner_edge) / inner_edge;

        if (this.strength > 0 && p >=0 && p < this.moods.length)
        {
            this.selection = this.moods[p];
            var now = millis();
            if (now - this.begin > 500)
                this.begin = now - 500;
        }
        else
            this.selection = null;
    }
}

MoodWheel.prototype.up = upMoodWheel;
function upMoodWheel(x, y)
{
    if (this.allow_sticky && millis() - this.begin < 500)
    {
        this.sticky = true;
        return true;
    }
    else
    {
        this.dead = true;
        this.end = millis();
        return false;
    }
}

MoodWheel.prototype.dismiss = dismissMoodWheel;
function dismissMoodWheel()
{
    this.selection = null;
    this.dead = true;
    this.end = millis();
}

MoodWheel.prototype.draw = drawMoodWheel;
function drawMoodWheel(context)
{
    var now = millis();
    if (!this.dead && now - this.begin > 10000)
    {
        this.dead = true;
        this.selection = null;
        this.end = now;
    }
    var alpha = this.dead ? 1.0 - Math.min(now - this.end, 250) / 250
                          : Math.min(now - this.begin, 250) / 250;

    var canvas = context.canvas;
    context.save();
    context.globalAlpha = 0.667 * alpha;
    context.fillStyle = this.background_color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.translate(this.x, this.y);
    context.fillStyle = this.color;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 5*this.scale;
    context.shadowColor = this.background_color;
    for (var n = 0; n < this.moods.length; n++)
    {
        var mood = this.moods[n], theta = this.theta_step * n + this.theta_start, text = mood.title;
        context.save();
        context.rotate(theta);

        var offset = 75;
        if (this.push)
        {
            offset = 60;
            while (offset < 100) {
                var tx = this.x + offset*Math.cos(theta)*this.scale, ty =  this.y + offset*Math.sin(theta)*this.scale,
                    dx = tx - this.px, dy = ty - this.py,
                    d = Math.sqrt(dx*dx + dy*dy) / this.scale;
                if (d > 50)
                    break;
                offset++;
            }
        }

        var font_size = Math.round(offset * this.scale / 3.75);
        context.translate(offset * this.scale, 0);
        context.globalAlpha = alpha * (mood == this.selection ? 1 : 1 - this.strength*0.75)
        context.font = mood == this.current ? "bold " + font_size + "px " + this.font_family
                                            : this.font_weight + " " + font_size + "px " + this.font_family;
        if (theta < 1.5*Math.PI)
        {
            context.translate(context.measureText(text).width, 0);
            context.rotate(Math.PI);
        }
        context.fillText(text, 0, 5*this.scale);
        context.restore();
    }
    context.restore();
    return this.dead && alpha == 0;
}

