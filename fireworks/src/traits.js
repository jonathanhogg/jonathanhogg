
/*
 * Copyright 2012 (C) Jonathan Hogg
 * www.jonathanhogg.com
 * All rights reserved.
 */


var ParticleImages = { blue:      'fireworks/images/blue.png', 
                       carnation: 'fireworks/images/carnation.png',
                       cyan:      'fireworks/images/cyan.png',
                       green:     'fireworks/images/green.png',
                       magenta:   'fireworks/images/magenta.png',
                       orange:    'fireworks/images/orange.png',
                       purple:    'fireworks/images/purple.png',
                       red:       'fireworks/images/red.png',
                       white:     'fireworks/images/white.png',
                       yellow:    'fireworks/images/yellow.png' }

var SmallImages = { blue:      'fireworks/images/small-blue.png',
                    carnation: 'fireworks/images/small-carnation.png',
                    cyan:      'fireworks/images/small-cyan.png',
                    green:     'fireworks/images/small-green.png',
                    magenta:   'fireworks/images/small-magenta.png',
                    orange:    'fireworks/images/small-orange.png',
                    purple:    'fireworks/images/small-purple.png',
                    red:       'fireworks/images/small-red.png',
                    white:     'fireworks/images/small-white.png',
                    yellow:    'fireworks/images/small-yellow.png' }

function initImageMap(map)
{
    var all = [];
    for (key in map)
    {
       var image = new Image();
       image.src = map[key];
       map[key] = image;
       all.push(image);
    }
    map.all = all;
}

initImageMap(ParticleImages);
initImageMap(SmallImages);


Flame.prototype = new FireworkTraits();
function Flame()
{
    this.images = [choose([ParticleImages.magenta, ParticleImages.orange, ParticleImages.red])];
    this.speed = 2;
    this.particle_attraction = [5];
    this.centre_attraction = [-30, 0, -0.01];
    this.particle_creation_rate = 1;
    this.maturation_rate = 5;
    this.decay_rate = 10;
    this.randomness = 0.25;
}

Sparkler.prototype = new FireworkTraits();
function Sparkler()
{
    this.images = [ParticleImages.yellow];
    this.speed = 5.0;
    this.centre_attraction = [-10, -5];
    this.particle_creation_rate = 2;
    this.maturation_rate = 5;
    this.decay_rate = 10;
    this.randomness = 0.5;
}

Burst.prototype = new FireworkTraits();
function Burst()
{
    this.max_particles = 50;
    this.speed = 2;
    this.centre_attraction = [-10];
    this.particle_creation_rate = 0.25;
    this.maturation_rate = 5;
    this.particle_start_distance = [1];
    this.particle_start_spin = [-0.1, 0.1];
    this.particle_start_drive = [0.1];
    this.conformity = 0.05;
}

Virus.prototype = new FireworkTraits();
function Virus()
{
    this.images = choose([[ParticleImages.cyan], [ParticleImages.orange]]);
    this.min_particles = 10;
    this.rotational_speed = 0.01;
    this.speed = 2.0;
    this.particle_attraction = [choose([-1, -2, -3])];
    this.centre_attraction = [0, 0, 0.01];
    this.particle_creation_rate = 0.05;
}

Virus.prototype.beat = beatVirus;
function beatVirus(firework)
{
    var n = (millis() % 900);
    this.centre_attraction = [0, 0, n < 150 ? 0 : (n < 300 ? 0.02 : 0.01)];
}

Ring.prototype = new FireworkTraits();
function Ring()
{
    this.images = [ParticleImages.blue];
    this.min_particles = 20;
    this.max_particles = 24;
    this.rotational_speed = -0.02;
    this.speed = 1.5;
    this.particle_attraction = [-1];
    this.centre_attraction = [0, -10, 0.1];
    this.particle_creation_rate = 0.05;
    this.particle_start_distance = [100];
    this.maturation_rate = 2;
    this.decay_rate = 2;
    this.conformity = 0.2;
}

Ring.prototype.beat = beatRing;
function beatRing(firework)
{
    var n = (millis() % 2000);
    this.centre_attraction = [0, n < 100 ? -13.5 : (n > 350 && n < 550 ? -14.4 : -15), 0.15];
    this.brightness = n < 300 ? 1.0 : 0.5;
}

BlackDeath.prototype = new FireworkTraits();
function BlackDeath()
{
    this.max_particles = 0;
    this.speed = 10;
}

BlackHole.prototype = new FireworkTraits();
function BlackHole()
{
    this.max_particles = 0;
    this.centre_attraction = [0, 1];
}

Snow.prototype = new FireworkTraits();
function Snow()
{
    this.images = [ParticleImages.white, SmallImages.white];
    this.centre_attraction = [-20];
    this.speed = 1;
    this.particle_creation_rate = 0.025;
    this.particle_start_distance = [50, 100, 125, 150, 175, 200, 225, 250, 275, 300];
    this.particle_start_spin = [-0.2, -0.1, 0.1, 0.2];
    this.particle_start_drive = [0.05, 0.1, 0.15, 0.2];
}

