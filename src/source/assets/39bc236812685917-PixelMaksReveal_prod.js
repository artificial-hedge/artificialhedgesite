import{jsx as _jsx}from"react/jsx-runtime";import{useEffect,useRef,useMemo,useCallback,useState}from"react";import{addPropertyControls,ControlType,RenderTarget}from"framer";import{ComponentMessage}from"https://framer.com/m/Utils-FINc.js";// Bundle: Three.js + GSAP + ScrollTrigger (see custom-bundle-gsap/pixel-mask-reveal-bundle)
// Build with: cd custom-bundle-gsap/pixel-mask-reveal-bundle && npm run build
import{Scene,PerspectiveCamera,WebGLRenderer,PlaneGeometry,Mesh,ShaderMaterial,TextureLoader,Vector2,Color,LinearFilter,gsap,ScrollTrigger}from"https://cdn.jsdelivr.net/gh/framer-university/components/npm-bundles/pixel-mask-reveal.js";gsap.registerPlugin(ScrollTrigger);function resolveImageSource(input){if(!input)return null;if(typeof input==="string")return input.trim()||null;return input?.src??input?.url??null;}// Framer color tokens: resolve var(--token) to fallback and parse to rgba (see colorInFramerCanvas.md)
const cssVariableRegex=/var\s*\(\s*(--[\w-]+)(?:\s*,\s*((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*))?\s*\)/;function extractDefaultValue(cssVar){if(!cssVar||!cssVar.startsWith("var("))return cssVar;const match=cssVariableRegex.exec(cssVar);if(!match)return cssVar;const fallback=(match[2]||"").trim();if(fallback.startsWith("var("))return extractDefaultValue(fallback);return fallback||cssVar;}function resolveTokenColor(input){if(typeof input!=="string")return"#242424";if(!input.trim().startsWith("var("))return input.trim();return extractDefaultValue(input)||"#242424";}function parseColorToRgba(input){if(!input)return{r:0,g:0,b:0,a:1};const str=input.trim();const rgbaMatch=str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);if(rgbaMatch){const r=Math.max(0,Math.min(255,parseFloat(rgbaMatch[1])))/255;const g=Math.max(0,Math.min(255,parseFloat(rgbaMatch[2])))/255;const b=Math.max(0,Math.min(255,parseFloat(rgbaMatch[3])))/255;const a=rgbaMatch[4]!==undefined?Math.max(0,Math.min(1,parseFloat(rgbaMatch[4]))):1;return{r,g,b,a};}const hex=str.replace(/^#/,"");if(hex.length===8){return{r:parseInt(hex.slice(0,2),16)/255,g:parseInt(hex.slice(2,4),16)/255,b:parseInt(hex.slice(4,6),16)/255,a:parseInt(hex.slice(6,8),16)/255};}if(hex.length===6){return{r:parseInt(hex.slice(0,2),16)/255,g:parseInt(hex.slice(2,4),16)/255,b:parseInt(hex.slice(4,6),16)/255,a:1};}if(hex.length===4){return{r:parseInt(hex[0]+hex[0],16)/255,g:parseInt(hex[1]+hex[1],16)/255,b:parseInt(hex[2]+hex[2],16)/255,a:parseInt(hex[3]+hex[3],16)/255};}if(hex.length===3){return{r:parseInt(hex[0]+hex[0],16)/255,g:parseInt(hex[1]+hex[1],16)/255,b:parseInt(hex[2]+hex[2],16)/255,a:1};}return{r:0,g:0,b:0,a:1};}function directionToUniforms(direction){switch(direction){case"up":return{axis:0,flip:0}// top to bottom (current default)
;case"down":return{axis:0,flip:1}// bottom to top
;case"left":return{axis:1,flip:1}// right to left
;case"right":return{axis:1,flip:0}// left to right
;default:return{axis:0,flip:0};}}// ============================================================================
// SHADERS (Codrops pixel reveal effect - exact implementation from article)
// https://github.com/J0SUKE/gsap-threejs-codrops
// ============================================================================
const vertexShader=`
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;const fragmentShader=`
uniform sampler2D uTexture;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uProgress;
uniform vec3 uColor;

