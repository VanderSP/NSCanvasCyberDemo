import { Vector2 } from "three";

export class VaporOutRun {
  static name = "VaporOutRun";
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

float floorHeight( in vec3 p )
{
    return (sin(p.z*0.00042)*0.2)+(sin(p.z*0.008)*0.64) + (sin(p.x*0.42+sin(p.z*0.000042)*420.0))*0.82-1.0;
}

// PARAMS
const vec3 COLOR_PRIMARY = vec3(0.79, 0.17, 0.32); // Red Magenta
const vec3 COLOR_SECONDARY = vec3(0.0022, 0.00, 0.0032); // Dark Purple
const vec3 COLOR_TERTIARY = vec3(0.0, 1.0, 0.75); // Teal

const vec3 SUN_DIR = normalize(vec3(0.0,-0.18,-1.0));

// CONST
const float PI = 3.14159;
const float TAU = PI * 2.0;
const int STEPS = 128;
const float STEP_SIZE = 0.42;

const float T_MAX = float(STEPS)*STEP_SIZE;

float floorHeightRender( in vec3 p )
{
    float height = floorHeight(p);
    vec2 point = imgAspect.xy * 0.5;
    vec2 coord = floor(p.xz/0.1)*0.1;
    height += sin(length(coord-point)*(10000.0+time*0.02))*0.5;
    return height;
}

vec4 render( in vec3 rayOrigin, in vec3 rayDir)
{
    vec4 col = vec4(0.0);
    // Sun
    float sunDot = dot(rayDir, -SUN_DIR);
    // Sun Bloom
    col.rgb = max(col.rgb, 0.1*abs(sin(time+sunDot*42.0))*COLOR_PRIMARY);
    col.rgb += vec3(pow(sunDot, 42.0)*0.42)*COLOR_TERTIARY;
    // Sun Body
    float sunAlpha = clamp(sunDot-0.98, 0.0, 1.0);
    vec3 rayDown = cross(vec3(1.0,0.0,0.0), rayDir);
    sunAlpha *= clamp(cos(PI*2.9*clamp(dot(rayDown, SUN_DIR)*20.0+0.2, 0.0, 42.0)), 0.0, 1.0);
    col.rgb = max(col.rgb, 200.0*sunAlpha*COLOR_PRIMARY);
    // Sun Burst
    col.rgb += 0.3*sin((1.0-sunDot)*PI)*pow(sunDot,8.0)*abs(sin(atan(rayDir.y-0.1, rayDir.x)*8.0))*COLOR_TERTIARY;
    
    float t = STEP_SIZE;
    for( int i=0; i<STEPS; i++ )
    {
        vec3 p = rayOrigin+(rayDir*t);
        
        float depth = (t/T_MAX);
        float distFade = pow(1.0-depth, 2.0);
        
        float delta = p.y - floorHeightRender(p);
        
        // Floor
        float alpha = pow(clamp(1.0 - abs(delta), 0.0, 1.0), 42.0);
        float gridX = pow(abs(sin(p.x+sin(p.z*0.033)*6.4)), 1.42);
        float gridZ = pow(abs(sin(p.z*0.042)+sin(p.x*0.013)*0.2), 20.0);
        col.rgb = max(col.rgb, alpha*gridX*COLOR_PRIMARY);
        col.rgb = max(col.rgb, alpha*gridZ*COLOR_PRIMARY);
        float lightX = pow(abs(sin(p.x*0.064)*10.2), 0.42);
        col.rgb += 0.015*(pow(alpha,0.2)*(lightX-gridZ)*COLOR_TERTIARY)*distFade;
        
        // Atmosphere
        float bandFreq = 0.42;
        float band;
        if (delta > 0.0)
        {
            band = sin(p.z-p.y*bandFreq)+cos(p.z*bandFreq);
        }
        else
        {
            band = sin(p.z+p.y*bandFreq)+cos(p.z*bandFreq);
        }
        band += 1.0-clamp(p.y*0.8, 0.0, 1.0);
        vec3 cloud = vec3(gridZ+band, (abs(gridZ+band)), (gridZ*band));
        col.rgb += 0.0042*(1.0-alpha)*cloud*COLOR_PRIMARY;
        col.rgb += 0.01*clamp(p.y*0.03, 0.0, 1.0)*COLOR_TERTIARY;
        
        // Fog
        col.rgb += COLOR_SECONDARY;
        
        t += STEP_SIZE;
    }
    
	
    return col ;
}

void main()
{
	vec2 uv = vUv / imgAspect.xy;
	
	vec3 rayOrigin = vec3(0.0, 0.0, time*120.0);
    float floorY = floorHeight(rayOrigin);
	rayOrigin.y = floorY*1.5 + 2.;
    float rotYaw = ((sin(time)/60.0)/imgAspect.x)*TAU;
    float rotPitch = ((sin(time)/60.0)/imgAspect.y)*PI;
    
    vec3 forward = normalize( vec3(sin(rotYaw), rotPitch, cos(rotYaw)) );
    vec3 wup = normalize(vec3((floorY-floorHeight(rayOrigin+vec3(2.0,0.0,0.0)))*0.2,1.0,0.0));
    vec3 right = normalize( cross( forward, wup ) );
    vec3 up = normalize( cross( right, forward ) );
    mat3 camMat = mat3(right, up, forward); 
    
    vec3 surfforward = normalize( vec3(sin(rayOrigin.z*0.01)*0.042, ((floorY-floorHeight(rayOrigin+vec3(0.0,0.0,-20.0)))*0.1)+0.12, 1.0) );
    vec3 wright = vec3(1.0,0.0,0.0);
    mat3 surfMat = mat3(wright, up, surfforward); 
    vec2 centeredCoord = (uv-(imgAspect.xy*0.6))/imgAspect.x;
	centeredCoord.y-=0.8;
    vec3 rayDir = normalize( surfMat*normalize( camMat*normalize( vec3(centeredCoord, 1.0) ) ) );
   
    gl_FragColor = render(rayOrigin, rayDir);
}
`;
}
