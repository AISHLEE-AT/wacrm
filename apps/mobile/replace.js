const fs = require('fs');
const file = 'D:/w/apps/mobile/src/screens/RideOScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/useState\('IDLE'\)/g, "useState('SELECT_PICKUP')");
code = code.replace(/resetToIdle/g, "resetToPickup");
code = code.replace(/rideState === 'IDLE'/g, "rideState === 'SELECT_PICKUP'");
code = code.replace(/rideState !== 'IDLE'/g, "rideState !== 'SELECT_PICKUP'");
code = code.replace(/const \[dropoffQuery, setDropoffQuery\] = useState\(''\);/, "const [pickupQuery, setPickupQuery] = useState('');\n  const [dropoffQuery, setDropoffQuery] = useState('');");

code = code.replace(
/  const resetToPickup = \(\) => \{\n    setRideState\('SELECT_PICKUP'\);\n    setDropoffLocation\(null\);\n    setDropoffAddress\(''\);\n    setDropoffQuery\(''\);\n    setRouteCoordinates\(\[\]\);/,
`  const resetToPickup = () => {
    setRideState('SELECT_PICKUP');
    setDropoffLocation(null);
    setDropoffAddress('');
    setDropoffQuery('');
    setPickupQuery('');
    setRouteCoordinates([]);`
);

code = code.replace(
/  const handleMapRegionChangeComplete = async \(region\) => \{\n    if \(rideState === 'SELECT_PICKUP'\) \{\n      setIsMapMoving\(false\);\n      setLocation\(\{ latitude: region\.latitude, longitude: region\.longitude \}\);\n      reverseGeocode\(region\.latitude, region\.longitude, setPickupAddress\);\n    \}\n  \};\n\n  \/\/ Actions\n  const handleDropoffSubmit = async \(\) => \{\n    if \(!dropoffQuery\) return;\n    setLoading\(true\);\n    try \{\n      const geocoded = await Location\.geocodeAsync\(dropoffQuery\);\n      if \(geocoded && geocoded\.length > 0\) \{\n        const dropLoc = \{ latitude: geocoded\[0\]\.latitude, longitude: geocoded\[0\]\.longitude \};\n        setDropoffLocation\(dropLoc\);\n        setDropoffAddress\(dropoffQuery\);\n        \n        const route = await fetchOSRMRoute\(location\.latitude, location\.longitude, dropLoc\.latitude, dropLoc\.longitude\);\n        setRouteCoordinates\(route\);\n        \n        const distance = getDistanceKm\(location\.latitude, location\.longitude, dropLoc\.latitude, dropLoc\.longitude\);\n        setFareEstimate\(\{ distanceKm: distance\.toFixed\(1\) \}\);\n        \n        if \(mapRef\.current\) \{\n          mapRef\.current\.fitToCoordinates\(\[location, dropLoc\], \{\n            edgePadding: \{ top: 100, right: 50, bottom: 400, left: 50 \},\n            animated: true\n          \}\);\n        \}\n        setRideState\('SELECT_DROPOFF'\);\n      \} else \{\n        Alert\.alert\('Location not found', 'Try another address\.'\);\n      \}\n    \} catch \(e\) \{\n      Alert\.alert\('Error', 'Could not search location\.'\);\n    \} finally \{\n      setLoading\(false\);\n    \}\n  \};/,
`  const handleMapRegionChangeComplete = async (region) => {
    setIsMapMoving(false);
    if (rideState === 'SELECT_PICKUP') {
      setLocation({ latitude: region.latitude, longitude: region.longitude });
      reverseGeocode(region.latitude, region.longitude, setPickupAddress);
    } else if (rideState === 'SELECT_DROPOFF') {
      setDropoffLocation({ latitude: region.latitude, longitude: region.longitude });
      reverseGeocode(region.latitude, region.longitude, setDropoffAddress);
    }
  };

  // Actions
  const handlePickupSubmit = async () => {
    if (!pickupQuery) return;
    setLoading(true);
    try {
      const geocoded = await Location.geocodeAsync(pickupQuery);
      if (geocoded && geocoded.length > 0) {
        const loc = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
        setLocation(loc);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...loc,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        Alert.alert('Location not found', 'Try another address.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not search location.');
    } finally {
      setLoading(false);
    }
  };

  const handleDropoffSubmit = async () => {
    if (!dropoffQuery) return;
    setLoading(true);
    try {
      const geocoded = await Location.geocodeAsync(dropoffQuery);
      if (geocoded && geocoded.length > 0) {
        const dropLoc = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
        setDropoffLocation(dropLoc);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...dropLoc,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        Alert.alert('Location not found', 'Try another address.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not search location.');
    } finally {
      setLoading(false);
    }
  };

  const confirmPickup = () => {
    setRideState('SELECT_DROPOFF');
    if (!dropoffLocation && location) {
      setDropoffLocation(location);
    }
  };

  const confirmDropoff = async () => {
    if (!location || !dropoffLocation) return;
    setLoading(true);
    try {
      const route = await fetchOSRMRoute(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      setRouteCoordinates(route);
      
      const distance = getDistanceKm(location.latitude, location.longitude, dropoffLocation.latitude, dropoffLocation.longitude);
      setFareEstimate({ distanceKm: distance.toFixed(1) });
      
      if (mapRef.current) {
        mapRef.current.fitToCoordinates([location, dropoffLocation], {
          edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
          animated: true
        });
      }
      setRideState('CONFIRM_TRIP');
    } catch (e) {
      Alert.alert('Route Error', 'Could not fetch route.');
    } finally {
      setLoading(false);
    }
  };`
);

code = code.replace(
/onRegionChange=\{\(\) => \{\n          if \(rideState === 'SELECT_PICKUP'\) setIsMapMoving\(true\);\n        \}\}/,
`onRegionChange={() => {
          if (rideState === 'SELECT_PICKUP' || rideState === 'SELECT_DROPOFF') setIsMapMoving(true);
        }}`
);

// UI Replacement for Markers and Center Pin
code = code.replace(
/        \{\/\* Pickup Marker \*\/\}\n        \{\(rideState !== 'SELECT_PICKUP' && location\) && \(\n          <Marker coordinate=\{location\} anchor=\{\{ x: 0\.5, y: 1 \}\}>\n            <View style=\{styles\.dotMarkerContainer\}>\n              <View style=\{\[styles\.dotMarker, \{ backgroundColor: COLORS\.green \}\]\} \/>\n            <\/View>\n          <\/Marker>\n        \)\}\n\n        \{\/\* Dropoff Marker \*\/\}\n        \{dropoffLocation && \(\n          <Marker coordinate=\{dropoffLocation\} anchor=\{\{ x: 0\.5, y: 1 \}\}>\n            <View style=\{styles\.dotMarkerContainer\}>\n              <View style=\{\[styles\.dotMarker, \{ backgroundColor: COLORS\.red \}\]\} \/>\n            <\/View>\n          <\/Marker>\n        \)\}/,
`        {/* Pickup Marker */}
        {(rideState !== 'SELECT_PICKUP' && location) && (
          <Marker coordinate={location} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.dotMarkerContainer}>
              <View style={[styles.dotMarker, { backgroundColor: COLORS.green }]} />
            </View>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {(rideState !== 'SELECT_DROPOFF' && rideState !== 'SELECT_PICKUP' && dropoffLocation) && (
          <Marker coordinate={dropoffLocation} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.dotMarkerContainer}>
              <View style={[styles.dotMarker, { backgroundColor: COLORS.red }]} />
            </View>
          </Marker>
        )}`
);

code = code.replace(
/      \{\/\* Draggable Center Pin for SELECT_PICKUP \*\/\}\n      \{rideState === 'SELECT_PICKUP' && \(\n        <View style=\{styles\.centerPinContainer\} pointerEvents="none">\n          <MapPin size=\{40\} color=\{COLORS\.green\} style=\{isMapMoving \? \{ transform: \[\{ translateY: -10 \}\] \} : \{\}\} \/>\n        <\/View>\n      \)\}/,
`      {/* Draggable Center Pin */}
      {(rideState === 'SELECT_PICKUP' || rideState === 'SELECT_DROPOFF') && (
        <View style={styles.centerPinContainer} pointerEvents="none">
          <MapPin size={40} color={rideState === 'SELECT_PICKUP' ? COLORS.green : COLORS.red} style={isMapMoving ? { transform: [{ translateY: -10 }] } : {}} />
        </View>
      )}`
);

code = code.replace(
/      \{\/\* Top Address Overlay — only show after SELECT_PICKUP \(when route is set\) \*\/\}\n      \{\['SELECT_DROPOFF', 'SHOW_DRIVERS'\]\.includes\(rideState\) && \(\n        <View style=\{styles\.topOverlay\}>\n          <TouchableOpacity \n            style=\{styles\.backBtn\} \n            onPress=\{\(\) => resetToPickup\(\)\}\n          >\n            <ArrowLeft color=\{COLORS\.text\} size=\{24\} \/>\n          <\/TouchableOpacity>\n          <View style=\{styles\.topAddressCard\}>\n            <View style=\{styles\.addressRow\}>\n              <View style=\{\[styles\.addressDot, \{ backgroundColor: COLORS\.green \}\]\} \/>\n              <Text style=\{styles\.addressText\} numberOfLines=\{1\}\>\{pickupAddress\}<\/Text>\n            <\/View>\n          <\/View>\n        <\/View>\n      \)\}/,
`      {/* Top Address Overlay — only show after SELECT_PICKUP */}
      {['SELECT_DROPOFF', 'CONFIRM_TRIP', 'SHOW_DRIVERS'].includes(rideState) && (
        <View style={styles.topOverlay}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => rideState === 'SELECT_DROPOFF' ? resetToPickup() : setRideState('SELECT_DROPOFF')}
          >
            <ArrowLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
          <View style={styles.topAddressCard}>
            <View style={styles.addressRow}>
              <View style={[styles.addressDot, { backgroundColor: COLORS.green }]} />
              <Text style={styles.addressText} numberOfLines={1}>{pickupAddress}</Text>
            </View>
          </View>
        </View>
      )}`
);

code = code.replace(
/      \{\/\* 1\. SELECT_PICKUP SHEET \*\/\}\n      \{rideState === 'SELECT_PICKUP' && \(\n        <View style=\{styles\.bottomSheet\}>\n          \{\/\* Back button row \*\/\}\n          <View style=\{styles\.idleTopRow\}>\n            <TouchableOpacity style=\{styles\.backBtnSmall\} onPress=\{\(\) => navigation\?\.goBack\(\)\}>\n              <ArrowLeft color=\{COLORS\.text\} size=\{22\} \/>\n            <\/TouchableOpacity>\n            <View style=\{styles\.pickupPill\}>\n              <View style=\{\[styles\.addressDot, \{ backgroundColor: COLORS\.green \}\]\} \/>\n              <Text style=\{styles\.pickupPillText\} numberOfLines=\{1\}\>\{pickupAddress\}<\/Text>\n            <\/View>\n          <\/View>\n          <Text style=\{styles\.greetingText\}\>\{greeting\}, \{user\?\.name \|\| 'Rider'\}!<\/Text>\n          <View style=\{styles\.searchBox\}>\n            <Search color=\{COLORS\.textMuted\} size=\{20\} \/>\n            <TextInput\n              style=\{styles\.searchInput\}\n              placeholder="Where are you going\?"\n              placeholderTextColor=\{COLORS\.textMuted\}\n              value=\{dropoffQuery\}\n              onChangeText=\{setDropoffQuery\}\n              onSubmitEditing=\{handleDropoffSubmit\}\n              returnKeyType="search"\n            \/>\n            \{loading && <ActivityIndicator color=\{COLORS\.green\} size="small" \/>\}\n          <\/View>\n        <\/View>\n      \)\}\n\n      \{\/\* 2\. SELECT_DROPOFF SHEET \*\/\}\n      \{rideState === 'SELECT_DROPOFF' && \(\n        <View style=\{styles\.bottomSheet\}>\n          <Text style=\{styles\.sheetTitle\}\>Trip Details<\/Text>\n          <View style=\{styles\.tripInfoRow\}>\n            <View style=\{styles\.tripInfoItem\}>\n              <Navigation color=\{COLORS\.blue\} size=\{20\} \/>\n              <Text style=\{styles\.tripInfoText\}\>\{fareEstimate\?\.distanceKm\} km<\/Text>\n            <\/View>\n            <View style=\{styles\.tripInfoItem\}>\n              <Clock color=\{COLORS\.yellow\} size=\{20\} \/>\n              <Text style=\{styles\.tripInfoText\}\>\{Math\.round\(parseFloat\(fareEstimate\?\.distanceKm \|\| 0\) \* 3\)\} mins<\/Text>\n            <\/View>\n          <\/View>\n          <TouchableOpacity style=\{styles\.primaryBtn\} onPress=\{findNearbyDrivers\}>\n            <Text style=\{styles\.primaryBtnText\}\>Find Nearby Drivers<\/Text>\n          <\/TouchableOpacity>\n        <\/View>\n      \)\}/,
`      {/* 1. SELECT_PICKUP SHEET */}
      {rideState === 'SELECT_PICKUP' && (
        <View style={styles.bottomSheet}>
          <View style={styles.idleTopRow}>
            <TouchableOpacity style={styles.backBtnSmall} onPress={() => navigation?.goBack()}>
              <ArrowLeft color={COLORS.text} size={22} />
            </TouchableOpacity>
            <Text style={styles.greetingText}>{greeting}, {user?.name || 'Rider'}!</Text>
          </View>
          <View style={styles.searchBox}>
            <Search color={COLORS.textMuted} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pickup location..."
              placeholderTextColor={COLORS.textMuted}
              value={pickupQuery}
              onChangeText={setPickupQuery}
              onSubmitEditing={handlePickupSubmit}
              returnKeyType="search"
            />
            {loading && <ActivityIndicator color={COLORS.green} size="small" />}
          </View>
          <View style={{ marginTop: 16 }}>
             <Text style={{ color: COLORS.text, fontSize: 14, marginBottom: 12, fontWeight: '500' }} numberOfLines={2}>
               Pickup: {pickupAddress}
             </Text>
             <TouchableOpacity style={styles.primaryBtn} onPress={confirmPickup}>
               <Text style={styles.primaryBtnText}>Confirm Pickup</Text>
             </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2. SELECT_DROPOFF SHEET */}
      {rideState === 'SELECT_DROPOFF' && (
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Where to?</Text>
          <View style={styles.searchBox}>
            <Search color={COLORS.textMuted} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destination..."
              placeholderTextColor={COLORS.textMuted}
              value={dropoffQuery}
              onChangeText={setDropoffQuery}
              onSubmitEditing={handleDropoffSubmit}
              returnKeyType="search"
            />
            {loading && <ActivityIndicator color={COLORS.green} size="small" />}
          </View>
          <View style={{ marginTop: 16 }}>
             <Text style={{ color: COLORS.text, fontSize: 14, marginBottom: 12, fontWeight: '500' }} numberOfLines={2}>
               Dropoff: {dropoffAddress || 'Locating...'}
             </Text>
             <TouchableOpacity style={styles.primaryBtn} onPress={confirmDropoff}>
               <Text style={styles.primaryBtnText}>Confirm Destination</Text>
             </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2.5 CONFIRM TRIP SHEET */}
      {rideState === 'CONFIRM_TRIP' && (
        <View style={styles.bottomSheet}>
          <Text style={styles.sheetTitle}>Trip Details</Text>
          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoItem}>
              <Navigation color={COLORS.blue} size={20} />
              <Text style={styles.tripInfoText}>{fareEstimate?.distanceKm} km</Text>
            </View>
            <View style={styles.tripInfoItem}>
              <Clock color={COLORS.yellow} size={20} />
              <Text style={styles.tripInfoText}>{Math.round(parseFloat(fareEstimate?.distanceKm || 0) * 3)} mins</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={findNearbyDrivers}>
            <Text style={styles.primaryBtnText}>Find Nearby Drivers</Text>
          </TouchableOpacity>
        </View>
      )}`
);

fs.writeFileSync(file, code);
console.log("Replaced successfully!");
