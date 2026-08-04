import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

class LocationPoint {
  final double lat;
  final double lng;
  final String name;

  LocationPoint({required this.lat, required this.lng, required this.name});
}

class RideScreen extends ConsumerStatefulWidget {
  const RideScreen({super.key});

  @override
  ConsumerState<RideScreen> createState() => _RideScreenState();
}

class _RideScreenState extends ConsumerState<RideScreen> {
  final Completer<GoogleMapController> _controller = Completer<GoogleMapController>();
  
  Position? _currentLocation;
  LocationPoint? _pickup;
  LocationPoint? _dropoff;
  
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  String? _errorMsg;

  static const String _wabaNumber = '916381029380';

  @override
  void initState() {
    super.initState();
    _determinePosition();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _errorMsg = 'Location services are disabled.';
      });
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _errorMsg = 'Location permissions are denied';
        });
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      setState(() {
        _errorMsg = 'Location permissions are permanently denied.';
      });
      return;
    } 

    try {
      final position = await Geolocator.getCurrentPosition();
      setState(() {
        _currentLocation = position;
      });

      // Reverse geocode
      List<Placemark> placemarks = await Geocoding().placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      String name = 'Current Location';
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final parts = [p.street, p.subLocality, p.locality].where((e) => e != null && e.isNotEmpty).toList();
        if (parts.isNotEmpty) {
          name = parts.join(', ');
        }
      }

      setState(() {
        _pickup = LocationPoint(
          lat: position.latitude,
          lng: position.longitude,
          name: name,
        );
      });
    } catch (e) {
      if (_currentLocation != null) {
        setState(() {
          _pickup = LocationPoint(
            lat: _currentLocation!.latitude,
            lng: _currentLocation!.longitude,
            name: 'Current Location',
          );
        });
      }
    }
  }

  Future<void> _handleSearchDropoff(String query) async {
    if (query.trim().isEmpty) return;
    
    setState(() {
      _isSearching = true;
    });
    
    FocusScope.of(context).unfocus();

    try {
      List<Location> locations = await Geocoding().locationFromAddress(query);
      if (locations.isNotEmpty) {
        final loc = locations.first;
        
        List<Placemark> placemarks = await Geocoding().placemarkFromCoordinates(
          loc.latitude,
          loc.longitude,
        );
        
        String cleanName = query;
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          final parts = [p.street, p.locality].where((e) => e != null && e.isNotEmpty).toList();
          if (parts.isNotEmpty) {
            cleanName = parts.join(', ');
          }
        }

        setState(() {
          _dropoff = LocationPoint(
            lat: loc.latitude,
            lng: loc.longitude,
            name: cleanName,
          );
          _searchController.text = cleanName;
        });

        // Center map to show both pickup and dropoff
        if (_pickup != null) {
          final controller = await _controller.future;
          
          double minLat = _pickup!.lat < loc.latitude ? _pickup!.lat : loc.latitude;
          double maxLat = _pickup!.lat > loc.latitude ? _pickup!.lat : loc.latitude;
          double minLng = _pickup!.lng < loc.longitude ? _pickup!.lng : loc.longitude;
          double maxLng = _pickup!.lng > loc.longitude ? _pickup!.lng : loc.longitude;

          controller.animateCamera(
            CameraUpdate.newLatLngBounds(
              LatLngBounds(
                southwest: LatLng(minLat, minLng),
                northeast: LatLng(maxLat, maxLng),
              ),
              100.0, // padding
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not find that location. Try a different search.')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error searching location.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
      }
    }
  }

  void _requestRide() async {
    if (_pickup == null || _dropoff == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a drop-off location first.')),
      );
      return;
    }
    
    final message = '''🚖 *Ride Request (RideO)*

🟢 *Pickup:* ${_pickup!.name}
📍 https://maps.google.com/?q=${_pickup!.lat},${_pickup!.lng}

🔴 *Drop-off:* ${_dropoff!.name}
📍 https://maps.google.com/?q=${_dropoff!.lat},${_dropoff!.lng}''';
    
    final encodedMessage = Uri.encodeComponent(message);
    final whatsappUrl = Uri.parse('whatsapp://send?phone=$_wabaNumber&text=$encodedMessage');
    final webUrl = Uri.parse('https://wa.me/$_wabaNumber?text=$encodedMessage');

    try {
      bool launched = await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(webUrl, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      await launchUrl(webUrl, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_errorMsg != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0A0F1E),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(LucideIcons.mapPinOff, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text(
                  _errorMsg!,
                  style: const TextStyle(color: Colors.white, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _determinePosition,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Try Again'),
                )
              ],
            ),
          ),
        ),
      );
    }

    if (_currentLocation == null || _pickup == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0F1E),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Color(0xFF10B981)),
              SizedBox(height: 16),
              Text(
                'Fetching your location...',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 16),
              ),
            ],
          ),
        ),
      );
    }

    Set<Marker> markers = {
      Marker(
        markerId: const MarkerId('pickup'),
        position: LatLng(_pickup!.lat, _pickup!.lng),
        infoWindow: InfoWindow(title: 'Pickup', snippet: _pickup!.name),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    };

    if (_dropoff != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('dropoff'),
          position: LatLng(_dropoff!.lat, _dropoff!.lng),
          infoWindow: InfoWindow(title: 'Drop-off', snippet: _dropoff!.name),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0F1E),
      body: Stack(
        children: [
          GoogleMap(
            mapType: MapType.normal,
            initialCameraPosition: CameraPosition(
              target: LatLng(_currentLocation!.latitude, _currentLocation!.longitude),
              zoom: 14.4746,
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            markers: markers,
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
            },
          ),
          
          // Search Bar Overlay
          Positioned(
            top: 60,
            left: 20,
            right: 20,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    offset: const Offset(0, 4),
                    blurRadius: 5,
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 12.0),
                    child: Icon(LucideIcons.search, color: Color(0xFF94A3B8), size: 20),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                      decoration: const InputDecoration(
                        hintText: 'Where to? (e.g. Marina Beach)',
                        hintStyle: TextStyle(color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.all(16),
                      ),
                      textInputAction: TextInputAction.search,
                      onSubmitted: _handleSearchDropoff,
                    ),
                  ),
                  if (_isSearching)
                    const Padding(
                      padding: EdgeInsets.only(right: 12.0),
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          
          // Recenter Button
          Positioned(
            right: 20,
            bottom: 300, // Above bottom sheet
            child: FloatingActionButton(
              heroTag: 'recenter',
              backgroundColor: Colors.white,
              onPressed: () async {
                final controller = await _controller.future;
                controller.animateCamera(
                  CameraUpdate.newCameraPosition(
                    CameraPosition(
                      target: LatLng(_pickup!.lat, _pickup!.lng),
                      zoom: 14.4746,
                    ),
                  ),
                );
              },
              child: const Icon(LucideIcons.navigation, color: Color(0xFF1E293B)),
            ),
          ),
          
          // Bottom Sheet UI
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFF111827),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
                border: Border(
                  top: BorderSide(color: Color(0xFF334155)),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    offset: Offset(0, -4),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'RideO Booking',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Location Row
                  Row(
                    children: [
                      // Dots and Line
                      Column(
                        children: [
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          Container(
                            width: 2,
                            height: 40,
                            color: const Color(0xFF334155),
                            margin: const EdgeInsets.symmetric(vertical: 4),
                          ),
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      // Texts
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'PICKUP',
                              style: TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _pickup!.name,
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 24),
                            const Text(
                              'DROP-OFF',
                              style: TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _dropoff?.name ?? 'Search destination above',
                              style: const TextStyle(color: Colors.white, fontSize: 16),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 24),
                  
                  ElevatedButton.icon(
                    onPressed: _dropoff != null ? _requestRide : null,
                    icon: const Icon(LucideIcons.messageCircle, color: Colors.white),
                    label: const Text(
                      'Request Ride via WhatsApp',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      disabledBackgroundColor: const Color(0xFF0F172A),
                      foregroundColor: Colors.white,
                      disabledForegroundColor: Colors.white54,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: _dropoff == null 
                            ? const BorderSide(color: Color(0xFF334155)) 
                            : BorderSide.none,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  const Text(
                    'Connected to Aishlee CRM network',
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
