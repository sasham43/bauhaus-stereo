const {createCanvas} = require("canvas");
const canvas = createCanvas(480, 320);

// Draw to your canvas:
const ctx = canvas.getContext("2d", {pixelFormat: "RGB16_565"});	// important: RGB16_565
ctx.font = "30px impact";
ctx.fillStyle = "red";
ctx.fillText("Hello!", 50, 100);

// Write to the framebuffer device:
const fs = require("fs");
const fb = fs.openSync("/dev/fb1", "w"); // where /dev/fb1 is the path to your fb device
const buff = canvas.toBuffer("raw");
console.log(buff.byteLength);  // should be equal to width*height*2
fs.writeSync(fb, buff, 0, buff.byteLength, 0);