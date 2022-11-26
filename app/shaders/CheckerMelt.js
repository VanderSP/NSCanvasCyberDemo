import { Vector2 } from "three";

export class CheckerMelt {
  static name = "CheckerMelt";
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
  uniform float alternate;
  uniform vec2 imgAspect;
  
  void main()
{
	vec2 uv = -1.0 + 2.0* vUv.xy * imgAspect.xy;
	vec2 coords = vec2( uv.x, 2.0* vUv.y);
	vec2 movingOrigin1 = vec2(sin(time*.7),+sin(time*1.7));
	float frequencyBoost = 75.0; 
	float wavePoint1 = sin(distance(movingOrigin1, coords)*frequencyBoost);
	float blackOrWhite1 = sign(wavePoint1);
	vec2 movingOrigin2 = vec2(-cos(time*1.5),-sin(time*2.0));
	float wavePoint2 = sin(distance(movingOrigin2, coords)*frequencyBoost);
	float blackOrWhite2 = sign(wavePoint2);
  vec3 color;
  vec3 darkColor;
  if(alternate==1.0){
    darkColor = vec3(0.0, 0.0, 0.0 );
    color = vec3(1.0, 1.0, 1.0);
  }
  else{
	color = vec3(1.0, .5, .9 );
	darkColor = vec3(0.5, 0.1, 0.3);
  }
	float composite = blackOrWhite1 * blackOrWhite2;
	gl_FragColor = vec4(max( color * composite, darkColor), 1.0);
}
`;
}
