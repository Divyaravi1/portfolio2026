// Flocking / Boid simulation — base algorithm from:
// The Nature of Code, Daniel Shiffman — http://natureofcode.com
// Modified and extended by Divya Ravi

// ── State ────────────────────────────────────────────────────
let noiseSeeds = {};
let isClicked  = false;
let mX = 0, mY = 0;
let cellsize   = 40;
let timer      = 0;
let isFood     = false;
let isCreated  = false;
let totalParticles = 140;
let particles  = [];
let timerVal   = 0;
let flock1, flock2, flock3, flock4;
let boidScale = 1; // scaled down on phone viewports

// ── Setup ────────────────────────────────────────────────────
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas');   // mount inside the fixed #canvas div

  noiseSeeds.rx = random(250);
  noiseSeeds.ry = random(250);
  noiseSeeds.gx = random(250);
  noiseSeeds.gy = random(250);
  noiseSeeds.bx = random(250);
  noiseSeeds.by = random(250);

  flock1 = new Flock();
  flock2 = new Flock();
  flock3 = new Flock();
  flock4 = new Flock();

  const mobile     = window.innerWidth < 768;
  boidScale        = mobile ? 0.6 : 1;  // fish drawn 60% size on phones
  const flockSize  = mobile ? 6  : 15;  // vibrant followers per colour
  const greySize   = mobile ? 9  : 22;  // independent grey-blue fish
  totalParticles   = mobile ? 45 : 140; // background dots

  for (let i = 0; i < totalParticles; i++) {
    particles[i] = new Particle();
  }

  // Vibrant followers — track cursor, respond to green/red
  for (let i = 0; i < flockSize; i++) {
    flock1.addBoid(new Boid(random(width), random(height), 119, 184, 249, true));  // blue
    flock2.addBoid(new Boid(random(width), random(height), 127,   0, 255, true));  // purple
    flock4.addBoid(new Boid(random(width), random(height), 181,   3,  92, true));  // pink
  }
  // Independent ambients — do own flocking, still respond to green/red
  for (let i = 0; i < greySize; i++) {
    flock3.addBoid(new Boid(random(width), random(height),  65,  90, 125, false)); // dark grey-blue
  }
}

// ── Keep canvas full-window on resize ────────────────────────
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ── Draw loop ────────────────────────────────────────────────
function draw() {
  background(220);

  // Colourful noise grid background
  for (let x = 0; x < width; x += cellsize) {
    for (let y = 0; y < height; y += cellsize) {
      let r = noise(noiseSeeds.rx + x * 0.01, noiseSeeds.ry + y * 0.01) * 255;
      let g = noise(noiseSeeds.gx + x * 0.01, noiseSeeds.gy + y * 0.01) * 255;
      let b = noise(noiseSeeds.bx + x * 0.01, noiseSeeds.by + y * 0.01) * 255;

      let xp  = x / cellsize;
      let yp  = y / cellsize;
      let mcX = parseInt(mX / cellsize);
      let mcY = parseInt(mY / cellsize);

      if (isClicked && xp === mcX && yp === mcY) {
        if (r > g) {
          isFood = false;
        } else {
          isFood = true;
          if (!isCreated) {
            flock1.addBoid(new Boid(mX, mY));
            flock2.addBoid(new Boid(mX, mY));
            flock3.addBoid(new Boid(mX, mY));
            isCreated = true;
          }
        }
      } else {
        fill(r, g, b);
      }

      noStroke();
      rect(x, y, 40, 40);
      circle(x, y, 40);
    }
  }

  // Click stimulus indicator (fades after 4 seconds)
  noStroke();
  if (isClicked && mX > 0 && mY > 0) {
    fill(isFood ? color(0, 204, 102, 150) : color(153, 0, 0, 150));
    timerVal = 240; // ~4 seconds at 60fps
    circle(mX, mY, 150);
  }

  flock1.run();
  flock2.run();
  flock3.run();
  flock4.run();

  for (let i = 0; i < particles.length; i++) {
    particles[i].show();
    particles[i].update();
    particles[i].edges();
  }

  strokeWeight(2);
  timer++;
  if (timer > timerVal && isClicked) {
    timer     = 0;
    isClicked = false;
    isFood    = false;
    isCreated = false;
  }
}

// Click sets the attract/repel point (hero section only — canvas receives
// clicks there because the section has pointer-events:none)
function mouseClicked() {
  mX = mouseX;
  mY = mouseY;
  isClicked = true;
  timer = 0;
}