WhiteHole.prototype = new Snow();
function WhiteHole()
{
    this.centre_attraction = [0, 2];
    this.rotational_speed = 0.05;
    this.particle_creation_rate = 0.3;
    this.particle_start_distance = [300];
    this.maturation_rate = 5;
    this.decay_rate = 5;
}

Swarm.prototype = new FireworkTraits();
function Swarm()
{
    this.images = [ParticleImages.orange, ParticleImages.orange, ParticleImages.orange, ParticleImages.orange,
                   ParticleImages.red, ParticleImages.red, ParticleImages.yellow,
                   SmallImages.blue];
    this.centre_attraction = choose([[-1000], [], [-1, 10]]);
    this.particle_attraction = [-10, 0, 0.001];
    this.speed = 5;
    this.particle_creation_rate = 0.2;
    this.particle_start_spin = [-0.5, -0.25, 0.25, 0.5];
    this.particle_start_drive = [1, 2, 3, 4, 5];
    this.drag = 0.01;
    this.randomness = 0.5;
}

Crackler.prototype = new FireworkTraits();
function Crackler()
{
    this.images = [ParticleImages.white, SmallImages.white, ParticleImages.carnation, SmallImages.carnation];
    this.max_particles = 100;
    this.rotational_speed = choose([-0.005, -0.0025, 0.0025, 0.005])
    this.speed = 1;
    this.particle_start_distance = [50, 100, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400,
                                    425, 450, 475, 500];
    this.particle_creation_rate = 2;
    this.maturation_rate = 20;
    this.decay_rate = 20;
    this.particle_start_drive = [0, 0.05, 0.1];
}

Streaker.prototype = new FireworkTraits();
function Streaker()
{
    this.min_particles = 25;
    this.max_particles = 50;
    this.speed = 20;
    this.particle_start_distance = [1];
    this.particle_creation_rate = 0.5;
    this.centre_attraction = [0, 0, 0.01];
    this.maturation_rate = 5;
    this.decay_rate = 10;
    this.particle_start_drive = [0, 0, 0, 0, 0.1, 0.2];
}

Explosion.prototype = new FireworkTraits();
function Explosion()
{
    this.max_particles = 0;
    this.speed = 1;
    this.centre_attraction = [0, -1];
    this.decay_rate = 0.5;
}

Rose.prototype = new FireworkTraits();
function Rose()
{
    this.images = [ParticleImages.magenta, ParticleImages.carnation, ParticleImages.carnation,
                   ParticleImages.white, ParticleImages.purple];
    this.max_particles = 50;
    this.particle_creation_rate = 1;
    this.particle_start_theta = [0, Math.PI*0.4, Math.PI*0.8, Math.PI*1.2, Math.PI*1.6];
    this.particle_start_spin = [-0.085];
    this.particle_start_drive = [0.5];
    this.speed = 1;
    this.rotational_speed = 0.025;
    this.decay_rate = 10;
    this.maturation_rate = 5;
}

Galaxy.prototype = new FireworkTraits();
function Galaxy()
{
    this.images = [ParticleImages.white, ParticleImages.yellow, ParticleImages.orange];
    this.max_particles = 50;
    this.particle_creation_rate = 0.5;
    this.particle_start_theta = [0, Math.PI];
    this.particle_start_distance = [0];
    this.particle_start_spin = [0.01, 0.017, 0.03];
    this.particle_start_drive = [0.15];
    this.speed = 1;
    this.rotational_speed = -0.01;
}

Stars.prototype = new FireworkTraits();
function Stars()
{
    this.max_particles = 10;
    this.images = [SmallImages.white, SmallImages.yellow, SmallImages.orange];
    this.particle_start_distance = [50, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350];
    this.particle_creation_rate = 0.1;
}

RedMist.prototype = new FireworkTraits();
function RedMist()
{
    this.max_particles = 60;
    this.images = [SmallImages.red, ParticleImages.red, ParticleImages.red, ParticleImages.purple];
    this.particle_start_distance = [100, 150, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450];
    this.particle_creation_rate = 0.5;
    this.particle_start_spin = [-1, 1];
    this.speed = 1;
    this.conformity = 0.2;
    this.base_brightness = 0.5;
    this.peak_brightness = 0.75;
    this.rotational_speed = choose([-0.002, 0, 0.002]);
    this.rate = random(490, 510);
    this.decay_rate = 2;
}

RedMist.prototype.beat = beatRedMist;
function beatRedMist()
{
    this.brightness = (millis() % this.rate) < 250 ? this.base_brightness : this.peak_brightness;
}

RedFist.prototype = new RedMist();
function RedFist()
{
    this.max_particles = 40;
    this.centre_attraction = [0, 0, .05];
    this.particle_attraction = [-5];
    this.base_brightness = 0.25;
    this.peak_brightness = 1;
    this.speed = 5;
    this.rotational_speed = choose([-0.002, 0, 0.002]);
    this.rate = 500;
}

