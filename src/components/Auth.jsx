// src/components/Auth.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Importa a instância de autenticação do Firebase

// Componente para a tela de Autenticação (Login e Registro)
const Auth = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  // Referência para o botão principal para poder "clicá-lo" via código
  const mainButtonRef = React.useRef(null);

  const handleLogin = async () => {
    try {
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      if (err.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou senha incorretos.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      console.error('Erro de login:', err.message);
    }
  };

  const handleRegister = async () => {
    try {
      setError('');
      await createUserWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao registrar. Tente novamente.');
      }
      console.error('Erro de registro:', err.message);
    }
  };

  // Função para lidar com a tecla "Enter" nos inputs
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      // Impede o comportamento padrão do Enter (como submeter um formulário HTML nativo se houver)
      event.preventDefault(); 
      // Aciona o clique do botão principal (Entrar/Registrar)
      if (mainButtonRef.current) {
        mainButtonRef.current.click();
      }
    }
  };

  // Classes condicionais para o background e borda do card
  const cardBgClass = isRegistering ? 'bg-emerald-700' : 'bg-gray-800'; // Fundo do card
  const cardBorderClass = isRegistering ? 'border-2 border-gray-900' : 'border border-gray-700'; // Borda do card

  // Classes condicionais para o botão principal
  const mainButtonClass = isRegistering 
    ? 'bg-gray-900 text-white hover:bg-gray-950' // Fundo escuro e texto branco para registro
    : 'bg-emerald-600 text-white hover:bg-emerald-700'; // Fundo verde e texto branco para login

  // Classes condicionais para o botão de alternar modo
  const toggleButtonClass = isRegistering
    ? 'text-gray-200 hover:underline' // Texto claro para registro
    : 'text-emerald-400 hover:underline'; // Texto verde esmeralda para login


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-6 sm:px-6 md:px-8 font-inter">
      <div className={`${cardBgClass} ${cardBorderClass} p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 hover:scale-102`}>
        <div className="flex justify-center mb-6">
          <img
            src="/dindion_logo.png"
            alt="Logo DindiOn - Porquinho Mealheiro"
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg shadow-sm"
          />
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-6">
          <span className="text-[#30CFCF]">Dindi</span><span className="text-[#A6E22E]">On</span>
        </h2>
        {error && <p className="text-red-400 text-center mb-4 text-sm">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-400 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-400 text-sm font-medium mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <button
          onClick={isRegistering ? handleRegister : handleLogin}
          ref={mainButtonRef}
          className={`w-full py-3 rounded-lg font-semibold transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${mainButtonClass}`}
        >
          {isRegistering ? 'Criar Conta' : 'Acessar'}
        </button>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className={`w-full mt-4 py-2 rounded-lg hover:underline transition duration-200 text-sm ${toggleButtonClass}`}
        >
          {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
