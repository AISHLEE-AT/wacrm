// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT, Camera } from 'react-native-maps';
import * as Location from 'expo-location';
import { ChevronLeft, Zap, Gamepad2, Award, EyeOff, CornerUpLeft, CornerUpRight, PauseCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { gameoSupabase } from '../services/gameoSupabase';

const { width, height } = Dimensions.get('window');

// Mock ghost paths from the GameO Supabase DB (historical race data)
const fetchGhostRoute = (startLat: number, startLng: number, lagMultiplier: number) => {
  return Array.from({ length: 50 }).map((_, i) => ({
    latitude: startLat + (i * 0.0002) - (lagMultiplier * 0.00005),
    longitude: startLng + (Math.sin(i * 0.5) * 0.0001) - (lagMultiplier * 0.00005),
  }));
};

// Haversine distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Turf Wars Hexagon generator
function generateHexagon(center: {latitude: number, longitude: number}, radius: number) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = Math.PI / 180 * angle_deg;
    points.push({
      latitude: center.latitude + radius * Math.cos(angle_rad),
      // Scale longitude based on latitude to keep it somewhat hexagonal on map projection
      longitude: center.longitude + (radius / Math.cos(center.latitude * Math.PI / 180)) * Math.sin(angle_rad)
    });
  }
  return points;
}

// Massive polygon covering the world for Fog of War
const FOG_OF_WAR_WORLD = [
  { latitude: 90, longitude: -180 },
  { latitude: 90, longitude: 180 },
  { latitude: -90, longitude: 180 },
  { latitude: -90, longitude: -180 },
];

