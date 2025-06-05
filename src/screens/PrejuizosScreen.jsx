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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const PrejuizosScreen = () => {
  const [eventos, setEventos] = useState([]);
  const [prejuizo, setPrejuizo] = useState('');
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

  const salvarPrejuizo = async () => {
    if (!eventoSelecionado || !prejuizo.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o valor do prejuízo.');
      return;
    }

    try {
      const novosEventos = eventos.map(e =>
        e.id === eventoSelecionado.id ? { ...e, prejuizo: prejuizo.trim() } : e
      );

      await AsyncStorage.setItem('eventos', JSON.stringify(novosEventos));
      setEventos(novosEventos);
      setEventoSelecionado(null);
      setPrejuizo('');
      Keyboard.dismiss();
      Alert.alert('Sucesso', 'Prejuízo registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar prejuízo:', error);
      Alert.alert('Erro', 'Não foi possível salvar o prejuízo.');
    }
  };

  const handleEditar = (item) => {
    setEventoSelecionado(item);
    setPrejuizo(item.prejuizo || '');
    
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const limparSelecao = () => {
    setEventoSelecionado(null);
    setPrejuizo('');
    Keyboard.dismiss();
  };

  const formatarPrejuizo = (valor) => {
    if (!valor) return 'Não informado';
    return `R$ ${valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
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
        {/* Cabeçalho Diferenciado */}
        <View style={styles.headerContainer}>
          <View style={styles.headerIconContainer}>
            <Icon 
              name="cash-remove" 
              size={40} 
              color={theme.colors.deleteButton || '#FF5555'} 
            />
          </View>
          <Text style={styles.title}>Registro de</Text>
          <Text style={styles.titleBold}>Prejuízos</Text>
          <Text style={styles.headerSubtitle}>Informe os danos financeiros causados</Text>
        </View>

        {eventoSelecionado && (
          <View style={styles.formCard}>
            <Text style={styles.selectedLocal}>
              Local: <Text style={styles.localName}>{eventoSelecionado.local}</Text>
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>R$</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Valor do prejuízo"
                placeholderTextColor={theme.colors.placeholderText || '#C0C0C0'}
                value={prejuizo}
                onChangeText={(text) => {
                  // Permite apenas números e vírgula
                  const formatted = text.replace(/[^0-9,]/g, '');
                  setPrejuizo(formatted);
                }}
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={salvarPrejuizo}
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={salvarPrejuizo}
              >
                <Text style={styles.buttonText}>
                  {eventoSelecionado.prejuizo ? 'Atualizar' : 'Salvar'}
                </Text>
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

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Locais com Prejuízos</Text>
          <View style={styles.listHeaderLine} />
        </View>

        {eventos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle-outline" size={40} color={theme.colors.secondaryText} />
            <Text style={styles.emptyText}>Nenhum local registrado ainda.</Text>
          </View>
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.eventItem,
                item.prejuizo && styles.eventItemWithDamage
              ]}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventText}>{item.local}</Text>
                  <Text style={[
                    styles.prejuizoText,
                    !item.prejuizo && styles.prejuizoEmpty
                  ]}>
                    {formatarPrejuizo(item.prejuizo)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.smallButton,
                    item.prejuizo ? styles.editButton : styles.addButton
                  ]}
                  onPress={() => handleEditar(item)}
                >
                  <Icon 
                    name={item.prejuizo ? "pencil" : "plus"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
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
    paddingHorizontal: 15,
    paddingTop: 10,
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
    paddingVertical: 25,
    backgroundColor: theme.colors.surface || '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 5,
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
  headerIconContainer: {
    backgroundColor: 'rgba(255, 85, 85, 0.1)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    color: theme.colors.primaryText || '#2C0D46',
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },
  titleBold: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.deleteButton || '#FF5555',
    fontFamily: 'Montserrat',
    textAlign: 'center',
    marginTop: -5,
  },
  headerSubtitle: {
    color: theme.colors.secondaryText,
    fontFamily: 'Montserrat',
    fontSize: 14,
    marginTop: 8,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground || '#F8F8F8',
    borderColor: theme.colors.inputBorder || '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  currencyPrefix: {
    color: theme.colors.text || '#333333',
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: theme.colors.text || '#333333',
    fontSize: 16,
    fontFamily: 'Montserrat',
    paddingVertical: 15,
  },
  buttonGroup: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: theme.colors.deleteButton || '#FF5555',
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.secondaryText || '#999999',
    borderWidth: 1,
    flex: 1,
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
  listHeader: {
    marginBottom: 15,
    paddingLeft: 10,
  },
  listHeaderText: {
    fontSize: 18,
    fontFamily: 'Montserrat',
    color: theme.colors.primaryText || '#2C0D46',
    fontWeight: 'bold',
  },
  listHeaderLine: {
    width: 50,
    height: 3,
    backgroundColor: theme.colors.deleteButton || '#FF5555',
    marginTop: 5,
    borderRadius: 2,
  },
  eventItem: {
    backgroundColor: theme.colors.surface || '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
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
  eventItemWithDamage: {
    borderLeftColor: theme.colors.deleteButton || '#FF5555',
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
  prejuizoText: {
    color: theme.colors.deleteButton || '#FF5555',
    fontFamily: 'Montserrat',
    fontSize: 15,
    fontWeight: 'bold',
  },
  prejuizoEmpty: {
    color: theme.colors.secondaryText || '#999999',
    fontStyle: 'italic',
    fontWeight: 'normal',
  },
  smallButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addButton: {
    backgroundColor: theme.colors.secondary || '#6FCF97',
  },
  editButton: {
    backgroundColor: theme.colors.tertiary || '#663399',
  },
  emptyContainer: {
    backgroundColor: theme.colors.surface || '#FFFFFF',
    borderRadius: 12,
    padding: 30,
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
    marginTop: 10,
    textAlign: 'center',
  },
});

export default PrejuizosScreen;