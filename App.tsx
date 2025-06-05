import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PanoramaScreen from './src/screens/PanoramaScreen';
import LocalizacaoScreen from './src/screens/LocalizacaoScreen';
import TempoScreen from './src/screens/TempoScreen';
import PrejuizosScreen from './src/screens/PrejuizosScreen';
import RecomendacoesScreen from './src/screens/RecomendacoesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Panorama">
          <Stack.Screen name="Panorama" component={PanoramaScreen} />
          <Stack.Screen name="Localizacao" component={LocalizacaoScreen} />
          <Stack.Screen name="Tempo" component={TempoScreen} />
          <Stack.Screen name="Prejuizos" component={PrejuizosScreen} />
          <Stack.Screen name="Recomendacoes" component={RecomendacoesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
