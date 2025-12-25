import { ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>;
            meshStandardMaterial: ReactThreeFiber.Object3DNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>;
            ambientLight: ReactThreeFiber.Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
            pointLight: ReactThreeFiber.Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
        }
    }
}
