
/*
 * Copyright 2012 (C) Jonathan Hogg
 * www.jonathanhogg.com
 * All rights reserved.
 */


var MAXIMUM_FRAME_RATE = 60;
var TARGET_FRAME_RATE = 50;
var GOOD_FRAME_RATE = 25;
var BAD_FRAME_RATE = 20;
var ANIMATION_RATE = 20;
var FIREWORK_CHANGE_INTERVAL = 5000;
var SCALE_PIXELS = 866;
var PIXELS_PER_FIREWORK = 200;

var requestAnimFrame = window.requestAnimationFrame       ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame    ||
                       window.oRequestAnimationFrame      ||
                       window.msRequestAnimationFrame;


function Particle(image, x, y, direction, spin, drive)
{
    this.image = image;
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 0;
    this.direction = direction;
    this.spin = spin;
    this.drive = drive;
    this.age = 0;
}

function Firework(traits, x, y, direction, image)
{
    this.traits = traits;
    this.x = x;
    this.y = y;
    this.image = image;
    this.theta = direction;
    this.direction = direction;
    this.speed = 0;
    this.rotational_speed = 0;
    this.number_of_particles = 0;
    this.particles = [];
    this.death_row = [];
    this.recycling_bin = [];
    this.brightness = 1;
}

Firework.prototype.update = updateFirework;
function updateFirework(frame_ratio, width, height)
{
    var traits = this.traits;

    this.x = wrap(this.x + Math.cos(this.direction) * this.speed * frame_ratio, width);
    this.y = wrap(this.y + Math.sin(this.direction) * this.speed * frame_ratio, height);
    this.theta = wrap(this.theta + this.rotational_speed * frame_ratio, 2*Math.PI);

    traits.beat(this);
    traits.apply(this, frame_ratio);

    var n = Math.floor(this.number_of_particles);
    while (this.particles.length < n)
        this.particles.push(traits.newParticle(this.recycling_bin));
    while (this.particles.length > traits.max_particles)
    {
        this.death_row.push(this.particles.shift());
        this.number_of_particles -= 1;
    }

    var maturation_rate = traits.maturation_rate * frame_ratio;
    for (var i = 0; i < this.particles.length; i++)
    {
        var particle = this.particles[i];
        particle.x += particle.x_speed * frame_ratio;
        particle.y += particle.y_speed * frame_ratio;
        particle.age = Math.min(particle.age + maturation_rate, 100);
    }
    var decay_rate = traits.decay_rate * frame_ratio;
    for (var i = 0; i < this.death_row.length; i++)
    {
        var particle = this.death_row[i];
        particle.x += particle.x_speed * frame_ratio;
        particle.y += particle.y_speed * frame_ratio;
        particle.age = Math.max(particle.age - decay_rate, 0);
    }
    while (this.death_row.length > 0 && (this.death_row[0].age == 0 ||
                                         this.death_row.length > traits.max_death_row))
    {
        var rubbish = this.death_row.shift();
        if (this.recycling_bin.length < 100)
            this.recycling_bin.push(rubbish);
    }
}

