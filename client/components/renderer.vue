<script>
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
      const { actor, scene } = this.state;
      scene.remove(actor);
      this.state.actor = new Actor(this.mesh);
      scene.add(this.state.actor);
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
      const { mesh, $refs: { mount } } = this;
      const state = {};
      this.state = state;
      state.mount = mount;
      state.camera = new PerspectiveCamera(74, 1, 1, 1024);
      state.clock = new Clock();
      state.renderer = new WebGLRenderer({ antialias: true });
      state.scene = new Scene();
      state.scene.fog = new FogExp2(0, 0.01);
      state.tilt = new Object3D();
      state.tilt.add(state.camera);
      state.camera.position.z = 32;
      state.tilt.position.y = 16;
      state.pan = new Object3D();
      state.pan.add(state.tilt);
      state.scene.add(state.pan);

      state.actor = new Actor(mesh);
      state.scene.add(state.actor);
      state.ground = new Ground();
      state.scene.add(state.ground);
      this.setClearColor(mesh.bg);
      state.pan.rotation.y = Math.PI * 0.1;
      state.tilt.rotation.x = Math.PI * -0.1;

      mount.appendChild(state.renderer.domElement);
      state.renderer.setPixelRatio(window.devicePixelRatio);
      mount.addEventListener('contextmenu', e => e.preventDefault());
      window.addEventListener('blur', this.onPointerUp, false);
      window.addEventListener('resize', this.onResize, false);
      this.onResize();
      state.renderer.setAnimationLoop(this.onAnimate);

      state.pointer = {
        active: false,
        current: new Vector2(0, 0),
        movement: new Vector2(0, 0),
        last: new Vector2(0, 0),
      };
      state.touches = Touches(window, { filtered: true })
        .on('start', this.onPointerDown)
        .on('move', this.onPointerMove)
        .on('end', this.onPointerUp);
    },
    destroy() {
      const {
        actor,
        ground,
        renderer,
        touches,
      } = this.state;
      ground.geometry.dispose();
      actor.geometry.dispose();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      renderer.forceContextLoss();
      touches.disable();
      window.removeEventListener('blur', this.onPointerUp);
      window.removeEventListener('resize', this.onResize);
    },
    onAnimate() {
      const {
        clock,
        camera,
        pointer,
        renderer,
        scene,
        tilt,
        pan,
      } = this.state;
      renderer.animationDelta = clock.getDelta();
      renderer.animationTime = clock.oldTime / 1000;
      if (pointer.active) {
        const step = renderer.animationDelta * 0.2;
        pan.rotation.y -= pointer.movement.x * step;
        tilt.rotation.x -= pointer.movement.y * step * 0.5;
        tilt.rotation.x = Math.min(Math.max(tilt.rotation.x, Math.PI * -0.5), Math.PI * 0.1);
        pointer.movement.x = 0;
        pointer.movement.y = 0;
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
      const { pointer } = this.state;
      pointer.current.x = x;
      pointer.current.y = y;
      pointer.movement.subVectors(pointer.current, pointer.last);
      pointer.last.copy(pointer.current);
    },
    onPointerUp() {
      const { pointer } = this.state;
      pointer.active = false;
    },
    onResize() {
      const { camera, mount, renderer } = this.state;
      const { width } = mount.getBoundingClientRect();
      renderer.setSize(width, width);
      camera.updateProjectionMatrix();
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