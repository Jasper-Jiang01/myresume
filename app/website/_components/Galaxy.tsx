"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type GalaxyProps = {
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  speed?: number;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  transparent?: boolean;
  className?: string;
};

const vertexShader = `
attribute float aSize;
attribute float aPhase;
attribute float aBrightness;

uniform float uTime;
uniform float uStarSpeed;
uniform float uTwinkleIntensity;
uniform float uPixelRatio;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uRepulsionStrength;

varying float vBrightness;
varying float vTwinkle;

void main() {
  vec3 animatedPosition = position;
  animatedPosition.y += sin(uTime * uStarSpeed * 0.22 + aPhase) * 0.018;

  vec4 viewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
  vec4 clipPosition = projectionMatrix * viewPosition;
  vec2 screenPosition = clipPosition.xy / max(clipPosition.w, 0.0001);
  vec2 awayFromMouse = screenPosition - uMouse;
  float mouseDistance = length(awayFromMouse);
  float repulsion = smoothstep(0.42, 0.0, mouseDistance)
    * uMouseActive
    * uRepulsionStrength;

  clipPosition.xy += normalize(awayFromMouse + vec2(0.0001))
    * repulsion
    * 0.07
    * clipPosition.w;

  float twinkle = 0.5 + 0.5 * sin(uTime * uStarSpeed * 2.2 + aPhase);
  float perspectiveScale = clamp(4.5 / max(-viewPosition.z, 1.0), 0.48, 1.7);
  gl_PointSize = aSize * uPixelRatio * perspectiveScale
    * mix(1.0, 0.58 + twinkle * 0.86, uTwinkleIntensity);
  gl_Position = clipPosition;

  vBrightness = aBrightness;
  vTwinkle = twinkle;
}
`;

const fragmentShader = `
precision highp float;

uniform float uGlowIntensity;
uniform float uSaturation;
uniform float uHueShift;

varying float vBrightness;
varying float vTwinkle;

vec3 rotateHue(vec3 color, float angle) {
  vec3 axis = normalize(vec3(1.0));
  return color * cos(angle)
    + cross(axis, color) * sin(angle)
    + axis * dot(axis, color) * (1.0 - cos(angle));
}

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float distanceFromCenter = length(point);
  if (distanceFromCenter > 0.5) discard;

  float core = smoothstep(0.21, 0.0, distanceFromCenter);
  float halo = smoothstep(0.5, 0.08, distanceFromCenter);
  float strength = core + halo * uGlowIntensity;
  float flicker = mix(0.72, 1.0, vTwinkle);

  vec3 starColor = mix(vec3(0.68, 0.72, 0.82), vec3(1.0), vBrightness);
  float luminance = dot(starColor, vec3(0.299, 0.587, 0.114));
  starColor = mix(vec3(luminance), starColor, uSaturation);
  starColor = rotateHue(starColor, uHueShift);

  gl_FragColor = vec4(starColor * strength * flicker, strength * vBrightness);
}
`;

function createSeededRandom(seed = 1437) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function Galaxy({
  starSpeed = 0.5,
  density = 0.5,
  hueShift = 0,
  speed = 0.4,
  glowIntensity = 0.25,
  saturation = 0,
  mouseRepulsion = true,
  repulsionStrength = 1,
  twinkleIntensity = 1,
  rotationSpeed = 0.05,
  transparent = true,
  className = "",
}: GalaxyProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const starCount = Math.round(6000 * Math.max(0.15, density));
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const brightness = new Float32Array(starCount);
    const random = createSeededRandom();
    const branches = 5;

    for (let index = 0; index < starCount; index += 1) {
      const offset = index * 3;
      const radius = Math.pow(random(), 0.62) * 6.3;
      const branch = (index % branches) / branches * Math.PI * 2;
      const spin = radius * 1.34;
      const spread = 0.08 + radius * 0.12;
      const randomX = (random() - 0.5) * spread;
      const randomY = (random() - 0.5) * spread * 0.38;
      const randomZ = (random() - 0.5) * spread;

      positions[offset] = Math.cos(branch + spin) * radius + randomX;
      positions[offset + 1] = randomY;
      positions[offset + 2] = Math.sin(branch + spin) * radius + randomZ;
      sizes[index] = 2.0 + Math.pow(random(), 5) * 5.2;
      phases[index] = random() * Math.PI * 2;
      brightness[index] = 0.38 + random() * 0.62;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aBrightness", new THREE.BufferAttribute(brightness, 1));

    const uniforms = {
      uTime: { value: 0 },
      uStarSpeed: { value: starSpeed },
      uTwinkleIntensity: { value: twinkleIntensity },
      uGlowIntensity: { value: glowIntensity },
      uSaturation: { value: saturation },
      uHueShift: { value: THREE.MathUtils.degToRad(hueShift) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      uMouse: { value: new THREE.Vector2(2, 2) },
      uMouseActive: { value: 0 },
      uRepulsionStrength: { value: repulsionStrength },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(geometry, material);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 40);
    const renderer = new THREE.WebGLRenderer({
      alpha: transparent,
      antialias: false,
      powerPreference: "high-performance",
    });

    camera.position.set(0, 4.7, 8.2);
    camera.lookAt(0, 0, 0);
    scene.add(stars);
    renderer.setPixelRatio(uniforms.uPixelRatio.value);
    renderer.setClearColor(0x010202, transparent ? 0 : 1);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      camera.aspect = bounds.width / Math.max(bounds.height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(bounds.width, bounds.height, false);
    };
    resize();

    const mouseTarget = new THREE.Vector2(2, 2);
    const mouseCurrent = new THREE.Vector2(2, 2);
    let mouseTargetActive = 0;
    let mouseCurrentActive = 0;
    const handlePointerMove = (event: PointerEvent) => {
      if (!mouseRepulsion) return;
      const bounds = host.getBoundingClientRect();
      const inside = event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom;

      if (inside) {
        mouseTarget.set(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
        );
        mouseTargetActive = 1;
      } else {
        mouseTargetActive = 0;
      }
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    let frame = 0;
    let visible = true;
    const draw = (now: number) => {
      if (visible) {
        const elapsed = prefersReducedMotion ? 0 : ((now - startedAt) / 1000) * speed;
        mouseCurrent.lerp(mouseTarget, 0.075);
        mouseCurrentActive += (mouseTargetActive - mouseCurrentActive) * 0.08;
        uniforms.uMouse.value.copy(mouseCurrent);
        uniforms.uMouseActive.value = mouseCurrentActive;
        uniforms.uTime.value = elapsed;
        stars.rotation.y = elapsed * rotationSpeed;
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "160px" },
    );
    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [
    density,
    glowIntensity,
    hueShift,
    mouseRepulsion,
    repulsionStrength,
    rotationSpeed,
    saturation,
    speed,
    starSpeed,
    transparent,
    twinkleIntensity,
  ]);

  return <div ref={hostRef} className={`galaxy ${className}`.trim()} aria-hidden="true" />;
}
