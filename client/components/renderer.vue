<script>
import fullscreen from 'fullscreen';
import {
  Clock,
  FogExp2,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  Vector2,
  WebGLRenderer,
} from 'three';
import Touches from 'touches';
import Actor from './meshes/actor';
import Ground from './meshes/ground';

// Fix threeJS Fog
ShaderChunk.fog_pars_vertex = ShaderChunk.fog_pars_vertex.replace(
  'varying float fogDepth;',
  'varying vec4 fogDepth;'
);
ShaderChunk.fog_vertex = ShaderChunk.fog_vertex.replace(
  'fogDepth = -mvPosition.z;',
  'fogDepth = mvPosition;'
);
ShaderChunk.fog_pars_fragment = ShaderChunk.fog_pars_fragment.replace(
  'varying float fogDepth;',
  'varying vec4 fogDepth;'
);
ShaderChunk.fog_fragment = ShaderChunk.fog_fragment.replace(
  'float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );',
  [
    'float fogDist = length(fogDepth);',
    'float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDist * fogDist * LOG2 ) );',
  ].join('\n')
).replace(
  'float fogFactor = smoothstep( fogNear, fogFar, fogDepth );',
  'float fogFactor = smoothstep( fogNear, fogFar, length(fogDepth) );'
);

export default {
  name: 'Renderer',
  props: {
    mesh: {
      type: Object,
      required: true,
    },
    pointerAnimation: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  watch: {
    'mesh.bg': function watchBackground() {
      const { mesh: { bg } } = this;
      this.setClearColor(bg);
    },
    'mesh.fps': function watchFps() {
      const { mesh: { fps }, state: { actor } } = this;
      actor.fps = fps;
    },
    'mesh.texture': function watchTexture() {
      const { mesh: { texture }, state: { actor } } = this;
      actor.load(texture);
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.destroy();
  },
  methods: {
    init() {
      const SIZE = __SIZE__;
      const { mesh, $refs: { mount } } = this;
      const state = {};
      this.state = state;
      state.mount = mount;
      state.camera = new PerspectiveCamera(SIZE, 1, 1, 1024);
      state.clock = new Clock();
      state.renderer = new WebGLRenderer({ alpha: false, antialias: true });
      state.renderer.setPixelRatio(window.devicePixelRatio || 1);
      state.scene = new Scene();
      state.scene.fog = new FogExp2(0, SIZE * 0.000117);
      state.tilt = new Object3D();
      state.tilt.add(state.camera);
      state.camera.position.z = SIZE;
      state.tilt.position.y = SIZE * 0.5;
      state.pan = new Object3D();
      state.pan.add(state.tilt);
      state.scene.add(state.pan);

      state.actor = new Actor(mesh);
      state.scene.add(state.actor);
      state.ground = new Ground();
      state.scene.add(state.ground);
      this.setClearColor(mesh.bg);

      mount.appendChild(state.renderer.domElement);
      mount.addEventListener('contextmenu', e => e.preventDefault(), false);
      mount.addEventListener('dblclick', this.requestFullscreen, false);
      mount.addEventListener('mouseenter', this.onPointerEnter, false);
      mount.addEventListener('mouseleave', this.onPointerLeave, false);
      window.addEventListener('blur', this.onPointerUp, false);
      window.addEventListener('resize', this.onResize, false);
      state.fullscreen = fullscreen(mount);
      this.$parent.$on('fullscreen', this.requestFullscreen);
      state.renderer.setAnimationLoop(this.onAnimate);
      this.onResize();

      state.pointer = {
        active: false,
        animation: this.pointerAnimation,
        over: false,
        current: new Vector2(0, 0),
        movement: new Vector2(0, 0),
        normalized: new Vector2(0, 0),
        last: new Vector2(0, 0),
      };
      state.touches = Touches(window, { filtered: true, target: mount })
        .on('start', this.onPointerDown)
        .on('move', this.onPointerMove)
        .on('end', this.onPointerUp);
    },
    destroy() {
      const {
        actor,
        fullscreen,
        ground,
        mount,
        renderer,
        touches,
      } = this.state;
      ground.geometry.dispose();
      actor.geometry.dispose();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      renderer.forceContextLoss();
      this.$parent.$off('fullscreen', this.requestFullscreen);
      if (fullscreen.target() === mount) {
        fullscreen.release();
      }
      fullscreen.dispose();
      touches.disable();
      window.removeEventListener('blur', this.onPointerUp);
      window.removeEventListener('resize', this.onResize);
    },
    onAnimate() {
      const {
        clock,
        camera,
        fullscreen,
        mount,
        pointer,
        renderer,
        scene,
        tilt,
        pan,
      } = this.state;
      renderer.animationDelta = clock.getDelta();
      renderer.animationTime = clock.oldTime / 1000;
      const maxAngle = Math.PI * 0.45;
      if (pointer.active) {
        const step = renderer.animationDelta * 0.2;
        pan.rotation.y -= pointer.movement.x * step;
        pan.rotation.y = Math.min(Math.max(pan.rotation.y, -maxAngle), maxAngle);
        tilt.rotation.x -= pointer.movement.y * step * 0.5;
        tilt.rotation.x = Math.min(Math.max(tilt.rotation.x, -maxAngle), maxAngle);
        pointer.movement.x = 0;
        pointer.movement.y = 0;
      } else if (pointer.animation && fullscreen.target() !== mount) {
        const step = renderer.animationDelta;
        const smooth = delta => (
          Math.min(Math.max(delta, -step), step)
        );
        if (pointer.over) {
          pan.rotation.y += smooth(
            (pointer.normalized.x * maxAngle) - pan.rotation.y
          );
          tilt.rotation.x += smooth(
            (pointer.normalized.y * maxAngle) - tilt.rotation.x
          );
        } else {
          pan.rotation.y += smooth(-pan.rotation.y);
          tilt.rotation.x += smooth(-tilt.rotation.x);
        }
      }
      renderer.render(scene, camera);
    },
    onPointerDown(e) {
      const { pointer, mount } = this.state;
      if (
        e.target === mount
        || e.target.parentNode === mount
      ) {
        pointer.active = true;
      }
    },
    onPointerMove(e, [x, y]) {
      const { pointer, renderer } = this.state;
      const { width, height } = renderer.getSize();
      pointer.current.x = x;
      pointer.current.y = y;
      pointer.normalized.x = Math.min(Math.max(0.5 - (x / width), -0.5), 0.5);
      pointer.normalized.y = Math.min(Math.max(0.5 - (y / height), -0.5), 0.5);
      pointer.movement.subVectors(pointer.current, pointer.last);
      pointer.last.copy(pointer.current);
    },
    onPointerUp() {
      const { pointer } = this.state;
      pointer.active = false;
    },
    onPointerEnter() {
      const { pointer } = this.state;
      pointer.over = true;
    },
    onPointerLeave() {
      const { pointer } = this.state;
      pointer.over = false;
    },
    onResize() {
      const {
        camera,
        fullscreen,
        mount,
        renderer,
      } = this.state;
      const { width, height } = mount.getBoundingClientRect();
      if (fullscreen.target() === mount) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
      } else {
        renderer.setSize(width, width);
        camera.aspect = 1;
      }
      camera.updateProjectionMatrix();
    },
    requestFullscreen() {
      const { fullscreen, mount } = this.state;
      if (fullscreen.target() === mount) {
        fullscreen.release();
      } else {
        fullscreen.request();
      }
    },
    setClearColor(color) {
      const { ground, renderer, scene: { fog } } = this.state;
      fog.color.setHex(color);
      ground.material.color.copy(fog.color).offsetHSL(0, 0, -0.33);
      renderer.setClearColor(fog.color);
    },
  },
};
</script>

<template>
  <div ref="mount" />
</template>
