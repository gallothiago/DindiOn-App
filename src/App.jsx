// src/App.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Importa apenas a instância de autenticação do Firebase
import './index.css'; // Importa o arquivo CSS para estilização (inclui Tailwind)

// Importa os novos componentes
import Auth from './components/Auth';
import ApplicationPage from './pages/ApplicationPage';
import CreditCardExpensesPage from './pages/CreditCardExpensesPage';
import AllExpensesPage from './pages/AllExpensesPage';

// Componente principal da aplicação (gerencia a autenticação e renderiza as páginas)
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('main'); // 'main', 'card-details', 'all-expenses'
  const [selectedCardDetails, setSelectedCardDetails] = useState(null); // { id, name } do cartão selecionado

  // useEffect para observar mudanças no estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Função para lidar com o logout do usuário
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentPage('main'); // Volta para a página principal após logout
      setSelectedCardDetails(null); // Limpa detalhes do cartão
    } catch (error) {
      console.error('Erro ao fazer logout:', error.message);
    }
  };

  // Função para navegar para a página de despesas de um cartão específico
  const handleViewCardExpenses = (cardId, cardName) => {
    setSelectedCardDetails({ id: cardId, name: cardName });
    setCurrentPage('card-details');
  };

  // Função para navegar para a página de todas as despesas
  const handleViewAllExpenses = () => {
    setCurrentPage('all-expenses');
  };

  // Função para voltar para a página principal
  const handleBackToMain = () => {
    setCurrentPage('main');
    setSelectedCardDetails(null);
  };

  // Exibe um indicador de carregamento enquanto o estado de autenticação está sendo verificado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <div className="text-xl font-semibold text-gray-700">Carregando...</div>
      </div>
    );
  }

  // Renderiza a página apropriada com base no currentPage
  if (user) {
    switch (currentPage) {
      case 'main':
        return (
          <ApplicationPage
            user={user}
            onLogout={handleLogout}
            onViewCardExpenses={handleViewCardExpenses}
            onViewAllExpenses={handleViewAllExpenses}
          />
        );
      case 'card-details':
        return (
          <CreditCardExpensesPage
            user={user}
            cardId={selectedCardDetails.id}
            cardName={selectedCardDetails.name}
            onBack={handleBackToMain}
            onLogout={handleLogout}
          />
        );
      case 'all-expenses':
        return (
          <AllExpensesPage
            user={user}
            onBack={handleBackToMain}
            onLogout={handleLogout}
          />
        );
      default:
        return <ApplicationPage user={user} onLogout={handleLogout} onViewCardExpenses={handleViewCardExpenses} onViewAllExpenses={handleViewAllExpenses} />;
    }
  }

  // Se não houver usuário logado, mostra a tela de autenticação
  return <Auth onLoginSuccess={() => {}} />;
}

export default App;