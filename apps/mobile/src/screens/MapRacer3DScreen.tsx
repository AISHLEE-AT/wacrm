import React, { Suspense, useRef, useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Alert, TouchableWithoutFeedback } from 'react-native';
import { ChevronLeft, Zap, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import { AppContext } from '../context/AppContext';
import { RewardsService } from '../services/RewardsService';
import { gameoSupabase } from '../services/gameoSupabase';
import * as THREE from 'three';

const { width } = Dimensions.get('window');
const LANE_WIDTH = 2;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH];

// --- SEEDED RNG FOR MULTIPLAYER SYNC ---
class RandomSeed {
  seed: number;
  constructor(seed: number) { this.seed = seed; }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// --- 3D ENVIRONMENT ---
function ScaryRoad() {
  const roadRef = useRef<THREE.Group>(null);
  const curbLeft = useRef<THREE.Mesh>(null);
  const curbRight = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    // We get speed from global so it increases over time
    const speed = global.gameSpeed || 15;
    if (roadRef.current) {
      roadRef.current.position.z += speed * delta;
      if (roadRef.current.position.z > 50) roadRef.current.position.z -= 50;
    }
    // Curb stripes animation
    if (curbLeft.current?.material && 'map' in curbLeft.current.material) {
      (curbLeft.current.material as any).map.offset.y -= speed * delta * 0.1;
      (curbRight.current.material as any).map.offset.y -= speed * delta * 0.1;
    }
  });

  return (
    <group>
      {/* Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -50]}>
        <planeGeometry args={[12, 200]} />
        <meshLambertMaterial color="#334155" />
      </mesh>
      {/* Napier Bridge Curbs (Black/White stripes) */}
      <group ref={roadRef}>
         {/* We simulate stripes with simple repeating boxes or shader, here just standard color blocks for simplicity since no texture is loaded */}
      </group>
      <mesh position={[-3.5, -0.25, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 200]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      <mesh position={[3.5, -0.25, -50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 200]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// --- PLAYER VEHICLE & HEADLIGHTS ---
function Player({ lane, isGhost, color }: { lane: number, isGhost?: boolean, color?: string }) {
  const playerRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (playerRef.current) {
      playerRef.current.position.x = THREE.MathUtils.lerp(playerRef.current.position.x, LANES[lane], 15 * delta);
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 3]}>
      <Box args={[1, 0.5, 2]}>
        <meshLambertMaterial 
          color={color || "#8b5cf6"} 
          transparent={isGhost} 
          opacity={isGhost ? 0.3 : 1} 
        />
      </Box>
    </group>
  );
}

// --- OBSTACLES (TN Themed) ---
function WorldObjects({ 
  isPlaying, onCrash, onCoinCollect, seed 
}: { 
  isPlaying: boolean, onCrash: () => void, onCoinCollect: () => void, seed: number 
}) {
  const [objects, setObjects] = useState<any[]>([]);
  const objectsRef = useRef(objects);
  const nextId = useRef(0);
  const rng = useRef(new RandomSeed(seed));
  const timeSinceLastSpawn = useRef(0);

  // Spawner
  useFrame((state, delta) => {
    if (!isPlaying) return;
    timeSinceLastSpawn.current += delta;
    
    // Spawn faster as speed increases
    const spawnRate = Math.max(0.4, 1.5 - ((global.gameSpeed - 15) * 0.03));
    
    if (timeSinceLastSpawn.current > spawnRate) {
      timeSinceLastSpawn.current = 0;
      
      const rand = rng.current.next();
      let type = 'coin';
      if (rand < 0.2) type = 'auto'; // 20% auto
      else if (rand < 0.4) type = 'cow'; // 20% cow
      else if (rand < 0.5) type = 'barricade'; // 10% barricade
      else if (rand < 0.6) type = 'pothole'; // 10% pothole
      
      const lane = Math.floor(rng.current.next() * 3);
      setObjects(prev => [...prev, { id: nextId.current++, type, lane, z: -40, driftDir: rng.current.next() > 0.5 ? 1 : -1 }]);
    }
  });
  
  useEffect(() => { objectsRef.current = objects; }, [objects]);

  return (
    <group>
      {objects.map((obj) => (
        <WorldItem 
          key={obj.id} 
          obj={obj} 
          isPlaying={isPlaying} 
          onRemove={(id, hit) => {
            setObjects(prev => prev.filter(o => o.id !== id));
            if (hit) {
              if (obj.type === 'coin') onCoinCollect();
              else onCrash();
            }
          }} 
        />
      ))}
    </group>
  );
}

function WorldItem({ obj, isPlaying, onRemove }: any) {
  const ref = useRef<THREE.Group>(null);
  const [currentLaneX, setCurrentLaneX] = useState(LANES[obj.lane]);
  
  useFrame((state, delta) => {
    if (!isPlaying || !ref.current) return;
    
    const speed = global.gameSpeed || 15;
    
    // Custom movement based on TN obstacle types
    let moveSpeed = speed; // World moves toward player
    
    if (obj.type === 'auto') {
      moveSpeed = speed - 5; // Auto moves forward, so approaches slower
    } else if (obj.type === 'cow') {
      // Cow slowly drifts to adjacent lane
      setCurrentLaneX(prev => {
        const newX = prev + (0.5 * delta * obj.driftDir);
        // Bounce off edges
        if (newX > 2.5) obj.driftDir = -1;
        if (newX < -2.5) obj.driftDir = 1;
        return newX;
      });
      ref.current.position.x = currentLaneX;
    }

    ref.current.position.z += moveSpeed * delta;
    
    // Collision detection (Player is at z=3)
    if (ref.current.position.z > 2 && ref.current.position.z < 4) {
      const playerX = LANES[global.playerLane];
      const hitboxW = obj.type === 'barricade' ? 2 : 1; // barricade is wider
      
      if (Math.abs(ref.current.position.x - playerX) < hitboxW) {
         if (!ref.current.userData.hit) {
           ref.current.userData.hit = true;
           onRemove(obj.id, true);
         }
      }
    } else if (ref.current.position.z > 10) {
      if (!ref.current.userData.hit) onRemove(obj.id, false);
    }
  });

  return (
    <group ref={ref} position={[LANES[obj.lane], 0, obj.z]}>
      {obj.type === 'auto' && (
        <Box args={[1.2, 1.2, 1.5]} position={[0,0.1,0]}>
          <meshLambertMaterial color="#eab308" />
        </Box>
      )}
      {obj.type === 'cow' && (
        <Box args={[0.8, 1, 1.8]} position={[0,0,0]}>
          <meshLambertMaterial color="#e2e8f0" />
        </Box>
      )}
      {obj.type === 'barricade' && (
        <Box args={[2.5, 0.8, 0.5]} position={[0,0,0]}>
          <meshLambertMaterial color="#f97316" />
        </Box>
      )}
      {obj.type === 'pothole' && (
        <Cylinder args={[0.8, 0.8, 0.1, 16]} position={[0,-0.45,0]}>
          <meshLambertMaterial color="#1e293b" />
        </Cylinder>
      )}
      {obj.type === 'coin' && (
        <Sphere args={[0.4, 16, 16]}>
          <meshLambertMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1} />
        </Sphere>
      )}
    </group>
  );
}


