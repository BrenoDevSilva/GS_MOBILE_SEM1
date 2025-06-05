import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderTab from '../components/HeaderTab';
import theme from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Função auxiliar para parsear a string de localização
const parseLocalString = (localString) => {
  let bairro = 'Não informado';
  let cidade = 'Não informado';
  let cep = ''; // Inicializa como vazio para verificar se há CEP

  const parts = localString.split(' - ');
  if (parts.length >= 2) {
    bairro = parts[0].trim();
    let cidadePart = parts[1].trim();
    const cepMatch = cidadePart.match(/\(CEP:\s*(.*?)\)/); // Procura por "(CEP: ...)"
    if (cepMatch && cepMatch[1]) {
      cep = cepMatch[1].trim();
      cidade = cidadePart.replace(cepMatch[0], '').trim(); // Remove o CEP da string da cidade
    } else {
      cidade = cidadePart;
    }
  }
  return { bairro, cidade, cep: cep || 'Não informado' }; // Retorna 'Não informado' se o CEP for vazio
};

// Funções de formatação (copiadas das outras telas para consistência)
const formatarPrejuizo = (valor) => {
  if (!valor || valor.trim() === '') return 'Não informado';
  // Remove qualquer 'R$', espaços e substitui vírgula por ponto para garantir o float
  const valorLimpo = String(valor).replace(/[^0-9,.]/g, '').replace(',', '.');
  const valorNumerico = parseFloat(valorLimpo);
  if (isNaN(valorNumerico)) return 'Formato inválido';
  // Formata para BRL com 2 casas decimais e separador de milhar
  return `R$ ${valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatarTempo = (tempo) => {
  if (!tempo || tempo.trim() === '') return 'Não informado';
  return tempo; // O tempo já deve estar em um formato legível (ex: "2h30", "45min")
};

const PanoramaScreen = () => {
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPrejuizo, setTotalPrejuizo] = useState('0,00');
  const [locaisComPrejuizo, setLocaisComPrejuizo] = useState(0);
  const [locaisSemPrejuizo, setLocaisSemPrejuizo] = useState(0);
  const [mediaTempoInterrupcao, setMediaTempoInterrupcao] = useState('N/A');
  const [totalLocais, setTotalLocais] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        await carregarDadosDoPanorama();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const carregarDadosDoPanorama = async () => {
    try {
      const dados = await AsyncStorage.getItem('eventos');
      if (dados) {
        const parsedEventos = JSON.parse(dados);
        setEventos(parsedEventos);
        calcularResumo(parsedEventos);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos para o panorama:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados para o panorama.');
    }
  };

  const calcularResumo = (eventosData) => {
    let somaPrejuizos = 0;
    let countComPrejuizo = 0;
    let countSemPrejuizo = 0;
    let totalMinutosInterrupcao = 0;
    let countTemposValidos = 0;

    eventosData.forEach(evento => {
      // Cálculo de Prejuízos
      if (evento.prejuizo) {
        // Remove 'R$', '.' e substitui ',' por '.' para parsear como float
        const valorNumerico = parseFloat(String(evento.prejuizo).replace('R$', '').replace(/\./g, '').replace(',', '.'));
        if (!isNaN(valorNumerico)) {
          somaPrejuizos += valorNumerico;
          countComPrejuizo++;
        } else {
          countSemPrejuizo++;
        }
      } else {
        countSemPrejuizo++;
      }

      // Cálculo de Tempo de Interrupção
      if (evento.tempo) {
        const tempoStr = evento.tempo.toLowerCase();
        let minutosAtuais = 0;

        const horasMatch = tempoStr.match(/(\d+)\s*h/);
        if (horasMatch) {
          minutosAtuais += parseInt(horasMatch[1]) * 60;
        }

        const minutosMatch = tempoStr.match(/(\d+)\s*min/);
        if (minutosMatch) {
          minutosAtuais += parseInt(minutosMatch[1]);
        } else {
            // Tenta pegar minutos se for apenas número e não tiver 'h' ou 'min' e não houver 'horas' já capturado
            const apenasNumeros = parseInt(tempoStr.replace(/\D/g, ''));
            if (!isNaN(apenasNumeros) && !horasMatch && !tempoStr.includes('horas')) { // Se for só número e não tiver 'h', assume minutos
                minutosAtuais += apenasNumeros;
            }
        }
        
        // Se a string contiver 'horas' e não houver 'h' explícito, tentar capturar
        const horasExtensoMatch = tempoStr.match(/(\d+)\s*horas?/);
        if (horasExtensoMatch && !horasMatch) {
            minutosAtuais += parseInt(horasExtensoMatch[1]) * 60;
        }

        if (minutosAtuais > 0) {
          totalMinutosInterrupcao += minutosAtuais;
          countTemposValidos++;
        }
      }
    });

    setTotalPrejuizo(somaPrejuizos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setLocaisComPrejuizo(countComPrejuizo);
    setLocaisSemPrejuizo(countSemPrejuizo);
    setTotalLocais(eventosData.length);

    if (countTemposValidos > 0) {
      const mediaMinutos = totalMinutosInterrupcao / countTemposValidos;
      const horas = Math.floor(mediaMinutos / 60);
      const minutos = Math.round(mediaMinutos % 60);
      let mediaFormatada = '';
      if (horas > 0) mediaFormatada += `${horas}h`;
      if (minutos > 0) mediaFormatada += `${minutos}min`;
      if (horas === 0 && minutos === 0 && totalMinutosInterrupcao > 0) mediaFormatada = '0min'; // Para casos de arredondamento para 0
      setMediaTempoInterrupcao(mediaFormatada || 'N/A');
    } else {
      setMediaTempoInterrupcao('N/A');
    }
  };

  // Pega os últimos 5 eventos e reverte para mostrar o mais recente primeiro
  const lastFiveEvents = eventos.slice(-5).reverse();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HeaderTab />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando panorama...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderTab />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Icon name="chart-bar" size={40} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Panorama Geral</Text>
          <Text style={styles.headerSubtitle}>Resumo dos eventos de falta de energia</Text>
        </View>

        <View style={styles.cardContainer}>
          {/* Cartão de Prejuízo Total */}
          <View style={[styles.infoCard, { borderColor: theme.colors.deleteButton }]}>
            <Icon name="cash-multiple" size={30} color={theme.colors.deleteButton} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Prejuízo Total</Text>
            <Text style={[styles.cardValue, { color: theme.colors.deleteButton }]}>R$ {totalPrejuizo}</Text>
          </View>

          {/* Cartão de Média de Tempo de Interrupção */}
          <View style={[styles.infoCard, { borderColor: theme.colors.tertiary }]}>
            <Icon name="timer-sand" size={30} color={theme.colors.tertiary} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Média Interrupção</Text>
            <Text style={[styles.cardValue, { color: theme.colors.tertiary }]}>{mediaTempoInterrupcao}</Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          {/* Cartão de Locais Registrados */}
          <View style={[styles.infoCard, { borderColor: theme.colors.secondary }]}>
            <Icon name="map-marker-multiple" size={30} color={theme.colors.secondary} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Total de Locais</Text>
            <Text style={[styles.cardValue, { color: theme.colors.secondary }]}>{totalLocais}</Text>
          </View>

          {/* Cartão de Locais com/sem Prejuízo */}
          <View style={[styles.infoCard, { borderColor: theme.colors.primary }]}>
            <Icon name="check-circle-outline" size={30} color={theme.colors.success} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Com Prejuízo: {locaisComPrejuizo}</Text>
            <Icon name="alert-circle-outline" size={30} color={theme.colors.warning} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Sem Prejuízo: {locaisSemPrejuizo}</Text>
          </View>
        </View>

        {eventos.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Icon name="information-outline" size={50} color={theme.colors.secondaryText} />
                <Text style={styles.emptyText}>Nenhum evento registrado ainda para exibir o panorama.</Text>
            </View>
        ) : (
            <>
                <Text style={styles.latestRecordsSectionTitle}>Últimos 5 Registros</Text>
                <View style={styles.latestRecordsContainer}>
                    {lastFiveEvents.map((item) => {
                        const { bairro, cidade, cep } = parseLocalString(item.local);
                        return (
                            <View key={item.id} style={styles.recordItem}>
                                <Text style={styles.recordDetailText}><Text style={styles.recordLabel}>Bairro:</Text> {bairro}</Text>
                                <Text style={styles.recordDetailText}><Text style={styles.recordLabel}>Cidade:</Text> {cidade}</Text>
                                <Text style={styles.recordDetailText}>
                                    <Text style={styles.recordLabel}>CEP:</Text> {cep === 'Não informado' ? <Text style={styles.recordEmptyMessage}>Não informado</Text> : cep}
                                </Text>
                                <Text style={styles.recordDetailText}>
                                    <Text style={styles.recordLabel}>Tempo Interrupção:</Text> {formatarTempo(item.tempo)}
                                </Text>
                                <Text style={styles.recordDetailText}>
                                    <Text style={styles.recordLabel}>Prejuízo:</Text> {formatarPrejuizo(item.prejuizo)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    fontFamily: theme.fonts.montserrat,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primaryText,
    fontFamily: theme.fonts.montserrat,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.secondaryText,
    fontFamily: theme.fonts.montserrat,
    marginTop: 5,
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    gap: 15,
  },
  infoCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primaryText,
    fontFamily: theme.fonts.montserrat,
    textAlign: 'center',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: theme.fonts.montserrat,
    marginTop: 5,
  },
  emptyContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    width: '100%',
    ...Platform.select({
        ios: {
            shadowColor: theme.colors.shadow,
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
    color: theme.colors.secondaryText,
    fontStyle: 'italic',
    fontSize: 16,
    fontFamily: theme.fonts.montserrat,
    marginTop: 10,
    textAlign: 'center',
  },
  // NOVOS ESTILOS PARA OS ÚLTIMOS REGISTROS
  latestRecordsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primaryText,
    fontFamily: theme.fonts.montserrat,
    marginTop: 30,
    marginBottom: 20,
    alignSelf: 'flex-start', // Alinha o título à esquerda
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    paddingBottom: 5,
  },
  latestRecordsContainer: {
    width: '100%',
    gap: 15, // Espaçamento entre os itens
  },
  recordItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.secondary, // Uma cor para diferenciar os itens
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  recordDetailText: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: theme.fonts.montserrat,
    marginBottom: 5,
  },
  recordLabel: {
    fontWeight: 'bold',
    color: theme.colors.primaryText,
  },
  recordEmptyMessage: {
    fontStyle: 'italic',
    color: theme.colors.secondaryText,
    fontSize: 14, // Um pouco menor para as mensagens de "não informado"
  },
});

export default PanoramaScreen;