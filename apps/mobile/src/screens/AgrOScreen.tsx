import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Linking, Image } from 'react-native';
import { Leaf, Newspaper, BellRing, MapPin, Landmark } from 'lucide-react-native';
import { MandiApiService, MandiItem } from '../services/MandiApiService';
import { fetchDailyNewsForModule, DailyNewsItem } from '../services/aishleeSupabase';

export default function AgrOScreen() {
  const [activeTab, setActiveTab] = useState<'mandi' | 'news' | 'alerts'>('mandi');
  const [mandiData, setMandiData] = useState<MandiItem[]>([]);
  const [newsData, setNewsData] = useState<DailyNewsItem[]>([]);
  const [loadingMandi, setLoadingMandi] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    MandiApiService.fetchMandiPrices().then(data => {
      setMandiData(data);
      setLoadingMandi(false);
    });
    // ✅ Now reads from Supabase daily_news (admin-curated at 6 AM)
    fetchDailyNewsForModule('agro').then(data => {
      setNewsData(data);
      setLoadingNews(false);
    });
  }, []);

  const renderTab = (id: 'mandi' | 'news' | 'alerts', label: string, Icon: any) => {
    const isActive = activeTab === id;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(id)}
      >
        <Icon color={isActive ? '#10b981' : '#94a3b8'} size={20} />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderMandiTab = () => {
    if (loadingMandi) return <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />;
    if (mandiData.length === 0) return <Text style={styles.emptyText}>No mandi data available.</Text>;

    return (
      <FlatList
        data={mandiData}
        keyExtractor={(item, idx) => idx.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Leaf color="#10b981" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.cardTitle}>{item.commodity} ({item.variety})</Text>
              </View>
              <Text style={styles.priceText}>â‚¹{item.modalPrice}/Qtl</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin color="#94a3b8" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.cardSubtitle}>{item.market}, {item.district}</Text>
              </View>
              <Text style={styles.minMaxText}>Min: â‚¹{item.minPrice} | Max: â‚¹{item.maxPrice}</Text>
            </View>
            <Text style={styles.dateText}>Date: {item.arrivalDate}</Text>
          </View>
        )}
      />
    );
  };

  const renderNewsTab = () => {
    if (loadingNews) return <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />;
    if (newsData.length === 0) return (
      <View style={styles.alertsContainer}>
        <Newspaper color="#334155" size={60} />
        <Text style={[styles.alertsTitle, { fontSize: 16, marginTop: 16 }]}>No News Today</Text>
        <Text style={styles.alertsDesc}>Admin loads fresh agriculture news every morning at 6 AM.</Text>
      </View>
    );

    return (
      <FlatList
        data={newsData}
        keyExtractor={(item, idx) => idx.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isGovt = item.data_type !== 'rss';
          return (
            <TouchableOpacity
              style={[styles.newsCard, isGovt && { borderColor: '#10b98155', borderWidth: 1 }]}
              activeOpacity={0.8}
              onPress={() => item.link ? Linking.openURL(item.link) : null}
            >
              {/* Govt banner */}
              {isGovt && (
                <View style={styles.govtBanner}>
                  <Landmark color="#10b981" size={14} />
                  <Text style={styles.govtBannerText}>🏛️ data.gov.in — Government Data</Text>
                </View>
              )}
              {/* RSS Image */}
              {item.image_url && item.data_type === 'rss' ? (
                <Image source={{ uri: item.image_url }} style={styles.newsImage} />
              ) : !isGovt ? (
                <View style={[styles.newsImage, { backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' }]}>
                  <Newspaper color="#94a3b8" size={40} />
                </View>
              ) : null}
              <View style={styles.newsContent}>
                <View style={styles.newsHeaderRow}>
                  <Text style={styles.newsSource}>{item.source_name}</Text>
                  <Text style={styles.newsDate}>{item.published_date?.substring(0, 10)}</Text>
                </View>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.newsDesc} numberOfLines={3}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  const renderAlertsTab = () => {
    return (
      <View style={styles.alertsContainer}>
        <View style={styles.bellIconBg}>
          <BellRing color="#10b981" size={60} />
        </View>
        <Text style={styles.alertsTitle}>Price Alerts</Text>
        <Text style={styles.alertsDesc}>
          Set target prices for your crops. We will notify you when the local Mandi price crosses your threshold.
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Alert</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Tabs */}
      <View style={styles.header}>
        {renderTab('mandi', 'Mandi Rates', Leaf)}
        {renderTab('news', 'Agri News', Newspaper)}
        {renderTab('alerts', 'Alerts', BellRing)}
      </View>
      
      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'mandi' && renderMandiTab()}
        {activeTab === 'news' && renderNewsTab()}
        {activeTab === 'alerts' && renderAlertsTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#0a0f1e',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#10b981',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#10b981',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  minMaxText: {
    color: '#64748b',
    fontSize: 12,
  },
  dateText: {
    color: '#64748b',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  govtBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#10b98115',
  },
  govtBannerText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  newsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  newsImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 16,
  },
  newsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsSource: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsDate: {
    color: '#64748b',
    fontSize: 10,
  },
  newsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsDesc: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  alertsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b98122',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  alertsTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  alertsDesc: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
  }
});
