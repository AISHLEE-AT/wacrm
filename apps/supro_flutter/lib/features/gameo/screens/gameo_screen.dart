import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide MapType;

class TurfZone {
  final int id;
  final List<LatLng> polygon;
  final String owner;

  TurfZone({required this.id, required this.polygon, required this.owner});
}

class GameoScreen extends StatefulWidget {
  const GameoScreen({super.key});

  @override
  State<GameoScreen> createState() => _GameoScreenState();
}

class _GameoScreenState extends State<GameoScreen> {
  final Completer<GoogleMapController> _controller = Completer();
  
  Position? _currentPosition;
  String? _errorMsg;
  bool _gameStarted = false;
  int _progress = 0;
  int _speed = 0;
  double _distanceKm = 0.0;
  int _nitroPoints = 0;
  String _mode = 'bike';
  
  Timer? _gameLoop;
  
  List<LatLng> _mockPath = [];
  List<LatLng> _ghostPath1 = [];
  List<LatLng> _ghostPath2 = [];
  
  List<TurfZone> _turfZones = [];

  // Fog of war polygon covering the whole world
  final List<LatLng> _fogOfWarWorld = [
    const LatLng(90, -180),
    const LatLng(90, 180),
    const LatLng(-90, 180),
    const LatLng(-90, -180),
  ];

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }
  
  @override
  void dispose() {
    _gameLoop?.cancel();
    super.dispose();
  }

  // Generates a mock route for ghosts based on lag
  List<LatLng> _fetchGhostRoute(double startLat, double startLng, double lagMultiplier) {
    return List.generate(50, (i) {
      return LatLng(
        startLat + (i * 0.0002) - (lagMultiplier * 0.00005),
        startLng + (math.sin(i * 0.5) * 0.0001) - (lagMultiplier * 0.00005),
      );
    });
  }

  // Generates the visibility hole around the player
  List<LatLng> _getVisibilityHole(LatLng center) {
    const double radius = 0.002; // Roughly 200m
    return List.generate(36, (i) {
      return LatLng(
        center.latitude + radius * math.cos((i * 10 * math.pi) / 180),
        center.longitude + radius * math.sin((i * 10 * math.pi) / 180),
      );
    });
  }

  // Haversine distance in km
  double _getDistance(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371.0;
    final dLat = (lat2 - lat1) * math.pi / 180.0;
    final dLon = (lon2 - lon1) * math.pi / 180.0;
    final a = math.sin(dLat/2) * math.sin(dLat/2) +
              math.cos(lat1 * math.pi / 180.0) * math.cos(lat2 * math.pi / 180.0) *
              math.sin(dLon/2) * math.sin(dLon/2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a));
    return R * c;
  }

  List<LatLng> _generateHexagon(LatLng center, double radius) {
    List<LatLng> points = [];
    for (int i = 0; i < 6; i++) {
      double angleDeg = 60.0 * i - 30.0;
      double angleRad = math.pi / 180.0 * angleDeg;
      points.add(LatLng(
        center.latitude + radius * math.cos(angleRad),
        center.longitude + (radius / math.cos(center.latitude * math.pi / 180.0)) * math.sin(angleRad),
      ));
    }
    return points;
  }


  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() => _errorMsg = 'Location services are disabled.');
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() => _errorMsg = 'Location permissions are denied');
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      setState(() => _errorMsg = 'Location permissions are permanently denied.');
      return;
    }

    try {
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      setState(() {
        _currentPosition = position;
        
        _turfZones = [
          TurfZone(id: 1, polygon: _generateHexagon(LatLng(position.latitude + 0.0015, position.longitude + 0.0015), 0.001), owner: 'none'),
          TurfZone(id: 2, polygon: _generateHexagon(LatLng(position.latitude - 0.0015, position.longitude - 0.0015), 0.001), owner: 'enemy'),
          TurfZone(id: 3, polygon: _generateHexagon(LatLng(position.latitude + 0.002, position.longitude - 0.0015), 0.001), owner: 'player'),
        ];
        
        _mockPath = _fetchGhostRoute(position.latitude, position.longitude, 0);
        _ghostPath1 = _fetchGhostRoute(position.latitude, position.longitude, 1);
        _ghostPath2 = _fetchGhostRoute(position.latitude, position.longitude, 2);
      });
    } catch (e) {
      setState(() => _errorMsg = 'Error getting location: $e');
    }
  }

  void _startGame() {
    setState(() {
      _gameStarted = true;
      _progress = 0;
      _distanceKm = 0.0;
      _nitroPoints = 0;
      _speed = 0;
    });

    int delay = _mode == 'bike' ? 1000 : 2500;
    
    _gameLoop = Timer.periodic(Duration(milliseconds: delay), (timer) async {
      if (!mounted) {
        timer.cancel();
        return;
      }
      
      if (_progress >= _mockPath.length - 1) {
        setState(() => _gameStarted = false);
        timer.cancel();
        return;
      }

      final currentPos = _mockPath[_progress];
      final nextPos = _mockPath[_progress + 1];
      
      final dist = _getDistance(currentPos.latitude, currentPos.longitude, nextPos.latitude, nextPos.longitude);
      final timeHours = delay / 3600000.0;
      final currentSpeed = dist / timeHours;

      setState(() {
        _progress++;
        _distanceKm += dist;
        _speed = currentSpeed.round();
        
        if (currentSpeed > 10 && currentSpeed <= 60) {
          _nitroPoints += 5;
        } else if (currentSpeed > 60) {
          _nitroPoints = math.max(0, _nitroPoints - 2);
        }
      });

      // Animate Camera
      final controller = await _controller.future;
      final currentCamPos = _mockPath[_progress];
      final nextCamPos = _progress < _mockPath.length - 1 ? _mockPath[_progress + 1] : currentCamPos;
      
      // Calculate bearing
      double y = math.sin(nextCamPos.longitude - currentCamPos.longitude) * math.cos(nextCamPos.latitude);
      double x = math.cos(currentCamPos.latitude) * math.sin(nextCamPos.latitude) -
                 math.sin(currentCamPos.latitude) * math.cos(nextCamPos.latitude) * math.cos(nextCamPos.longitude - currentCamPos.longitude);
      double bearing = (math.atan2(y, x) * 180 / math.pi + 360) % 360;

      controller.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: currentCamPos,
            tilt: 60,
            bearing: bearing,
            zoom: 18,
          ),
        ),
      );
    });
  }

  Future<void> _syncToSupro() async {
    if (_nitroPoints < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You need at least 10 Nitro Points to sync to SuprO Coins!')),
      );
      return;
    }
    
    try {
      final nitroToSpend = (_nitroPoints ~/ 10) * 10;
      final response = await Supabase.instance.client.rpc('convert_nitro_to_supro', params: {
        'user_id': '11111111-1111-1111-1111-111111111111',
        'nitro_spent': nitroToSpend
      });
      
      if (response != null && response['success'] == true) {
        setState(() {
          _nitroPoints = response['new_nitro_balance'];
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Successfully synced! Gained ${response['supro_gained']} SuprO Coins.')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_errorMsg != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0a0f1e),
        body: Center(child: Text(_errorMsg!, style: const TextStyle(color: Colors.red, fontSize: 16))),
      );
    }

    if (_currentPosition == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0a0f1e),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Color(0xFF8b5cf6)),
              SizedBox(height: 16),
              Text('Calibrating GPS...', style: TextStyle(color: Color(0xFF8b5cf6), fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      );
    }

    LatLng playerPos = _mockPath.isNotEmpty ? _mockPath[_progress] : LatLng(_currentPosition!.latitude, _currentPosition!.longitude);
    
    // Ghost Markers
    Set<Marker> markers = {};
    if (_gameStarted) {
      if (_ghostPath1.isNotEmpty) {
        LatLng p = _progress < _ghostPath1.length ? _ghostPath1[_progress] : _ghostPath1.last;
        markers.add(Marker(markerId: const MarkerId('ghost1'), position: p, alpha: 0.7, icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure)));
      }
      if (_ghostPath2.isNotEmpty) {
        LatLng p = _progress < _ghostPath2.length ? _ghostPath2[_progress] : _ghostPath2.last;
        markers.add(Marker(markerId: const MarkerId('ghost2'), position: p, alpha: 0.7, icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure)));
      }
    }
    
    // Player Marker
    markers.add(Marker(markerId: const MarkerId('player'), position: playerPos, icon: BitmapDescriptor.defaultMarkerWithHue(_mode == 'bike' ? BitmapDescriptor.hueRed : BitmapDescriptor.hueGreen)));

    // Fog of War Polygon
    Set<Polygon> polygons = {
      Polygon(
        polygonId: const PolygonId('fog'),
        points: _fogOfWarWorld,
        holes: [_getVisibilityHole(playerPos)],
        fillColor: Colors.black.withValues(alpha: 0.85),
        strokeWidth: 0,
        zIndex: 2,
      )
    };

    for (var zone in _turfZones) {
      Color fillColor;
      Color strokeColor;
      if (zone.owner == 'player') {
        fillColor = const Color(0x3310b981);
        strokeColor = const Color(0xFF10b981);
      } else if (zone.owner == 'enemy') {
        fillColor = const Color(0x33ef4444);
        strokeColor = const Color(0xFFef4444);
      } else {
        fillColor = const Color(0x0Cffffff);
        strokeColor = const Color(0x80ffffff);
      }

      polygons.add(Polygon(
        polygonId: PolygonId('turf-${zone.id}'),
        points: zone.polygon,
        fillColor: fillColor,
        strokeColor: strokeColor,
        strokeWidth: 2,
        zIndex: 1,
      ));
    }

    return Scaffold(
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
              zoom: 18,
              tilt: 60,
            ),
            mapType: MapType.normal,
            myLocationEnabled: false,
            myLocationButtonEnabled: false,
            compassEnabled: false,
            mapToolbarEnabled: false,
            buildingsEnabled: false, // Performance optimization
            trafficEnabled: false,
            markers: markers,
            polygons: polygons,
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
              // In production we would load dark mode map styling here using controller.setMapStyle
            },
          ),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // HUD Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
                          child: const Icon(LucideIcons.chevronLeft, color: Colors.white),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0x668b5cf6),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0x808b5cf6)),
                        ),
                        child: const Row(
                          children: [
                            Icon(LucideIcons.gamepad2, color: Color(0xFFc4b5fd), size: 16),
                            SizedBox(width: 8),
                            Text('MapRacer India', style: TextStyle(color: Color(0xFFc4b5fd), fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 40), // spacer
                    ],
                  ),
                  
                  // Bottom Area
                  if (!_gameStarted)
                    // Lobby
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0f172a),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF1e293b)),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('Select Mode', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _mode = 'bike'),
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: _mode == 'bike' ? const Color(0x338b5cf6) : const Color(0xFF1e293b),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: _mode == 'bike' ? const Color(0xFF8b5cf6) : Colors.transparent, width: 2),
                                    ),
                                    child: const Column(
                                      children: [
                                        Text('🏍️', style: TextStyle(fontSize: 32)),
                                        SizedBox(height: 8),
                                        Text('Street Race', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _mode = 'run'),
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: _mode == 'run' ? const Color(0x338b5cf6) : const Color(0xFF1e293b),
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: _mode == 'run' ? const Color(0xFF8b5cf6) : Colors.transparent, width: 2),
                                    ),
                                    child: const Column(
                                      children: [
                                        Text('🏃', style: TextStyle(fontSize: 32)),
                                        SizedBox(height: 8),
                                        Text('Fitness Run', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          GestureDetector(
                            onTap: _startGame,
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              decoration: BoxDecoration(
                                color: const Color(0xFF8b5cf6),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(LucideIcons.zap, color: Colors.white, size: 20),
                                  SizedBox(width: 8),
                                  Text('Start Engine', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                                ],
                              ),
                            ),
                          ),
                          if (_nitroPoints >= 10) ...[
                            const SizedBox(height: 12),
                            GestureDetector(
                              onTap: _syncToSupro,
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 18),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFf59e0b),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(LucideIcons.award, color: Colors.white, size: 20),
                                    const SizedBox(width: 8),
                                    Text('Sync ${(_nitroPoints ~/ 10) * 10} Nitro to SuprO', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    )
                  else
                    // Active HUD
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFF334155)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('SPEED', style: TextStyle(color: Color(0xFF94a3b8), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.baseline,
                                    textBaseline: TextBaseline.alphabetic,
                                    children: [
                                      Text('$_speed', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900)),
                                      const SizedBox(width: 4),
                                      const Text('KM/H', style: TextStyle(color: Color(0xFF64748b), fontSize: 14, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text('${_distanceKm.toStringAsFixed(2)} KM', style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 12)),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: Colors.black54,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: const Color(0x40ca8a04)),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(LucideIcons.award, color: Color(0xFFfde047), size: 16),
                                      SizedBox(width: 8),
                                      Text('1st', style: TextStyle(color: Color(0xFFfde047), fontSize: 24, fontWeight: FontWeight.w900)),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: Colors.black54,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: const Color(0x808b5cf6)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(LucideIcons.zap, color: Color(0xFFc4b5fd), size: 16),
                                      const SizedBox(width: 8),
                                      Text('$_nitroPoints NITRO', style: const TextStyle(color: Color(0xFFc4b5fd), fontSize: 18, fontWeight: FontWeight.w900)),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                GestureDetector(
                                  onTap: () => setState(() => _gameStarted = false),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: Colors.black54,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: const Color(0x40f43f5e)),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(LucideIcons.pauseCircle, color: Color(0xFFf43f5e), size: 24),
                                        SizedBox(width: 8),
                                        Text('PAUSE', style: TextStyle(color: Color(0xFFf43f5e), fontSize: 14, fontWeight: FontWeight.w900)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Expanded(child: _buildControlBtn(LucideIcons.cornerUpLeft)),
                            const SizedBox(width: 16),
                            Expanded(flex: 1, child: _buildControlBtn(LucideIcons.zap, label: 'NITRO', isPrimary: true)),
                            const SizedBox(width: 16),
                            Expanded(child: _buildControlBtn(LucideIcons.cornerUpRight)),
                          ],
                        )
                      ],
                    )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildControlBtn(IconData icon, {String? label, bool isPrimary = false}) {
    return Container(
      height: 80,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: isPrimary ? const Color(0x508b5cf6) : Colors.white10,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isPrimary ? const Color(0xFF8b5cf6) : Colors.white24),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: isPrimary ? const Color(0xFFc4b5fd) : const Color(0xFF94a3b8), size: isPrimary ? 36 : 32),
          if (label != null) ...[
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isPrimary ? const Color(0xFFc4b5fd) : Colors.white54,
                fontWeight: FontWeight.w900,
                fontSize: 12,
              ),
            ),
          ]
        ],
      ),
    );
  }
}
