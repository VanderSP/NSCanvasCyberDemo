import { Vector2 } from "three";

export class Scroller {
  static name = "Scroller";
  static uniforms = {
    fontTex: { type: "f", value: null },
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
  uniform sampler2D fontTex;
  uniform float time;
  uniform vec2 imgAspect;
  
//--- common data ---
vec2 pos = vec2(0);  //  0 .. 1
vec2 uv  = vec2(0);  // -1 .. 1
vec2 tp  = vec2(0);  // text position

//--- font data ---
#define FONT_SIZE1 1.4
#define FONT_SPACE 0.45
#define SIN_FREQ 0.75
#define SIN_SPEED 3.0
#define SCROLL_LEN 58.
#define SCROLL_SPEED 1.4

//----- access to the image of ascii code characters ------
//#define S(a) c+=texture(iChannel0,clamp(tp,0.,1.)/16.+fract(floor(vec2(a,15.999-float(a)/16.))/16.)).x; uv.x-=FONT_SPACE;

#define S(a) c+=char(float(a)); tp.x-=FONT_SPACE;

#define _note  S(10);
#define _star  S(28);
#define _smily S(29);
#define _    S(32);
#define _exc S(33);
#define _add S(43);
#define _dot S(46);

#define _A S(65);
#define _B S(66);
#define _C S(67);
#define _D S(68);
#define _E S(69);
#define _F S(70);
#define _G S(71);
#define _H S(72);
#define _I S(73);
#define _J S(74);
#define _K S(75);
#define _L S(76);
#define _M S(77);
#define _N S(78);
#define _O S(79);
#define _P S(80);
#define _Q S(81);
#define _R S(82);
#define _S S(83);
#define _T S(84);
#define _U S(85);
#define _V S(86);
#define _W S(87);
#define _X S(88);
#define _Y S(89);
#define _Z S(90);

#define _a S(97);
#define _b S(98);
#define _c S(99);
#define _d S(100);
#define _e S(101);
#define _f S(102);
#define _g S(103);
#define _h S(104);
#define _i S(105);
#define _j S(106);
#define _k S(107);
#define _l S(108);
#define _m S(109);
#define _n S(110);
#define _o S(111);
#define _p S(112);
#define _q S(113);
#define _r S(114);
#define _s S(115);
#define _t S(116);
#define _u S(117);
#define _v S(118);
#define _w S(119);
#define _x S(120);
#define _y S(121);
#define _z S(122);

#define _0 S(48);
#define _1 S(49);
#define _2 S(50);
#define _3 S(51);
#define _4 S(52);
#define _5 S(53);
#define _6 S(54);
#define _7 S(55);
#define _8 S(56);
#define _9 S(57);

float char(float ch)
{
  vec4 f = texture2D(fontTex,clamp(tp,0.,1.)/16.+fract(floor(vec2(ch,15.999-float(ch)/16.))/16.));
    return f.x * (f.y+0.3)*(f.z+0.3)*2.0;  
}

vec4 ScrollText1()
{
  tp = uv / FONT_SIZE1;  // set font size
  tp.x = 2.0*(tp.x -4. +mod(3.+time*SCROLL_SPEED, SCROLL_LEN));
  float SIN_AMP = 0.5 / imgAspect.y;
  tp.y = tp.y - 0.5 +SIN_AMP*sin(tp.x*SIN_FREQ +time*SIN_SPEED);

  float c = 0.0;
    
  _W _E _L _C _O _M _E _ _T _O _ _T _H _E _ _N _A _T _I _V _E _S _C _R _I _P _T _
  
  _C _Y _B _E _R _P _U _N _K _ _D _E _M _O _ _ _ _M _A _D _E _ _P _O _S _S _I _B _L _E _ _B _Y
  
  _ _T _R _I _N _I _W _I _Z _ _C _A _N _V _A _S _ _1 _dot _1 _exc _exc _exc

  _ _ _ _ _ _ _star _ _N _O _O _B _S _ _I _N _F _O _R _M _A _T _I _O _N _ _star

  _ _ _ _ _T _H _I _S _ _I _S _ _C _O _D _E _ _R _U _N _N _I _N _G _exc

  _ _N _O _T _ _P _R _E _ _C _R _E _A _T _E _D _  _I _N _ _F _A _N _C _Y _ _M _I _L _L _E _N _I _A _L _ _G _U _I _s _dot _dot _dot 
      
  _ _ _ _ _ _ _P _U _T _ _Y _O _U _R _ _H _E _A _D _P _H _O _N _E _S _ _note _note _note
      
  _ _A _N _D _ _T _O _U _C _H _ _T _O _ _C _O _N _T _I _N _U _E _ _smily _ _smily _ _smily

  return c * vec4(pos, 0.5+0.5*sin(2.0*time),1.0);
}

void main()
{
  pos = vUv.xy / imgAspect.xy; 
  pos.x *= 1.25;
  uv = pos * 2.0 - 1.0;

  gl_FragColor = ScrollText1();
}
`;
}
