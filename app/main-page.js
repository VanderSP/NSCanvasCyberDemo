import {
  AnimationMixer,
  ClampToEdgeWrapping,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  InstancedMesh,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Application, Screen } from "@nativescript/core";
import { TNSPlayer } from "nativescript-audio";
import { AmigaBars } from "./shaders/AmigaBars";
import { CheckerMelt } from "./shaders/CheckerMelt";
import { Fire } from "./shaders/Fire";
import { Fractal } from "./shaders/Fractal";
import { LSDMelt } from "./shaders/LSDMelt";
import { Scroller } from "./shaders/Scroller";
import { VaporOutRun } from "./shaders/VaporOutRun";

import gsap from "gsap/gsap-core";
import { initScroller, scrollerUpdate } from "./SineScroller";

let backCanvas,
  backRenderer,
  backScene,
  backCamera,
  backMaterial,
  glassMesh,
  backMesh;
let topCanvas, topRenderer, topScene, topCamera, topMaterial, topMesh;
let backCanvasAlreadyReady, topCanvasAlreadyReady, RAF;
let canvas2D, textMesh, textMaterial, c2d, fade;
let backSceneTime;
let waveScape, waveScapeGroup, dummy, wInc;
let initialized;
let hemiLight;
let model;
let light;
let nslogo;
let mixer;
let layout;
let clock;
let imgAspect;
let firstScene;
let secondScene, secondScene2, secondScene3;
let thirdScene, thirdScene2, thirdScene3;
let fourthScene;
let fifthScene;
let sixthScene;
let seventhScene;
let text1, text2, text3, text4, text5, text6, text7;
const loader = new TextureLoader();
const player = new TNSPlayer();

export function backReady(event) {
  backCanvas = event.object;

  layout = event.object.parent;

  const context = backCanvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    stencil: false,
    depth: false,
  });
  backRenderer = new WebGLRenderer({ context });

  const { drawingBufferWidth, drawingBufferHeight } = context;
  backCanvas.dbW = drawingBufferWidth;
  backCanvas.dbH = drawingBufferHeight;

  backRenderer.setSize(backCanvas.dbW, backCanvas.dbH);

  setPixelRatioTHREE(backCanvas, backRenderer, 3);

  backScene = new Scene();
  const aspect = backCanvas.dbW / backCanvas.dbH;
  backCamera = new PerspectiveCamera(45, aspect, 0.1, 2000);

  backCamera.position.z = 10;

  const vFov = (backCamera.fov * Math.PI) / 180;
  const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * backCamera.position.z;
  const planeWidthAtDistance = planeHeightAtDistance * aspect;
  const geo = new PlaneGeometry(planeWidthAtDistance, planeHeightAtDistance);
  const shader = AmigaBars;

  imgAspect = new Vector2(
    10 / planeWidthAtDistance / Screen.mainScreen.scale,
    10 / planeHeightAtDistance / Screen.mainScreen.scale
  );

  backSceneTime = 30;
  backMaterial = new ShaderMaterial({
    name: "ShaderMaterial",
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
  });

  backMaterial.uniforms.imgAspect.value = imgAspect;

  light = new PointLight(0xaaffdd, 2.0, 15, 0.5);
  light.position.set(6, -3, 0);
  backScene.add(light);
  hemiLight = new HemisphereLight(0x00ffaa, 0xffaa00, 0.5);
  backScene.add(hemiLight);
  backMesh = new Mesh(geo, backMaterial);
  backScene.add(backMesh);
  const glassGeo = new SphereGeometry(0.5, 14, 8);
  const glassMat = new MeshPhysicalMaterial({
    transmission: 0.82,
    thickness: 2.75,
    opacity: 0.85,
    flatShading: true,
    reflectivity: 0.82,
    roughness: 0.1,
    metalness: 0.05,
    transparent: true,
    side: DoubleSide,
    emissive: new Color(0x101020),
  });
  glassMesh = new Mesh(glassGeo, glassMat);
  backScene.add(glassMesh);
  glassMesh.visible = false;

  createWaveScape();

  clock = new Clock();

  const loader = new GLTFLoader();
  loader.load("~/assets/CesiumMan.glb", function (gltf) {
    model = gltf.scene;

    mixer = new AnimationMixer(model);
    gltf.animations.forEach(function (clip) {
      mixer.clipAction(clip).play();
    });
    model.position.set(0, -5, -20);
    model.rotation.y = -1;
    model.scale.set(4, 4, 4);
    model.visible = false;
    loader.load("~/assets/nslogo.glb", function (gltf) {
      nslogo = gltf.scene;

      nslogo.position.set(0, 5, -13);
      nslogo.children[0].material = new MeshStandardMaterial({
        color: 0x4499ff,
        metalness: 0.5,
        roughness: 0,
      });

      backCanvasTotalReady();
    });
  });
}

