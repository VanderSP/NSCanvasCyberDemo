import { Vector2 } from "three";

export class LSDMelt {
  static name = "LSDMelt";
  static uniforms = {
    time: { type: "f", value: 0 },
    alternate: { type: "f", value: 0 },
    imgAspect: { type: "v2", value: new Vector2(1.0, 1.0) },
  };

  static vertexShader = ` 
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); 
  }
  `;

  static fragmentShader = `
  varying vec2 vUv;
  uniform float time;
  uniform float alternate;
  uniform vec2 imgAspect;
  
  const float Pi = 3.14159;
  const float Pi2 = Pi * 2.0;
  const float hPi = Pi * 0.5;
  vec3 ct[9]; 
  
  vec3 lookup(const float pos)
  {
      float p = fract(pos) * 7.999;
      int i = int(p);
      float f = fract(p);
      vec3 res = vec3(0.0);
      vec3 a = vec3(0.0);
      vec3 b = vec3(0.0);
      
      if (i < 4)
      {
          if (i < 2)
          {
              if (i == 0)
              {
                  a = ct[0]; b = ct[1];    
              }
              else
              {
                  a = ct[1]; b = ct[2];
              }            
          }
          else
          {
              if (i == 2)
              {
                  a = ct[2]; b = ct[3];    
              }
              else
              {
                  a = ct[3]; b = ct[4];
              }            
          }    
      }
      else
      {
        if (i < 6)
          {
              if (i == 4)
              {
                  a = ct[4]; b = ct[5];    
              }
              else
              {
                  a = ct[5]; b = ct[6];
              }            
          }
          else
          {
              if (i == 6)
              {
                  a = ct[6]; b = ct[7];    
              }
              else
              {
                  a = ct[7]; b = ct[8];
              }            
          }    
      }
      
    return mix(a, b, f);
  }
  
  
  void main()
  {
  
if(alternate==1.0){
  ct[0] = vec3(0.5, 0.0, 0.3);
  ct[1] = vec3(0.3, 0.1, 0.0);
  ct[2] = vec3(1.0, 0.3, 1.0);
  ct[3] = vec3(1.0, 0.6, 1.0);
  ct[4] = vec3(1.0, 0.9, 1.0);
  ct[5] = vec3(1.0, 0.6, 1.0);
  ct[6] = vec3(1.0, 0.3, 1.0);
  ct[7] = vec3(0.3, 0.1, 0.0);
  ct[8] = vec3(0.5, 0.0, 0.3);
    
}else{
    ct[0] = vec3(0.5, 0.0, 0.3);
    ct[1] = vec3(0.3, 0.1, 0.0);
    ct[2] = vec3(1.0, 0.3, 0.0);
    ct[3] = vec3(1.0, 0.6, 0.0);
    ct[4] = vec3(1.0, 0.9, 0.0);
    ct[5] = vec3(1.0, 0.6, 0.0);
    ct[6] = vec3(1.0, 0.3, 0.0);
    ct[7] = vec3(0.3, 0.1, 0.0);
    ct[8] = vec3(0.5, 0.0, 0.3);
  }
       
      float zoomTime = time * 0.073;

      vec2 uv = vUv.xy / imgAspect.xy;
      vec2 uvCos = vUv.xy / imgAspect.xy;
      
      uvCos.x = -cos(uvCos.x * Pi2) * 0.5 + 0.5;
      uvCos.y = -cos(uvCos.y * Pi2) * 0.5 + 0.5;
      
      float zp = -sin(hPi + zoomTime) * 0.5 + 0.5;
      float s = 0.5 + 8.0 * zp * ((0.8 + uvCos.x * 0.9) + (0.9 + (1.0 - -cos(uvCos.y + time)) * 1.3) + (0.9 + (1.0 - -cos(uvCos.x + time)) * 1.3) );
      uv.xy *= s;
      uv.x -= s;
      uv.y -= s * 0.5;
        
      
      float x = 0.5 + 0.5 * -cos(uv.x * Pi2 + time * 2.0)  * (uvCos.y + 1.0);
      x += 0.25 + 0.25 * -cos((uv.x + time * 0.2) * Pi2 * 2.5);
      float y = 0.5 + 0.5 * -cos(uv.y * Pi2);
      float blah = (0.5 + 0.5 * -cos(time * 0.134)) * (uv.x + time * 0.1);
      y += 0.25 + 1.0 * -cos(blah + uv.y * Pi2 * 0.1);
      
      gl_FragColor = vec4(lookup(x * y * (1.1 - pow(zp, 0.125)) * 4.1 + time * 0.001), 1.0);
  }
`;
}