RedPissed.prototype = new RedMist();
function RedPissed()
{
    this.max_particles = 25;
    this.centre_attraction = [-1000];
    this.rotational_speed = choose([-0.002, 0, 0.002]);
    this.rate = random(490, 510);
}

GreenBlob.prototype = new FireworkTraits();
function GreenBlob()
{
    this.images = [ParticleImages.green, ParticleImages.green, ParticleImages.cyan];
    this.min_particles = 25;
    this.max_particles = 50;
    this.particle_creation_rate = 0.1;
    this.particle_start_distance = [50, 75, 100, 125, 150];
    this.centre_attraction = [-150, 0, 0.12];
    this.particle_attraction = [0.5, 0, -0.002];
    this.particle_start_drive = [0, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 2];
    this.particle_start_spin = [-0.01, 0, 0.01];
    this.speed = 1;
    this.rotational_speed = choose([-0.01, 0, 0.01]);
    this.decay_rate = 2;
    this.start = millis();
}

GreenBlob.prototype.beat = beatGreenBlob;
function beatGreenBlob()
{
    var n = (millis() - this.start) % 500;
    this.centre_attraction = n > 350 ? [-300, 0, 0.12] : [-150, 0, 0.12];
}

Bawble.prototype = new FireworkTraits();
function Bawble()
{
    this.images = [SmallImages.white, SmallImages.cyan, SmallImages.white,
                   choose([ParticleImages.green, ParticleImages.magenta, ParticleImages.magenta, ParticleImages.blue])];
    this.min_particles = 20;
    this.max_particles = 50;
    this.rotational_speed = choose([-0.01, 0.01]);
    this.speed = 3;
    this.particle_attraction = [-3];
    this.centre_attraction = [0, 0, 0.05];
    this.particle_creation_rate = 0.1;
    this.particle_start_spin = [-0.2, -0.1, 0.05, 0.15];
    this.particle_start_drive = [0, 0, 0, 0, 2];
    this.maturation_rate = 10;
    this.particle_start_distance = [1];
}

Bawble.prototype.beat = beatBawble;
function beatBawble(firework)
{
    var n = (millis() % 1000);
    this.centre_attraction = [0, 0, n < 150 ? 0.045 : 0.05];
}

DeadDuck.prototype = new FireworkTraits();
function DeadDuck()
{
    this.max_particles = 0;
    this.randomness = 0;
    this.conformity = 0;
    this.drag = 0;
}


function FireworkTraits()
{
    this.images = ParticleImages.all;
    this.min_particles = 0;
    this.max_particles = 25;
    this.max_death_row = 100;
    this.rotational_speed = 0;
    this.speed = 0;
    this.randomness = 0.1;
    this.conformity = 0.1;
    this.particle_attraction = [];
    this.centre_attraction = [];
    this.particle_start_distance = [10];
    this.particle_start_theta = [];
    this.particle_start_theta_i = 0;
    this.particle_drag = 0.1;
    this.particle_creation_rate = 0;
    this.maturation_rate = 1;
    this.decay_rate = 1;
    this.particle_start_spin = [0];
    this.particle_start_drive = [0];
    this.brightness = 1;
}

FireworkTraits.prototype.adjust = adjustFireworkTraits;
function adjustFireworkTraits(current, target, jitter, frame_ratio)
{
    return current + ((target-current)*this.conformity + jitter*this.randomness*normal()) * frame_ratio;
}

FireworkTraits.prototype.apply = applyFireworkTraits;
function applyFireworkTraits(firework, frame_ratio)
{
    if (firework.number_of_particles < this.min_particles)
        firework.number_of_particles = this.min_particles
    else
        firework.number_of_particles += this.particle_creation_rate * frame_ratio;

    firework.speed = this.adjust(firework.speed, this.speed, this.speed*0.1, frame_ratio);
    firework.direction += 0.1 * normal() * this.randomness * frame_ratio;
    firework.rotational_speed = this.adjust(firework.rotational_speed, this.rotational_speed,
                                            this.rotational_speed*0.1, frame_ratio);
    firework.brightness = this.adjust(firework.brightness, this.brightness, this.brightness*0.1, frame_ratio);
}

FireworkTraits.prototype.newParticle = newParticleFireworkTraits;
function newParticleFireworkTraits(recycling_bin)
{
    var distance = choose(this.particle_start_distance),
        theta = this.particle_start_theta.length == 0 ? random(0, 2*Math.PI)
                 : this.particle_start_theta[this.particle_start_theta_i++ % this.particle_start_theta.length],
        image = choose(this.images), x = distance*Math.cos(theta), y = distance*Math.sin(theta),
        direction = this.particle_start_theta.length == 0 ? random(0, 2*Math.PI) : theta,
        spin = choose(this.particle_start_spin), drive = choose(this.particle_start_drive);

    if (recycling_bin.length > 0)
    {
        var particle = recycling_bin.shift();
        Particle.call(particle, image, x, y, direction, spin, drive);
        return particle;
    }

    return new Particle(image, x, y, direction, spin, drive);
}

FireworkTraits.prototype.beat = beatFireworkTraits;
function beatFireworkTraits()
{
}