export default function GameOScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [nitroPoints, setNitroPoints] = useState(0);
  const [mode, setMode] = useState<'bike' | 'run'>('bike');

  const [turfZones, setTurfZones] = useState<{id: number, polygon: any[], owner: 'player' | 'enemy' | 'none'}[]>([]);

  const [mockPath, setMockPath] = useState<{latitude: number, longitude: number}[]>([]);
  const [ghostPath1, setGhostPath1] = useState<{latitude: number, longitude: number}[]>([]);
  const [ghostPath2, setGhostPath2] = useState<{latitude: number, longitude: number}[]>([]);
  
  // Create a visibility hole around the player
  const getVisibilityHole = (center: {latitude: number, longitude: number}) => {
    const radius = 0.002; // Roughly 200 meters
    return Array.from({ length: 36 }).map((_, i) => ({
      latitude: center.latitude + radius * Math.cos((i * 10 * Math.PI) / 180),
      longitude: center.longitude + radius * Math.sin((i * 10 * Math.PI) / 180),
    }));
  };
  
  // Initialize location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(currentLoc);
      
      // Generate mock Turf Zones nearby
      setTurfZones([
        { id: 1, polygon: generateHexagon({ latitude: currentLoc.coords.latitude + 0.0015, longitude: currentLoc.coords.longitude + 0.0015 }, 0.001), owner: 'none' },
        { id: 2, polygon: generateHexagon({ latitude: currentLoc.coords.latitude - 0.0015, longitude: currentLoc.coords.longitude - 0.0015 }, 0.001), owner: 'enemy' },
        { id: 3, polygon: generateHexagon({ latitude: currentLoc.coords.latitude + 0.002, longitude: currentLoc.coords.longitude - 0.0015 }, 0.001), owner: 'player' },
      ]);
      
      // Fetch ghost traces (simulated from gameoSupabase)
      setMockPath(fetchGhostRoute(currentLoc.coords.latitude, currentLoc.coords.longitude, 0));
      setGhostPath1(fetchGhostRoute(currentLoc.coords.latitude, currentLoc.coords.longitude, 1));
      setGhostPath2(fetchGhostRoute(currentLoc.coords.latitude, currentLoc.coords.longitude, 2));
    })();
  }, []);

  // Game Loop Scaffold - Progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && mockPath.length > 0) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1;
          if (next >= mockPath.length - 1) {
            setGameStarted(false); // Finished
            return prev;
          }
          return next;
        });
      }, mode === 'bike' ? 1000 : 2500); // Bike moves faster in mock
    }
    
    return () => clearInterval(interval);
  }, [gameStarted, mockPath, mode]);

  // Game Loop Scaffold - Physics & Telemetry
  useEffect(() => {
    if (gameStarted && progress > 0 && progress < mockPath.length) {
      const currentPos = mockPath[progress - 1];
      const nextPos = mockPath[progress];
      
      const dist = getDistance(currentPos.latitude, currentPos.longitude, nextPos.latitude, nextPos.longitude);
      const timeHours = (mode === 'bike' ? 1000 : 2500) / 3600000;
      const currentSpeed = dist / timeHours;
      
      setDistanceKm(prev => prev + dist);
      setSpeed(Math.round(currentSpeed));
      
      // Gamify Commute: Award Nitro Points for legal driving (10 - 60 km/h)
      if (currentSpeed > 10 && currentSpeed <= 60) {
        setNitroPoints(prev => prev + 5);
      } else if (currentSpeed > 60) {
        setNitroPoints(prev => Math.max(0, prev - 2)); // Speeding penalty
      }

      // Animate camera to follow player in 3D pitched mode
      if (mapRef.current) {
        const y = Math.sin(nextPos.longitude - currentPos.longitude) * Math.cos(nextPos.latitude);
        const x = Math.cos(currentPos.latitude) * Math.sin(nextPos.latitude) -
                  Math.sin(currentPos.latitude) * Math.cos(currentPos.latitude) * Math.cos(nextPos.longitude - currentPos.longitude);
        const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

        const newCamera: Camera = {
          center: nextPos,
          pitch: 60, // 3D tilt
          heading: bearing,
          zoom: 18,
          altitude: 100, // iOS
        };
        
        mapRef.current.animateCamera(newCamera, { duration: mode === 'bike' ? 1000 : 2500 });
      }
    }
  }, [progress, gameStarted, mockPath, mode]);

  const handleSyncToSupro = async () => {
    if (nitroPoints < 10) {
      Alert.alert("Not Enough Nitro", "You need at least 10 Nitro Points to sync to SuprO Coins!");
      return;
    }
    
    try {
      const nitroToSpend = Math.floor(nitroPoints / 10) * 10;
      const { data, error } = await gameoSupabase.rpc('convert_nitro_to_supro', {
        user_id: '11111111-1111-1111-1111-111111111111', // Mock ID for testing
        nitro_spent: nitroToSpend
      });
      
      if (error) {
         console.error("RPC Error:", error);
         Alert.alert("Sync Failed", error.message);
      } else {
         Alert.alert("Success!", `Successfully synced! Gained ${data.supro_gained} SuprO Coins.`);
         setNitroPoints(data.new_nitro_balance);
      }
    } catch (err) {
       console.error("Sync error:", err);
       Alert.alert("Error", "Could not connect to SuprO Economy Server.");
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Calibrating GPS...</Text>
      </View>
    );
  }

  const currentPlayerPos = mockPath.length > 0 ? mockPath[progress] : { latitude: location.coords.latitude, longitude: location.coords.longitude };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialCamera={{
          center: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          pitch: 60,
          heading: 0,
          zoom: 18,
          altitude: 100,
        }}
        showsUserLocation={false}
        showsBuildings={false} // Performance: Disable 3D buildings to save battery
        showsTraffic={false}
        showsIndoors={false}
        mapType="standard"
        userInterfaceStyle="dark"
      >
        {/* Fog of War Mask */}
        <Polygon
          coordinates={FOG_OF_WAR_WORLD}
          holes={[getVisibilityHole(currentPlayerPos)]}
          fillColor="rgba(0, 0, 0, 0.85)"
          strokeWidth={0}
        />

        {/* Turf Zones */}
        {turfZones.map(zone => (
          <Polygon
            key={`turf-${zone.id}`}
            coordinates={zone.polygon}
            fillColor={zone.owner === 'player' ? 'rgba(16, 185, 129, 0.2)' : zone.owner === 'enemy' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'}
            strokeColor={zone.owner === 'player' ? '#10b981' : zone.owner === 'enemy' ? '#ef4444' : '#ffffff80'}
            strokeWidth={2}
          />
        ))}

        {/* Ghost Avatars (Asynchronous PvP) */}
        {gameStarted && [ghostPath1, ghostPath2].map((path, index) => {
          const opponentPos = path.length > 0 ? (path[progress] || path[path.length - 1]) : currentPlayerPos;
          
          return (
            <Marker key={`ghost-${index}`} coordinate={opponentPos} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={[styles.avatarMarker, { backgroundColor: '#3b82f6', transform: [{ scale: 0.8 }], opacity: 0.7 }]}>
                <Text style={styles.avatarEmoji}>👻</Text>
              </View>
            </Marker>
          );
        })}

        {/* Player Avatar Marker */}
        <Marker coordinate={currentPlayerPos} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={[styles.avatarMarker, { backgroundColor: mode === 'bike' ? '#ef4444' : '#10b981' }]}>
            <Text style={styles.avatarEmoji}>{mode === 'bike' ? '🏍️' : '🏃'}</Text>
          </View>
        </Marker>
      </MapView>

      <SafeAreaView style={styles.overlay}>
        {/* Header HUD */}
        <View style={styles.hudHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.hudTitleBadge}>
            <Gamepad2 color="#c4b5fd" size={16} />
            <Text style={styles.hudTitle}>MapRacer India</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {!gameStarted ? (
          /* Pre-Game Lobby Overlay */
          <View style={styles.lobbyContainer}>
            <View style={styles.lobbyCard}>
              <Text style={styles.lobbyTitle}>Select Mode</Text>
              
              <View style={styles.modeRow}>
                <TouchableOpacity 
                  style={[styles.modeBtn, mode === 'bike' && styles.modeBtnActive]}
                  onPress={() => setMode('bike')}
                >
                  <Text style={styles.modeEmoji}>🏍️</Text>
                  <Text style={styles.modeText}>Street Race</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modeBtn, mode === 'run' && styles.modeBtnActive]}
                  onPress={() => setMode('run')}
                >
                  <Text style={styles.modeEmoji}>🏃</Text>
                  <Text style={styles.modeText}>Fitness Run</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => {
                  setProgress(0);
                  setDistanceKm(0);
                  setNitroPoints(0);
                  setSpeed(0);
                  setGameStarted(true);
                }}
              >
                <Zap color="#fff" size={20} />
                <Text style={styles.startBtnText}>Start Engine</Text>
              </TouchableOpacity>

              {nitroPoints > 0 && (
                <TouchableOpacity 
                  style={[styles.startBtn, { backgroundColor: '#f59e0b', marginTop: 12 }]}
                  onPress={handleSyncToSupro}
                >
                  <Award color="#fff" size={20} />
                  <Text style={styles.startBtnText}>Sync {Math.floor(nitroPoints / 10) * 10} Nitro to SuprO</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.startBtn, { backgroundColor: '#3b82f6', marginTop: 12 }]}
                onPress={() => navigation.navigate('GamingHubScreen')}
              >
                <Award color="#fff" size={20} />
                <Text style={styles.startBtnText}>Gaming Hub & Rewards</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.startBtn, { backgroundColor: '#db2777', marginTop: 12, borderWidth: 2, borderColor: '#fbcfe8' }]}
                onPress={() => navigation.navigate('MapRacer3DScreen')}
              >
                <Zap color="#fff" size={20} />
                <Text style={styles.startBtnText}>PLAY 3D MAPRACER</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Active Game HUD */
          <View style={styles.activeHudContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20 }}>
              <View style={styles.speedometerBox}>
                <Text style={styles.speedLabel}>SPEED</Text>
                <View style={styles.speedValueRow}>
                  <Text style={styles.speedValue}>{speed}</Text>
                  <Text style={styles.speedUnit}>KM/H</Text>
                </View>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                  {distanceKm.toFixed(2)} KM
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end', gap: 12 }}>
                <View style={styles.rankBox}>
                  <Award color="#fde047" size={16} />
                  <Text style={styles.rankText}>1st</Text>
                </View>
                
                <View style={[styles.rankBox, { borderColor: '#8b5cf680' }]}>
                  <Zap color="#c4b5fd" size={16} />
                  <Text style={[styles.rankText, { color: '#c4b5fd', fontSize: 18 }]}>{nitroPoints} NITRO</Text>
                </View>
                
                <TouchableOpacity style={styles.pauseBtn} onPress={() => setGameStarted(false)}>
                  <PauseCircle color="#f43f5e" size={24} />
                  <Text style={styles.pauseText}>PAUSE</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.steerBtn} activeOpacity={0.6}>
                <CornerUpLeft color="#94a3b8" size={32} />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.steerBtn, styles.boostBtn]} activeOpacity={0.6}>
                <Zap color="#c4b5fd" size={36} />
                <Text style={styles.boostText}>NITRO</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.steerBtn} activeOpacity={0.6}>
                <CornerUpRight color="#94a3b8" size={32} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  centerContainer: { flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ef4444', fontSize: 16 },
  loadingText: { color: '#8b5cf6', fontSize: 16, marginTop: 12, fontWeight: 'bold' },
  map: { width, height, position: 'absolute', top: 0, left: 0 },
  overlay: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 16 },
  hudHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00000080', justifyContent: 'center', alignItems: 'center' },
  hudTitleBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8b5cf640', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#8b5cf680' },
  hudTitle: { color: '#c4b5fd', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  
  lobbyContainer: { flex: 1, justifyContent: 'flex-end', paddingBottom: 40 },
  lobbyCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1e293b' },
  lobbyTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  modeRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  modeBtn: { flex: 1, backgroundColor: '#1e293b', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  modeBtnActive: { borderColor: '#8b5cf6', backgroundColor: '#8b5cf620' },
  modeEmoji: { fontSize: 32, marginBottom: 8 },
  modeText: { color: '#fff', fontWeight: 'bold' },
  startBtn: { backgroundColor: '#8b5cf6', borderRadius: 16, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },

  activeHudContainer: { flex: 1, justifyContent: 'space-between', paddingBottom: 20 },
  speedometerBox: { backgroundColor: '#00000080', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  speedLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  speedValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  speedValue: { color: '#fff', fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'] },
  speedUnit: { color: '#64748b', fontSize: 14, fontWeight: 'bold' },
  
  rankBox: { backgroundColor: '#00000080', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ca8a0440', gap: 8 },
  rankText: { color: '#fde047', fontSize: 24, fontWeight: '900' },
  
  pauseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00000080', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f43f5e40', gap: 8 },
  pauseText: { color: '#f43f5e', fontSize: 14, fontWeight: '900' },

  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingHorizontal: 10 },
  steerBtn: { flex: 1, height: 80, backgroundColor: '#ffffff10', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ffffff20' },
  boostBtn: { backgroundColor: '#8b5cf650', borderColor: '#8b5cf6', flex: 1.2 },
  boostText: { color: '#c4b5fd', fontWeight: '900', fontSize: 12, marginTop: 4 },
  controlText: { color: '#ffffff80', fontWeight: '900', fontSize: 12 },

  avatarMarker: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5 },
  avatarEmoji: { fontSize: 20 },
});