Firework.prototype.recalculate = recalculateFirework;
function recalculateFirework(frame_ratio)
{
    var np = this.particles.length, nd = this.death_row.length, npd = np + nd,
        pcoeffs = this.traits.particle_attraction, ccoeffs = this.traits.centre_attraction,
        drag = 1 - this.traits.particle_drag * frame_ratio;
    for (var i = 0; i < npd; i++)
    {
        var particle = i < np ? this.particles[i] : this.death_row[i-np], age = particle.age;
        if (age > 0)
        {
            var x_speed = particle.x_speed, y_speed = particle.y_speed,
                x = particle.x, y = particle.y, force;
            if (pcoeffs.length > 0)
            {
                var age_ratio = age / 10000 * frame_ratio;
                for (var j = i+1; j < npd; j++)
                {
                    var other = j < np ? this.particles[j] : this.death_row[j-np], other_age = other.age;
                    if (other_age > 0)
                    {
                        var xd = other.x - x, yd = other.y - y, sqrdist = xd*xd + yd*yd;
                        switch (pcoeffs.length)
                        {
                            case 1:
                                force = pcoeffs[0]/sqrdist;
                                break;
                            case 2:
                                force = pcoeffs[0]/sqrdist + pcoeffs[1]/Math.sqrt(sqrdist);
                                break;
                            case 3:
                                force = pcoeffs[0]/sqrdist + pcoeffs[1]/Math.sqrt(sqrdist) + pcoeffs[2];
                        }
                        force *= other_age * age_ratio;
                        var xdf = xd * force, ydf = yd * force;
                        x_speed += xdf;
                        y_speed += ydf;
                        other.x_speed -= xdf;
                        other.y_speed -= ydf;
                    }
                }
            }
            if (ccoeffs.length > 0)
            {
                var sqrdist = x*x + y*y;
                switch (ccoeffs.length)
                {
                    case 1:
                        force = ccoeffs[0]/sqrdist;
                        break;
                    case 2:
                        force = ccoeffs[0]/sqrdist + ccoeffs[1]/Math.sqrt(sqrdist);
                        break;
                    case 3:
                        force = ccoeffs[0]/sqrdist + ccoeffs[1]/Math.sqrt(sqrdist) + ccoeffs[2];
                }
                force *= age / 100.0 * frame_ratio;
                x_speed -= x * force;
                y_speed -= y * force;
            }
            if (particle.drive != 0)
            {
                var drive = particle.drive * frame_ratio;
                x_speed += Math.cos(particle.direction) * drive;
                y_speed += Math.sin(particle.direction) * drive;
                particle.direction += wrap(particle.spin * frame_ratio, 2*Math.PI);
            }
            particle.x_speed = x_speed * drag;
            particle.y_speed = y_speed * drag;
        }
    }
}

Firework.prototype.draw = drawFirework;
function drawFirework(context, width, height, round_position)
{
    context.save();
    var np = this.particles.length, nd = this.death_row.length, npd = np + nd,
        fx = this.x, fy = this.y, cos = Math.cos(this.theta), sin = Math.sin(this.theta),
        brightness = this.brightness / 100;
    for (var i = 0; i < np; i++)
    {
        var particle = this.particles[i], age = particle.age;
        if (age > 0)
        {
            var x = particle.x, y = particle.y,
                image = particle.image,
                himagew = image.width / 2, himageh = image.height / 2,
                widthp = width - image.width, heightp = height - image.height,
                xtu = fx + x*cos - y*sin,
                xt = (xtu < 0 ? (xtu % width) + width : xtu % width) - himagew,
                ytu = fy + x*sin + y*cos,
                yt = (ytu < 0 ? (ytu % height) + height : ytu % height) - himageh;
            if (round_position)
            {
                xt = Math.round(xt);
                yt = Math.round(yt);
            }
            context.globalAlpha = age * brightness;
            var xo = xt < 0 ? xt + width : (xt > widthp ? xt - width : 0),
                yo = yt < 0 ? yt + height : (yt > heightp ? yt - height : 0);
            context.drawImage(image, xt, yt);
            if (xo != 0) context.drawImage(image, xo, yt);
            if (yo != 0)
            {
                context.drawImage(image, xt, yo);
                if (xo != 0) context.drawImage(image, xo, yo);
            }
        }
    }
    for (var i = 0; i < nd; i++)
    {
        var particle = this.death_row[i], age = particle.age;
        if (age > 0)
        {
            var x = particle.x, y = particle.y,
                image = particle.image,
                himagew = image.width / 2, himageh = image.height / 2,
                widthp = width - image.width, heightp = height - image.height,
                xtu = fx + x*cos - y*sin,
                xt = (xtu < 0 ? (xtu % width) + width : xtu % width) - himagew,
                ytu = fy + x*sin + y*cos,
                yt = (ytu < 0 ? (ytu % height) + height : ytu % height) - himageh;
            context.globalAlpha = age * brightness;
            var xo = xt < 0 ? xt + width : (xt > widthp ? xt - width : 0),
                yo = yt < 0 ? yt + height : (yt > heightp ? yt - height : 0);
            context.drawImage(image, xt, yt);
            if (xo != 0) context.drawImage(image, xo, yt);
            if (yo != 0)
            {
                context.drawImage(image, xt, yo);
                if (xo != 0) context.drawImage(image, xo, yo);
            }
        }
    }
    context.restore();
    return npd;
}


