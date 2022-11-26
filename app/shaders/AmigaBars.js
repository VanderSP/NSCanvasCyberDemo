import { Vector2 } from "three";

export class AmigaBars {
  static name = "AmigaBars";
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
  uniform vec2 imgAspect;

  #define dir 2    // define direction 0,1,2,3  up/down/left/right
  #define speed 0.4

vec2 mod289(vec2 x) {
		  return x - floor(x * (1.0 / 289.0)) * 289.0;
		}

		vec3 mod289(vec3 x) {
		  	return x - floor(x * (1.0 / 289.0)) * 289.0;
		}
		
		vec4 mod289(vec4 x) {
		  	return x - floor(x * (1.0 / 289.0)) * 289.0;
		}
		
		vec3 permute(vec3 x) {
		  return mod289(((x*34.0)+1.0)*x);
		}

		vec4 permute(vec4 x) {
		  return mod((34.0 * x + 1.0) * x, 289.0);
		}

		vec4 taylorInvSqrt(vec4 r)
		{
		  	return 1.79284291400159 - 0.85373472095314 * r;
		}
		
		float snoise(vec2 v)
		{
				const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
				vec2 i  = floor(v + dot(v, C.yy) );
				vec2 x0 = v -   i + dot(i, C.xx);
				
				vec2 i1;
				i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
				vec4 x12 = x0.xyxy + C.xxzz;
				x12.xy -= i1;
				
				i = mod289(i); // Avoid truncation effects in permutation
				vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
					+ i.x + vec3(0.0, i1.x, 1.0 ));
				
				vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
				m = m*m ;
				m = m*m ;
				
				vec3 x = 2.0 * fract(p * C.www) - 1.0;
				vec3 h = abs(x) - 0.5;
				vec3 ox = floor(x + 0.5);
				vec3 a0 = x - ox;
				
				m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
				
				vec3 g;
				g.x  = a0.x  * x0.x  + h.x  * x0.y;
				g.yz = a0.yz * x12.xz + h.yz * x12.yw;

				return 130.0 * dot(m, g);		
		}
		
		float cellular2x2(vec2 P)
		{
				#define K 0.142857142857 // 1/7
				#define K2 0.0714285714285 // K/2
				#define jitter 0.8 // jitter 1.0 makes F1 wrong more often
				
				vec2 Pi = mod(floor(P), 289.0);
				vec2 Pf = fract(P);
				vec4 Pfx = Pf.x + vec4(-0.5, -1.5, -0.5, -1.5);
				vec4 Pfy = Pf.y + vec4(-0.5, -0.5, -1.5, -1.5);
				vec4 p = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0));
				p = permute(p + Pi.y + vec4(0.0, 0.0, 1.0, 1.0));
				vec4 ox = mod(p, 7.0)*K+K2;
				vec4 oy = mod(floor(p*K),7.0)*K+K2;
				vec4 dx = Pfx + jitter*ox;
				vec4 dy = Pfy + jitter*oy;
				vec4 d = dx * dx + dy * dy; // d11, d12, d21 and d22, squared
				// Sort out the two smallest distances
				
				// Cheat and pick only F1
				d.xy = min(d.xy, d.zw);
				d.x = min(d.x, d.y);
				return d.x; // F1 duplicated, F2 not computed
		}
		

	float barsize = 0.08;
	float cr=0.0; // color reduction ;
	vec2 position=vec2(0); 
	vec3 color=vec3(0);


    float r=1.0;
    float g=1.0;
    float b=0.0;


vec3 mixcol(float value, float r, float g, float b)
{
	return vec3(value * r, value * g, value * b);
}

void bar(float pos, float r, float g, float b)
{
	 if ((position.y <= pos + barsize) && (position.y >= pos - barsize))
		color = mixcol(1.0 - abs(pos - position.y) / barsize, r, g, b);
}

float checkers(vec2 q)
{
    return mod(floor(q.x) + floor(q.y), 2.0);
}

void main()
{
	    
    vec2 q = vUv.xy / imgAspect.xy;
	
	vec2 GA=vec2(0);
				
	#if dir==0 
	GA.y +=time*speed;
	#elif dir==1
	GA.y -=time*speed;
	#elif dir==2
	GA.x +=time*speed;
	#elif dir==3
	GA.x -=time*speed;
	#endif
	
    float   F1,F2,F3,F4=0.0;
	float   N1,N2,N3,N4=0.0;
	float A,A1,A2,A3,A4=0.0;

	F1 = 1.0-cellular2x2((vUv+(GA*0.1))*8.0);	
	A1 = 1.0-(A*0.8);
	N1 = smoothstep(0.9998,1.0,F1)*0.2*A1;	

	F2 = 1.0-cellular2x2((vUv+(GA*0.2))*7.0);	
	A2 = 1.0-(A*0.8);
	N2 = smoothstep(0.9998,1.0,F2)*0.3*A2;				

	F3 = 1.0-cellular2x2((vUv+(GA*0.3))*6.0);	
	A3 = 1.0-(A*0.8);
	N3 = smoothstep(0.9998,1.0,F3)*0.4*A3;			
			
	F4 = 1.0-cellular2x2((vUv+(GA*0.4))*5.0);	
	A4 = 1.0-(A*0.8);
	N4 = smoothstep(0.9998,1.0,F4)*0.5*A4;	
			
	float cl= N4+N3+N2+N1;

    gl_FragColor = vec4(cl, cl, cl, 1.0)*2.;

    position = vUv.xy / imgAspect.xy;
	position = position * vec2(2.0) - vec2(1.0); 	
	
	float t = time;
    
	if     (mod(0.1*t,2.) < 1.){r=1.0;g=1.0;b=1.0;}
    if     (mod(0.2*t,2.) < 1.){r=1.0;g=0.0;b=0.0;}
    if     (mod(0.3*t,2.) < 1.){r=1.0;g=0.0;b=1.0;}
    
    float ps=0.4;
    float bf=20.0;
    
    for(float i=0.0;i<1.6;i+=0.08){
     cr-=0.05;
     bar(2. + (ps*cos(t*1.8+bf*8.*i)),r-cr,g-cr,b-cr);
    }
    	
    gl_FragColor += vec4(vec3(color),1.0);
    
    float x=vUv.x;
    float coppers = -t*5.0;
    float rep = 128.;
    vec3 col2 = vec3(0.5 + 0.5 * sin(x/rep + 3.14 + coppers), 0.5 + 0.5 * cos (x/rep + coppers), 0.5 + 0.5 * sin (x/rep + coppers));
    vec3 col3 = vec3(0.5 + 0.5 * sin(x/rep + 3.14 - coppers), 0.5 + 0.5 * cos (x/rep - coppers), 0.5 + 0.5 * sin (x/rep - coppers));	
    if ( q.y > 2.0 && q.y < 2.01) gl_FragColor = vec4 (vec3(col2), 1.0 ); 
	if ( q.y > 0.3 && q.y<0.31) gl_FragColor = vec4 (vec3(col3), 1.0 );
} 
`;
}
