import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';

// --- Constants ---
const COLORS = {
  primary: '#10B981',     
  secondary: '#059669',   
  background: '#111827',  
  card: '#1F2937',        
  text: '#F9FAFB',        
  textSecondary: '#9CA3AF', 
  danger: '#EF4444',
  success: '#34D399'
};

// --- Helper Logic ---
const MATERIAL_DENSITY = {
  PET: 1.38, // g/cm3 (Standard Water Bottles)
  PLA: 1.24,
};

const calculateMaterial = (volumeCm3) => {
  // We default to PET because this is a bottle recycling machine
  const weightGrams = volumeCm3 * MATERIAL_DENSITY.PET;
  const gramsPerBottle = 12; 
  const bottlesNeeded = Math.ceil(weightGrams / gramsPerBottle);
  
  return { weightGrams, bottlesNeeded };
};

// --- Components ---

const Header = ({ title }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={styles.avatar}>
      <Ionicons name="person" size={18} color={COLORS.primary} />
    </View>
  </View>
);

const MachineStatusModal = ({ visible, onClose, step }) => {
  // This simulates the "Talk" with the machine
  const steps = {
    1: { text: "Scanning QR Code...", icon: "qrcode-scan" },
    2: { text: "Connecting to Machine...", icon: "wifi" },
    3: { text: "Verifying Weight...", icon: "scale-balance" },
    4: { text: "Material Accepted!", icon: "check-circle", color: COLORS.success },
  };

  const current = steps[step] || steps[1];

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <MaterialCommunityIcons name={current.icon} size={50} color={current.color || COLORS.primary} />
          <Text style={styles.modalText}>{current.text}</Text>
          <ActivityIndicator size="small" color={COLORS.primary} style={{marginTop: 20}} />
        </View>
      </View>
    </Modal>
  );
};

// --- Screen 1: Dashboard ---
const DashboardScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Header title="Re:Print" />
      
      {/* Credits Card */}
      <View style={styles.creditCard}>
        <View>
          <Text style={styles.creditLabel}>Eco Credits</Text>
          <Text style={styles.creditValue}>1,250</Text>
        </View>
        <MaterialCommunityIcons name="recycle" size={40} color="rgba(255,255,255,0.2)" />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
           <Text style={styles.statNumber}>42</Text>
           <Text style={styles.statLabel}>Bottles</Text>
        </View>
        <View style={styles.statBox}>
           <Text style={styles.statNumber}>3.5kg</Text>
           <Text style={styles.statLabel}>CO2 Saved</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Actions</Text>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Print')}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="cube-send" size={24} color={COLORS.primary} />
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.actionTitle}>New Print Job</Text>
          <Text style={styles.actionSub}>Upload STL & Calculate</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Screen 2: Print & Link Logic ---