// ── Particle class ───────────────────────────────────────────
class Particle {
  constructor() {
    this.pos      = createVector(random(width), random(height));
    this.vel      = p5.Vector.random2D();
    this.acc      = createVector(0, 0);
    this.maxSpeed = 5;
  }
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  applyForce(force) { this.acc.add(force); }
  show() {
    fill(255, 255, 51);
    strokeWeight(2);
    circle(this.pos.x, this.pos.y, 8);
  }
  edges() {
    if (this.pos.x > width)  this.pos.x = 0;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.x < 0) this.pos.x = width - 1;
    if (this.pos.y < 0) this.pos.y = height - 1;
  }
}

// ── Flock ────────────────────────────────────────────────────
function Flock() { this.boids = []; }
Flock.prototype.run = function () {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
};
Flock.prototype.addBoid = function (b) { this.boids.push(b); };

// ── Boid ─────────────────────────────────────────────────────
function Boid(x, y, rc, gc, bc, follows) {
  this.acceleration = createVector(0, 0);
  this.velocity     = createVector(random(-2.5, 2.5), random(-2.5, 2.5));
  this.position     = createVector(x, y);
  this.r            = 3.0;
  this.maxspeed     = 3.8;
  this.maxforce     = 0.1;
  this.rc = rc; this.gc = gc; this.bc = bc;
  this.follows   = (follows !== false); // true by default
  this.desiredSep = this.follows ? 85.0 : 160.0; // grey-blue fish stay far apart
}

Boid.prototype.run = function (boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
};
Boid.prototype.applyForce = function (force) { this.acceleration.add(force); };
Boid.prototype.flock = function (boids) {
  let sep = this.separate(boids);
  let ali = this.align(boids);
  let coh = this.cohesion(boids);
  if (this.follows) {
    sep.mult(1.5); ali.mult(1.2); coh.mult(1.0);
  } else {
    // Grey-blue independents: strong push-apart, barely clump
    sep.mult(3.2); ali.mult(0.5); coh.mult(0.1);
  }
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.seekMouse();
};

// Mouse / click force — grey-blue fish ignore everything; followers respond to both
Boid.prototype.seekMouse = function () {
  if (!this.follows) return; // grey-blue fish are fully independent

  let gx = window.fishMX || 0;
  let gy = window.fishMY || 0;
  if (gx === 0 && gy === 0) return;

  if (isClicked && mX > 0 && mY > 0) {
    let dx = mX - this.position.x;
    let dy = mY - this.position.y;
    if (isFood) {
      this.velocity.x += dx * 0.00095;
      this.velocity.y += dy * 0.00095;
    } else {
      this.velocity.x -= dx * 0.00015;
      this.velocity.y -= dy * 0.00015;
    }
  } else {
    this.velocity.x += (gx - this.position.x) * 0.00048;
    this.velocity.y += (gy - this.position.y) * 0.00048;
  }
};
Boid.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
};
Boid.prototype.seek = function (target) {
  let desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);
  return steer;
};
Boid.prototype.render = function () {
  let theta = this.velocity.heading() + radians(90);
  fill(this.rc, this.gc, this.bc, 150);
  stroke(0);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  let s = boidScale;
  ellipse(0, 0, 18 * s, 36 * s);
  triangle(0, 16 * s, -8 * s, 32 * s, 8 * s, 32 * s);
  fill(255);
  ellipse(16 * s * 0.04, -3 * s, 16 * s * 0.4);
  pop();
};
Boid.prototype.borders = function () {
  if (this.position.x < -this.r)          this.position.x = width  + this.r;
  if (this.position.y < -this.r)          this.position.y = height + this.r;
  if (this.position.x > width  + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
};
Boid.prototype.separate = function (boids) {
  let desired_sep = this.desiredSep;
  let steer = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < desired_sep) {
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);
      steer.add(diff);
      count++;
    }
  }
  if (count > 0) steer.div(count);
  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
};
Boid.prototype.align = function (boids) {
  let neighbordist = 68;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) { sum.add(boids[i].velocity); count++; }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }
  return createVector(0, 0);
};
Boid.prototype.cohesion = function (boids) {
  let neighbordist = 68;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < neighbordist) { sum.add(boids[i].position); count++; }
  }
  if (count > 0) { sum.div(count); return this.seek(sum); }
  return createVector(0, 0);
};
