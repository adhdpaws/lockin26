import { View, Text, Dimensions, Platform, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  runOnJS,
  SharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { Milestone } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BALL_RADIUS = 30;
const GOAL_RADIUS = 50;
const MAX_MILESTONE_RADIUS = SCREEN_WIDTH * 0.55; // Allow it to grow large enough to span the screen
const DAMPING = 0.8;
const FRICTION = 0.98;
const SENSITIVITY = 1500;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;
const HEADER_HEIGHT = 100; // Approx header height
const BOTTOM_LIMIT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - 40; // 40px buffer

interface BallProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  r: SharedValue<number>;
  scale: SharedValue<number>;
  color: string;
  label: string;
}

function Ball({ x, y, r, scale, color, label }: BallProps) {
  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value - r.value },
        { translateY: y.value - r.value },
        { scale: scale.value }
      ],
      backgroundColor: color,
      width: r.value * 2,
      height: r.value * 2,
      borderRadius: r.value,
    } as any;
  });

  // We need a derived value or just use the shared value for text sizing logic?
  // For simplicity, we'll just use a standard size or check r.value in style (but that's tricky for conditional rendering)
  // Let's just make text size dynamic based on r.value in the style if possible, or just keep it simple.
  // We'll use a reanimated style for the text container if needed, but for now let's just keep the text static size or simple.

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        style
      ]}
    >
      <Text className="text-white font-bold text-center px-1 text-[10px]" numberOfLines={2}>
        {label}
      </Text>
    </Animated.View>
  );
}