const PrintScreen = () => {
  const [step, setStep] = useState('upload'); // upload, analyzing, result, qr
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  
  // Simulation State
  const [machineStep, setMachineStep] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleUpload = () => {
    setStep('analyzing');
    setTimeout(() => {
      // Mock Calculation
      const vol = 85.5;
      const calc = calculateMaterial(vol);
      setData({ volume: vol, ...calc });
      setFile({ name: 'Voronoi_Vase.stl' });
      setStep('result');
    }, 1500);
  };

  const generateJob = () => {
    setStep('qr');
  };

  const simulateMachineSync = () => {
    // This function mimics the machine verifying the bottles
    setShowModal(true);
    setMachineStep(1);

    // Sequence of fake events
    setTimeout(() => setMachineStep(2), 1500); // Connected
    setTimeout(() => setMachineStep(3), 3000); // Weighing
    setTimeout(() => setMachineStep(4), 5000); // Accepted
    setTimeout(() => {
      setShowModal(false);
      setMachineStep(0);
      Alert.alert("Success", "The machine has started printing your object!");
      setStep('upload'); // Reset
    }, 6500);
  };

  return (
    <ScrollView style={styles.container}>
      <MachineStatusModal visible={showModal} step={machineStep} />
      <Header title="Print Wizard" />

      {step === 'upload' && (
        <TouchableOpacity style={styles.uploadZone} onPress={handleUpload}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={60} color={COLORS.primary} />
          <Text style={styles.zoneTitle}>Upload 3D Model</Text>
          <Text style={styles.zoneSub}>Supports .STL, .OBJ</Text>
        </TouchableOpacity>
      )}

      {step === 'analyzing' && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Slicing Model...</Text>
          <Text style={styles.loadingSub}>Analyzing geometry density</Text>
        </View>
      )}

      {step === 'result' && data && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Material Breakdown</Text>
            
            {/* Auto-Selected Material */}
            <View style={styles.row}>
              <Text style={styles.label}>Material Type</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>rPET (Recycled)</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Volume</Text>
              <Text style={styles.value}>{data.volume} cm³</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Required Weight</Text>
              <Text style={styles.value}>{data.weightGrams.toFixed(1)}g</Text>
            </View>

            {/* The Big Number */}
            <View style={styles.highlightBox}>
              <Text style={styles.highlightLabel}>YOU NEED TO DEPOSIT</Text>
              <Text style={styles.highlightValue}>{data.bottlesNeeded} BOTTLES</Text>
              <Text style={styles.highlightSub}>Standard 500ml PET Bottles</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={generateJob}>
            <Text style={styles.btnText}>Generate Machine Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'qr' && (
        <View style={styles.centerBox}>
          <Text style={styles.qrTitle}>Scan at Kiosk</Text>
          <Text style={styles.qrSub}>Show this code to the vending machine camera</Text>
          
          <View style={styles.qrContainer}>
            <QRCode 
              value={`{"job":"${file.name}", "bottles":${data.bottlesNeeded}}`} 
              size={200}
              backgroundColor="white"
            />
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Machine will unlock intake door for {data.bottlesNeeded} bottles after scanning.
            </Text>
          </View>

          {/* DEMO BUTTON: Hidden in a "Developer Mode" style or just explicit for demo */}
          <TouchableOpacity style={styles.demoButton} onPress={simulateMachineSync}>
            <Text style={styles.demoText}>[DEMO] Simulate Machine Scan</Text>
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
            let iconName = 'home';
            if (route.name === 'Print') iconName = 'cube';
            return <MaterialCommunityIcons name={iconName} size={28} color={focused ? COLORS.primary : COLORS.textSecondary} />;
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
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50, paddingHorizontal: 20 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  avatar: { width: 35, height: 35, borderRadius: 20, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  
  // Dashboard Styles
  creditCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  creditLabel: { color: '#E6FFFA', fontSize: 14, fontWeight: '600' },
  creditValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { backgroundColor: COLORS.card, width: '48%', padding: 15, borderRadius: 12, alignItems: 'center' },
  statNumber: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: COLORS.textSecondary, fontSize: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actionButton: { backgroundColor: COLORS.card, flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  actionSub: { color: COLORS.textSecondary, fontSize: 12 },

  // Upload/Print Styles
  uploadZone: { height: 300, borderWidth: 2, borderColor: COLORS.card, borderStyle: 'dashed', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  zoneTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  zoneSub: { color: COLORS.textSecondary, marginTop: 5 },
  
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { color: COLORS.text, marginTop: 20, fontSize: 18, fontWeight: 'bold' },
  loadingSub: { color: COLORS.textSecondary, marginTop: 5 },

  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginTop: 10 },
  cardTitle: { color: COLORS.textSecondary, fontSize: 14, textTransform: 'uppercase', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { color: COLORS.text, fontSize: 16 },
  value: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  pill: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pillText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: COLORS.background, marginVertical: 10 },
  
  highlightBox: { backgroundColor: COLORS.background, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: COLORS.primary },
  highlightLabel: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  highlightValue: { color: COLORS.text, fontSize: 28, fontWeight: 'bold', marginVertical: 5 },
  highlightSub: { color: COLORS.textSecondary, fontSize: 12 },

  mainButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // QR Styles
  qrTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  qrSub: { color: COLORS.textSecondary, marginBottom: 30, textAlign: 'center' },
  qrContainer: { padding: 15, backgroundColor: '#fff', borderRadius: 16 },
  infoBox: { flexDirection: 'row', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 15, borderRadius: 12, marginTop: 30, alignItems: 'center' },
  infoText: { color: COLORS.primary, marginLeft: 10, flex: 1 },
  demoButton: { marginTop: 40, padding: 15, borderWidth: 1, borderColor: COLORS.textSecondary, borderRadius: 8, width: '100%', alignItems: 'center' },
  demoText: { color: COLORS.textSecondary, fontFamily: 'monospace' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.card, width: '80%', padding: 30, borderRadius: 20, alignItems: 'center' },
  modalText: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },

  tabBar: { backgroundColor: COLORS.card, borderTopColor: 'transparent', height: 60 },
});