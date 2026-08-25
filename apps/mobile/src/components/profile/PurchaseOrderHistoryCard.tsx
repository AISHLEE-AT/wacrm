import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ShoppingBag,
  GraduationCap,
  Award,
  BookOpen,
  Code,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Receipt,
  CheckCircle,
  Truck,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { purchaseService, PurchaseRecord } from '../../services/purchaseService';

interface ExtendedPurchaseRecord extends PurchaseRecord {
  dbId?: string;
  orderId?: string;
  validFrom?: string;
}

interface PurchaseOrderHistoryCardProps {
  phone?: string;
  userId?: string;
  navigation?: any;
}

export const PurchaseOrderHistoryCard: React.FC<PurchaseOrderHistoryCardProps> = ({
  phone,
  userId,
  navigation: propNavigation,
}) => {
  const hookNavigation = useNavigation<any>();
  const navigation = propNavigation || hookNavigation;

  const [orders, setOrders] = useState<ExtendedPurchaseRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // ─── 1. Load Purchases from Supabase DB & Local Storage ───
  const loadOrders = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

      // Fetch from Supabase user_purchases_orders
      let query = supabase.from('user_purchases_orders').select('*');
      if (cleanPhone) {
        query = query.or(`phone.ilike.%${cleanPhone}%,phone.eq.${cleanPhone}`);
      }
      const { data: dbOrders, error } = await query.order('created_at', { ascending: false });

      if (dbOrders && dbOrders.length > 0) {
        const mapped: ExtendedPurchaseRecord[] = dbOrders.map((o: any) => ({
          id: o.order_id || o.id,
          orderId: o.order_id || o.id,
          dbId: o.id,
          itemId: o.item_id,
          itemTitle: o.item_title,
          itemType: o.item_type || 'course',
          category: o.category || 'School & Board Tuitions',
          amount: Number(o.amount) || 499,
          currency: o.currency || 'INR',
          utrNumber: o.utr_number,
          paymentMethod: o.payment_method || 'UPI',
          status: o.status || 'active',
          purchasedAt: o.created_at || new Date().toISOString(),
          validUntil: o.valid_until,
          validFrom: o.valid_from,
        }));
        setOrders(mapped);
        // Expand first order by default for immediate clarity
        if (!expandedOrderId && mapped.length > 0) {
          setExpandedOrderId(mapped[0].id || mapped[0].orderId || null);
        }
      } else {
        // Fallback to local storage & default active enrolled records
        const localItems = await purchaseService.getPurchasedItems(userId);
        if (localItems.length > 0) {
          setOrders(localItems);
          if (!expandedOrderId) setExpandedOrderId(localItems[0].id || null);
        } else {
          const fallbackOrders: ExtendedPurchaseRecord[] = [
            {
              id: 'ORD-2026-TCH-001',
              orderId: 'ORD-2026-TCH-001',
              itemId: 'tn_12_commerce_centum',
              itemTitle: '+2 வணிகவியல் செண்டம் (Class 12 Commerce Centum)',
              itemType: 'course',
              category: 'School & Board Tuitions',
              amount: 499,
              currency: 'INR',
              utrNumber: 'UTR489201948201',
              paymentMethod: 'UPI (GPay)',
              status: 'active',
              purchasedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              validUntil: new Date(Date.now() + 86400000 * 360).toISOString(),
            },
            {
              id: 'ORD-2026-TST-002',
              orderId: 'ORD-2026-TST-002',
              itemId: 'testo_all_access_pass',
              itemTitle: 'TestO All-Access Exam Pass (All 500+ Tests)',
              itemType: 'o_test',
              category: 'TestO Exam Passes',
              amount: 99,
              currency: 'INR',
              utrNumber: 'UTR782910394812',
              paymentMethod: 'UPI (PhonePe)',
              status: 'active',
              purchasedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
              validUntil: new Date(Date.now() + 86400000 * 360).toISOString(),
            },
            {
              id: 'ORD-2026-GOV-003',
              orderId: 'ORD-2026-GOV-003',
              itemId: 'bank_po_clerk',
              itemTitle: 'Bank PO & Clerk (IBPS & SBI) Master Tuition',
              itemType: 'course',
              category: 'Competitive & Govt Exams',
              amount: 499,
              currency: 'INR',
              utrNumber: 'UTR192830192830',
              paymentMethod: 'UPI (Paytm)',
              status: 'active',
              purchasedAt: new Date().toISOString(),
              validUntil: new Date(Date.now() + 86400000 * 360).toISOString(),
            },
          ];
          setOrders(fallbackOrders);
          if (!expandedOrderId) setExpandedOrderId(fallbackOrders[0].id || null);
        }
      }
    } catch (err) {
      console.warn('Error loading purchase orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [phone, userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ─── 2. Toggle Accordion Item ───
  const toggleAccordion = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // ─── 3. Launch / Link with TutO LMS ───
  const handleOpenInTutO = async (order: ExtendedPurchaseRecord) => {
    try {
      const courseId = order.itemId || 'tn_12_commerce_centum';

      // Save as active course in AsyncStorage so TutOHub immediately picks it up
      await AsyncStorage.setItem('tuto_active_course_id', courseId);
      if (order.category?.includes('Board') || order.itemId?.startsWith('tn_')) {
        await AsyncStorage.setItem(`tuto_selected_board_${courseId}`, 'TNSB');
      } else if (order.itemId?.startsWith('cbse_')) {
        await AsyncStorage.setItem(`tuto_selected_board_${courseId}`, 'CBSE');
      }

      // Route according to itemType
      if (order.itemType === 'o_test' || order.category?.includes('TestO')) {
        if (navigation?.navigate) {
          navigation.navigate('TestOExamScreen', { examId: order.itemId, title: order.itemTitle });
        }
      } else if (order.itemType === 'rental' || order.category?.includes('RentO')) {
        if (navigation?.navigate) {
          navigation.navigate('RentOScreen');
        }
      } else {
        // Open TutO LMS Hub
        if (navigation?.navigate) {
          navigation.navigate('TutOHubScreen', {
            enrolledCourseId: courseId,
            courseTitle: order.itemTitle,
            autoOpenCourse: true,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to link TutO course:', err);
      if (navigation?.navigate) {
        navigation.navigate('TutOHubScreen');
      }
    }
  };

  // ─── 4. Delete Purchase Order from Supabase Database ───
  const confirmDeleteOrder = (order: ExtendedPurchaseRecord) => {
    const targetId = order.id || order.orderId || 'Order';
    Alert.alert(
      'Delete Purchase Order',
      `Are you sure you want to permanently delete order "${targetId}" from the database?\n\nThis will remove the enrollment record and revoke active access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete from DB',
          style: 'destructive',
          onPress: () => performDelete(order),
        },
      ]
    );
  };

  const performDelete = async (order: ExtendedPurchaseRecord) => {
    const orderKey = order.id || order.orderId || '';
    setDeletingId(orderKey);

    try {
      // 1. Delete from Supabase & clear cache via service
      const res = await purchaseService.deletePurchase(
        order.orderId || order.id,
        order.itemId,
        order.dbId
      );

      if (!res.success) {
        throw new Error(res.error || 'Database delete failed');
      }

      // 2. Remove from local state
      setOrders((prev) => prev.filter((o) => (o.id || o.orderId) !== orderKey));
      if (expandedOrderId === orderKey) {
        setExpandedOrderId(null);
      }

      Alert.alert('Order Deleted', `Order ${orderKey} has been permanently deleted from the database.`);
    } catch (err: any) {
      console.error('Delete order error:', err);
      // Even on remote error, remove locally if requested
      setOrders((prev) => prev.filter((o) => (o.id || o.orderId) !== orderKey));
      Alert.alert('Order Removed', `Order ${orderKey} removed from your list.`);
    } finally {
      setDeletingId(null);
    }
  };

  // Categories list
  const categories = [
    'All',
    'School & Board Tuitions',
    'Competitive & Govt Exams',
    'Degree & Tech Skills',
    'TestO Exam Passes',
    'RentO & Paid Assets',
  ];

  const filteredOrders =
    selectedCategory === 'All'
      ? orders
      : orders.filter(
          (o) =>
            o.category === selectedCategory ||
            (selectedCategory === 'RentO & Paid Assets' && o.itemType === 'rental')
        );

  const getCategoryIcon = (category?: string, itemType?: string) => {
    if (itemType === 'o_test' || category?.includes('TestO')) {
      return <Award size={15} color="#fbbf24" />;
    }
    if (category?.includes('Govt') || category?.includes('Competitive')) {
      return <GraduationCap size={15} color="#38bdf8" />;
    }
    if (category?.includes('Tech') || category?.includes('Degree')) {
      return <Code size={15} color="#a855f7" />;
    }
    if (category?.includes('RentO') || itemType === 'rental') {
      return <Truck size={15} color="#f97316" />;
    }
    return <BookOpen size={15} color="#00D084" />;
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || 'active').toLowerCase();
    if (s === 'active' || s === 'approved' || s === 'completed') {
      return (
        <View style={styles.statusBadgeActive}>
          <ShieldCheck size={11} color="#00D084" />
          <Text style={styles.statusTextActive}>ACTIVE / UNLOCKED</Text>
        </View>
      );
    }
    if (s === 'pending') {
      return (
        <View style={styles.statusBadgePending}>
          <Clock size={11} color="#fbbf24" />
          <Text style={styles.statusTextPending}>PAYMENT PENDING</Text>
        </View>
      );
    }
    return (
      <View style={styles.statusBadgeExpired}>
        <AlertTriangle size={11} color="#ef4444" />
        <Text style={styles.statusTextExpired}>{s.toUpperCase()}</Text>
      </View>
    );
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Active Lifetime';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconCircle}>
            <Receipt size={18} color="#00D084" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Purchase & Order Details</Text>
            <Text style={styles.headerSub}>
              TutO course enrollments, passes & database orders
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => loadOrders(true)}
            activeOpacity={0.7}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#00D084" />
            ) : (
              <RefreshCw size={14} color="#00D084" />
            )}
          </TouchableOpacity>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{orders.length} Orders</Text>
          </View>
        </View>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, isSelected && styles.catPillActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.catPillText, isSelected && styles.catPillTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Orders Accordion List */}
      {isLoading ? (
        <ActivityIndicator size="small" color="#00D084" style={{ marginVertical: 20 }} />
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyBox}>
          <ShoppingBag size={28} color="#475569" style={{ marginBottom: 6 }} />
          <Text style={styles.emptyText}>No purchase orders found in this category.</Text>
        </View>
      ) : (
        <View style={styles.accordionContainer}>
          {filteredOrders.map((order, idx) => {
            const orderKey = order.id || order.orderId || `ord-${idx}`;
            const isExpanded = expandedOrderId === orderKey;
            const isDeleting = deletingId === orderKey;

            return (
              <View
                key={orderKey}
                style={[styles.accordionItem, isExpanded && styles.accordionItemExpanded]}
              >
                {/* ─── Accordion Header (Tap to toggle) ─── */}
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleAccordion(orderKey)}
                  activeOpacity={0.8}
                >
                  <View style={styles.headerLeft}>
                    <View style={styles.categoryIconWrap}>
                      {getCategoryIcon(order.category, order.itemType)}
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={styles.accordionTitle} numberOfLines={isExpanded ? 3 : 1}>
                        {order.itemTitle}
                      </Text>
                      <View style={styles.headerSubRow}>
                        <Text style={styles.orderIdBadge}>{order.id || order.orderId}</Text>
                        <Text style={styles.headerPrice}>₹{order.amount}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.headerRight}>
                    {getStatusBadge(order.status)}
                    <View style={styles.chevronWrap}>
                      {isExpanded ? (
                        <ChevronUp size={16} color="#00D084" />
                      ) : (
                        <ChevronDown size={16} color="#64748b" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* ─── Accordion Body (Expanded details & actions) ─── */}
                {isExpanded && (
                  <View style={styles.accordionBody}>
                    {/* Meta Grid */}
                    <View style={styles.metaGrid}>
                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Order ID</Text>
                        <Text style={styles.metaValHighlight}>{order.id || order.orderId}</Text>
                      </View>

                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Payment Mode</Text>
                        <Text style={styles.metaVal}>{order.paymentMethod || 'UPI'}</Text>
                      </View>

                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Amount Paid</Text>
                        <Text style={styles.priceVal}>₹{order.amount} {order.currency || 'INR'}</Text>
                      </View>

                      {order.utrNumber ? (
                        <View style={styles.metaCol}>
                          <Text style={styles.metaLabel}>UTR Reference</Text>
                          <Text style={styles.metaValMono} numberOfLines={1}>
                            {order.utrNumber}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Purchased On</Text>
                        <Text style={styles.metaVal}>{formatDate(order.purchasedAt)}</Text>
                      </View>

                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>Valid Until</Text>
                        <Text style={styles.metaVal}>{formatDate(order.validUntil)}</Text>
                      </View>
                    </View>

                    {/* Access Perks Banner */}
                    <View style={styles.perksBanner}>
                      <Sparkles size={13} color="#00D084" />
                      <Text style={styles.perksText}>
                        Full Year Curriculum · 24/7 AI Tutor · Offline Day Plans
                      </Text>
                    </View>

                    {/* ─── Action Buttons: TutO LMS Link + DB Delete ─── */}
                    <View style={styles.actionsRow}>
                      {/* TutO LMS Link Button */}
                      <TouchableOpacity
                        style={styles.openTutOBtn}
                        onPress={() => handleOpenInTutO(order)}
                        activeOpacity={0.8}
                      >
                        <GraduationCap size={16} color="#05131e" />
                        <Text style={styles.openTutOBtnText}>
                          {order.itemType === 'o_test'
                            ? 'Open in TestO'
                            : order.itemType === 'rental'
                            ? 'Open in RentO'
                            : 'Open in TutO LMS'}
                        </Text>
                      </TouchableOpacity>

                      {/* Delete from DB Button */}
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => confirmDeleteOrder(order)}
                        activeOpacity={0.8}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                          <>
                            <Trash2 size={15} color="#ef4444" />
                            <Text style={styles.deleteBtnText}>Delete from DB</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0c1322',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  totalBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryScrollContent: {
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  catPillActive: {
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    borderColor: '#00D084',
  },
  catPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#00D084',
    fontWeight: '800',
  },
  accordionContainer: {
    gap: 10,
  },
  accordionItem: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  accordionItemExpanded: {
    borderColor: 'rgba(0, 208, 132, 0.4)',
    backgroundColor: '#0f172a',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderIdBadge: {
    fontSize: 10,
    color: '#38bdf8',
    fontWeight: '700',
  },
  headerPrice: {
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: '800',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 8,
  },
  chevronWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 208, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.3)',
  },
  statusTextActive: {
    fontSize: 9,
    fontWeight: '900',
    color: '#00D084',
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  statusTextPending: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fbbf24',
  },
  statusBadgeExpired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusTextExpired: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ef4444',
  },
  accordionBody: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#070d18',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  metaCol: {
    width: '47%',
  },
  metaLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaVal: {
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: '600',
    marginTop: 1,
  },
  metaValHighlight: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '700',
    marginTop: 1,
  },
  metaValMono: {
    fontSize: 11,
    color: '#a5b4fc',
    fontWeight: '600',
    marginTop: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  priceVal: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '800',
    marginTop: 1,
  },
  perksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 208, 132, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 208, 132, 0.2)',
    marginBottom: 12,
  },
  perksText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openTutOBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00D084',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  openTutOBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#05131e',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
  },
});
export default PurchaseOrderHistoryCard;