export default function Journey() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [goalTitle, setGoalTitle] = useState('LOCKED GOAL');
  const [worldHeight, setWorldHeight] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showWisdom, setShowWisdom] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [damping, setDamping] = useState(0.8);
  const [stiffness, setStiffness] = useState(90);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showConcept, setShowConcept] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const gravity = useSharedValue({ x: 0, y: 0 });

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => setIsActive(false);
    }, [])
  );

  useEffect(() => {
    loadData();

    if (!isActive) return;

    const subscription = Accelerometer.addListener(data => {
      // Adjust gravity mapping for better feel
      // x: left/right tilt
      // y: forward/back tilt. When holding phone upright, y is -1.
      // We want "down" on screen to be +y direction in our coordinate system.
      // So if y is -1 (upright), we want gravity to be +y.
      // If x is +1 (tilted right), we want gravity to be +x.
      gravity.value = { x: data.x, y: -data.y };
    });
    Accelerometer.setUpdateInterval(16);

    return () => subscription.remove();
  }, [isActive]);

  const loadData = async () => {
    const savedStack = await AsyncStorage.getItem('milestoneStack');
    const savedGoal = await AsyncStorage.getItem('mainGoal');

    if (savedGoal) setGoalTitle(savedGoal);

    if (savedStack) {
      const stack = JSON.parse(savedStack);
      setMilestones(stack);
    } else {
      setMilestones([
        { id: '1', title: 'Start', status: 'COMPLETED', impact: 'HIGH', description: '', deadline: '', order: 1 },
        { id: '2', title: 'Plan', status: 'ACTIVE', impact: 'CRITICAL', description: '', deadline: '', order: 2 },
        { id: '3', title: 'Execute', status: 'PENDING', impact: 'HIGH', description: '', deadline: '', order: 3 },
      ]);
    }
  };

  if (milestones.length === 0) return <View className="flex-1 bg-white" />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 py-4 border-b border-gray-100 z-50 bg-white flex-row justify-between items-center">
        <View>
          <Text className="font-black text-2xl tracking-tighter">YOUR JOURNEY</Text>
          <Text className="font-bold text-[10px] text-gray-400 tracking-[0.2em]">MOMENTUM FIELD</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setShowControls(!showControls)}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Ionicons name="options" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setResetTrigger(prev => prev + 1);
              setShowConcept(false);
            }}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Ionicons name="refresh" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Ionicons name={soundEnabled ? "volume-high" : "volume-mute"} size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {showControls && (
        <View className="px-6 py-4 bg-gray-50 border-b border-gray-200 z-40">
          <View className="mb-4">
            <Text className="text-xs font-bold text-gray-500 mb-2">DAMPING (BOUNCE): {damping.toFixed(2)}</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0.1}
              maximumValue={1.5}
              value={damping}
              onValueChange={setDamping}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#d3d3d3"
            />
          </View>
          <View>
            <Text className="text-xs font-bold text-gray-500 mb-2">STIFFNESS (GROWTH): {stiffness.toFixed(0)}</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={10}
              maximumValue={300}
              value={stiffness}
              onValueChange={setStiffness}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#d3d3d3"
            />
          </View>
        </View>
      )}

      <View
        className="flex-1 overflow-hidden relative bg-gray-50"
        onLayout={(e) => setWorldHeight(e.nativeEvent.layout.height)}
      >
        {showConcept && (
          <View className="absolute inset-0 justify-center items-center p-8 z-0 pointer-events-none">
            <Text className="text-gray-200 text-4xl font-black text-center uppercase tracking-widest opacity-40">
              METAMORPHOSIS
            </Text>
            <Text className="text-gray-300 text-xs font-bold text-center mt-4 leading-loose tracking-widest">
              "IF YOU ONLY TINKER WITH WINS, YOU CANNOT MOVE ANYWHERE OR HAVE SPACE FOR THE NEW.{'\n'}
              SO YOU NEED TO CONSUME."
            </Text>
          </View>
        )}

        {worldHeight > 0 && (
          <PhysicsWorld
            key={resetTrigger}
            milestones={milestones}
            goalTitle={goalTitle}
            gravity={gravity}
            worldHeight={worldHeight}
            soundEnabled={soundEnabled}
            damping={damping}
            stiffness={stiffness}
            isActive={isActive}
            onGoalPop={() => setShowWisdom(true)}
            onAbsorption={() => setShowConcept(true)}
          />
        )}

        {showWisdom && (
          <View className="absolute inset-0 bg-black/90 z-[100] justify-center items-center px-8">
            <Text className="text-white text-2xl font-black text-center mb-6 tracking-tighter">
              ASCENDED
            </Text>
            <Text className="text-gray-300 text-lg font-medium text-center italic leading-relaxed">
              "We are grateful for your achievements, but if we get lost in between, everything is forgotten and goes unseen."
            </Text>
            <TouchableOpacity
              onPress={() => setShowWisdom(false)}
              className="mt-12 bg-white px-8 py-3 rounded-full"
            >
              <Text className="font-bold text-black">BEGIN AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function PhysicsWorld({ milestones, goalTitle, gravity, worldHeight, soundEnabled, damping, stiffness, isActive, onGoalPop, onAbsorption }: { milestones: Milestone[], goalTitle: string, gravity: SharedValue<{ x: number, y: number }>, worldHeight: number, soundEnabled: boolean, damping: number, stiffness: number, isActive: boolean, onGoalPop: () => void, onAbsorption: () => void }) {
  const heightSV = useSharedValue(worldHeight);
  const soundEnabledSV = useSharedValue(soundEnabled);
  const dampingSV = useSharedValue(damping);
  const stiffnessSV = useSharedValue(stiffness);
  const isActiveSV = useSharedValue(isActive);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    heightSV.value = worldHeight;
  }, [worldHeight]);

  useEffect(() => {
    isActiveSV.value = isActive;
  }, [isActive]);

  useEffect(() => {
    soundEnabledSV.value = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    dampingSV.value = damping;
  }, [damping]);

  useEffect(() => {
    stiffnessSV.value = stiffness;
  }, [stiffness]);

  useEffect(() => {
    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/collision.mp3')
        );
        soundRef.current = sound;
      } catch (error) {
        console.log("Error loading sound:", error);
      }
    }
    loadSound();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.replayAsync().catch(() => { });
    }
  };

  // Initialize positions
  // Goal is index 0 in our physics arrays
  const items = [
    { id: 'goal', title: goalTitle, type: 'GOAL', radius: GOAL_RADIUS },
    ...milestones.map(m => ({ ...m, type: 'MILESTONE', radius: BALL_RADIUS }))
  ];

  const positions = items.map((item, i) => ({
    x: useSharedValue(i === 0 ? SCREEN_WIDTH / 2 : Math.random() * (SCREEN_WIDTH - 60) + 30),
    y: useSharedValue(i === 0 ? worldHeight / 3 : Math.random() * (worldHeight / 2) + 50),
    vx: useSharedValue(0),
    vy: useSharedValue(0),
    r: useSharedValue(item.radius),
    scale: useSharedValue(1),
    active: useSharedValue(1),
    isCompleted: item.type === 'MILESTONE' && (item as any).status === 'COMPLETED',
    growthStage: useSharedValue(0),
    doomed: useSharedValue(0),
    deathTimer: useSharedValue(0)
  }));

  useFrameCallback((frameInfo) => {
    if (!frameInfo.timeSincePreviousFrame || !isActiveSV.value) return;
    const dt = Math.min(frameInfo.timeSincePreviousFrame / 1000, 0.05); // Cap dt to prevent tunneling

    const gx = gravity.value.x * SENSITIVITY;
    const gy = gravity.value.y * SENSITIVITY;

    // Update Physics
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      if (p.active.value === 0) continue;

      // Handle Doomed State (Struggle before death)
      if (p.doomed.value === 1) {
        p.deathTimer.value += dt;

        // Struggle: Add random jitter forces
        p.vx.value += (Math.random() - 0.5) * 200;
        p.vy.value += (Math.random() - 0.5) * 200;

        // Time's up (5 seconds)
        if (p.deathTimer.value >= 5) {
          // Trigger Absorption
          p.active.value = 0;
          p.doomed.value = 0; // Reset              
          runOnJS(onAbsorption)();
          // Milestone swells then vanishes
          p.scale.value = withSequence(
            withTiming(1.2, { duration: 150 }),
            withTiming(0, { duration: 300 })
          );

          // Goal grows (small constant amount) - Goal is positions[0]
          const goal = positions[0];
          const growth = 5;
          const newRadius = goal.r.value + growth;
          goal.r.value = withSpring(newRadius, { damping: 15, stiffness: stiffnessSV.value });

          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
          if (soundEnabledSV.value) runOnJS(playSound)();

          // Check for Pop
          if (newRadius > SCREEN_WIDTH * 0.7) {
            goal.r.value = withDelay(500, withTiming(GOAL_RADIUS, { duration: 800, easing: Easing.bounce }));
            runOnJS(onGoalPop)();
          }
        }
      }

      // Apply forces
      p.vx.value += gx * dt;
      p.vy.value += gy * dt;

      // Apply friction
      p.vx.value *= FRICTION;
      p.vy.value *= FRICTION;

      // Update position
      p.x.value += p.vx.value * dt;
      p.y.value += p.vy.value * dt;

      // Wall Collisions
      // Left
      if (p.x.value < p.r.value) {
        p.x.value = p.r.value;
        if (Math.abs(p.vx.value) > 50) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
        p.vx.value *= -dampingSV.value;
      }
      // Right
      else if (p.x.value > SCREEN_WIDTH - p.r.value) {
        p.x.value = SCREEN_WIDTH - p.r.value;
        if (Math.abs(p.vx.value) > 50) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
        p.vx.value *= -dampingSV.value;
      }

      // Top
      if (p.y.value < p.r.value) {
        p.y.value = p.r.value;
        p.vy.value *= -dampingSV.value;
      }
      // Bottom
      if (p.y.value > heightSV.value - p.r.value) {
        p.y.value = heightSV.value - p.r.value;
        p.vy.value *= -dampingSV.value;
      }

      // Ball to Ball Collisions
      for (let j = i + 1; j < positions.length; j++) {
        const p2 = positions[j];
        if (p2.active.value === 0) continue;

        let dx = p.x.value - p2.x.value;
        let dy = p.y.value - p2.y.value;
        let dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p.r.value + p2.r.value;

        // Handle exact overlap (dist = 0)
        if (dist === 0) {
          dx = 1;
          dy = 0;
          dist = 1;
        }

        if (dist < minDist) {
          // Check for Goal (i=0) vs Completed Milestone (j)
          if (i === 0 && p2.isCompleted && p2.doomed.value === 0) {
            // Check if touching at least 2 walls
            const touchingLeft = p2.x.value - p2.r.value <= 5;
            const touchingRight = p2.x.value + p2.r.value >= SCREEN_WIDTH - 5;
            const touchingTop = p2.y.value - p2.r.value <= 5;
            const touchingBottom = p2.y.value + p2.r.value >= heightSV.value - 5;

            const wallContacts = (touchingLeft ? 1 : 0) + (touchingRight ? 1 : 0) + (touchingTop ? 1 : 0) + (touchingBottom ? 1 : 0);

            if (wallContacts >= 2) {
              // Mark as Doomed (Caught)
              p2.doomed.value = 1;
              runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Warning);
            }
          }

          // 1. Calculate Collision Normal
          const nx = dx / dist;
          const ny = dy / dist;

          // 2. Separate (Projection Method) to prevent sinking
          const overlap = minDist - dist;
          const m1 = p.r.value; // Mass proportional to radius
          const m2 = p2.r.value;
          const totalMass = m1 + m2;

          // Move apart proportional to inverse mass
          const moveX = nx * overlap;
          const moveY = ny * overlap;

          p.x.value += moveX * (m2 / totalMass);
          p.y.value += moveY * (m2 / totalMass);
          p2.x.value -= moveX * (m1 / totalMass);
          p2.y.value -= moveY * (m1 / totalMass);

          // 3. Impulse Response (Bounce)
          const dvx = p.vx.value - p2.vx.value;
          const dvy = p.vy.value - p2.vy.value;

          // Velocity along normal
          const velAlongNormal = dvx * nx + dvy * ny;

          // Only resolve if moving towards each other
          if (velAlongNormal < 0) {
            const restitution = 0.5; // Bounciness (0-1)

            // Impulse scalar
            let impulse = -(1 + restitution) * velAlongNormal;
            impulse /= (1 / m1 + 1 / m2);

            // Apply impulse
            const impulseX = impulse * nx;
            const impulseY = impulse * ny;

            p.vx.value += impulseX / m1;
            p.vy.value += impulseY / m1;
            p2.vx.value -= impulseX / m2;
            p2.vy.value -= impulseY / m2;

            // Special Growth Logic for Completed Milestones hitting Goal
            if (i === 0 && p2.isCompleted && p2.r.value < MAX_MILESTONE_RADIUS) {
              // Only grow if impact is significant (avoid little touches)
              if (Math.abs(velAlongNormal) > 30) {
                const growthStep = 15;
                p2.r.value = withSpring(Math.min(p2.r.value + growthStep, MAX_MILESTONE_RADIUS), { stiffness: stiffnessSV.value });
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                if (soundEnabledSV.value) runOnJS(playSound)();
              }
            }

            // 4. Haptics (Trigger on significant impact)
            if (Math.abs(velAlongNormal) > 100) {
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
              if (soundEnabledSV.value) runOnJS(playSound)();
            }
          }
        }
      }
    }
  });

  return (
    <>
      {items.map((item, i) => (
        <Ball
          key={item.id}
          x={positions[i].x}
          y={positions[i].y}
          r={positions[i].r}
          scale={positions[i].scale}
          color={item.type === 'GOAL' ? '#000000' : (item as any).status === 'COMPLETED' ? '#FF3B30' : '#E5E7EB'}
          label={item.title}
        />
      ))}
    </>
  );
}
