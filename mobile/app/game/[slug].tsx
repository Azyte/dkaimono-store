import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface Game {
  id: string;
  name: string;
  publisher: string;
  banner_url: string;
  validation_fields: any[];
}

interface Product {
  id: string;
  name: string;
  price_idr: number;
  original_price_idr: number | null;
  denomination: number;
}

export default function GameTopUpScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userId, setUserId] = useState('');
  const [serverId, setServerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      const { data: gameData } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (gameData) {
        setGame(gameData);
        
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('game_id', gameData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
          
        if (productData) setProducts(productData);
      }
      setLoading(false);
    };

    fetchGame();
  }, [slug]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#A29BFE" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Game not found.</Text>
      </View>
    );
  }

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <Image source={{ uri: game.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80' }} style={styles.banner} />
      
      <View style={styles.content}>
        <Text style={styles.gameName}>{game.name}</Text>
        <Text style={styles.publisher}>{game.publisher}</Text>

        {/* Step 1: Account Validation */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.cardTitle}>Account Details</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Enter User ID"
              placeholderTextColor="#636E8A"
              value={userId}
              onChangeText={setUserId}
            />
            {game.validation_fields?.map((field: any) => field.name === 'server_id') && (
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                placeholder="Enter Server ID"
                placeholderTextColor="#636E8A"
                value={serverId}
                onChangeText={setServerId}
              />
            )}
          </View>
        </View>

        {/* Step 2: Select Product */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepText}>2</Text></View>
            <Text style={styles.cardTitle}>Select Top-Up</Text>
          </View>
          
          <View style={styles.productGrid}>
            {products.map((product) => (
              <Pressable 
                key={product.id} 
                style={[styles.productCard, selectedProductId === product.id && styles.productCardActive]}
                onPress={() => setSelectedProductId(product.id)}
              >
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{formatIDR(product.price_idr)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable 
          style={[styles.checkoutBtn, (!userId || !selectedProductId) && styles.checkoutBtnDisabled]}
          disabled={!userId || !selectedProductId}
        >
          <Text style={styles.checkoutBtnText}>Buy Now</Text>
        </Pressable>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF7675',
    fontSize: 16,
  },
  banner: {
    width: '100%',
    height: 200,
    backgroundColor: '#1C2038',
  },
  content: {
    padding: 16,
    marginTop: -20,
    backgroundColor: '#0A0E1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  gameName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E8E8F0',
  },
  publisher: {
    fontSize: 14,
    color: '#A29BFE',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#141829',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D3154',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A29BFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepText: {
    color: '#141829',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8E8F0',
  },
  inputGroup: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0A0E1A',
    borderWidth: 1,
    borderColor: '#2D3154',
    borderRadius: 10,
    padding: 14,
    color: '#E8E8F0',
    fontSize: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  productCard: {
    width: '45%',
    flexGrow: 1,
    backgroundColor: '#0A0E1A',
    borderWidth: 1,
    borderColor: '#2D3154',
    borderRadius: 12,
    padding: 16,
    margin: 6,
  },
  productCardActive: {
    borderColor: '#A29BFE',
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E8E8F0',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    color: '#A29BFE',
    fontWeight: '600',
  },
  checkoutBtn: {
    backgroundColor: '#A29BFE',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutBtnDisabled: {
    backgroundColor: '#2D3154',
  },
  checkoutBtnText: {
    color: '#141829',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