function FireworksDisplay(container_selector, mood_display_selector)
{
    this.container = $(container_selector)[0];
    this.mood_display = $(mood_display_selector)[0];
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('style', 'width: 100%; height: 100%;');
    this.context = this.canvas.getContext('2d');

    var width = this.container.clientWidth, height = this.container.clientHeight,
        diagonal = Math.sqrt(width*width + height*height);
    this.scale = Math.ceil(SCALE_PIXELS / diagonal);
    this.width = width * this.scale;
    this.height = height * this.scale;
    this.max_fireworks = Math.ceil(diagonal*this.scale / PIXELS_PER_FIREWORK);
    this.round_position = false;
    this.composite_operation = 'lighter';
    this.show_stats = false;
    this.dropped_last_frame = false;
    this.wheel = null;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.container.appendChild(this.canvas);
    this.fireworks = [];
    this.dying_fireworks = [];
    this.animation_counter = new FrameCounter(MAXIMUM_FRAME_RATE);
    this.drawing_counter = new FrameCounter(TARGET_FRAME_RATE);
    this.mood = DefaultMood;
    this.mood_display.innerHTML = this.mood.title;
    this.addFirework();

    var display = this;

    if (Modernizr.touch)
    {
        this.container.addEventListener('touchstart', function(e) {display.wheel_touch_start(e);});
        this.container.addEventListener('touchmove', function(e) {display.wheel_touch_move(e);});
        this.container.addEventListener('touchend', function(e) {display.wheel_touch_end(e);});
        this.container.addEventListener('touchcancel', function(e) {display.wheel_touch_cancel(e);});
    }
    else
        $(this.container).mousedown(function(e) {display.wheel_down(e);})
                         .mousemove(function(e) {display.wheel_move(e);})
                         .mouseup(function(e) {display.wheel_up(e);});

    this.debugControl();
    if (Modernizr.hashchange)
        $(window).bind('hashchange', function() {display.debugControl();});

    if (requestAnimFrame)
    {
        var callback = function() { requestAnimFrame(callback, this.canvas); display.loop(); };
        requestAnimFrame(callback, this.canvas);
    }
    else
        window.setInterval(function() {display.loop();}, 1000 / MAXIMUM_FRAME_RATE);
}

FireworksDisplay.prototype.hideInterface = hideInterfaceFireworksDisplay;
function hideInterfaceFireworksDisplay()
{
    if (this.wheel)
        this.wheel.dismiss();
}

FireworksDisplay.prototype.changeMood = changeMoodFireworksDisplay;
function changeMoodFireworksDisplay(title)
{
    if (this.wheel)
        this.wheel.dismiss();

    if (!title)
    {
        this.mood = DefaultMood;
        this.mood_display.innerHTML = this.mood.title;
        return;
    }

    for (var i = 0; i < AllMoods.length; i++)
    {
        var mood = AllMoods[i];
        if (mood.title == title)
        {
            this.mood = mood;
            this.mood_display.innerHTML = this.mood.title;
            return;
        }
    }
}

FireworksDisplay.prototype.debugControl = debugControlFireworksDisplay;
function debugControlFireworksDisplay()
{
    var hash = window.location.hash;
    switch (hash)
    {
        case "#stats":
            this.show_stats = true;
            break;

        case "#nostats":
            this.show_stats = false;
            break;

        case "#test":
            this.mood = TestMood;
            this.mood_display.innerHTML = this.mood.title;
            break;
    }
}

FireworksDisplay.prototype.addFirework = addFireworkFireworksDisplay;
function addFireworkFireworksDisplay()
{
    var width = this.width, height = this.height;
    var firework = new Firework(new (choose(this.mood.traits))(),
                                random(width*0.25, width*0.75),
                                random(height*0.25, height*0.75),
                                random(0, 2*Math.PI));
    firework.mood = this.mood;
    this.fireworks.push(firework);
    this.last_firework_time = millis();
}

FireworksDisplay.prototype.dropFirework = dropFireworkFireworksDisplay;
function dropFireworkFireworksDisplay()
{
    var firework = this.fireworks.shift();
    firework.traits = new DeadDuck();
    this.dying_fireworks.push(firework);
    this.last_firework_time = millis();
}

