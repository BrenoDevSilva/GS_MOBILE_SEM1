import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  Alert,
  Keyboard,
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderTab from '../components/HeaderTab';
import theme from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Certifique-se de instalar o pacote
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TempoScreen = () => {
  const [eventos, setEventos] = useState([]);
  const [tempo, setTempo] = useState('');
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        await carregarEventos();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const carregarEventos = async () => {
    try {
      const dados = await AsyncStorage.getItem('eventos');
      if (dados) {
        setEventos(JSON.parse(dados));
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os locais registrados.');
      throw error;
    }
  };

  const salvarTempo = async () => {
    if (!eventoSelecionado || !tempo.trim()) {
      Alert.alert('Atenção', 'Por favor, informe um tempo válido (ex: 2h30).');
      return;
    }

    try {
      const novosEventos = eventos.map(e =>
        e.id === eventoSelecionado.id ? { ...e, tempo: tempo.trim() } : e
      );

      await AsyncStorage.setItem('eventos', JSON.stringify(novosEventos));
      setEventos(novosEventos);
      setEventoSelecionado(null);
      setTempo('');
      Keyboard.dismiss();
      Alert.alert('Sucesso', 'Tempo de interrupção salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar tempo:', error);
      Alert.alert('Erro', 'Não foi possível salvar o tempo de interrupção.');
    }
  };

  const handleEditar = (item) => {
    setEventoSelecionado(item);
    setTempo(item.tempo || '');
    
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const limparSelecao = () => {
    setEventoSelecionado(null);
    setTempo('');
    Keyboard.dismiss();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderTab />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderTab />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho Aprimorado */}
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F5']}
          style={styles.headerContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Icon 
            name="clock-outline" 
            size={36} 
            color={theme.colors.tertiary} 
            style={styles.titleIcon}
          />
          <Text style={styles.title}>Tempo de</Text>
          <Text style={styles.titleBold}>Interrupção</Text>
          <View style={styles.titleUnderline} />
        </LinearGradient>

        {eventoSelecionado && (
          <View style={styles.formCard}>
            <Text style={styles.selectedLocal}>
              Local: <Text style={styles.localName}>{eventoSelecionado.local}</Text>
            </Text>
            
            <Text style={styles.label}>Tempo de interrupção:</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ex: 2h30, 45min, 3 horas"
              placeholderTextColor={theme.colors.placeholderText || '#C0C0C0'}
              value={tempo}
              onChangeText={setTempo}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={salvarTempo}
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={salvarTempo}
              >
                <Text style={styles.buttonText}>Salvar Tempo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={limparSelecao}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.subtitle}>Locais Registrados</Text>

        {eventos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum local registrado ainda.</Text>
          </View>
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventText}>{item.local}</Text>
                  <Text style={[
                    styles.timeText,
                    !item.tempo && styles.timeEmpty
                  ]}>
                    {item.tempo || 'Tempo não informado'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.smallButton, styles.infoButton]}
                  onPress={() => handleEditar(item)}
                >
                  <Text style={styles.smallButtonText}>
                    {item.tempo ? 'Editar' : 'Informar'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight || '#F0F2F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    fontFamily: 'Montserrat',
  },
  headerContainer: {
    marginBottom: 25,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  titleIcon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: theme.colors.primaryText || '#2C0D46',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleBold: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.tertiary || '#663399',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginTop: -8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleUnderline: {
    width: width * 0.3,
    height: 4,
    backgroundColor: theme.colors.secondary || '#6FCF97',
    marginTop: 12,
    borderRadius: 2,
  },
  formCard: {
    backgroundColor: theme.colors.surface || '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  selectedLocal: {
    color: theme.colors.primaryText,
    fontFamily: 'Montserrat',
    fontSize: 16,
    marginBottom: 15,
  },
  localName: {
    fontWeight: 'bold',
  },
  label: {
    color: theme.colors.primaryText,
    fontFamily: 'Montserrat',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.inputBackground || '#F8F8F8',
    borderColor: theme.colors.inputBorder || '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: theme.colors.text || '#333333',
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
  buttonGroup: {
    marginTop: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saveButton: {
    backgroundColor: theme.colors.tertiary || '#663399',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.secondaryText || '#999999',
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Montserrat',
  },
  cancelButtonText: {
    color: theme.colors.secondaryText || '#666666',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Montserrat',
    color: theme.colors.primaryText || '#2C0D46',
    marginBottom: 15,
    fontWeight: 'bold',
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  eventItem: {
    backgroundColor: theme.colors.surface || '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventText: {
    color: theme.colors.text || '#333333',
    fontFamily: 'Montserrat',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  timeText: {
    color: theme.colors.secondary || '#6FCF97',
    fontFamily: 'Montserrat',
    fontSize: 14,
  },
  timeEmpty: {
    color: theme.colors.secondaryText || '#999999',
    fontStyle: 'italic',
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoButton: {
    backgroundColor: theme.colors.secondary || '#6FCF97',
  },
  emptyContainer: {
    backgroundColor: theme.colors.surface || '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyText: {
    color: theme.colors.secondaryText || '#666666',
    fontStyle: 'italic',
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
});

export default TempoScreen;