export function topReady(event) {
  topCanvas = event.object;
  const context = topCanvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    stencil: false,
  });
  topRenderer = new WebGLRenderer({ context });
  topCanvas.top = "-1225px";

  const { drawingBufferWidth, drawingBufferHeight } = context;
  topCanvas.dbW = drawingBufferWidth;
  topCanvas.dbH = drawingBufferHeight;

  topRenderer.setSize(topCanvas.dbW, topCanvas.dbH);

  setPixelRatioTHREE(topCanvas, topRenderer, 3);

  topScene = new Scene();
  topCamera = new PerspectiveCamera(
    45,
    topCanvas.dbW / topCanvas.dbH,
    0.1,
    2000
  );

  topCamera.position.z = 10;

  const aspect = topCanvas.dbW / topCanvas.dbH;
  const vFov = (topCamera.fov * Math.PI) / 180;
  const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * topCamera.position.z;
  const planeWidthAtDistance = planeHeightAtDistance * aspect;
  const geo = new PlaneGeometry(planeWidthAtDistance, planeHeightAtDistance);

  const shader = Scroller;

  topMaterial = new ShaderMaterial({
    name: "ShaderMaterial",
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
  });

  topMaterial.uniforms.imgAspect.value = imgAspect;

  topMesh = new Mesh(geo, topMaterial);
  topScene.add(topMesh);

  canvas2D = document.createElement("canvas");
  canvas2D.width = 512;
  canvas2D.height = 110;
  c2d = canvas2D.getContext("2d");
  c2d.font = "54px sans-serif-medium";
  c2d.lineWidth = 5;
  c2d.fillStyle = "#000000";
  c2d.strokeStyle = "#FFFFFF";
  const texture = new Texture(canvas2D);
  texture.wrapT = texture.wrapS = ClampToEdgeWrapping;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;

  textMaterial = new MeshBasicMaterial({ map: texture, transparent: true });
  textMesh = new Mesh(new PlaneGeometry(10, 0.6), textMaterial);
  topScene.add(textMesh);
  textMaterial.needsUpdate = true;
  textMaterial.map.needsUpdate = true;
  doRenderTop();

  loader.load("~/assets/fontTex.png", (tex) => {
    topMaterial.uniforms.fontTex.value = tex;
    topCanvasTotalReady();
  });
}

// ***** CROSSFIRE READY! *****
const backCanvasTotalReady = () => {
  backCanvasAlreadyReady = true;
  if (topCanvasAlreadyReady) realInit();
};

const topCanvasTotalReady = () => {
  topCanvasAlreadyReady = true;
  if (backCanvasAlreadyReady) realInit();
};

const realInit = () => {
  player.playFromFile({
    audioFile: "~/assets/Paranoimia - Estrayk (Xtronoid Remaster).mp3",
    completeCallback: () => {
      player.play();
    },
  });
  initialized = true;
  animate();
  layout.on("touch", () => {
    if (!demoStarted) {
      demoStarted = true;

      player.playFromFile({
        audioFile: "~/assets/Jester - Cyber Ride (Xtronoid Remaster).mp3",
        loop: false,
      });
      placeText("dummy", -10, 10);
    }
  });
};

let demoStarted;
let renderBack = true;
let renderTop = true;

let time = 0;

let musicSequence;

const changeShader = (material, shader) => {
  time = 0;
  material.fragmentShader = shader.fragmentShader;
  material.needsUpdate = true;
};

const placeText = (text, x, y) => {
  c2d.clearRect(0, 0, 512, 110);
  c2d.strokeText(text, 32, 96);
  c2d.fillText(text, 32, 96);
  textMaterial.opacity = 1;
  textMaterial.map.needsUpdate = true;
  textMesh.position.set(x, y, 0);
  doRenderTop();
  setTimeout(() => {
    gsap.to(textMaterial, {
      opacity: 0,
      duration: 0.85,
      onUpdate: () => {
        doRenderTop();
      },
    });
  }, 2500);
};

