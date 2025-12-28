import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  Alert,
  Image,
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';

// --- Constants ---
const { width, height } = Dimensions.get('window');
const COLORS = {
  primary: '#10B981',     
  secondary: '#064E3B',   
  background: '#0F172A',  
  surface: '#1E293B',     
  text: '#F8FAFC',        
  textMuted: '#94A3B8',
  accent: '#38BDF8'       
};

// --- LOCAL DATA ---
// Make sure these files exist in your 'assets' folder!
const PREMADE_DESIGNS = [
  { id: 1, name: 'Whistle', bottles: 1, image: require('./assets/whistle.png'), weight: 12 },
  { id: 2, name: 'Phone Stand', bottles: 3, image: require('./assets/phone_stand.png'), weight: 34 },
  { id: 3, name: 'Bag Clip', bottles: 1, image: require('./assets/clip.png'), weight: 8 },
  { id: 4, name: 'Comb', bottles: 2, image: require('./assets/comb.png'), weight: 22 },
  { id: 5, name: 'Carabiner', bottles: 2, image: require('./assets/carabiner.png'), weight: 18 },
  { id: 6, name: 'Planter', bottles: 5, image: require('./assets/planter.png'), weight: 55 },
];

// --- Helper Components ---
const MachineStatusModal = ({ visible, step }) => {
  const steps = {
    1: { text: "Connecting...", icon: "wifi" },
    2: { text: "Verifying Material...", icon: "scale-balance" },
    3: { text: "Accepted!", icon: "check-circle", color: '#4ADE80' },
  };
  const current = steps[step] || steps[1];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons name={current.icon} size={48} color={current.color || COLORS.primary} />
          <Text style={styles.modalText}>{current.text}</Text>
          {step < 3 && <ActivityIndicator size="small" color={COLORS.primary} style={{marginTop: 15}} />}
        </View>
      </View>
    </Modal>
  );
};

// --- Screen 1: Dashboard (Redesigned Hero) ---
const DashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.containerNoPadding}>
      
      {/* 1. TOP HERO SECTION (Full Width Banner) */}
      <TouchableOpacity 
        style={styles.topHeroContainer} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Print')}
      >
        <ImageBackground
          // Using a Remote URL since you don't have this one locally
          source={{uri: 'https://images.unsplash.com/photo-1615655406736-b37c4d898e6f?q=80&w=800&auto=format&fit=crop'}}
          style={styles.heroImage}
        >
          <LinearGradient colors={['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.9)']} style={styles.heroGradient}>
            <SafeAreaView style={styles.safeArea}>
              
              {/* Header inside the Banner */}
              <View style={styles.heroHeaderRow}>
                <View>
                  <Text style={styles.heroGreeting}>Welcome Back,</Text>
                  <Text style={styles.heroSubtitle}>Ready to recycle today?</Text>
                </View>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color={COLORS.textMuted} />
                </View>
              </View>

              {/* Big CTA Text */}
              <View style={styles.heroCTA}>
                <View style={styles.ctaIconCircle}>
                   <MaterialCommunityIcons name="cube-send" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.ctaTitle}>Start New Project</Text>
                <Text style={styles.ctaSub}>Tap here to choose a design or upload</Text>
              </View>

            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>

      {/* 2. BOTTOM CONTENT SECTION (Sheet Style) */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sectionHeader}>Your Impact</Text>
        
        {/* Credits Card */}
        <LinearGradient 
          colors={['#059669', '#10B981']} 
          start={{x:0, y:0}} end={{x:1, y:1}} 
          style={styles.creditCard}
        >
          <View>
            <Text style={styles.creditLabel}>Eco Credits</Text>
            <Text style={styles.creditValue}>1,250</Text>
          </View>
          <MaterialCommunityIcons name="leaf" size={40} color="rgba(255,255,255,0.2)" />
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
             <MaterialCommunityIcons name="bottle-soda-classic-outline" size={28} color={COLORS.accent} />
             <Text style={styles.statNumber}>42</Text>
             <Text style={styles.statLabel}>Bottles</Text>
          </View>
          <View style={styles.statBox}>
             <MaterialCommunityIcons name="molecule-co2" size={28} color="#F472B6" />
             <Text style={styles.statNumber}>3.5kg</Text>
             <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statBox}>
             <MaterialCommunityIcons name="printer-3d-nozzle-outline" size={28} color="#FBBF24" />
             <Text style={styles.statNumber}>8</Text>
             <Text style={styles.statLabel}>Prints</Text>
          </View>
        </View>
      </View>

    </View>
  );
};

