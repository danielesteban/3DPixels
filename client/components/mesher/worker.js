import { PNG } from 'pngjs';

const SIZE = 32;
const DEPTH = 3;

const decode = buffer => (
  new Promise((resolve, reject) => (
    new PNG({ filterType: 4 }).parse(buffer, (err, { width, height, data }) => {
      if (err) {
        reject(err);
        return;
      }
      if (height !== SIZE) {
        reject(new Error('Invalid dimensions'));
      }
      resolve({ data, stride: width });
    })
  ))
);

const getFrames = ({ data, stride }) => {
  const frames = [];
  for (let frame = 0; frame < Math.floor(stride / SIZE); frame += 1) {
    const pixels = [];
    for (let y = 0; y < SIZE; y += 1) {
      pixels[y] = [];
      for (let x = 0; x < SIZE; x += 1) {
        const i = (((SIZE - 1 - y) * stride) + (frame * SIZE) + x) * 4;
        const a = data[i + 3];
        pixels[y][x] = a >= 0X80 ? ({
          r: (data[i] / 0xFF) * (a / 0xFF),
          g: (data[i + 1] / 0xFF) * (a / 0xFF),
          b: (data[i + 2] / 0xFF) * (a / 0xFF),
        }) : (
          false
        );
      }
    }
    frames.push(pixels);
  }
  return frames;
};

const getMesh = (frames) => {
  const position = [];
  const color = [];
  const index = [];
  const ranges = [];
  const origin = SIZE * -0.5;
  let i = 0;
  const pushFace = (pixel, ...v) => {
    const { r, g, b } = pixel;
    position.push(
      origin + v[0], v[1], v[2],
      origin + v[3], v[4], v[5],
      origin + v[6], v[7], v[8],
      origin + v[9], v[10], v[11]
    );
    color.push(
      r, g, b,
      r, g, b,
      r, g, b,
      r, g, b
    );
    index.push(
      i, i + 1, i + 2,
      i + 2, i + 3, i
    );
    i += 4;
  };
  frames.forEach((pixels) => {
    const start = index.length;
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (!pixel) return;
        pushFace(
          pixel,
          x - 0.5, y - 0.5, 0,
          x + 0.5, y - 0.5, 0,
          x + 0.5, y + 0.5, 0,
          x - 0.5, y + 0.5, 0
        );
        pushFace(
          pixel,
          x + 0.5, y - 0.5, -DEPTH,
          x - 0.5, y - 0.5, -DEPTH,
          x - 0.5, y + 0.5, -DEPTH,
          x + 0.5, y + 0.5, -DEPTH
        );
        if (x === 0 || !pixels[y][x - 1]) {
          pushFace(
            { r: pixel.r * 0.5, g: pixel.g * 0.5, b: pixel.b * 0.5 },
            x - 0.5, y - 0.5, -DEPTH,
            x - 0.5, y - 0.5, 0,
            x - 0.5, y + 0.5, 0,
            x - 0.5, y + 0.5, -DEPTH
          );
        }
        if (x === SIZE - 1 || !pixels[y][x + 1]) {
          pushFace(
            { r: pixel.r * 0.5, g: pixel.g * 0.5, b: pixel.b * 0.5 },
            x + 0.5, y - 0.5, 0,
            x + 0.5, y - 0.5, -DEPTH,
            x + 0.5, y + 0.5, -DEPTH,
            x + 0.5, y + 0.5, 0
          );
        }
        if (y === 0 || !pixels[y - 1][x]) {
          pushFace(
            { r: pixel.r * 0.25, g: pixel.g * 0.25, b: pixel.b * 0.25 },
            x - 0.5, y - 0.5, -DEPTH,
            x + 0.5, y - 0.5, -DEPTH,
            x + 0.5, y - 0.5, 0,
            x - 0.5, y - 0.5, 0
          );
        }
        if (y === SIZE - 1 || !pixels[y + 1][x]) {
          pushFace(
            { r: pixel.r * 0.75, g: pixel.g * 0.75, b: pixel.b * 0.75 },
            x - 0.5, y + 0.5, 0,
            x + 0.5, y + 0.5, 0,
            x + 0.5, y + 0.5, -DEPTH,
            x - 0.5, y + 0.5, -DEPTH
          );
        }
      });
    });
    ranges.push({ start, count: index.length - start });
  });
  return {
    position: new Float32Array(position),
    color: new Float32Array(color),
    index: (
      position.length > 65535 ? (
        new Uint32Array(index)
      ) : (
        new Uint16Array(index)
      )
    ),
    frames: ranges,
  };
};

// eslint-disable-next-line no-restricted-globals
self.onmessage = ({ data: { buffer } }) => {
  decode(buffer)
    .then(getFrames)
    .then(getMesh)
    .then(({
      position,
      color,
      index,
      frames,
    }) => {
      // eslint-disable-next-line no-restricted-globals
      self.postMessage({
        position,
        color,
        index,
        frames,
      }, [
        position.buffer,
        color.buffer,
        index.buffer,
      ]);
    })
    .catch(console.error);
};
