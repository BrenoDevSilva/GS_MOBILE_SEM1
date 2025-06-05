import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Alert, SafeAreaView, ScrollView, Platform } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { salvarEvento, listarEventos, deletarEvento, atualizarEvento } from '../storage/storage';
import HeaderTab from '../components/HeaderTab';
import theme from '../theme';

const LocalizacaoScreen = () => {
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');
  const [eventos, setEventos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const carregarEventos = async () => {
    const dados = await listarEventos();
    setEventos(dados);
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const handleSalvar = async () => {
    if (!bairro.trim() || !cidade.trim()) {
      Alert.alert('Atenção', 'Preencha Bairro e Cidade.');
      return;
    }

    const local = `${bairro.trim()} - ${cidade.trim()}${cep ? ` (CEP: ${cep.trim()})` : ''}`;

    if (editandoId) {
      await atualizarEvento(editandoId, { local });
      setEditandoId(null);
    } else {
      await salvarEvento({ local });
    }

    limparCampos();
    carregarEventos();
  };

  const limparCampos = () => {
    setBairro('');
    setCidade('');
    setCep('');
    setEditandoId(null);
    Keyboard.dismiss();
  };

  const handleEditar = (item) => {
    const [bairroCidade, cepPart] = item.local.split(' (CEP: ');
    const [bairro, cidade] = bairroCidade.split(' - ');

    setBairro(bairro);
    setCidade(cidade);
    setCep(cepPart ? cepPart.replace(')', '') : '');
    setEditandoId(item.id);
  };

  const handleDeletar = async (id) => {
    const resultado = await deletarEvento(id);
    if (resultado) {
      carregarEventos();
    } else {
      Alert.alert('Erro', 'Falha ao excluir o local');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.backgroundLight}]}>
      <HeaderTab />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Cabeçalho Aprimorado */}
        <View style={[styles.headerContainer, {backgroundColor: theme.colors.primary}]}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="map-marked-alt" size={28} color={theme.colors.onPrimary} />
            <MaterialIcons name="location-on" size={28} color={theme.colors.onPrimary} style={styles.secondaryIcon} />
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, {color: theme.colors.onPrimary}]}>Cadastrar Local</Text>
            <Text style={[styles.headerSubtitle, {color: theme.colors.onPrimary}]}>Atingido</Text>
          </View>
          
          <View style={[styles.decorativeLine, {backgroundColor: theme.colors.secondary}]} />
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.cardBackground,
              }
            ]}
            placeholder="Bairro"
            placeholderTextColor={theme.colors.secondaryText}
            value={bairro}
            onChangeText={setBairro}
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.cardBackground,
              }
            ]}
            placeholder="Cidade"
            placeholderTextColor={theme.colors.secondaryText}
            value={cidade}
            onChangeText={setCidade}
          />
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.cardBackground,
              }
            ]}
            placeholder="CEP (opcional)"
            placeholderTextColor={theme.colors.secondaryText}
            value={cep}
            onChangeText={setCep}
            keyboardType="numeric"
          />

          <TouchableOpacity 
            style={[
              styles.button, 
              editandoId 
                ? {backgroundColor: theme.colors.tertiary} 
                : {backgroundColor: theme.colors.secondary}
            ]} 
            onPress={handleSalvar}
          >
            <Text style={styles.buttonText}>
              {editandoId ? 'Atualizar Local' : 'Salvar Local'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de locais registrados */}
        <Text style={[styles.subtitulo, {color: theme.colors.primaryText}]}>
          Locais Registrados:
        </Text>
        
        <View style={styles.listaContainer}>
          {eventos.length === 0 ? (
            <Text style={[styles.textoVazio, {color: theme.colors.secondaryText}]}>
              Nenhum local registrado ainda.
            </Text>
          ) : (
            eventos.map((item) => (
              <View key={item.id} style={[styles.itemLista, {backgroundColor: theme.colors.surface}]}>
                <Text style={[styles.textoLista, {color: theme.colors.text}]}>
                  {item.local}
                </Text>
                <View style={styles.botoesAcao}>
                  <TouchableOpacity
                    style={[styles.botaoAcao, {backgroundColor: theme.colors.primary}]}
                    onPress={() => handleEditar(item)}
                  >
                    <Text style={styles.textoBotaoAcao}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botaoAcao, {backgroundColor: theme.colors.tertiary}]}
                    onPress={() => handleDeletar(item.id)}
                  >
                    <Text style={styles.textoBotaoAcao}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  secondaryIcon: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    opacity: 0.8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: theme.fonts.montserrat,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 22,
    fontFamily: theme.fonts.montserrat,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  decorativeLine: {
    width: 4,
    height: '70%',
    borderRadius: 2,
    marginLeft: 15,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: theme.fonts.montserrat,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: theme.fonts.montserrat,
  },
  subtitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: theme.fonts.montserrat,
    marginBottom: 20,
  },
  listaContainer: {
    gap: 15,
  },
  itemLista: {
    padding: 18,
    borderRadius: 10,
    borderLeftWidth: 5,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  textoLista: {
    fontSize: 17,
    fontFamily: theme.fonts.montserrat,
    marginBottom: 10,
  },
  botoesAcao: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  botaoAcao: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  textoBotaoAcao: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.montserrat,
    fontSize: 15,
    fontWeight: '600',
  },
  textoVazio: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: theme.fonts.montserrat,
    marginTop: 20,
    fontSize: 16,
  },
});

export default LocalizacaoScreen;