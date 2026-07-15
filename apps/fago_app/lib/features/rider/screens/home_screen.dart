import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/websocket_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  GoogleMapController? mapController;
  Position? _currentPosition;
  final WebSocketService _wsService = WebSocketService();
  
  bool _isRequesting = false;
  bool _isRideAccepted = false;
  Map<String, dynamic>? _acceptedRideData;

  // Places Search
  final String _googleApiKey = 'AIzaSyDdAePjhtVNhbCPhvsdEGrMUGA2kn5WDds';
  List<dynamic> _placeList = [];
  LatLng? _dropoffLocation;
  String _destinationName = '';
  final TextEditingController _searchController = TextEditingController();

  // Default to the center of India
  final LatLng _defaultCenter = const LatLng(20.5937, 78.9629);

  @override
  void initState() {
    super.initState();
    _determinePosition();
    _initWebSocket();
  }

  void _initWebSocket() {
    _wsService.initSocket();
    _wsService.onRideAccepted = (data) {
      setState(() {
        _isRequesting = false;
        _isRideAccepted = true;
        _acceptedRideData = data;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ride Accepted! Driver is arriving.', style: TextStyle(color: Colors.white)), backgroundColor: Colors.green),
      );
    };
    _wsService.onRideRejected = (data) {
      setState(() {
        _isRequesting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No drivers available right now.')),
      );
    };
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
    
    if (permission == LocationPermission.deniedForever) return;

    Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
    setState(() {
      _currentPosition = position;
    });

    if (mapController != null) {
      mapController!.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: LatLng(position.latitude, position.longitude),
            zoom: 15.0,
          ),
        ),
      );
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  void _searchPlaces(String input) async {
    if (input.isEmpty) {
      setState(() {
        _placeList = [];
      });
      return;
    }

    String url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=$input&key=$_googleApiKey&components=country:in';
    
    try {
      var response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        if (data['status'] == 'OK') {
          setState(() {
            _placeList = data['predictions'];
          });
        }
      }
    } catch (e) {
      debugPrint('Error searching places: $e');
    }
  }

  void _getPlaceDetails(String placeId, String description) async {
    String url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id=$placeId&key=$_googleApiKey';
    
    try {
      var response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        var data = jsonDecode(response.body);
        if (data['status'] == 'OK') {
          var location = data['result']['geometry']['location'];
          setState(() {
            _dropoffLocation = LatLng(location['lat'], location['lng']);
            _destinationName = description;
            _searchController.text = description;
            _placeList = []; // Hide dropdown
          });

          // Draw marker or animate camera to show route (simplified for now)
          mapController?.animateCamera(CameraUpdate.newLatLngZoom(_dropoffLocation!, 14));
        }
      }
    } catch (e) {
      debugPrint('Error getting place details: $e');
    }
  }

  void _requestRide() {
    if (_currentPosition == null || _dropoffLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a destination first.')),
      );
      return;
    }
    
    setState(() {
      _isRequesting = true;
    });

    // Mock price calculation based on distance
    double mockPrice = 150.0;

    _wsService.requestRide(
      riderUid: FirebaseAuth.instance.currentUser?.uid ?? 'guest',
      pickupLat: _currentPosition!.latitude,
      pickupLng: _currentPosition!.longitude,
      dropoffLat: _dropoffLocation!.latitude,
      dropoffLng: _dropoffLocation!.longitude,
      estimatedPrice: mockPrice,
    );
  }

  @override
  void dispose() {
    _wsService.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          GoogleMap(
            onMapCreated: _onMapCreated,
            initialCameraPosition: CameraPosition(
              target: _currentPosition != null 
                  ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude) 
                  : _defaultCenter,
              zoom: _currentPosition != null ? 15.0 : 4.0,
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            markers: _dropoffLocation != null 
              ? { Marker(markerId: const MarkerId('dropoff'), position: _dropoffLocation!) } 
              : {},
          ),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: CircleAvatar(
                backgroundColor: Colors.white,
                child: IconButton(
                  icon: const Icon(Icons.menu, color: Colors.black),
                  onPressed: () {},
                ),
              ),
            ),
          ),

          // Bottom Sheet
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [
                  BoxShadow(color: Colors.black12, blurRadius: 10, spreadRadius: 5)
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _isRideAccepted ? 'Driver En Route' : 'Where to?',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  
                  if (!_isRideAccepted) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        controller: _searchController,
                        onChanged: _searchPlaces,
                        decoration: const InputDecoration(
                          icon: Icon(Icons.search, color: Colors.black),
                          hintText: 'Enter destination',
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                    
                    // Search Results Dropdown
                    if (_placeList.isNotEmpty)
                      Container(
                        constraints: const BoxConstraints(maxHeight: 200),
                        margin: const EdgeInsets.only(top: 8),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: _placeList.length,
                          itemBuilder: (context, index) {
                            return ListTile(
                              leading: const Icon(Icons.location_on, color: Colors.grey),
                              title: Text(_placeList[index]['description']),
                              onTap: () {
                                _getPlaceDetails(_placeList[index]['place_id'], _placeList[index]['description']);
                              },
                            );
                          },
                        ),
                      ),

                    const SizedBox(height: 20),
                    if (_dropoffLocation != null)
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _isRequesting ? null : _requestRide,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.black,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: _isRequesting
                              ? const CircularProgressIndicator(color: Colors.white)
                              : const Text('Find a Ride', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        ),
                      ),
                  ] else ...[
                    // Driver Info UI
                    ListTile(
                      leading: const CircleAvatar(backgroundColor: Colors.amber, child: Icon(Icons.person, color: Colors.black)),
                      title: const Text('Your Driver is arriving', style: TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('ID: ${_acceptedRideData?['driverUid']?.toString().substring(0,6) ?? ''}'),
                      trailing: IconButton(icon: const Icon(Icons.phone), onPressed: (){}),
                    ),
                  ],
                ],
              ),
            ),
          ),

          // Custom My Location Button
          Positioned(
            bottom: _isRideAccepted ? 120 : (_placeList.isNotEmpty ? 350 : 200),
            right: 16,
            child: FloatingActionButton(
              backgroundColor: Colors.white,
              onPressed: _determinePosition,
              child: const Icon(Icons.my_location, color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}

