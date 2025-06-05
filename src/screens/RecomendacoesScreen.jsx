import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import HeaderTab from '../components/HeaderTab';
import theme from '../theme'; // Importa seu arquivo de tema

const groupedTips = {
  'Antes do Apagão': [
    'Tenha lanternas com pilhas novas e carregadas.',
    'Mantenha o celular carregado sempre que possível.',
    'Tenha um kit de emergência com velas, fósforos e baterias.',
  ],
  'Durante o Apagão': [
    'Evite abrir a geladeira ou o freezer.',
    'Desligue aparelhos eletrônicos da tomada.',
    'Use luzes de LED ou lanternas para iluminação segura.',
  ],
  'Depois do Apagão': [
    'Verifique a integridade dos alimentos refrigerados.',
    'Reconecte os aparelhos aos poucos para evitar sobrecarga.',
    'Informe quedas ou danos à concessionária local.',
  ],
};

const RecomendacoesScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* O HeaderTab está aqui e o SafeAreaView dele já gerencia o topo */}
      <HeaderTab /> 
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Card para o texto introdutório - com visual aprimorado */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Como se preparar e reagir durante apagões</Text>
          <Text style={styles.introText}>
            Apagões podem afetar não só nossa rotina, mas também a segurança e bem-estar de muitas pessoas. Imagine um idoso em casa sozinho, uma criança com medo no escuro ou até um paciente em um hospital sem energia imediata.
            {'\n\n'}
            Pensando nisso, reunimos algumas recomendações práticas que podem ajudar você, sua família e sua comunidade a lidar melhor com essas situações. Compartilhe essas informações e ajude a proteger quem você ama.
          </Text>
        </View>

        {Object.entries(groupedTips).map(([sectionTitle, tips]) => (
          <View key={sectionTitle} style={styles.section}>
            {/* Título da seção com fundo e texto mais coesos */}
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>

            {/* Cada dica individual - cards mais distintos e com sombra */}
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipBox}>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // Deixando o fundo do safeArea mais claro para o scrollContent ser a cor principal da página
    backgroundColor: theme.colors.backgroundLight || '#F0F2F5', // Um cinza/branco bem suave
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    // Removendo o paddingTop daqui, pois o HeaderTab já adiciona o padding superior.
    // Se o conteúdo estiver muito perto do header, podemos ajustar um marginBottom no introCard.
    paddingTop: 15, // Mantenho este padding para afastar o introCard do topo do ScrollView
    paddingBottom: 30, // Mais espaço no final da tela
  },
  
  // Card Introdutório - Melhorias na sombra e borda para um look mais premium
  introCard: {
    backgroundColor: theme.colors.surface || '#FFFFFF', // Cor de superfície clara
    borderRadius: 15, // Cantos ligeiramente mais arredondados
    padding: 25, // Aumentar o padding interno
    marginBottom: 30, // Mais espaçamento abaixo
    
    // Sombra mais profunda e suave
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000', 
        shadowOffset: { width: 0, height: 6 }, // Aumentar a profundidade
        shadowOpacity: 0.15, // Um pouco mais opaca
        shadowRadius: 10, // Sombra mais espalhada e suave
      },
      android: {
        elevation: 12, // Elevação Android mais proeminente
      },
    }),
    borderWidth: 0, // Removendo a borda para um look mais limpo, confiando na sombra
  },
  introTitle: {
    fontSize: 24, // Título um pouco maior
    fontWeight: 'bold',
    marginBottom: 18, // Mais espaço abaixo do título
    color: theme.colors.primaryText || '#2C0D46', // Cor primária para o texto
    fontFamily: 'Montserrat', 
    textAlign: 'center',
    lineHeight: 30, // Melhorar o espaçamento entre linhas
  },
  introText: {
    fontSize: 16,
    color: theme.colors.secondaryText || '#555555', // Uma cor de texto mais suave para o corpo
    fontFamily: 'Montserrat',
    lineHeight: 24, // Ajustar lineHeight para melhor legibilidade
    textAlign: 'justify',
  },

  section: {
    marginBottom: 30, // Mais espaço entre as seções
  },
  // Título da seção com fundo mais integrado e alinhamento
  sectionTitle: {
    fontSize: 20, // Título da seção um pouco maior
    fontWeight: 'bold',
    marginBottom: 20, // Mais espaço abaixo do título da seção
    color: theme.colors.onPrimary || '#FFFFFF', // Cor de texto que contrasta com o fundo
    backgroundColor: theme.colors.primary || '#2C0D46', // Cor principal do tema
    paddingVertical: 12, // Aumentar padding vertical
    paddingHorizontal: 20, // Aumentar padding horizontal
    borderRadius: 10, // Cantos mais arredondados
    alignSelf: 'flex-start', // Garante que o fundo cubra apenas o texto
    // marginLeft: -5, // Isso pode ser ajustado se o paddingHorizontal do scrollContent for fixo.
                      // Vamos ajustar o padding aqui para não precisar de marginLeft negativo.
    // Sem sombra aqui para não competir com a sombra do introCard, mas você pode adicionar se quiser
  },
  
  // Caixas de Dicas - Visual mais leve e com contraste
  tipBox: {
    backgroundColor: theme.colors.cardBackground || '#E0E0E0', // Um cinza claro para o fundo da dica
    borderRadius: 12,
    padding: 18, // Aumentar um pouco o padding
    marginBottom: 15, // Um pouco mais de espaço entre as dicas
    
    // Sombra mais sutil para as dicas
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow || '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08, // Mais suave
        shadowRadius: 5,
      },
      android: {
        elevation: 6, // Elevação Android
      },
    }),
    borderWidth: 0, // Removendo borda
  },
  tipText: {
    fontSize: 16, // Texto da dica um pouco maior
    color: theme.colors.text || '#333333', // Cor de texto principal para as dicas
    fontFamily: 'Montserrat',
    lineHeight: 22, // Melhorar espaçamento entre linhas
    textAlign: 'left',
  },
});

export default RecomendacoesScreen;