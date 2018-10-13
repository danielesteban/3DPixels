import {
  Mesh,
  PlaneBufferGeometry,
  ShaderLib,
  ShaderMaterial,
  UniformsUtils,
} from 'three';

class Ground extends Mesh {
  constructor() {
    const geometry = new PlaneBufferGeometry(1, 1);
    geometry.rotateX(Math.PI * -0.5);
    geometry.translate(0, -0.001, 0);
    const vertexShader = ShaderLib.basic.vertexShader.replace(
      '#include <clipping_planes_pars_vertex>',
      [
        '#include <clipping_planes_pars_vertex>',
        'varying vec3 vWorldPosition;',
      ].join('\n')
    ).replace(
      '#include <fog_vertex>',
      [
        '#include <fog_vertex>',
        'vWorldPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;',
      ].join('\n')
    );
    const fragmentShader = ShaderLib.basic.fragmentShader.replace(
      '#include <clipping_planes_pars_fragment>',
      [
        '#include <clipping_planes_pars_fragment>',
        'varying vec3 vWorldPosition;',
      ].join('\n')
    ).replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      [
        'vec2 coord = vWorldPosition.xz * 0.25;',
        'vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);',
        'float line = min(grid.x, grid.y);',
        'vec4 diffuseColor = vec4(mix(diffuse, diffuse * 1.25, 1.0 - min(line, 1.0)), opacity);',
      ].join('\n')
    );
    super(
      geometry,
      new ShaderMaterial({
        name: 'ground-material',
        uniforms: UniformsUtils.clone(ShaderLib.basic.uniforms),
        fragmentShader,
        vertexShader,
        extensions: { derivatives: true },
        fog: true,
      })
    );
    this.material.color = this.material.uniforms.diffuse.value;
    this.scale.set(512, 1, 512);
  }
}

export default Ground;
