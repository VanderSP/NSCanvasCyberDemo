import { Canvas } from "@nativescript/canvas";

let canvas;
let letters;
let context;
let fontWidth, fontHeight, fontScale;
let text;
let x;
let char;
let wiggle;
let counter;
let bitmap;
text =
  "     welcome to the end of this demo   we are nativescript   we are not like as others   hope you enjoyed the trip   create worlds   create games   create futuristic interfaces   the universe is the limit";
fontScale = 5;
fontWidth = 32 * fontScale;
fontHeight = 25 * fontScale;
letters = 5;
counter = 0;
x = [];
char = [];
wiggle = 40;
let position = letters;
bitmap = new Image();

export const initScroller = (layout) => {
  canvas = new Canvas();
  canvas.width = window.innerWidth;
  canvas.height = fontHeight;
  canvas.left = 420;
  canvas.top = 500;
  canvas.scaleX = 1.75;
  canvas.scaleY = 1.75;
  canvas.on("ready", canvasReady);
  layout.addChild(canvas);
};

const canvasReady = async () => {
  context = canvas.getContext("2d");

  bitmap.onload = () => {
    for (let n = 0; n < 47; n++) {
      char[n] = text.charCodeAt(n) - 97;
      x[n] = n * fontWidth;
    }

    scrollerUpdate();
  };

  bitmap.src = "~/assets/AngelInlined.png";
};

export const scrollerUpdate = () => {
  if (bitmap) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let n = 0; n < letters; n++) {
      for (let xC = 0; xC < fontWidth; xC++) {
        let y =
          100 +
          wiggle *
            Math.sin((x[n] + xC) / (canvas.width / 10) + counter / 4.0 / 6.28) *
            2;
        context.drawImage(
          bitmap,
          char[n] * fontWidth + xC,
          0,
          1,
          fontHeight,
          x[n] + xC,
          y,
          1,
          fontHeight
        );
      }
      x[n] -= 28;
      if (x[n] < -fontWidth) {
        x[n] = (letters - 1) * fontWidth;
        char[n] = text.charCodeAt(position) - 97;
        position++;
        if (position > text.length) position = 0;
      }
    }
    counter += 8;
  }
};
