import { Vector2 } from "three";

export class Fractal {
  static name = "Fractal";
  static uniforms = {
    time: { type: "f", value: 0 },
    alternate: { type: "f", value: 0 },
    imgAspect: { type: "v2", value: new Vector2(1.0, 1.0) },
  };

  static vertexShader = ` 
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
  }
  `;

  static fragmentShader = `
  varying vec2 vUv;
  uniform float time;
  uniform vec2 imgAspect;

  void main()
  {
    vec2 uv = (vUv+vUv-1.0) * 2.0;

	  mat2 m = mat2(cos( .5*time + vec4(0,55,33,0)));
	  for (float t=.8, i=0.; i < 17.; i++)
		  t *= .7+.1*sin(2.243*time),
		  uv.y = abs( uv *= m ).y - t;
	 
	  gl_FragColor = vec4(.7,.9,1,0) * exp(-1e4*dot(uv,uv));
  }
`;
}
