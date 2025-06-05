# 🔌 Blackout Guardian

Aplicativo React Native que registra e gerencia informações sobre apagões em regiões brasileiras, promovendo segurança, organização e orientação à população.

## 📱 Sobre o Projeto

**Blackout Guardian** é um app mobile desenvolvido como solução para situações de falta de energia causadas por eventos naturais como chuvas, ventos fortes ou deslizamentos. A plataforma permite registrar localidades afetadas, tempos de interrupção e prejuízos, além de exibir recomendações práticas antes, durante e após apagões.

## 👨‍💻 Integrantes do Grupo

| Nome                          | RM      |
|-------------------------------|---------|
| Anna Heloisa Soto Yagyu       | 550360  |
| Breno da Silva Santos         | 99275   |
| Gustavo Kawamura Christofani | 99679   |

## 📋 Funcionalidades

- 📍 **Localização Atingida**  
  Registre bairro, cidade e CEP afetados por um apagão.

- ⏱️ **Tempo de Interrupção**  
  Informe a duração do tempo sem energia em cada local registrado.

- 💸 **Prejuízos Causados**  
  Registre prejuízos financeiros, como danos a eletrodomésticos ou paralisação de negócios.

- 📊 **Panorama Geral**  
  Visualize os últimos registros, tempo médio de interrupção, número de locais afetados e prejuízo total estimado.

- 💡 **Sugestões e Recomendações**  
  Lista de boas práticas antes, durante e após um apagão, com foco em segurança, prevenção e orientação.

## 🛠️ Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation](https://reactnavigation.org/)
- [Icons - Vector Icons](https://github.com/oblador/react-native-vector-icons)

## 🧠 Organização do Código

```
/BlackoutGuardianMobile
│
├── /src
│   ├── /components        → HeaderTab (navegação inferior)
│   ├── /screens           → Panorama, Localização, Tempo, Prejuízos, Recomendações
│   ├── /storage           → Funções de manipulação com AsyncStorage
│   ├── /theme.js          → Paleta de cores e fonte global
│   └── App.jsx            → Configuração de navegação
│
├── assets/                → Imagens e ícones
├── package.json
└── README.md
```

## 📦 Estrutura de Dados

```json
{
  "id": "uuid",
  "data": "2025-06-04T14:22:00.000Z",
  "local": "Bairro - Cidade (CEP: 00000-000)",
  "tempo": "2h30",
  "prejuizo": "1500,00"
}
```

## ✅ Critérios Atendidos

| Critério                                            | Status |
|-----------------------------------------------------|--------|
| Telas funcionais com navegação                      | ✅     |
| Fluxo de cadastro e listagem de eventos             | ✅     |
| Armazenamento local com AsyncStorage                | ✅     |
| Interface clara e coesa                             | ✅     |
| Código organizado, comentado e reutilizável         | ✅     |

## 🧪 Como Rodar o Projeto

```bash
npm install
npx expo start
```

> Recomendado utilizar o **Expo Go** no celular ou emulador Android/iOS configurado.
