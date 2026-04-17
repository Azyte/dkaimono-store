import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface Game {
  id: string;
  name: string;
  slug: string;
  publisher: string;
  cover_url: string;
}

export default function HomeScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (data) {
      setGames(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A29BFE" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to dKaimono</Text>
        <Text style={styles.subtitle}>Super fast digital top-up platform.</Text>
      </View>

      <View style={styles.gamesSection}>
        <Text style={styles.sectionTitle}>Popular Games</Text>
        
        {loading && !refreshing ? (
          <Text style={styles.loadingText}>Loading games...</Text>
        ) : (
          <View style={styles.grid}>
            {games.map((game) => (
              <Link href={`/game/${game.slug}`} key={game.id} asChild>
                <Pressable style={styles.card}>
                  <Image 
                    source={{ uri: game.cover_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80' }} 
                    style={styles.cardImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.gameTitle} numberOfLines={1}>{game.name}</Text>
                    <Text style={styles.publisherTitle} numberOfLines={1}>{game.publisher}</Text>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    padding: 20,
    backgroundColor: '#141829',
    borderBottomWidth: 1,
    borderBottomColor: '#2D3154',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E8E8F0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8892B0',
  },
  gamesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E8E8F0',
    marginBottom: 16,
  },
  loadingText: {
    color: '#8892B0',
    textAlign: 'center',
    padding: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 12,
    backgroundColor: '#1C2038',
  },
  cardContent: {
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8E8F0',
  },
  publisherTitle: {
    fontSize: 12,
    color: '#8892B0',
    marginTop: 2,
  }
});
