import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export const salvarEvento = async (evento) => {
  try {
    const eventos = await listarEventos();
    const novoEvento = { id: uuidv4(), ...evento };
    const atualizado = [...eventos, novoEvento];
    await AsyncStorage.setItem('eventos', JSON.stringify(atualizado));
    return novoEvento;
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
  }
};

export const listarEventos = async () => {
  try {
    const eventos = await AsyncStorage.getItem('eventos');
    return eventos ? JSON.parse(eventos) : [];
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return [];
  }
};

export const deletarEvento = async (id) => {
  try {
    const eventos = await listarEventos();
    console.log('[DEBUG] ID a ser deletado:', id);
    console.log('[DEBUG] Lista atual de eventos:', eventos);

    const eventosAtualizados = eventos.filter(evento => String(evento.id) !== String(id));

    console.log('[DEBUG] Lista após deletar:', eventosAtualizados);

    await AsyncStorage.setItem('eventos', JSON.stringify(eventosAtualizados));
    return true;
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    return false;
  }
};


export const atualizarEvento = async (id, novosDados) => {
  try {
    const eventos = await listarEventos();
    const atualizado = eventos.map(evento =>
      evento.id === id ? { ...evento, ...novosDados } : evento
    );
    await AsyncStorage.setItem('eventos', JSON.stringify(atualizado));
    return true;
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return false;
  }
};