const createWaveScape = () => {
  waveScapeGroup = new Group();
  dummy = new Object3D();

  waveScape = new InstancedMesh(
    new SphereGeometry(0.1, 8, 8),
    new MeshNormalMaterial({ flatShading: true }),
    1024
  );

  waveScapeGroup.position.y = -15;
  waveScapeGroup.position.z = -80;
  waveScapeGroup.rotation.y = -1.6;
  waveScapeGroup.visible = false;
  waveScapeGroup.add(waveScape);
  wInc = 0;
};

const animate = () => {
  RAF = requestAnimationFrame(animate);

  if (demoStarted) {
    musicSequence = player.currentTime / 1000;
    if (musicSequence > 0) {
      if (!firstScene) {
        firstScene = true;
        renderTop = false;
        topMesh.visible = false;
        doRenderTop();
        setPixelRatioTHREE(topCanvas, topRenderer, 1, true);
        changeShader(backMaterial, VaporOutRun);
        setPixelRatioTHREE(backCanvas, backRenderer, 6);
      }
    }
    if (musicSequence > 4) {
      if (!text1) {
        text1 = true;
        placeText("No more webviews!", -1, 3);
      }
    }
    if (musicSequence > 9) {
      if (!text2) {
        text2 = true;
        placeText("Direct Access GPU!", 0, 1);
      }
    }
    if (musicSequence > 16) {
      if (!text3) {
        text3 = true;
        placeText("Android & iOS!", 3, -2);
      }
    }
    if (musicSequence > 22.3) {
      if (!text4) {
        text4 = true;
        placeText("ARE YOU READY?!", 0, 0);
      }
    }

    if (musicSequence > 25.7) {
      if (!secondScene) {
        secondScene = true;
        backScene.visible = false;
        changeShader(backMaterial, LSDMelt);
        doRenderBack();
        setTimeout(() => {
          setPixelRatioTHREE(backCanvas, backRenderer, 1);
          backScene.visible = true;
        }, 15);
        setTimeout(() => {
          glassMesh.visible = true;
        }, 130);
      }
    }

    if (musicSequence > 38.3) {
      if (!secondScene2) {
        secondScene2 = true;
        backMaterial.uniforms["alternate"].value = 1.0;
      }
    }

    if (musicSequence > 51.6) {
      if (!secondScene3) {
        secondScene3 = true;
        backMaterial.uniforms["alternate"].value = 0.0;
      }
    }

    //console.log(musicSequence);
    if (musicSequence > 67.5) {
      if (!thirdScene) {
        thirdScene = true;
        backSceneTime = 120;
        changeShader(backMaterial, CheckerMelt);
      }
    }
    if (musicSequence > 82.5) {
      if (!thirdScene2) {
        thirdScene2 = true;
        backMaterial.uniforms["alternate"].value = 1.0;
      }
    }

    if (musicSequence > 89.7) {
      if (!thirdScene3) {
        thirdScene3 = true;
        backMaterial.uniforms["alternate"].value = 0.0;
      }
    }

    if (musicSequence > 102.7) {
      if (!fourthScene) {
        fourthScene = true;
        glassMesh.visible = false;
        changeShader(backMaterial, Fractal);
      }
    }

    if (musicSequence > 122) {
      if (!fifthScene) {
        fifthScene = true;
        backSceneTime = 30;
        setPixelRatioTHREE(backCanvas, backRenderer, 6);
        changeShader(backMaterial, VaporOutRun);
      }
    }

    if (musicSequence > 125) {
      if (!text5) {
        text5 = true;
        placeText("Native 3D Speed!", -1, 3);
      }
    }
    if (musicSequence > 134) {
      if (!text6) {
        text6 = true;
        placeText("...JS Easiness!", 0, 1);
      }
    }
    if (musicSequence > 144) {
      if (!text7) {
        text7 = true;
        placeText("Vulkan in roadmap!", 1, -2);
      }
    }

    if (musicSequence > 154.5) {
      if (!sixthScene) {
        sixthScene = true;
        renderTop = false;
        backMesh.visible = false;
        time = 0;
        hemiLight.color = new Color(0xffffaa);
        hemiLight.groundColor = new Color(0xaaaaff);
        hemiLight.intensity = 1;
        light.position.set(0, 3, 0);
        setTimeout(() => {
          setPixelRatioTHREE(backCanvas, backRenderer, 1);
          backScene.add(waveScapeGroup);
          backScene.add(model);
          model.visible = true;
          waveScapeGroup.visible = true;
        }, 60);
      }
    }

    if (musicSequence > 225) {
      if (!seventhScene) {
        seventhScene = true;
        initScroller(layout);
        model.visible = false;
        waveScapeGroup.visible = false;
        backScene.remove(waveScapeGroup);
        backScene.remove(model);
        backScene.remove(hemiLight);
        backScene.remove(light);
        topScene.add(hemiLight);
        topScene.add(light);
        backMesh.visible = true;
        backCamera.position.z = 10;
        setPixelRatioTHREE(topCanvas, topRenderer, 3);
        topCanvas.top = -800;
        topCanvas.left = -35;
        const nWidth = (Screen.mainScreen.widthPixels * 3.5) / 3;
        const nHeight = Screen.mainScreen.heightPixels / 3;
        topCanvas.width = nWidth + "px";
        topCanvas.heigth = nHeight + "px";
        topRenderer.setSize(nWidth, nHeight);
        topCamera.aspect = nWidth / nHeight;
        renderTop = true;
        topScene.add(nslogo);
        setPixelRatioTHREE(backCanvas, backRenderer, 6);
        changeShader(backMaterial, Fire);
      }
    }
  }

  if (time % 2) {
    if (renderBack) {
      if (backMesh.visible)
        backMaterial.uniforms.time.value = time / backSceneTime;

      if (glassMesh.visible) {
        glassMesh.position.set(
          (Math.sin(time / 60) + Math.sin(time / 45)) / 2,
          Math.cos(time / 90) + Math.cos(time / 60),
          (3 + Boolean(thirdScene3) * 3) *
            (Math.sin(time / 90) + Math.sin(time / 60))
        );

        glassMesh.rotation.set(time / 60, time / 30, time / 90);
      }

      if (waveScapeGroup && waveScapeGroup.visible) {
        const wTime = time / 3;
        for (var x = -16; x < 16; x++) {
          for (var z = -16; z < 16; z++) {
            dummy.position.set(
              x,
              Math.sin((x + wTime) * 0.3) * 2 + Math.sin((z + wTime) * 0.3) * 2,
              z
            );
            dummy.updateMatrix();

            waveScape.setMatrixAt(wInc, dummy.matrix);
            if (wInc < 1024) {
              wInc++;
            } else {
              wInc = 0;
            }
          }
        }
        waveScape.instanceMatrix.needsUpdate = true;
        waveScapeGroup.rotation.y += 0.01;
      }

      if (model && model.visible) {
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta * 1.3);
        model.rotation.y += 0.01;
        backCamera.position.z -= Math.sin(time / 60) / 6;
      }

      doRenderBack();
    }

    if (renderTop) {
      if (seventhScene) {
        nslogo.rotation.set(time / 60, 0, time / 30);
        scrollerUpdate();
      } else {
        topMaterial.uniforms.time.value = time / 60;
      }

      doRenderTop();
    }
  }

  time++;
};

const doRenderBack = () => {
  backRenderer.render(backScene, backCamera);
};
const doRenderTop = () => {
  topRenderer.render(topScene, topCamera);
};

const setPixelRatioTHREE = (canvas, renderer, ratio, full) => {
  if (canvas.backTop == null) canvas.backTop = canvas.top.value;
  if (full) {
    canvas.height = "100%";
    canvas.dbH = Screen.mainScreen.heightPixels;
  }
  canvas.scaleX = ratio;
  canvas.scaleY = ratio;
  canvas.left = canvas.width * ((ratio - 1) / 2) + "px";

  if (full) {
    canvas.top = "0px";
  } else {
    canvas.top =
      -canvas.dbH * ((ratio - 1) / 2) -
      (canvas.backTop ? canvas.backTop : 0) +
      "px";
  }
  renderer.setSize(canvas.dbW / ratio, canvas.dbH / ratio);
};

Application.on(Application.resumeEvent, () => {
  if (initialized) {
    player.resume();
    animate();
  }
});

Application.on(Application.suspendEvent, () => {
  if (initialized) {
    player.pause();
    cancelAnimationFrame(RAF);
  }
});