FireworksDisplay.prototype.loop = loopFireworksDisplay;
function loopFireworksDisplay()
{
    var now = millis(),
        delta = this.animation_counter.depth > 0 ? now - this.animation_counter.last_time : 1000 / MAXIMUM_FRAME_RATE,
        frame_ratio = Math.min(1, delta / 1000 * ANIMATION_RATE);

    if (delta > 500 || (this.animation_counter.depth > 5 && delta > 5*this.animation_counter.average_interval))
    {
        this.animation_counter.reset();
        this.drawing_counter.reset();
    }
    else if (!this.dropped_last_frame && this.animation_counter.test(now) > MAXIMUM_FRAME_RATE)
    {
        this.dropped_last_frame = true;
        return;
    }

    this.animation_counter.push(now);
    this.doAnimation(frame_ratio);

    now = millis();
    var drawing_rate = this.drawing_counter.test(now);
    if (!this.dropped_last_frame && (drawing_rate > TARGET_FRAME_RATE
                                     || (drawing_rate > GOOD_FRAME_RATE
                                         && this.animation_counter.frame_rate < TARGET_FRAME_RATE)))
        this.dropped_last_frame = true;
    else
    {
        this.dropped_last_frame = false;
        this.drawing_counter.push(now);
        this.doDrawing();
    }

    if (this.drawing_counter.full)
    {
        drawing_rate = this.drawing_counter.frame_rate;
        var num_fireworks = this.fireworks.length + this.dying_fireworks.length,
            max_fireworks = this.mood.max_fireworks ? Math.min(this.max_fireworks, this.mood.max_fireworks)
                                                    : this.max_fireworks,
            can_change_fireworks = now > this.last_firework_time + FIREWORK_CHANGE_INTERVAL;

        if (can_change_fireworks && (num_fireworks > max_fireworks || (num_fireworks > 1 && drawing_rate < BAD_FRAME_RATE)))
        {
            this.dropFirework();
            this.drawing_counter.reset();
        }
        else if (drawing_rate < GOOD_FRAME_RATE)
        {
            if (!this.round_position)
            {
                this.round_position = true;
                this.drawing_counter.reset();
            }
            else if (this.composite_operation == 'lighter')
            {
                this.composite_operation = 'source-over';
                this.drawing_counter.reset();
            }
        }
        else if (drawing_rate > GOOD_FRAME_RATE && num_fireworks < max_fireworks && can_change_fireworks)
        {
            this.addFirework();
            this.drawing_counter.reset();
        }
    }
}

FireworksDisplay.prototype.doAnimation = doAnimationFireworksDisplay;
function doAnimationFireworksDisplay(frame_ratio)
{
    for (var i = 0; i < this.fireworks.length; i++)
    {
        var firework = this.fireworks[i],
            stability = firework.mood == this.mood ? this.mood.stability : 50,
            change = random(0, stability / frame_ratio);
        if (change <= 1)
        {
            firework.traits = new (choose(this.mood.traits))();
            firework.mood = this.mood;
        }

        firework.update(frame_ratio, this.width, this.height);
        firework.recalculate(frame_ratio);
    }
    for (var i = 0; i < this.dying_fireworks.length; i++)
    {
        var firework = this.dying_fireworks[i];
        firework.update(frame_ratio, this.width, this.height);
        firework.recalculate(frame_ratio);
    }
}

FireworksDisplay.prototype.doDrawing = doDrawingFireworksDisplay;
function doDrawingFireworksDisplay()
{
    var canvas = this.canvas,
        context = this.context,
        fireworks = this.fireworks,
        dying_fireworks = this.dying_fireworks,
        width = this.container.clientWidth,
        height = this.container.clientHeight,
        diagonal = Math.sqrt(width*width + height*height);
    this.scale = Math.ceil(SCALE_PIXELS / diagonal);
    this.width = width *= this.scale;
    this.height = height *= this.scale;
    this.max_fireworks = Math.ceil(diagonal*this.scale / PIXELS_PER_FIREWORK);
    if (width != canvas.width || height != canvas.height)
    {
        canvas.width = width;
        canvas.height = height;
    }

    context.save();
    context.clearRect(0, 0, width, height);

    var firework_count = 0, particle_count = 0;
    context.globalCompositeOperation = this.composite_operation;
    for (i = 0; i < fireworks.length; i++)
    {
        var firework = fireworks[i];
        particle_count += firework.draw(context, width, height, this.round_position);
        firework_count++;
    }
    for (i = 0; i < dying_fireworks.length; i++)
    {
        var firework = dying_fireworks[i];
        particle_count += firework.draw(context, width, height, this.round_position);
        firework_count++;
    }
    while (dying_fireworks.length > 0 && (dying_fireworks[0].death_row.length +
                                          dying_fireworks[0].particles.length) == 0)
        dying_fireworks.shift();

    context.globalCompositeOperation = 'source-over';

    if (this.show_stats)
    {
        var x = 50, y = height - 40;
        var text = "Animation rate: " + Math.round(this.animation_counter.frame_rate) 
                 + " fps; draw rate: " + Math.round(this.drawing_counter.frame_rate) 
                 + " fps; fireworks: " + firework_count + " (" + particle_count + " particles)";
        if (this.round_position)
            text += "; no sub-pixel rendering";
        if (this.composite_operation == 'source-over')
            text += "; no additive blending";

        var style = window.getComputedStyle(this.container);
        context.save();
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 3;
        context.shadowColor = style['background-color'] || style['backgroundColor'];
        var font = (style['font-weight'] || style['fontWeight']) + " 12px " + (style['font-family'] || style['fontFamily']);
        context.font = font;
        context.fillStyle = style['color'];
        context.fillText(text, x, y);
        context.restore();
    }

    if (this.wheel && this.wheel.draw(context, width, height))
    {
        if (this.wheel.selection != null && this.wheel.strength > 0.5)
        {
            this.mood = this.wheel.selection;
            this.mood_display.innerHTML = this.mood.title;
        }
        this.wheel = null;
    }

    context.restore();
}


