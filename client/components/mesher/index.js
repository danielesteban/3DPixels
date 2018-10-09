import API from '../../services/api';
import Worker from './worker';

class Mesher {
  constructor() {
    this.queue = [];
    this.workers = [...Array(Mesher.numWorkers)].map(() => {
      const worker = new Worker();
      worker.onmessage = ({ data }) => this.onMessage(worker, data);
      return worker;
    });
  }

  mesh(texture) {
    const { queue, workers } = this;
    const mesh = (buffer, disposable) => (
      new Promise((resolve) => {
        let worker;
        for (let i = 0; i < workers.length; i += 1) {
          if (!workers[i].isBusy) {
            worker = workers[i];
            break;
          }
        }
        if (!worker) {
          queue.push({ buffer, disposable, resolve });
          return;
        }
        worker.isBusy = true;
        worker.resolve = resolve;
        worker.postMessage({ buffer }, disposable ? [buffer] : []);
      })
    );
    if (texture instanceof ArrayBuffer) {
      return mesh(texture, false);
    }
    return API.meshes.texture(texture)
      .then(({ data: texture }) => mesh(texture, true));
  }

  onMessage(worker, data) {
    worker.resolve(data);
    const { queue } = this;
    if (queue.length) {
      const { buffer, disposable, resolve } = queue.shift();
      worker.resolve = resolve;
      worker.postMessage({ buffer }, disposable ? [buffer] : []);
    } else {
      delete worker.resolve;
      worker.isBusy = false;
    }
  }
}

Mesher.numWorkers = navigator.hardwareConcurrency || 4;

export default new Mesher();
