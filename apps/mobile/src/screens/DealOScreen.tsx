// @ts-nocheck
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ShoppingBag,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Navigation,
  X,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Share2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { decode } from 'base64-arraybuffer';
import { AppContext } from '../context/AppContext';
import { LocationContext } from '../context/LocationContext';
import { supabase } from '../lib/supabase';
import { colors } from '../lib/theme';

export interface MarketListing {
  id: string;
  user_id?: string;
  seller_name: string;
  seller_phone: string;
  seller_whatsapp: string;
  seller_upi?: string;
  title: string;
  category: 'livestock' | 'cereals' | 'farm_produce' | 'machinery_tools' | 'general_shop' | string;
  price: number;
  unit: string;
  quantity?: number;
  description?: string;
  image_url?: string;
  pincode: string;
  district?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'approved' | 'sold' | 'rejected' | string;
  rejection_reason?: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items', labelTa: 'அனைத்தும்', icon: '🌟', color: '#00D084' },
  { id: 'livestock', label: 'Livestock', labelTa: 'கால்நடைகள் (மாடு/ஆடு)', icon: '🐄', color: '#f59e0b' },
  { id: 'cereals', label: 'Grains & Crops', labelTa: 'தானியங்கள் (நெல்/கம்பு)', icon: '🌾', color: '#10b981' },
  { id: 'farm_produce', label: 'Farm Produce', labelTa: 'உழவர் சந்தை (காய்கறி/தேங்காய்)', icon: '🥦', color: '#3b82f6' },
  { id: 'machinery_tools', label: 'Tools & Agri', labelTa: 'விவசாய கருவிகள் (கொழு/மோட்டார்)', icon: '🚜', color: '#ec4899' },
  { id: 'general_shop', label: 'Local Shops', labelTa: 'உள்ளூர் கடைகள் (உரம்/தீவனம்)', icon: '🏪', color: '#8b5cf6' },
];

const POPULAR_PINCODES = [
  { pincode: '', label: 'All TN' },
  { pincode: '614904', label: '614904 Pattukkottai' },
  { pincode: '620001', label: '620001 Trichy' },
  { pincode: '614601', label: '614601 Pudukkottai' },
  { pincode: '613001', label: '613001 Thanjavur' },
  { pincode: '625001', label: '625001 Madurai' },
];

const UNIT_OPTIONS = [
  { id: 'per_head', label: 'Per Head (எண்ணிக்கை)', labelTa: 'ஒன்றுக்கு' },
  { id: 'per_bag', label: 'Per Bag (மூட்டை)', labelTa: 'மூட்டைக்கு' },
  { id: 'per_kg', label: 'Per Kg (கிலோ)', labelTa: 'கிலோவுக்கு' },
  { id: 'per_item', label: 'Per Item (பொருள்)', labelTa: 'பொருளுக்கு' },
  { id: 'per_ton', label: 'Per Ton (டன்)', labelTa: 'டன்னுக்கு' },
  { id: 'per_acre', label: 'Per Acre (ஏக்கர்)', labelTa: 'ஏக்கருக்கு' },
];