uniform vec2 uContainerRes;
uniform float uGridSize;
uniform float uRevealAxis;  // 0.0 = vertical (y), 1.0 = horizontal (x)
uniform float uRevealFlip;  // 0.0 = step(progress, coord), 1.0 = step(coord, progress)

// Pseudo-random function for staggered reveal
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Generate square grid UVs for the pixel blocks
vec2 squaresGrid(vec2 vUv) {
    float imageAspectX = 1.0;
    float imageAspectY = 1.0;

    float containerAspectX = uResolution.x / uResolution.y;
    float containerAspectY = uResolution.y / uResolution.x;

    vec2 ratio = vec2(
        min(containerAspectX / imageAspectX, 1.0),
        min(containerAspectY / imageAspectY, 1.0)
    );

    vec2 squareUvs = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    return squareUvs;
}

void main() {
    vec2 newUvs = vUv;

    float imageAspectX = uResolution.x / uResolution.y;
    float imageAspectY = uResolution.y / uResolution.x;

    float containerAspectX = uContainerRes.x / uContainerRes.y;
    float containerAspectY = uContainerRes.y / uContainerRes.x;

    vec2 ratio = vec2(
        min(containerAspectX / imageAspectX, 1.0),
        min(containerAspectY / imageAspectY, 1.0)
    );

    // Cover UVs for object-fit: cover behavior
    vec2 coverUvs = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    // Generate grid
    vec2 squareUvs = squaresGrid(coverUvs);
    float gridSize = floor(uContainerRes.x / uGridSize);
    vec2 grid = vec2(
        floor(squareUvs.x * gridSize) / gridSize,
        floor(squareUvs.y * gridSize) / gridSize
    );
    
    // Grid texture (colored blocks)
    vec4 gridTexture = vec4(uColor, 0.0);

    // Image texture
    vec4 texture = texture2D(uTexture, coverUvs);
    float height = 0.2;
    float margin = 0.35;  // Keep progress outside [0,1] at start/end to avoid pre-animation pixel line

    // Progress: normal goes from (1+margin) to -margin as uProgress 0→1 (top to bottom)
    // Inverse goes from -margin to (1+margin) (bottom to top, left/right). Margin prevents edge artifacts.
    float range = 1.0 + 2.0 * margin;
    float progress = (1.0 + margin) - (uProgress * range);
    float progressInv = -margin + (uProgress * range);

    // Direction: axis 0 = y (up/down), axis 1 = x (left/right). Flip chooses progress vs progressInv.
    float coord = (uRevealAxis < 0.5) ? grid.y : grid.x;
    float progressLine = (uRevealFlip < 0.5) ? progress : progressInv;

    // Distance calculations for reveal effect
    float dist = 1.0 - distance(coord, progressLine);
    float clampedDist = smoothstep(height, 0.0, distance(coord, progressLine));

    // Randomized reveal for staggered pixel effect
    float randDist = step(1.0 - height * random(grid), dist);
    dist = step(1.0 - height, dist);

    float rand = random(grid);

    // Alpha calculation for colored grid overlay
    float alpha = dist * (clampedDist + rand - 0.5 * (1.0 - randDist));
    alpha = max(0.0, alpha);
    gridTexture.a = alpha;

    // Reveal: flip 0 = step(progressLine, coord) [line moves high→low], 1 = step(coord, progressLine) [line moves low→high]
    float show = (uRevealFlip < 0.5) ? step(progressLine, coord) : step(coord, progressLine);
    texture.rgba *= show;

    // Final mix: image with grid overlay
    gl_FragColor = vec4(mix(texture, gridTexture, gridTexture.a));
}
`;// ============================================================================
// COMPONENT
// ============================================================================
/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 300
 * @framerDisableUnlink
 */export default function PixelMaskReveal({preview=false,image,gridSize=20,mode="layer-in-view",startAlign="top",replay=true,revealDuration=1.6,revealDelay=0,pixelColor="#242424",direction="up",borderRadius,style}){const isCanvas=RenderTarget.current()===RenderTarget.canvas;const containerRef=useRef(null);const canvasRef=useRef(null);const sceneRef=useRef(null);const cameraRef=useRef(null);const rendererRef=useRef(null);const meshRef=useRef(null);const materialRef=useRef(null);const scrollTriggerRef=useRef(null);const rafRef=useRef(null);const imageSrcRef=useRef(null);const[textureReady,setTextureReady]=useState(0);const imageSrc=useMemo(()=>resolveImageSource(image),[image]);const hasImage=!!imageSrc;imageSrcRef.current=imageSrc;const triggerSelector=isCanvas?null:containerRef.current;const startThreshold=startAlign==="top"?0:startAlign==="center"?.5:1;const initScene=useCallback(()=>{const container=containerRef.current;const canvas=canvasRef.current;const src=imageSrcRef.current;if(!container||!canvas||!src)return;const width=container.clientWidth;const height=container.clientHeight;if(width<=0||height<=0)return;const scene=new Scene;sceneRef.current=scene;const fov=75;const camera=new PerspectiveCamera(fov,width/height,.1,100);camera.position.z=10;cameraRef.current=camera;const renderer=new WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setSize(width,height);renderer.setPixelRatio(Math.min(2,window.devicePixelRatio));rendererRef.current=renderer;const fovRad=fov*(Math.PI/180);const visibleHeight=2*Math.tan(fovRad/2)*camera.position.z;const visibleWidth=visibleHeight*camera.aspect;const resolvedPixelColor=parseColorToRgba(resolveTokenColor(pixelColor));const geometry=new PlaneGeometry(1,1,1,1);const material=new ShaderMaterial({vertexShader,fragmentShader,uniforms:{uTexture:{value:null},uResolution:{value:new Vector2(1,1)},uContainerRes:{value:new Vector2(width,height)},uProgress:{value:0},uGridSize:{value:gridSize},uColor:{value:new Color(resolvedPixelColor.r,resolvedPixelColor.g,resolvedPixelColor.b)},uRevealAxis:{value:0},uRevealFlip:{value:0}},depthTest:true,depthWrite:true,transparent:true});materialRef.current=material;const mesh=new Mesh(geometry,material);mesh.scale.set(visibleWidth,visibleHeight,1);scene.add(mesh);meshRef.current=mesh;const loader=new TextureLoader;loader.load(src,tex=>{tex.minFilter=LinearFilter;tex.magFilter=LinearFilter;material.uniforms.uTexture.value=tex;material.uniforms.uResolution.value=new Vector2(tex.image.naturalWidth,tex.image.naturalHeight);setTextureReady(v=>v+1);},undefined,()=>{});material.uniforms.uContainerRes.value.set(width,height);material.uniforms.uGridSize.value=gridSize;const{axis,flip}=directionToUniforms(direction);material.uniforms.uRevealAxis.value=axis;material.uniforms.uRevealFlip.value=flip;},[]);const resize=useCallback((observedWidth,observedHeight)=>{const container=containerRef.current;const camera=cameraRef.current;const renderer=rendererRef.current;const material=materialRef.current;const mesh=meshRef.current;const scene=sceneRef.current;if(!container||!camera||!renderer||!material||!scene)return;const width=observedWidth??container.clientWidth;const height=observedHeight??container.clientHeight;if(width<=0||height<=0)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);renderer.setPixelRatio(Math.min(2,window.devicePixelRatio));material.uniforms.uContainerRes.value.set(width,height);// Recalculate mesh scale to fill the visible area
if(mesh){const fovRad=camera.fov*(Math.PI/180);const visibleHeight=2*Math.tan(fovRad/2)*camera.position.z;const visibleWidth=visibleHeight*camera.aspect;mesh.scale.set(visibleWidth,visibleHeight,1);}// Force one frame so resized canvas shows content immediately
renderer.render(scene,camera);},[]);const render=useCallback(()=>{const renderer=rendererRef.current;const scene=sceneRef.current;const camera=cameraRef.current;if(!renderer||!scene||!camera)return;renderer.render(scene,camera);},[]);const startLoop=useCallback(()=>{const loop=()=>{render();rafRef.current=requestAnimationFrame(loop);};rafRef.current=requestAnimationFrame(loop);},[render]);const setupScrollTrigger=useCallback(()=>{const material=materialRef.current;if(!material||!triggerSelector||isCanvas)return;ScrollTrigger.refresh();const uProgress=material.uniforms.uProgress;uProgress.value=0;const st=gsap.to(uProgress,{value:1,duration:revealDuration,ease:"linear",scrollTrigger:{trigger:triggerSelector,start:"top bottom",end:"bottom top",toggleActions:replay?"play reset restart reset":"play none none none"},delay:revealDelay});scrollTriggerRef.current=st.scrollTrigger??null;},[triggerSelector,revealDuration,revealDelay,replay,isCanvas]);const runAppearAnimation=useCallback(()=>{const material=materialRef.current;if(!material)return;const uProgress=material.uniforms.uProgress;gsap.killTweensOf(uProgress);uProgress.value=0;gsap.to(uProgress,{value:1,duration:revealDuration,delay:revealDelay,ease:"linear"});},[revealDuration,revealDelay]);// Init only when hasImage becomes true; teardown when hasImage becomes false or unmount. Never tear down when only imageSrc changes.
useEffect(()=>{if(!hasImage){scrollTriggerRef.current?.kill();if(rafRef.current)cancelAnimationFrame(rafRef.current);rafRef.current=null;meshRef.current=null;materialRef.current?.dispose();materialRef.current=null;sceneRef.current=null;cameraRef.current=null;const r=rendererRef.current;if(r?.dispose)r.dispose();rendererRef.current=null;setTextureReady(0);return;}if(!containerRef.current)return;if(!sceneRef.current)initScene();return()=>{scrollTriggerRef.current?.kill();if(rafRef.current)cancelAnimationFrame(rafRef.current);rafRef.current=null;meshRef.current=null;materialRef.current?.dispose();materialRef.current=null;sceneRef.current=null;cameraRef.current=null;const r=rendererRef.current;if(r?.dispose)r.dispose();rendererRef.current=null;};},[hasImage,initScene]);// When only imageSrc changes: update texture on existing material (no teardown → no blank)
useEffect(()=>{if(!hasImage||!imageSrc)return;const material=materialRef.current;if(!material)return;const loader=new TextureLoader;loader.load(imageSrc,tex=>{tex.minFilter=LinearFilter;tex.magFilter=LinearFilter;material.uniforms.uTexture.value=tex;material.uniforms.uResolution.value=new Vector2(tex.image.naturalWidth,tex.image.naturalHeight);setTextureReady(v=>v+1);},undefined,()=>{});},[hasImage,imageSrc]);useEffect(()=>{if(!hasImage)return;const container=containerRef.current;if(!container)return;const handleResize=entries=>{const entry=entries[0];if(!entry)return;const{width,height}=entry.contentRect;if(width<=0||height<=0)return;// If scene was never created (e.g. initial mount had 0x0), init now
if(!sceneRef.current){initScene();return;}resize(width,height);};// Run once with current dimensions in case we already have size
const w=container.clientWidth;const h=container.clientHeight;if(w>0&&h>0&&!sceneRef.current)initScene();else if(w>0&&h>0&&sceneRef.current)resize(w,h);const ro=new ResizeObserver(handleResize);ro.observe(container);return()=>ro.disconnect();},[hasImage,resize,initScene]);useEffect(()=>{const material=materialRef.current;if(!hasImage||!material)return;material.uniforms.uGridSize.value=gridSize;const rgba=parseColorToRgba(resolveTokenColor(pixelColor));material.uniforms.uColor.value.setRGB(rgba.r,rgba.g,rgba.b);const{axis,flip}=directionToUniforms(direction);material.uniforms.uRevealAxis.value=axis;material.uniforms.uRevealFlip.value=flip;if(RenderTarget.current()===RenderTarget.canvas){const renderer=rendererRef.current;const scene=sceneRef.current;const camera=cameraRef.current;if(renderer&&scene&&camera)renderer.render(scene,camera);}},[hasImage,gridSize,pixelColor,direction]);useEffect(()=>{if(!hasImage)return;startLoop();return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};},[hasImage,startLoop]);useEffect(()=>{const material=materialRef.current;if(!hasImage||!material||textureReady===0)return;if(isCanvas){if(preview)runAppearAnimation();else material.uniforms.uProgress.value=1;return;}if(mode==="appear"){runAppearAnimation();return;}setupScrollTrigger();return()=>{scrollTriggerRef.current?.kill();scrollTriggerRef.current=null;};},[hasImage,isCanvas,preview,mode,runAppearAnimation,setupScrollTrigger,revealDuration,revealDelay,gridSize,pixelColor,direction,textureReady]);if(!hasImage){return /*#__PURE__*/_jsx("div",{ref:containerRef,style:{...style,position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",...borderRadius?{borderRadius}:{}},children:/*#__PURE__*/_jsx(ComponentMessage,{style:{position:"relative",width:"100%",height:"100%",minWidth:0,minHeight:0},title:"Pixel Mask Reveal",subtitle:"Add an image to see the scroll-reveal effect"})});}return /*#__PURE__*/_jsx("div",{ref:containerRef,style:{...style,position:"relative",width:"100%",height:"100%",overflow:"hidden",...borderRadius?{borderRadius}:{}},children:/*#__PURE__*/_jsx("canvas",{ref:canvasRef,style:{display:"block",width:"100%",height:"100%",verticalAlign:"middle"}})});}addPropertyControls(PixelMaskReveal,{preview:{type:ControlType.Boolean,title:"Preview",defaultValue:true,enabledTitle:"On",disabledTitle:"Off"},image:{type:ControlType.ResponsiveImage,title:"Image"},mode:{type:ControlType.Enum,title:"Mode",options:["appear","layer-in-view"],optionTitles:["Appear","Layer in View"],defaultValue:"layer-in-view",displaySegmentedControl:true,segmentedControlDirection:"vertical"},startAlign:{type:ControlType.Enum,title:"Start At",options:["top","center","bottom"],optionTitles:["Top","Center","Bottom"],defaultValue:"top",displaySegmentedControl:true,segmentedControlDirection:"horizontal",hidden:props=>props.mode!=="layer-in-view"},replay:{type:ControlType.Boolean,title:"Replay",defaultValue:true,hidden:props=>props.mode!=="layer-in-view"},gridSize:{type:ControlType.Number,title:"Grid Size",min:4,max:80,step:2,defaultValue:20},revealDuration:{type:ControlType.Number,title:"Duration",min:.2,max:4,step:.1,defaultValue:1.6,unit:"s"},revealDelay:{type:ControlType.Number,title:"Delay",min:0,max:2,step:.1,defaultValue:0,unit:"s"},direction:{type:ControlType.Enum,title:"Direction",options:["up","down","left","right"],optionTitles:["Up","Down","Left","Right"],defaultValue:"up",optionIcons:["direction-down","direction-up","direction-right","direction-left"],displaySegmentedControl:true,segmentedControlDirection:"horizontal"},borderRadius:{//@ts-ignore
type:ControlType.BorderRadius,title:"Radius",defaultValue:"0px"},pixelColor:{type:ControlType.Color,title:"Pixel Tint",description:"More components at [Framer University](https://frameruni.link/cc)."}});PixelMaskReveal.displayName="Pixel Mask Reveal";
export const __FramerMetadata__ = {"exports":{"default":{"type":"reactComponent","name":"PixelMaskReveal","slots":[],"annotations":{"framerDisableUnlink":"","framerSupportedLayoutHeight":"any-prefer-fixed","framerIntrinsicHeight":"300","framerSupportedLayoutWidth":"any-prefer-fixed","framerIntrinsicWidth":"400","framerContractVersion":"1"}},"__FramerMetadata__":{"type":"variable"}}}
//# sourceMappingURL=./PixelMaksReveal_prod.map