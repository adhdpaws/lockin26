import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Text, Center } from '@react-three/drei/native';
import { DeviceMotion } from 'expo-sensors';
import { View } from 'react-native';
import * as THREE from 'three';

function TiltingText({ text }: { text: string }) {
    const mesh = useRef<THREE.Group>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    useEffect(() => {
        DeviceMotion.setUpdateInterval(16); // 60fps
        const subscription = DeviceMotion.addListener((data) => {
            // Amplify the rotation for dramatic effect
            // Gamma (y-axis tilt) drives X rotation
            // Beta (x-axis tilt) drives Y rotation
            const x = (data.rotation?.gamma || 0) * 0.5;
            const y = (data.rotation?.beta || 0) * 0.5;

            setRotation({ x, y });
        });

        return () => subscription.remove();
    }, []);

    useFrame((state, delta) => {
        if (mesh.current) {
            // Smoothly interpolate current rotation to target rotation
            mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, rotation.y, 0.1);
            mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, rotation.x, 0.1);
        }
    });

    return (
        <Center>
            <group ref={mesh}>
                <Text
                    color="black"
                    fontSize={1.5}
                    maxWidth={10}
                    lineHeight={1}
                    letterSpacing={-0.05}
                    textAlign="center"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf"
                    anchorX="center"
                    anchorY="middle"
                >
                    {text.toUpperCase()}
                    <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                </Text>
                {/* Subtle shadow text for depth */}
                <Text
                    color="#FF3B30"
                    fontSize={1.5}
                    maxWidth={10}
                    lineHeight={1}
                    letterSpacing={-0.05}
                    textAlign="center"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf"
                    anchorX="center"
                    anchorY="middle"
                    position={[0.05, -0.05, -0.1]}
                    fillOpacity={0.5}
                >
                    {text.toUpperCase()}
                </Text>
            </group>
        </Center>
    );
}

export default function TiltGoalWidget({ goal }: { goal: string }) {
    return (
        <View className="w-full h-[180px] bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#FF3B30" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />
                <TiltingText text={goal || "LOCK IN"} />
            </Canvas>
        </View>
    );
}
