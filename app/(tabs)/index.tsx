import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  Dimensions, Pressable, RefreshControl, ActivityIndicator,
  Image, TextInput, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../constants/supabase';
import { GunStatus, getStatusLabel, getDaysUntilExpiry } from '../../constants/kosLogic';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Dropdown } from 'react-native-element-dropdown';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 2 - Spacing.sm) / 2;

// Priority: expired (0) → expiring soon (1) → needs cleaning (2) → valid (3)
const STATUS_PRIORITY: Record<GunStatus, number> = { danger: 0, warning: 1, good: 2 };

const FILTER_TYPES = [
  { label: 'Всички', value: 'Всички' },
  { label: 'Пистолет', value: 'Пистолет' },
  { label: 'SMG', value: 'SMG' },
  { label: 'Карабина', value: 'Карабина' },
  { label: 'Гладкоцевна', value: 'Гладкоцевна' },
  { label: 'Болтова', value: 'Болтова' },
  { label: 'Револвер', value: 'Револвер' }
];

const FILTER_CALIBERS = [
  { label: 'Всички', value: 'Всички' },
  { label: '.22 LR', value: '.22 LR' },
  { label: '9x19mm', value: '9x19mm' },
  { label: '9x18mm Makarov', value: '9x18mm Makarov' },
  { label: '.38 Special', value: '.38 Special' },
  { label: '.357 Magnum', value: '.357 Magnum' },
  { label: '.40 S&W', value: '.40 S&W' },
  { label: '.45 ACP', value: '.45 ACP' },
  { label: '10mm Auto', value: '10mm Auto' },
  { label: '.44 Magnum', value: '.44 Magnum' },
  { label: '5.56x45mm', value: '5.56x45mm' },
  { label: '7.62x39mm', value: '7.62x39mm' },
  { label: '7.62x51mm', value: '7.62x51mm' },
  { label: '7.62x54mmR', value: '7.62x54mmR' },
  { label: '6.5mm Creedmoor', value: '6.5mm Creedmoor' },
  { label: '.300 Blackout', value: '.300 Blackout' },
  { label: '12 Gauge', value: '12 Gauge' },
  { label: '20 Gauge', value: '20 Gauge' },
  { label: '.338 Lapua', value: '.338 Lapua' },
  { label: '5.7x28mm', value: '5.7x28mm' },
  { label: 'Друго', value: 'Друго' }
];

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, expiryDate }: { status: GunStatus; expiryDate: string }) {
  const days = getDaysUntilExpiry(expiryDate);
  // Use the correct color from Colors.status — was broken before (used theme.accent for all)
  const s = Colors.status[status];

  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={[styles.badgeDot, { backgroundColor: s.dot }]} />
      <Text style={[styles.badgeText, { color: s.text }]}>{getStatusLabel(status)}</Text>
      {status !== 'good' && (
        <Text style={[styles.badgeDays, { color: s.text }]}>
          {days < 0 ? `+${Math.abs(days)}д` : `${days}д`}
        </Text>
      )}
    </View>
  );
}

// ─── CLEANING BADGE ───────────────────────────────────────────────────────────
function CleaningBadge({ lastCleaned }: { lastCleaned: string | null }) {
  return (
    <View style={styles.cleaningBadge}>
      <Text style={styles.cleaningBadgeText}>⚠ ЗА ПОЧИСТВАНЕ</Text>
      {lastCleaned && (
        <Text style={styles.cleaningDate}>
          Последно: {new Date(lastCleaned).toLocaleDateString('bg-BG')}
        </Text>
      )}
    </View>
  );
}

