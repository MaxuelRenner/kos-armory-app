import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Dimensions, Pressable, RefreshControl, ActivityIndicator, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../constants/supabase';
import { GunStatus, getStatusLabel, getDaysUntilExpiry } from '../../constants/mockData';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 2 - Spacing.sm) / 2;

const STATUS_ORDER: Record<GunStatus, number> = { danger: 0, warning: 1, good: 2 };

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status, expiryDate }: { status: GunStatus; expiryDate: string }) {
  const { theme } = useTheme();
  const days = getDaysUntilExpiry(expiryDate);
  
  // Custom theme-aware colors
  const isDanger = status === 'danger';
  const badgeBg = isDanger ? theme.accent + '22' : theme.input; // 22 adds transparency
  const badgeBorder = isDanger ? theme.accent : theme.border;
  const textColor = isDanger ? theme.accent : theme.muted;

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
      <View style={[styles.badgeDot, { backgroundColor: textColor }]} />
      <Text style={[styles.badgeText, { color: textColor }]}>{getStatusLabel(status)}</Text>
      {status !== 'good' && ( 
        <Text style={[styles.badgeDays, { color: textColor }]}> 
          {days < 0 ? `+${Math.abs(days)}д` : `${days}д`} 
        </Text> 
      )}
    </View>
  );
}

function GunCard({ gun, onPress }: { gun: any; onPress: () => void }) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);
  const status = (gun.kosStatus as GunStatus) || 'good';

  return (
    <Pressable onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      
      {/* RESTORED THE GREEN/RED STATUS STRIP */}
      <View style={[styles.cardStrip, { backgroundColor: Colors.status[status].dot }]} />
      
      {/* FULL WIDTH IMAGE, NO BORDERS ON SIDES */}
      <View style={styles.cardImageArea}>
        {gun.image_url ? (
          <Image source={{ uri: gun.image_url }} style={styles.gunImage} />
        ) : (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.input}}><Text style={{ color: theme.muted, fontSize: 10, fontWeight: '700' }}>[НЯМА СНИМКА]</Text></View>
        )}
        
        {/* BLACK SEMI-TRANSPARENT BACKGROUND FOR SERIAL NUMBER LEGIBILITY */}
        <View style={styles.serialBox}>
          <Text style={styles.serialText}>S/N: {gun.serial_number}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{gun.name}</Text>
        <Text style={[styles.cardMfr, { color: theme.muted }]} numberOfLines={1}>{gun.manufacturer || '—'}</Text>
        <StatusBadge status={status} expiryDate={gun.kosExpiryDate} />
      </View>
    </Pressable>
  );
}
// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ArmoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [guns, setGuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGuns = useCallback(async () => {
    const { data, error } = await supabase.from('firearms').select('*').order('created_at', { ascending: false });
    if (data) {
      const processedGuns = data.map(g => {
        const regDate = new Date(g.kos_registration_date);
        const expiryDate = new Date(regDate.setFullYear(regDate.getFullYear() + 5));
        const isoExpiry = expiryDate.toISOString().split('T')[0];
        const days = getDaysUntilExpiry(isoExpiry);
        let status: GunStatus = 'good';
        if (days <= 0) status = 'danger'; else if (days <= 35) status = 'warning';
        return { ...g, kosExpiryDate: isoExpiry, kosStatus: status };
      });
      setGuns(processedGuns);
    }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { fetchGuns(); }, [fetchGuns]);

  const filteredGuns = useMemo(() => {
    return guns
      .filter((gun) => {
        const lowerQuery = searchQuery.toLowerCase();
        return ( gun.name.toLowerCase().includes(lowerQuery) || gun.serial_number.toLowerCase().includes(lowerQuery) || (gun.manufacturer && gun.manufacturer.toLowerCase().includes(lowerQuery)) );
      })
      .sort((a, b) => STATUS_ORDER[a.kosStatus as GunStatus] - STATUS_ORDER[b.kosStatus as GunStatus]);
  }, [guns, searchQuery]);

  if (loading && !refreshing) return <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}><ActivityIndicator size="large" color={theme.accent} /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={filteredGuns}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGuns(); }} tintColor={theme.accent} /> }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={[styles.headerEyebrow, { color: theme.accent }]}>ЦИФРОВ АРСЕНАЛ</Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>МОИ ОРЪЖИЯ</Text>
              </View>
            </View>
            
            <View style={styles.searchWrap}>
              <TextInput style={[styles.searchInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]} value={searchQuery} onChangeText={setSearchQuery} placeholder="Търсене по модел, S/N или производител..." placeholderTextColor={theme.muted} clearButtonMode="while-editing" />
            </View>

            {filteredGuns.some((g) => g.kosStatus === 'danger') && (
              <View style={styles.alertBanner}><Text style={styles.alertText}>⚠ Имате оръжия с изтекъл КОС!</Text></View>
            )}
          </>
        }
        renderItem={({ item }) => <GunCard gun={item} onPress={() => router.push(`/gun/${item.id}`)} /> }
        ListEmptyComponent={ <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: theme.muted, textAlign: 'center' }}>{searchQuery ? 'Няма намерени оръжия.' : 'Арсеналът е празен. Добавете оръжие.'}</Text></View> }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 40, paddingBottom: 100 }, 
  list: { gap: 20, paddingBottom: 20 },    
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  header: {marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg },
  headerEyebrow: { fontSize: 10, letterSpacing: 3, marginBottom: 4, fontWeight: '800' },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  searchWrap: { marginBottom: Spacing.md },
  searchInput: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  alertBanner: { backgroundColor: Colors.status.danger.bg, borderWidth: 1, borderColor: Colors.status.danger.border, borderRadius: Radius.md, padding: 12, marginBottom: Spacing.md },
  alertText: { color: Colors.status.danger.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  row: { gap: Spacing.sm, marginBottom: Spacing.sm },
  card: { width: CARD_WIDTH, borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: 25, ...Shadow.card },
  cardStrip: { height: 3, width: '100%' },
  cardImageArea: { height: 110, width: '100%', overflow: 'hidden', borderBottomWidth: 1, borderColor: '#222' },
  gunImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  serialBox: { position: 'absolute', bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 3, borderTopRightRadius: 6 },
  serialText: { fontSize: 8, color: '#FFFFFF', fontFamily: 'Courier New', fontWeight: 'bold' },
  cardBody: { padding: Spacing.sm, paddingTop: 5, gap: 4 },
  cardName: { fontSize: 14, fontWeight: '800' },
  cardMfr: { fontSize: 10, marginBottom: 4, fontWeight: '500' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, alignSelf: 'flex-start' },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 8, fontWeight: '700' },
  badgeDays: { fontSize: 8, fontWeight: '700', opacity: 0.8 },
});