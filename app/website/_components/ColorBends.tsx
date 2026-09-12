"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = { rotation:number; speed:number; colors:string[]; transparent?:boolean; autoRotate:number; scale:number; frequency:number; warpStrength:number; mouseInfluence:number; parallax:number; noise:number; iterations:number; intensity:number; bandWidth:number };

const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}`;
const fragment = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution,uPointer;
uniform float uTime,uRotation,uSpeed,uAutoRotate,uScale,uFrequency,uWarp,uMouse,uParallax,uNoise,uIntensity,uBand;
uniform int uIterations;
uniform vec3 uC0,uC1,uC2;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 p=vUv*2.-1.; p.x*=uResolution.x/max(uResolution.y,1.);
  p+=uPointer*uParallax*.12;
  float a=uRotation+uTime*uAutoRotate;
  mat2 r=mat2(cos(a),-sin(a),sin(a),cos(a)); p=r*p/max(uScale,.001);
  float t=uTime*uSpeed;
  vec2 q=p;
  for(int j=0;j<4;j++){if(j>=uIterations)break;q+=uWarp*.18*sin(q.yx*uFrequency*3.+t*vec2(1.1,-.8)+float(j));q+=uPointer*uMouse*.035;}
  float f0=sin((q.x+sin(q.y*1.7+t*.8))*uBand-t*1.2);
  float f1=sin((q.y+cos(q.x*1.35-t*.65))*uBand+t*.9+2.1);
  float f2=sin((q.x-q.y+sin(length(q)*3.-t))*uBand*.72+4.2);
  vec3 col=uC0*smoothstep(-.25,.9,f0)+uC1*smoothstep(-.2,.95,f1)+uC2*smoothstep(-.25,.9,f2);
  col*=uIntensity*.62; col+=uNoise*(hash(gl_FragCoord.xy+uTime)-.5);
  float alpha=clamp(max(max(col.r,col.g),col.b)*1.35,0.,1.);
  gl_FragColor=vec4(col,alpha);
}`;

export function ColorBends(props:Props){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!host.current) return;
    const el=host.current, scene=new THREE.Scene(), camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const uniforms:{[key:string]:{value:unknown}}={uResolution:{value:new THREE.Vector2()},uPointer:{value:new THREE.Vector2()},uTime:{value:0},uRotation:{value:THREE.MathUtils.degToRad(props.rotation)},uSpeed:{value:props.speed},uAutoRotate:{value:props.autoRotate},uScale:{value:props.scale},uFrequency:{value:props.frequency},uWarp:{value:props.warpStrength},uMouse:{value:props.mouseInfluence},uParallax:{value:props.parallax},uNoise:{value:props.noise},uIterations:{value:props.iterations},uIntensity:{value:props.intensity},uBand:{value:props.bandWidth},uC0:{value:new THREE.Color(props.colors[0])},uC1:{value:new THREE.Color(props.colors[1])},uC2:{value:new THREE.Color(props.colors[2])}};
    const material=new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,transparent:props.transparent,blending:THREE.AdditiveBlending,depthWrite:false});
    const geometry=new THREE.PlaneGeometry(2,2), mesh=new THREE.Mesh(geometry,material); scene.add(mesh);
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:"high-performance"}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); el.appendChild(renderer.domElement);
    const resize=()=>{const b=el.getBoundingClientRect();renderer.setSize(b.width,b.height,false);(uniforms.uResolution.value as THREE.Vector2).set(b.width,b.height)}; resize();
    const target=new THREE.Vector2(), current=new THREE.Vector2();
    const move=(e:PointerEvent)=>{const b=el.getBoundingClientRect();target.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1))};
    let frame=0,start=performance.now(); const draw=(now:number)=>{current.lerp(target,.055);(uniforms.uPointer.value as THREE.Vector2).copy(current);uniforms.uTime.value=(now-start)/1000;renderer.render(scene,camera);frame=requestAnimationFrame(draw)}; frame=requestAnimationFrame(draw);
    const observer=new ResizeObserver(resize);observer.observe(el);window.addEventListener("pointermove",move,{passive:true});
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("pointermove",move);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove()};
  },[]);
  return <div ref={host} className="colorBends" aria-hidden="true"/>;
}
