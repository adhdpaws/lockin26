// @ts-nocheck
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Float, Environment } from '@react-three/drei/native';
import { DeviceMotion } from 'expo-sensors';
import * as THREE from 'three';

function Rig({ children }: { children: React.ReactNode }) {
    const group = useRef<THREE.Group>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    useEffect(() => {
        DeviceMotion.setUpdateInterval(15);
        const subscription = DeviceMotion.addListener((data) => {
            // Smooth out the sensor data
            const x = (data.rotation?.beta || 0) * 0.7; // Tilt forward/back
            const y = (data.rotation?.gamma || 0) * 0.7; // Tilt left/right
            setRotation({ x, y });
        });
        return () => subscription.remove();
    }, []);

    useFrame((state, delta) => {
        if (group.current) {
            // Smooth interpolation for the tilt
            // We start with a base slight upward tilt (-0.2) for better viewing angle
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rotation.x - 0.2, 2 * delta);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, rotation.y, 2 * delta);
        }
    });

    return <group ref={group}>{children}</group>;
}

function Scene({ goal }: { goal: string }) {
    // Use a bold, thick font for maximum "blocky" 3D effect
    const fontUrl = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

    const material = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#111',
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
    }), []);

    return (
        <Rig>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Center>
                    <Text3D
                        font={fontUrl}
                        size={0.8}
                        height={0.4} // This is the 3D DEPTH (Extrusion)
                        curveSegments={12}
                        bevelEnabled
                        bevelThickness={0.02}
                        bevelSize={0.02}
                        bevelOffset={0}
                        bevelSegments={5}
                        material={material}
                    >
                        {goal ? goal.toUpperCase() : "LOCK IN"}
                    </Text3D>
                </Center>
            </Float>
        </Rig>
    );
}

export default function TiltGoalWidget({ goal }: { goal: string }) {
    return (
        <View className="w-full h-[220px] bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                {/* Cinematic Lighting Setup */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -5, -10]} intensity={1} color="#ff3b30" /> {/* Swiss Red backlight */}
                <Environment preset="city" />

                <Scene goal={goal} />
            </Canvas>

            {/* Overlay Badge */}
            <View className="absolute bottom-4 left-0 w-full items-center pointer-events-none">
                <View className="bg-black/5 px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-gray-400 tracking-[0.3em]">
                        3D LIVE FEED
                    </Text>
                </View>
            </View>
        </View>
    );
}
