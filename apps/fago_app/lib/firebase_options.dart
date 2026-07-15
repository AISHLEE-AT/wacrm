import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyB0UIfxvTHXmaiKCg2C5L1Vw8KCFwkVUKs',
    appId: '1:784954157473:web:113eff1c0d2017241303e0',
    messagingSenderId: '784954157473',
    projectId: 'fago-letstravo',
    storageBucket: 'fago-letstravo.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB0UIfxvTHXmaiKCg2C5L1Vw8KCFwkVUKs',
    appId: '1:784954157473:android:c9b9b8e33ef4a5d41303e0',
    messagingSenderId: '784954157473',
    projectId: 'fago-letstravo',
    storageBucket: 'fago-letstravo.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyB0UIfxvTHXmaiKCg2C5L1Vw8KCFwkVUKs',
    appId: '1:784954157473:ios:something', // Placeholder for iOS
    messagingSenderId: '784954157473',
    projectId: 'fago-letstravo',
    storageBucket: 'fago-letstravo.firebasestorage.app',
    iosBundleId: 'com.wacrmride.driver_app',
  );
}