export default function DealOScreen({ navigation }: any) {
  const { user, isAdmin, themeMode } = useContext(AppContext);
  const locationCtx = useContext(LocationContext);

  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'market' | 'my_listings'>('market');

  // New Listing Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('livestock');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('per_head');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formDescription, setFormDescription] = useState('');
  const [formPincode, setFormPincode] = useState(user?.pincode || '614904');
  const [formLocation, setFormLocation] = useState(user?.location || 'Pattukkottai, Thanjavur');
  const [formUpi, setFormUpi] = useState(user?.upiId || (user?.phone ? `${user.phone.replace(/\D/g, '').slice(-10)}@upi` : ''));
  const [formImage, setFormImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Auto-detect current Pincode from GPS
  useEffect(() => {
    (async () => {
      try {
        if (locationCtx?.coords) {
          const [geo] = await Location.reverseGeocodeAsync({
            latitude: locationCtx.coords.latitude,
            longitude: locationCtx.coords.longitude,
          });
          if (geo?.postalCode) {
            setFormPincode(geo.postalCode);
            if (geo.city || geo.district) {
              setFormLocation(`${geo.city || geo.district}, ${geo.region || 'Tamil Nadu'}`);
            }
          }
        }
      } catch (e) {
        // Fallback to default
      }
    })();
  }, [locationCtx?.coords]);

  // Fetch Listings from Supabase
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('market_listings')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        setListings(data);
      }
    } catch (e) {
      console.error('Error fetching market listings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();

    // Subscribe to realtime market updates
    const channel = supabase
      .channel('market_listings_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_listings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setListings((prev) => [payload.new as MarketListing, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setListings((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as MarketListing) : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setListings((prev) => prev.filter((item) => item.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchListings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  // Image Selection Handler
  const handlePickImage = async (mode: 'camera' | 'gallery') => {
    try {
      let result;
      if (mode === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera access is required to photograph goods.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery access is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setFormImage(asset.uri);

        if (asset.base64) {
          setIsUploadingImage(true);
          const fileName = `deal_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(`dealo/${fileName}`, decode(asset.base64), {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(`dealo/${fileName}`);
            if (publicUrlData?.publicUrl) {
              setFormImage(publicUrlData.publicUrl);
            }
          }
          setIsUploadingImage(false);
        }
      }
    } catch (e) {
      console.warn('Image picker error:', e);
      setIsUploadingImage(false);
    }
  };

  // Submit New Listing
  const handleCreateListing = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Missing Title / பெயர் தேவை', 'Please enter goods title or name (e.g. நாட்டு மாடு / பொன்னி நெல்).');
      return;
    }
    if (!formPrice.trim() || isNaN(Number(formPrice))) {
      Alert.alert('Invalid Price / சரியான விலை தேவை', 'Please enter a valid price in Rupees.');
      return;
    }
    if (!formPincode.trim() || formPincode.replace(/\D/g, '').length < 6) {
      Alert.alert('Valid Pincode Required / பின்கோடு தேவை', 'Please enter a 6-digit Pincode.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = user?.phone?.replace(/\D/g, '').slice(-10) || '9486335870';
      const cleanUpi = formUpi.trim() || `${cleanPhone}@upi`;
      const autoApprove = isAdmin || false;

      const newListing = {
        user_id: user?.id || null,
        seller_name: user?.name || 'Local Trader / உழவர்',
        seller_phone: cleanPhone,
        seller_whatsapp: cleanPhone,
        seller_upi: cleanUpi,
        title: formTitle.trim(),
        category: formCategory,
        price: Number(formPrice),
        unit: formUnit,
        quantity: Number(formQuantity) || 1,
        description: formDescription.trim(),
        image_url: formImage || undefined,
        pincode: formPincode.replace(/\D/g, '').slice(0, 6),
        district: formLocation.split(',')[1]?.trim() || 'Thanjavur',
        location_name: formLocation.trim(),
        latitude: locationCtx?.coords?.latitude || 10.4312,
        longitude: locationCtx?.coords?.longitude || 79.3194,
        status: autoApprove ? 'approved' : 'pending',
      };

      const { data, error } = await supabase
        .from('market_listings')
        .insert([newListing])
        .select()
        .single();

      if (error) {
        Alert.alert('Submission Error', error.message);
      } else {
        Alert.alert(
          '🎉 Listing Submitted! / பதிவு செய்யப்பட்டது',
          autoApprove
            ? 'Your goods listing is live in the marketplace!'
            : 'Your goods listing has been submitted for Pincode Admin verification and will go live shortly.',
          [{ text: 'OK', onPress: () => setModalVisible(false) }]
        );
        // Reset form
        setFormTitle('');
        setFormPrice('');
        setFormDescription('');
        setFormImage(null);
        fetchListings();
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to submit listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark as Sold Handler
  const handleMarkAsSold = async (id: string) => {
    try {
      await supabase.from('market_listings').update({ status: 'sold' }).eq('id', id);
      setListings((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'sold' } : item)));
      Alert.alert('Updated', 'Item marked as SOLD / விற்கப்பட்டது.');
    } catch (e) {}
  };

  // Direct 1-Tap Trade Actions
  const handleWhatsAppChat = (item: MarketListing) => {
    const cleanPhone = item.seller_whatsapp.replace(/\D/g, '').slice(-10);
    const text = encodeURIComponent(
      `வணக்கம் ${item.seller_name}! 👋\n\nநான் SuprO DealO App-ல் உங்களுடைய "${item.title}" (விலை: ₹${item.price} ${item.unit.replace('_', ' ')}) பார்த்தேன்.\n\nநேரில் பார்த்து வாங்க விரும்புகிறேன். விவரங்களை கூறவும்.`
    );
    Linking.openURL(`https://wa.me/91${cleanPhone}?text=${text}`).catch(() => {
      Alert.alert('WhatsApp Error', 'Could not open WhatsApp. Phone: +91 ' + cleanPhone);
    });
  };

  const handleUpiPayment = (item: MarketListing) => {
    const upi = item.seller_upi || `${item.seller_phone.replace(/\D/g, '').slice(-10)}@upi`;
    const name = encodeURIComponent(item.seller_name);
    const note = encodeURIComponent(`SuprO DealO: ${item.title.substring(0, 30)}`);
    const upiUrl = `upi://pay?pa=${upi}&pn=${name}&am=${item.price}&cu=INR&tn=${note}`;

    Linking.openURL(upiUrl).catch(() => {
      Alert.alert(
        'Direct UPI Pay / யுபிஐ கட்டணம்',
        `Seller UPI ID:\n\n${upi}\n\nAmount: ₹${item.price}\n\nYou can copy this UPI ID to pay via GPay, PhonePe, or Paytm.`,
        [{ text: 'OK' }]
      );
    });
  };

  const handleDirectCall = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    Linking.openURL(`tel:+91${cleanPhone}`);
  };

  const handleNavigateMap = (item: MarketListing) => {
    if (item.latitude && item.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
      Linking.openURL(url);
    } else {
      const q = encodeURIComponent(`${item.location_name || ''} ${item.pincode}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
    }
  };

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Tab filter
      if (activeTab === 'my_listings') {
        const userCleanPhone = user?.phone?.replace(/\D/g, '').slice(-10);
        const itemCleanPhone = item.seller_phone?.replace(/\D/g, '').slice(-10);
        const isMyItem =
          (item.user_id && item.user_id === user?.id) ||
          (userCleanPhone && itemCleanPhone === userCleanPhone);
        if (!isMyItem) return false;
      } else {
        // Market view: Only show approved items (or user's own pending items)
        if (item.status !== 'approved' && item.user_id !== user?.id) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Pincode filter
      if (selectedPincode.trim().length > 0) {
        if (!item.pincode.startsWith(selectedPincode.trim())) {
          return false;
        }
      }

      // Text Search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesLoc = (item.location_name || '').toLowerCase().includes(q);
        const matchesSeller = item.seller_name.toLowerCase().includes(q);
        const matchesPincode = item.pincode.includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesSeller && !matchesPincode) {
          return false;
        }
      }

      return true;
    });
  }, [listings, activeTab, selectedCategory, selectedPincode, searchQuery, user]);

  const userCleanPhone = user?.phone?.replace(/\D/g, '').slice(-10);
  const myListingsCount = listings.filter((item) => {
    const itemClean = item.seller_phone?.replace(/\D/g, '').slice(-10);
    return item.user_id === user?.id || (userCleanPhone && itemClean === userCleanPhone);
  }).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {/* ─── Top Header ─── */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerTop}>
          <View>
            <View style={styles.brandRow}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>DealO</Text>
              <View style={styles.badge}>
                <Sparkles size={11} color="#00D084" />
                <Text style={styles.badgeText}>LOCAL TRADE</Text>
              </View>
            </View>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              உள்ளூர் சந்தை • Cattle, Cereals & Goods Trading
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.sellBtn, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.sellBtnText}>விற்பனை செய்</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Pincode & Search Bar ─── */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search goods, cattle, grains, or 6-digit Pincode..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── Pincode Quick Selector Pills ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pincodeScroll}
        >
          {POPULAR_PINCODES.map((pin) => {
            const isSelected = selectedPincode === pin.pincode;
            return (
              <TouchableOpacity
                key={pin.label}
                style={[
                  styles.pincodeChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedPincode(pin.pincode)}
              >
                <MapPin size={12} color={isSelected ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 4 }} />
                <Text
                  style={[
                    styles.pincodeChipText,
                    { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {pin.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Tabs: All Market vs My Listings ─── */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[
              styles.tabToggle,
              activeTab === 'market' && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
            ]}
            onPress={() => setActiveTab('market')}
          >
            <Text
              style={[
                styles.tabToggleText,
                { color: activeTab === 'market' ? colors.primary : colors.textSecondary },
              ]}
            >
              🏪 Market Feed ({listings.filter((l) => l.status === 'approved').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabToggle,
              activeTab === 'my_listings' && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
            ]}
            onPress={() => setActiveTab('my_listings')}
          >
            <Text
              style={[
                styles.tabToggleText,
                { color: activeTab === 'my_listings' ? colors.primary : colors.textSecondary },
              ]}
            >
              📦 My Listings ({myListingsCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Category Filter Carousel ─── */}
      <View style={styles.catWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catCard,
                  {
                    backgroundColor: isSelected ? `${cat.color}22` : colors.card,
                    borderColor: isSelected ? cat.color : colors.borderLight,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.catLabel,
                    { color: isSelected ? cat.color : colors.text, fontWeight: isSelected ? '700' : '600' },
                  ]}
                >
                  {cat.label}
                </Text>
                <Text style={[styles.catSub, { color: isSelected ? cat.color : colors.textSecondary }]}>
                  {cat.labelTa.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Market Listings Feed ─── */}
      <ScrollView
        contentContainerStyle={styles.feedScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading local trade goods & livestock...
            </Text>
          </View>
        ) : filteredListings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color={colors.textSecondary} style={{ opacity: 0.4, marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Listings Found</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              {searchQuery || selectedPincode
                ? `No items found matching "${searchQuery || selectedPincode}". Try clearing your filter.`
                : 'Be the first local farmer or trader to list goods in your area!'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyBtnText}>1-Click List My Goods</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredListings.map((item) => (
            <View
              key={item.id}
              style={[
                styles.listingCard,
                { backgroundColor: colors.card, borderColor: colors.borderLight },
              ]}
            >
              {/* Card Top: Pincode Tag & Status */}
              <View style={styles.cardHeader}>
                <View style={[styles.pincodeBadge, { backgroundColor: 'rgba(0, 208, 132, 0.12)' }]}>
                  <MapPin size={12} color="#00D084" />
                  <Text style={styles.pincodeBadgeText}>
                    {item.pincode} • {item.district || item.location_name || 'Tamil Nadu'}
                  </Text>
                </View>

                {item.status === 'pending' ? (
                  <View style={[styles.statusPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                    <Clock size={11} color="#f59e0b" />
                    <Text style={[styles.statusText, { color: '#f59e0b' }]}>Pending Approval</Text>
                  </View>
                ) : item.status === 'sold' ? (
                  <View style={[styles.statusPill, { backgroundColor: 'rgba(100, 116, 139, 0.15)' }]}>
                    <CheckCircle2 size={11} color="#64748b" />
                    <Text style={[styles.statusText, { color: '#64748b' }]}>SOLD OUT</Text>
                  </View>
                ) : (
                  <View style={[styles.statusPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <ShieldCheck size={11} color="#10b981" />
                    <Text style={[styles.statusText, { color: '#10b981' }]}>VERIFIED LIVE</Text>
                  </View>
                )}
              </View>

              {/* Title & Price Row */}
              <View style={styles.titlePriceRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.sellerName, { color: colors.textSecondary }]}>
                    👤 {item.seller_name} • {item.quantity ? `📦 ${item.quantity} units available` : 'In Stock'}
                  </Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={[styles.priceTag, { color: colors.primary }]}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                    /{item.unit.replace('per_', '')}
                  </Text>
                </View>
              </View>

              {/* Description if present */}
              {item.description ? (
                <Text style={[styles.itemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {/* Location Detail */}
              {item.location_name ? (
                <View style={styles.locRow}>
                  <Navigation size={13} color={colors.textSecondary} />
                  <Text style={[styles.locText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.location_name}
                  </Text>
                </View>
              ) : null}

              {/* 1-Tap Trading Action Buttons Bar */}
              <View style={[styles.actionBar, { borderTopColor: colors.borderLight }]}>
                {/* 1. WhatsApp Direct Chat */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
                  onPress={() => handleWhatsAppChat(item)}
                  activeOpacity={0.8}
                >
                  <MessageSquare size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>வாட்ஸ்அப்</Text>
                </TouchableOpacity>

                {/* 2. Direct UPI Pay */}
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#0052cc' }]}
                  onPress={() => handleUpiPayment(item)}
                  activeOpacity={0.8}
                >
                  <CreditCard size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>UPI Pay</Text>
                </TouchableOpacity>

                {/* 3. Direct Phone Call */}
                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleDirectCall(item.seller_phone)}
                >
                  <Phone size={16} color={colors.primary} />
                </TouchableOpacity>

                {/* 4. GPS Map Navigation */}
                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleNavigateMap(item)}
                >
                  <Navigation size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* My Listing Actions (Mark Sold) */}
              {activeTab === 'my_listings' && item.status !== 'sold' && (
                <TouchableOpacity
                  style={[styles.markSoldBtn, { borderColor: colors.border }]}
                  onPress={() => handleMarkAsSold(item.id)}
                >
                  <Check size={14} color="#10b981" style={{ marginRight: 4 }} />
                  <Text style={styles.markSoldText}>Mark as Sold / விற்றுவிட்டது</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* ─── 1-Click "List Sellable Goods" Bottom Sheet / Modal ─── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  விற்பனைக்கு பதிவு செய்
                </Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  List Cow, Goat, Cereals & Goods with 1-Click
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* 1. Goods Category */}
              <Text style={[styles.formLabel, { color: colors.text }]}>Category / வகை</Text>
              <View style={styles.categoryPickerRow}>
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
                  const isSel = formCategory === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.catChoice,
                        {
                          backgroundColor: isSel ? colors.primary : colors.surface,
                          borderColor: isSel ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFormCategory(c.id)}
                    >
                      <Text style={styles.catChoiceEmoji}>{c.icon}</Text>
                      <Text
                        style={[
                          styles.catChoiceText,
                          { color: isSel ? '#FFFFFF' : colors.text, fontWeight: isSel ? '700' : '500' },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 2. Item Title */}
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Goods / Animal Title (பொருள் அல்லது மாட்டின் பெயர்) *
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g. நாட்டு காங்கேயம் கறவை பசு / பொன்னி நெல் மூட்டை"
                placeholderTextColor={colors.textSecondary}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* 3. Price & Unit Row */}
              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Price (விலை ₹) *</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g. 45000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Quantity (அளவு)</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g. 1 or 20"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={formQuantity}
                    onChangeText={setFormQuantity}
                  />
                </View>
              </View>

              {/* 4. Unit Selector */}
              <Text style={[styles.formLabel, { color: colors.text }]}>Price Unit (விலை முறை)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {UNIT_OPTIONS.map((u) => {
                  const isSel = formUnit === u.id;
                  return (
                    <TouchableOpacity
                      key={u.id}
                      style={[
                        styles.unitChoice,
                        {
                          backgroundColor: isSel ? colors.primary : colors.surface,
                          borderColor: isSel ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFormUnit(u.id)}
                    >
                      <Text
                        style={[
                          styles.unitChoiceText,
                          { color: isSel ? '#FFFFFF' : colors.text, fontWeight: isSel ? '700' : '500' },
                        ]}
                      >
                        {u.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 5. Pincode & Town */}
              <View style={styles.twoColRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>6-Digit Pincode *</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g. 614904"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={6}
                    value={formPincode}
                    onChangeText={setFormPincode}
                  />
                </View>
                <View style={{ flex: 1.2, marginLeft: 8 }}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Village / Town</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="Pattukkottai, Thanjavur"
                    placeholderTextColor={colors.textSecondary}
                    value={formLocation}
                    onChangeText={setFormLocation}
                  />
                </View>
              </View>

              {/* 6. UPI ID for Direct Payment */}
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Trader UPI ID (நேரடி கட்டணம் பெற)
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                placeholder="e.g. 9486335870@upi or gpay/paytm id"
                placeholderTextColor={colors.textSecondary}
                value={formUpi}
                onChangeText={setFormUpi}
              />

              {/* 7. Description */}
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Details & Description (விவரங்கள்)
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  styles.textArea,
                  { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="நாட்டு இனம், பால் அளவு, தரம், இருப்பு போன்ற விவரங்களை குறிப்பிடவும்..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                value={formDescription}
                onChangeText={setFormDescription}
              />

              {/* 8. Photo Attachment */}
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Photo (புகைப்படம் - Optional)
              </Text>
              <View style={styles.photoRow}>
                <TouchableOpacity
                  style={[styles.photoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handlePickImage('camera')}
                >
                  <Camera size={18} color={colors.primary} />
                  <Text style={[styles.photoBtnText, { color: colors.text }]}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.photoBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handlePickImage('gallery')}
                >
                  <ImageIcon size={18} color={colors.primary} />
                  <Text style={[styles.photoBtnText, { color: colors.text }]}>Gallery</Text>
                </TouchableOpacity>

                {formImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: formImage }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setFormImage(null)}
                    >
                      <X size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Linked Profile Banner */}
              <View style={[styles.profileBanner, { backgroundColor: 'rgba(0, 208, 132, 0.08)', borderColor: 'rgba(0, 208, 132, 0.2)' }]}>
                <ShieldCheck size={18} color="#00D084" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.profileBannerTitle, { color: colors.text }]}>
                    Profile Linked Trading
                  </Text>
                  <Text style={[styles.profileBannerSub, { color: colors.textSecondary }]}>
                    Linked Phone: +91 {user?.phone || '9486335870'} • Auto-receives direct WhatsApp inquiries and UPI payments.
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleCreateListing}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Plus size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Submit Listing / விற்பனைக்கு பதிவிடு</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#00D084',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sellBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  searchRow: {
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  pincodeScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  pincodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  pincodeChipText: {
    fontSize: 12,
  },
  tabToggleRow: {
    flexDirection: 'row',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tabToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  catWrapper: {
    paddingVertical: 10,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  catCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 105,
  },
  catIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  catLabel: {
    fontSize: 12,
  },
  catSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  feedScroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  listingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pincodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pincodeBadgeText: {
    color: '#00D084',
    fontSize: 11,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  sellerName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceTag: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  locText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  iconActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markSoldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  markSoldText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  formInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  catChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  catChoiceEmoji: {
    fontSize: 14,
  },
  catChoiceText: {
    fontSize: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitChoice: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  unitChoiceText: {
    fontSize: 12,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 14,
  },
  profileBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  profileBannerSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    marginTop: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