// ─── GUN CARD ─────────────────────────────────────────────────────────────────
function GunCard({ gun, onPress }: { gun: any; onPress: () => void }) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  const status = (gun.kosStatus as GunStatus) || 'good';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      {/* Color strip — green/orange/red based on KOS status */}
      <View style={[styles.cardStrip, { backgroundColor: Colors.status[status].dot }]} />

      <View style={styles.cardImageArea}>
        {gun.image_url ? (
          <Image source={{ uri: gun.image_url }} style={styles.gunImage} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.input }}>
            <Text style={{ color: theme.muted, fontSize: 10, fontWeight: '700' }}>[НЯМА СНИМКА]</Text>
          </View>
        )}
        <View style={styles.serialBox}>
          <Text style={styles.serialText}>S/N: {gun.serial_number}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{gun.name}</Text>
        <Text style={[styles.cardMfr, { color: theme.muted }]} numberOfLines={1}>{gun.manufacturer || '—'}</Text>

        {/* Cleaning badge — shows when gun needs cleaning after a range day */}
        {gun.needs_cleaning && (
          <CleaningBadge lastCleaned={gun.last_cleaned_date} />
        )}

        <StatusBadge status={status} expiryDate={gun.kosExpiryDate} />
      </View>
    </Pressable>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ArmoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [guns, setGuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Всички');
  const [caliberFilter, setCaliberFilter] = useState('Всички');

  const fetchGuns = useCallback(async () => {
    const { data, error } = await supabase
      .from('firearms')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const processed = data.map((g) => {
        // 👈 FIXED: Now checks if you've renewed it, just like the detail screen!
        const activeDateStr = g.last_renewed_date || g.kos_registration_date;
        const activeDate = new Date(activeDateStr);
        const expiryDate = new Date(activeDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 5);
        const isoExpiry = expiryDate.toISOString().split('T')[0];
        
        const days = getDaysUntilExpiry(isoExpiry);
        let status: GunStatus = 'good';
        if (days <= 0)  status = 'danger';
        else if (days <= 30) status = 'warning'; 
        
        return { ...g, kosExpiryDate: isoExpiry, kosStatus: status, daysUntilExpiry: days };
      });

      // Priority sort: expired (0) → expiring (1) → needs cleaning (1.5) → valid (2)
      const sorted = processed.sort((a, b) => {
        // 👈 FIXED: Cleaning priority is 1.5 so it sits ABOVE "good" (2) but below "warning" (1)
        const pa = a.needs_cleaning && a.kosStatus === 'good' ? 1.5 : STATUS_PRIORITY[a.kosStatus as GunStatus];
        const pb = b.needs_cleaning && b.kosStatus === 'good' ? 1.5 : STATUS_PRIORITY[b.kosStatus as GunStatus];
        
        // Primary sort: by color/status
        if (pa !== pb) return pa - pb;
        
        // Secondary sort: if they are the exact same status, put the one with FEWER days left at the top!
        return a.daysUntilExpiry - b.daysUntilExpiry;
      });

      setGuns(sorted);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Auto-refresh every time the screen comes into focus (e.g. after adding a gun)
  useFocusEffect(
    useCallback(() => {
      fetchGuns();
    }, [fetchGuns])
  );

  const filteredGuns = useMemo(() => {
    return guns.filter((gun) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        gun.name?.toLowerCase().includes(q) ||
        gun.serial_number?.toLowerCase().includes(q) ||
        gun.manufacturer?.toLowerCase().includes(q);

      // 👈 FIXED: We use gun.type instead of gun.gun_type!
      const matchesType = typeFilter === 'Всички' || gun.type === typeFilter;

      // 👈 FIXED: Safely checks if caliber exists
      const matchesCaliber = caliberFilter === 'Всички' || (gun.caliber && gun.caliber.includes(caliberFilter));

      return matchesSearch && matchesType && matchesCaliber;
    });
  }, [guns, searchQuery, typeFilter, caliberFilter]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={filteredGuns}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchGuns(); }}
            tintColor={theme.accent}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={[styles.headerEyebrow, { color: theme.accent }]}>ЦИФРОВ АРСЕНАЛ</Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>МОИ ОРЪЖИЯ</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Търсене по модел, S/N или производител..."
                placeholderTextColor={theme.muted}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Filters */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
              <Dropdown 
                style={[styles.filterDropdown, { backgroundColor: theme.input, borderColor: theme.border }]} 
                selectedTextStyle={{ color: theme.accent, fontSize: 12, fontWeight: '700' }} 
                placeholderStyle={{ color: theme.muted, fontSize: 12 }} 
                containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} 
                itemTextStyle={{ color: theme.text, fontSize: 12 }} 
                activeColor={theme.border} 
                data={FILTER_TYPES} // 👈 NO .map() HERE!
                labelField="label" valueField="value" value={typeFilter} 
                placeholder="Всички типове" // 👈 FIXES THE ENGLISH
                onChange={i => setTypeFilter(i.value)} 
              />
              <Dropdown 
                style={[styles.filterDropdown, { backgroundColor: theme.input, borderColor: theme.border }]} 
                selectedTextStyle={{ color: theme.accent, fontSize: 12, fontWeight: '700' }} 
                placeholderStyle={{ color: theme.muted, fontSize: 12 }} 
                containerStyle={{ backgroundColor: theme.card, borderColor: theme.border }} 
                itemTextStyle={{ color: theme.text, fontSize: 12 }} 
                activeColor={theme.border} 
                data={FILTER_CALIBERS} // 👈 NO .map() HERE!
                labelField="label" valueField="value" value={caliberFilter} 
                placeholder="Всички калибри" // 👈 FIXES THE ENGLISH
                onChange={i => setCaliberFilter(i.value)} 
              />
            </View>
            {/* Expired alert banner */}
            {filteredGuns.some((g) => g.kosStatus === 'danger') && (
              <View style={styles.alertBanner}>
                <Text style={styles.alertText}>⚠ Имате оръжия с изтекъл КОС!</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <GunCard gun={item} onPress={() => router.push(`/gun/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: theme.muted, textAlign: 'center' }}>
              {searchQuery || typeFilter !== 'Всички' || caliberFilter !== 'Всички'
                ? 'Няма намерени оръжия.'
                : 'Арсеналът е празен. Добавете оръжие.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  header: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg },
  headerEyebrow: { fontSize: 10, letterSpacing: 3, marginBottom: 4, fontWeight: '800' },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },

  // Search
  searchWrap: { marginBottom: Spacing.sm },
  searchInput: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },

  // Filters
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginRight: 8, width: 52 },
  chipsScroll: { gap: 6, paddingRight: Spacing.md },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  chipText: { fontSize: 10, fontWeight: '600' },

  // Alert
  alertBanner: { backgroundColor: Colors.status.danger.bg, borderWidth: 1, borderColor: Colors.status.danger.border, borderRadius: Radius.md, padding: 12, marginBottom: Spacing.md, marginTop: 8 },
  alertText: { color: Colors.status.danger.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // Grid
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },

  // Card
  card: { width: CARD_WIDTH, borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: 25, ...Shadow.card },
  cardStrip: { height: 3, width: '100%' },
  cardImageArea: { height: 110, width: '100%', overflow: 'hidden', borderBottomWidth: 1, borderColor: '#222' },
  gunImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  serialBox: { position: 'absolute', bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 3, borderTopRightRadius: 6 },
  serialText: { fontSize: 8, color: '#FFFFFF', fontFamily: 'Courier New', fontWeight: 'bold' },
  cardBody: { padding: Spacing.sm, paddingTop: 5, gap: 4 },
  cardName: { fontSize: 14, fontWeight: '800' },
  cardMfr: { fontSize: 10, marginBottom: 2, fontWeight: '500' },

  // Status badge
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, alignSelf: 'flex-start' },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 8, fontWeight: '700' },
  badgeDays: { fontSize: 8, fontWeight: '700', opacity: 0.8 },

  // Cleaning badge
  cleaningBadge: { backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 3 },
  cleaningBadgeText: { fontSize: 8, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.5 },
  cleaningDate: { fontSize: 7, color: '#F59E0B', marginTop: 1 },
  filterDropdown: { flex: 1, borderRadius: 10, padding: 12, borderWidth: 1 }
});
