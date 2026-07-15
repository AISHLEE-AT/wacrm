import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';

class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();
  IO.Socket? socket;
  Function(Map<String, dynamic>)? onRideAccepted;
  Function(Map<String, dynamic>)? onRideRejected;

  factory WebSocketService() {
    return _instance;
  }

  WebSocketService._internal();

  void initSocket() {
    const String serverUrl = kIsWeb ? 'http://localhost:3000' : 'http://10.0.2.2:3000';

    socket = IO.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket!.connect();

    socket!.onConnect((_) {
      debugPrint('Connected to WebSocket Server: ${socket!.id}');
    });

    final uid = FirebaseAuth.instance.currentUser?.uid;
    
    if (uid != null) {
      socket!.on('ride_accepted_$uid', (data) {
        debugPrint('Ride Accepted! Driver is on the way: $data');
        if (onRideAccepted != null) onRideAccepted!(data);
      });

      socket!.on('ride_rejected_$uid', (data) {
        debugPrint('Ride Rejected: $data');
        if (onRideRejected != null) onRideRejected!(data);
      });
    }

    socket!.onDisconnect((_) => debugPrint('Disconnected from WebSocket'));
  }

  void requestRide({
    required String riderUid,
    required double pickupLat,
    required double pickupLng,
    required double dropoffLat,
    required double dropoffLng,
    required double estimatedPrice,
  }) {
    if (socket != null && socket!.connected) {
      socket!.emit('request_ride', {
        'riderUid': riderUid,
        'pickupLat': pickupLat,
        'pickupLng': pickupLng,
        'dropoffLat': dropoffLat,
        'dropoffLng': dropoffLng,
        'estimatedPrice': estimatedPrice,
      });
    }
  }

  void dispose() {
    socket?.disconnect();
  }
}
