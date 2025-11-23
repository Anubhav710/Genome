import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Type definitions for R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      points: any;
      icosahedronGeometry: any;
      sphereGeometry: any;
      shaderMaterial: any;
      ambientLight: any;
    }
  }
}

// Vertex Shader: Handles particle position and size
const vertexShader = `
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;
varying float vDisplacement;
varying float vRandom;

// Classic Perlin 3D Noise 
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  
  // Create organic movement
  float time = uTime * 0.2;
  
  // Noise determines displacement
  // When typing (uIntensity > 0), the movement becomes slightly more agitated
  float noiseFreq = 1.2;
  float noiseAmp = 0.15 + (uIntensity * 0.1); 
  
  vec3 noisePos = position * noiseFreq + vec3(time);
  vDisplacement = snoise(noisePos);
  
  // Apply displacement along normal
  vec3 newPosition = position + normal * (vDisplacement * noiseAmp);

  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Particle Size
  // Particles are larger when closer to camera
  // Size pulses slightly with displacement and typing intensity
  float sizePulse = 1.0 + (vDisplacement * 0.3) + (uIntensity * 0.2);
  gl_PointSize = (4.0 * sizePulse) * (1.5 / -mvPosition.z);
}
`;

// Fragment Shader: Handles particle shape and galaxy colors
const fragmentShader = `
uniform float uIntensity;
varying float vDisplacement;

void main() {
  // Make particles round
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) discard;

  // Galaxy Color Palette (Grayish/Silver with subtle cool undertones)
  vec3 deepSpace = vec3(0.2, 0.22, 0.25);  // Dark gray/blue base
  vec3 starlight = vec3(0.9, 0.95, 1.0);   // White/Silver highlights
  vec3 nebula    = vec3(0.4, 0.45, 0.55);  // Muted blue-gray accent

  // Mix colors based on noise displacement
  float noiseMix = smoothstep(-0.5, 0.5, vDisplacement);
  
  vec3 color = mix(deepSpace, nebula, noiseMix);
  color = mix(color, starlight, noiseMix * 0.6); // Add highlights

  // Typing effect:
  // When typing, brighten the core slightly and shift slightly cooler
  vec3 activeColor = vec3(0.1, 0.1, 0.2); 
  color += activeColor * uIntensity;

  // Soft glow falloff from center of particle
  float alpha = (1.0 - r) * 0.8;
  
  gl_FragColor = vec4(color, alpha);
}
`;

const GalaxySphere = ({
  isTyping,
  postion,
}: {
  isTyping?: boolean;
  postion?: [number, number, number];
}) => {
  const points = useRef<THREE.Points>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const { clock } = state;
    if (points.current) {
      // Rotation logic
      // Base rotation is slow and majestic
      // Adds a small boost when typing
      const baseRotationSpeed = 0.05;
      const extraSpeed = isTyping ? 0.05 : 0.0;

      // We use total time to drive rotation for smoothness
      // To variable speed, we'd normally integrate delta, but for "small animation" this works well:
      points.current.rotation.y =
        clock.getElapsedTime() * (baseRotationSpeed + extraSpeed);
      points.current.rotation.z = clock.getElapsedTime() * 0.02;

      // Update uniforms
      // Smoothly transition intensity
      uniforms.uIntensity.value = THREE.MathUtils.lerp(
        uniforms.uIntensity.value,
        isTyping ? 1.0 : 0.0,
        0.05
      );

      uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={points} scale={2.2} position={postion}>
      {/* High detail sphere for particle density */}
      <icosahedronGeometry args={[1, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

interface Background3DProps {
  isTyping?: boolean;
  position?: [number, number, number];
}

const Background3D: React.FC<Background3DProps> = ({ isTyping, position }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <GalaxySphere isTyping={isTyping} postion={position} />
      </Canvas>
    </div>
  );
};

export default Background3D;