FireworksDisplay.prototype.wheel_down = wheel_down;
function wheel_down(e)
{
    if (this.wheel == null)
    {
        var style = window.getComputedStyle(this.container);
        this.wheel = new MoodWheel(this.mood, e.clientX*this.scale, e.clientY*this.scale, this.scale, style);
        $("body").addClass('fireworksui');
    }
    else
        this.wheel.down(e.clientX*this.scale, e.clientY*this.scale);
}

FireworksDisplay.prototype.wheel_move = wheel_move;
function wheel_move(e)
{
    if (this.wheel)
        this.wheel.move(e.clientX*this.scale, e.clientY*this.scale);
}

FireworksDisplay.prototype.wheel_up = wheel_up;
function wheel_up(e)
{
    if (this.wheel)
    {
        if (!this.wheel.up(e.clientX*this.scale, e.clientY*this.scale))
            $("body").removeClass('fireworksui');
    }
}

FireworksDisplay.prototype.wheel_touch_start = wheel_touch_start;
function wheel_touch_start(e)
{
    if (this.wheel == null && e.targetTouches.length == 1 && e.changedTouches.length == 1 &&
        e.targetTouches[0] == e.changedTouches[0])
    {
        e.preventDefault();
        var touch = e.targetTouches[0];
        var style = window.getComputedStyle(this.container);
        this.wheel = new MoodWheel(this.mood, touch.clientX*this.scale, touch.clientY*this.scale, this.scale, style);
        this.wheel.allow_sticky = false;
        this.wheel.push = true;
        this.wheel.touch_identifier = touch.identifier;
        $("body").addClass('fireworksui');
    }
}

FireworksDisplay.prototype.wheel_touch_move = wheel_touch_move;
function wheel_touch_move(e)
{
    if (this.wheel)
        for (var i = 0; i < e.changedTouches.length; i++)
        {
            var touch = e.changedTouches[i];
            if (touch.identifier == this.wheel.touch_identifier)
            {
                e.preventDefault();
                this.wheel.move(touch.clientX*this.scale, touch.clientY*this.scale);
                return;
            }
        }
}

FireworksDisplay.prototype.wheel_touch_end = wheel_touch_end;
function wheel_touch_end(e)
{
    if (this.wheel)
        for (var i = 0; i < e.changedTouches.length; i++)
        {
            var touch = e.changedTouches[i];
            if (touch.identifier == this.wheel.touch_identifier)
            {
                e.preventDefault();
                this.wheel.up(touch.clientX*this.scale, touch.clientY*this.scale);
                $("body").removeClass('fireworksui');
                return;
            }
        }
}

FireworksDisplay.prototype.wheel_touch_cancel = wheel_touch_cancel;
function wheel_touch_cancel(e)
{
    if (this.wheel)
        for (var i = 0; i < e.changedTouches.length; i++)
        {
            var touch = e.changedTouches[i];
            if (touch.identifier == this.wheel.touch_identifier)
            {
                e.preventDefault();
                this.wheel.dismiss();
                $("body").removeClass('fireworksui');
                return;
            }
        }
}