// --- MAIN SCREEN ---
export default function MapRacer3DScreen() {
  const navigation = useNavigation<any>();
  const { session } = useContext(AppContext);
  const user = session?.user;

  const [mode, setMode] = useState<'offline'|'online'>('offline');
  const [gameState, setGameState] = useState<'lobby'|'matchmaking'|'playing'|'gameover'>('lobby');
  const [lane, setLane] = useState(1);
  const [nitroPoints, setNitroPoints] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Multiplayer State
  const [matchSeed, setMatchSeed] = useState(Date.now());
  const [opponents, setOpponents] = useState<Record<string, number>>({});
  const channelRef = useRef<any>(null);

  // Global exposes for ThreeJS canvas
  global.playerLane = lane;
  global.gameSpeed = 15;

  // Progressive speed logic
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        global.gameSpeed = Math.min(45, global.gameSpeed + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Multiplayer Matchmaking
  const joinMatchmaking = () => {
    setGameState('matchmaking');
    
    // Create or join a Realtime channel
    const roomName = 'race_lobby_tn';
    const channel = gameoSupabase.channel(roomName, {
      config: { presence: { key: user?.id } }
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const players = Object.keys(state);
      
      if (players.length >= 2) { // Start if 2 or 3 players
         // The lowest ID determines the seed
         const seed = parseInt(players.sort()[0].substring(0,8), 16) || 12345;
         setMatchSeed(seed);
         
         setTimeout(() => {
           setGameState('playing');
         }, 2000);
      }
    });

    channel.on('broadcast', { event: 'lane_update' }, (payload) => {
      if (payload.payload.userId !== user?.id) {
        setOpponents(prev => ({...prev, [payload.payload.userId]: payload.payload.lane}));
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ status: 'waiting', lane: 1 });
      }
    });

    channelRef.current = channel;
  };

  // Lane switching
  const handleLaneChange = (direction: 'left' | 'right') => {
    if (gameState !== 'playing') return;
    let newLane = lane;
    if (direction === 'left' && lane > 0) newLane = lane - 1;
    if (direction === 'right' && lane < 2) newLane = lane + 1;
    setLane(newLane);
    
    if (mode === 'online' && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'lane_update',
        payload: { userId: user?.id, lane: newLane }
      });
    }
  };

  const startGameOffline = () => {
    setMode('offline');
    setMatchSeed(Date.now());
    setNitroPoints(0);
    setLane(1);
    global.gameSpeed = 15;
    setGameState('playing');
  };

  const handleCrash = () => {
    if (gameState !== 'playing') return;
    setGameState('gameover');
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };

  const handleCoinCollect = () => {
    if (gameState !== 'playing') return;
    // Points scale with speed
    const multiplier = Math.floor(global.gameSpeed / 10); 
    setNitroPoints(prev => prev + (5 * multiplier));
  };

  const handleSyncPoints = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    await RewardsService.syncPointsToServer(user.id, nitroPoints);
    setIsSyncing(false);
    navigation.navigate('GamingHubScreen');
  };

  return (
    <View style={styles.container}>
      
      {/* 3D Canvas */}
      <Canvas style={StyleSheet.absoluteFill}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} color="#ffffff" />
        <perspectiveCamera position={[0, 4, 10]} />
        
        <Suspense fallback={null}>
          <ScaryRoad />
          <Player lane={lane} />
          
          {/* Multiplayer Ghosts */}
          {mode === 'online' && Object.entries(opponents).map(([id, oppLane]) => (
            <Player key={id} lane={oppLane} isGhost color="#ef4444" />
          ))}

          <WorldObjects 
            isPlaying={gameState === 'playing'} 
            onCrash={handleCrash} 
            onCoinCollect={handleCoinCollect}
            seed={matchSeed} 
          />
        </Suspense>
      </Canvas>

      {/* Accessible Split-Screen Tap Controls (Invisible) */}
      {gameState === 'playing' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableWithoutFeedback onPress={() => handleLaneChange('left')}>
               <View style={{flex: 1}} />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => handleLaneChange('right')}>
               <View style={{flex: 1}} />
            </TouchableWithoutFeedback>
          </View>
        </View>
      )}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        
        {/* HUD */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          {gameState === 'playing' && (
            <View style={styles.pointsBadge}>
              <Zap color="#fde047" size={16} />
              <Text style={styles.pointsText}>{nitroPoints}</Text>
            </View>
          )}
        </View>

        {/* Menus */}
        <View pointerEvents="box-none" style={{flex: 1, justifyContent: 'center'}}>
          {gameState === 'lobby' && (
            <View style={styles.centerCard}>
              <Text style={styles.titleText}>MapRacer TN</Text>
              <Text style={styles.subtitleText}>Scary Night Edition</Text>
              
              <TouchableOpacity style={styles.primaryBtn} onPress={startGameOffline}>
                <Text style={styles.primaryBtnText}>Single Player / தனியாக விளையாடு</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.primaryBtn, {backgroundColor: '#3b82f6', marginTop: 12}]} onPress={() => { setMode('online'); joinMatchmaking(); }}>
                <Users color="#fff" size={20} style={{position: 'absolute', left: 20}} />
                <Text style={styles.primaryBtnText}>Online Match (Max 3)</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameState === 'matchmaking' && (
            <View style={styles.centerCard}>
              <ActivityIndicator color="#3b82f6" size="large" />
              <Text style={[styles.titleText, {fontSize: 20, marginTop: 16}]}>Waiting for opponents...</Text>
              <Text style={styles.subtitleText}>எதிர் வீரருக்காக காத்திருக்கிறது</Text>
            </View>
          )}

          {gameState === 'gameover' && (
            <View style={styles.centerCard}>
              <Text style={[styles.titleText, { color: '#ef4444' }]}>CRASHED!</Text>
              <Text style={styles.subtitleText}>You collected {nitroPoints} points.</Text>
              
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#f59e0b', marginTop: 24 }]} onPress={handleSyncPoints} disabled={isSyncing}>
                {isSyncing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sync Wallet / ஒத்திசை</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#334155', marginTop: 12 }]} onPress={() => setGameState('lobby')}>
                <Text style={styles.primaryBtnText}>Menu / மெனு</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  pointsText: { color: '#fde047', fontWeight: 'bold', fontSize: 20, marginLeft: 6 },
  
  centerCard: { backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 24, borderRadius: 24, alignSelf: 'center', width: '90%', borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  titleText: { color: '#fff', fontSize: 32, fontWeight: '900', textAlign: 'center' },
  subtitleText: { color: '#94a3b8', fontSize: 16, textAlign: 'center', marginTop: 8 },
  primaryBtn: { width: '100%', backgroundColor: '#8b5cf6', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 32, flexDirection: 'row', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
