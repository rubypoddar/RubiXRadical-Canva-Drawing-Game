var _canvas = document.getElementById("_canvas");
var _ctx = _canvas.getContext("2d");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cw = canvas.width = _canvas.width = 500,
  cx = cw / 2;
var ch = canvas.height = _canvas.height = 500,
  cy = ch / 2;
_ctx.strokeStyle = "white";

var drawing = false;
var smoothingFactor = 5;
var rad = Math.PI / 180;
var N = 16;
var A = 360 * rad / N;

var img = _canvas;

var strokeRy = [{x: 0, y: 0}];
var strokeRy1 = [{x: 0, y: 0}];

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", mouseUpOrOut);
canvas.addEventListener("mouseout", mouseUpOrOut);
canvas.addEventListener("dblclick", resetCanvas);
canvas.addEventListener("mousemove", drawIfDrawing);

document.querySelector("#N input").addEventListener("input", updateSlices);
document.querySelector("#S input").addEventListener("input", updateSmoothing);

function startDrawing(e) {
  drawing = true;
  strokeRy.length = strokeRy1.length = 0;
  getPoints(oMousePos(canvas, e));
}

function mouseUpOrOut() {
  if (drawing && strokeRy.length > 1) {
    clearCanvas();
    reDraw(smoothingFactor, strokeRy);
    reDraw(smoothingFactor, strokeRy1);
    for (var i = 0; i < N; i++) rotateImg(img, ctx, i * A);
  }
  drawing = false;
}

function resetCanvas() {
  drawing = false;
  clearCanvas();
}

function drawIfDrawing(e) {
  if (drawing) {
    var m = oMousePos(canvas, e);
    getPoints(m);
    clearCanvas();
    draw(strokeRy);
    draw(strokeRy1);
    for (var i = 0; i < N; i++) rotateImg(img, ctx, i * A);
  }
}

function updateSlices() {
  N = +this.value;
  A = 360 * rad / N;
  clearCanvas();
  for (var i = 0; i < N; i++) rotateImg(img, ctx, i * A);
  document.querySelector("#N span").innerHTML = N;
}

function updateSmoothing() {
  smoothingFactor = +this.value;
  clearCanvas();
  reDraw(smoothingFactor, strokeRy);
  reDraw(smoothingFactor, strokeRy1);
  for (var i = 0; i < N; i++) rotateImg(img, ctx, i * A);
  document.querySelector("#S span").innerHTML = smoothingFactor;
}

function clearCanvas() {
  ctx.clearRect(0, 0, cw, ch);
  _ctx.clearRect(0, 0, cw, ch);
}

function oMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {x: Math.round(evt.clientX - rect.left), y: Math.round(evt.clientY - rect.top)};
}

function getPoints(m) {
  var m1 = {x: cw - m.x, y: m.y};
  strokeRy.push(m);
  strokeRy1.push(m1);
}

function draw(ry) {
  _ctx.beginPath();
  _ctx.moveTo(ry[0].x, ry[0].y);
  for (var i = 1; i < ry.length; i++) _ctx.lineTo(ry[i].x, ry[i].y);
  _ctx.stroke();
}

function smoothStroke(ry) {
  if (ry.length > 1) {
    _ctx.beginPath();
    _ctx.moveTo(ry[0].x, ry[0].y);
    for (var i = 1; i < ry.length - 2; i++) {
      var pc = getControlPoint(ry[i], ry[i + 1]);
      _ctx.quadraticCurveTo(ry[i].x, ry[i].y, pc.x, pc.y);
    }
    _ctx.quadraticCurveTo(ry[ry.length - 2].x, ry[ry.length - 2].y, ry[ry.length - 1].x, ry[ry.length - 1].y);
    _ctx.stroke();
  }
}

function getControlPoint(a, b) {
  return {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
}

function decimateByFactor(n, ry) {
  var newRy = [ry[0]];
  for (var i = 1; i < ry.length; i++) if (i % n === 0) newRy.push(ry[i]);
  newRy[newRy.length - 1] = ry[ry.length - 1];
  return newRy;
}

function reDraw(n, ry) {
  var newRy = decimateByFactor(n, ry);
  smoothStroke(newRy);
}

function rotateImg(img, ctx, rot) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.translate(-cx, -cy);
  ctx.drawImage(img, 0, 0, cw, ch);
  ctx.restore();
}