// --- Screen 2: Print Hub ---
const PrintScreen = ({ navigation }) => {
  const [view, setView] = useState('hub'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [machineStep, setMachineStep] = useState(1);

  const selectPremade = (item) => {
    setSelectedItem(item);
    setView('result'); 
  };

  const selectCustom = () => {
    setView('analyzing');
    setTimeout(() => {
      setSelectedItem({
        name: 'Custom_Gear_v4.stl',
        bottles: 4,
        weight: 48,
        image: null 
      });
      setView('result');
    }, 2000);
  };

  const simulateMachine = () => {
    setModalVisible(true);
    setMachineStep(1);
    setTimeout(() => setMachineStep(2), 2000);
    setTimeout(() => setMachineStep(3), 4000);
    setTimeout(() => {
      setModalVisible(false);
      Alert.alert("Success", "Printing Started!");
      setView('hub');
    }, 5500);
  };

  if (view === 'hub') {
    return (
      <View style={styles.containerPadded}>
        <View style={styles.headerContainer}>
           <Text style={styles.headerTitle}>Design Library</Text>
           <Text style={styles.headerSubtitle}>Select a model or upload your own</Text>
        </View>
        
        <TouchableOpacity style={styles.uploadCard} onPress={selectCustom}>
           <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.uploadGradient}>
             <MaterialCommunityIcons name="cloud-upload" size={32} color="#fff" />
             <View style={{marginLeft: 15, flex: 1}}>
               <Text style={styles.uploadTitle}>Upload Custom File</Text>
               <Text style={styles.uploadSub}>Supports .STL and .OBJ</Text>
             </View>
             <Ionicons name="chevron-forward" size={24} color="#fff" />
           </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>Community Designs</Text>
        
        <FlatList 
          data={PREMADE_DESIGNS}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => selectPremade(item)}
              activeOpacity={0.8}
            >
              {/* UPDATED: Uses local image source */}
              <Image source={item.image} style={styles.gridImage} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.gridOverlay}>
                <Text style={styles.gridTitle}>{item.name}</Text>
                <View style={styles.gridBadge}>
                  <MaterialCommunityIcons name="bottle-soda" size={12} color={COLORS.primary} />
                  <Text style={styles.gridBadgeText}>{item.bottles} Bottles</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  if (view === 'analyzing') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingTitle}>Slicing Model...</Text>
        <Text style={styles.loadingSub}>Calculating density & infill</Text>
      </View>
    );
  }

  const isQR = view === 'qr';
  
  return (
    <ScrollView style={styles.containerPadded}>
      <MachineStatusModal visible={modalVisible} step={machineStep} />
      
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setView('hub')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isQR ? "Scan at Kiosk" : "Job Summary"}</Text>
        <View style={{width: 40}} />
      </View>

      {!isQR ? (
        <View style={{marginTop: 20}}>
          <View style={styles.summaryCard}>
            {selectedItem.image ? (
              // UPDATED: Uses local image source
              <Image source={selectedItem.image} style={styles.summaryImage} />
            ) : (
              <View style={styles.summaryPlaceholder}>
                <MaterialCommunityIcons name="printer-3d" size={60} color={COLORS.primary} />
              </View>
            )}
            
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>{selectedItem.name}</Text>
              
              <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Estimated Weight</Text>
                 <Text style={styles.detailValue}>{selectedItem.weight}g</Text>
              </View>
              <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Material</Text>
                 <Text style={styles.detailValue}>rPET (Recycled)</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.costBox}>
                <Text style={styles.costLabel}>REQUIRED DEPOSIT</Text>
                <View style={styles.costRow}>
                   <MaterialCommunityIcons name="bottle-soda-classic" size={32} color={COLORS.primary} />
                   <Text style={styles.costValue}>{selectedItem.bottles} Bottles</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={() => setView('qr')}>
            <Text style={styles.mainBtnText}>Confirm & Generate Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.qrContainer}>
           <View style={styles.qrCard}>
             <QRCode value={JSON.stringify(selectedItem)} size={220} />
             <Text style={styles.qrHint}>Align code with machine scanner</Text>
           </View>

           <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Machine will open intake for <Text style={{fontWeight: 'bold', color: COLORS.primary}}>{selectedItem.bottles} bottles</Text>. 
                Please remove caps before depositing.
              </Text>
           </View>

           <TouchableOpacity style={styles.demoButton} onPress={simulateMachine}>
             <Text style={styles.demoText}>[DEMO] Simulate Connection</Text>
           </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// --- Navigation ---
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home-variant' : 'home-variant-outline';
            } else if (route.name === 'Print') {
              iconName = 'printer-3d'; 
            }
            return <MaterialCommunityIcons name={iconName} size={28} color={focused ? COLORS.primary : COLORS.textMuted} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Print" component={PrintScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  // LAYOUT CONTAINERS
  containerNoPadding: { flex: 1, backgroundColor: COLORS.background },
  containerPadded: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 30, paddingTop: 60 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  // HERO SECTION (New)
  topHeroContainer: { height: height * 0.45, width: '100%' }, // Takes top 45% of screen
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  safeArea: { flex: 1, justifyContent: 'space-between', paddingBottom: 60, paddingTop: 50 },
  
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  heroSubtitle: { fontSize: 16, color: '#CBD5E1', marginTop: 5 },
  
  avatarPlaceholder: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },

  heroCTA: { marginBottom: 20 },
  ctaIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(16, 185, 129, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: COLORS.primary },
  ctaTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  ctaSub: { fontSize: 14, color: COLORS.primary, marginTop: 5, fontWeight: '600' },

  // BOTTOM SHEET SECTION (New)
  bottomSheet: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    marginTop: -40, // Pulls up over the image
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    paddingHorizontal: 30, 
    paddingTop: 30,
    elevation: 20
  },

  // STATS
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
  creditCard: { borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  creditLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  creditValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 5 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { backgroundColor: COLORS.surface, width: '31%', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statNumber: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },

  // PRINT HUB STYLES
  headerContainer: { marginBottom: 25 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  uploadCard: { marginBottom: 30, borderRadius: 16, overflow: 'hidden', elevation: 5 },
  uploadGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  uploadTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  uploadSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

  gridItem: { width: (width - 75) / 2, height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 15, backgroundColor: COLORS.surface }, 
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingTop: 40 },
  gridTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  gridBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  gridBadgeText: { color: COLORS.primary, fontSize: 12, marginLeft: 4, fontWeight: 'bold' },

  summaryCard: { backgroundColor: COLORS.surface, borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  summaryImage: { width: '100%', height: 200 },
  summaryPlaceholder: { width: '100%', height: 200, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  summaryContent: { padding: 20 },
  summaryTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { color: COLORS.textMuted, fontSize: 15 },
  detailValue: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 15 },
  costBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  costLabel: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  costRow: { flexDirection: 'row', alignItems: 'center' },
  costValue: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginLeft: 10 },

  mainButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 14, alignItems: 'center' },
  mainBtnText: { color: '#064E3B', fontSize: 16, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },

  qrContainer: { alignItems: 'center', marginTop: 20 },
  qrCard: { padding: 25, backgroundColor: '#fff', borderRadius: 24, alignItems: 'center', marginBottom: 30 },
  qrHint: { color: '#64748B', marginTop: 15, fontSize: 13 },
  infoBox: { padding: 15, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 12, marginBottom: 30 },
  infoText: { color: COLORS.accent, textAlign: 'center', lineHeight: 20 },
  demoButton: { padding: 15 },
  demoText: { color: COLORS.textMuted, fontFamily: 'monospace', fontSize: 12 },

  loadingTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  loadingSub: { color: COLORS.textMuted, marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '75%', backgroundColor: COLORS.surface, padding: 30, borderRadius: 24, alignItems: 'center' },
  modalText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginTop: 15 },

  tabBar: { backgroundColor: COLORS.background, borderTopColor: '#334155', height: 60, paddingBottom: 5 }
});