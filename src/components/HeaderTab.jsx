import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, Entypo, FontAwesome } from '@expo/vector-icons';

const HeaderTabs = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { name: 'Panorama', label: 'Panorama', icon: Entypo, iconName: 'globe' },
    { name: 'Localizacao', label: 'Localização', icon: Entypo, iconName: 'location-pin' },
    { name: 'Tempo', label: 'Tempo de Interrupção', icon: Entypo, iconName: 'clock' },
    { name: 'Prejuizos', label: 'Prejuízos', icon: MaterialCommunityIcons, iconName: 'tools' },
    { name: 'Recomendacoes', label: 'Sugestões', icon: FontAwesome, iconName: 'thumbs-up' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = route.name === tab.name;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tabItem,
                isActive && styles.activeTabItem
              ]}
              onPress={() => navigation.navigate(tab.name)}
            >
              <IconComponent
                name={tab.iconName}
                size={25}
                color={'#FFFFFF'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#2C0D46', // A mesma cor roxa escura do container do header
    zIndex: 9999, // Adicionado para garantir que fique na frente de outros elementos
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#2C0D46', // Fundo roxo escuro para a barra
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 25, // Cantos arredondados para a barra inteira
    marginHorizontal: 10,
    height: 120, // Mantendo a altura com padding superior
    overflow: 'hidden', // Mantido, mas pode ser removido se causar problemas futuros
    paddingTop: 30, // Mantendo o paddingTop
    zIndex: 9999, // Adicionado para garantir que fique na frente
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(0,0,0,0.3)', // Fundo escuro transparente para as abas
    borderRadius: 20, // Cantos arredondados para a "pílula" de cada aba
    height: '90%',
    marginHorizontal: 2,
  },
  activeTabItem: {
    backgroundColor: '#6FCF97', // A aba ativa muda para verde
  },
});

export default HeaderTabs;