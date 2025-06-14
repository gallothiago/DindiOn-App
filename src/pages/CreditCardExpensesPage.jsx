// src/pages/CreditCardExpensesPage.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../firebaseConfig';

const CreditCardExpensesPage = ({ user, cardId, cardName, onBack, onLogout }) => {
  const [cardExpenses, setCardExpenses] = useState([]);

  useEffect(() => {
    if (user && cardId) {
      const transactionsRef = ref(database, `users/${user.uid}/transactions`);
      const unsubscribe = onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedExpenses = [];
        for (let id in data) {
          if (data[id].type === 'expense' && data[id].paymentType === 'credit' && data[id].cardId === cardId) {
            loadedExpenses.push({ id, ...data[id] });
          }
        }
        setCardExpenses(loadedExpenses);
      });
      return () => unsubscribe();
    }
  }, [user, cardId]);

  const handleRemoveExpense = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta despesa?')) {
      try {
        await remove(ref(database, `users/${user.uid}/transactions/${id}`));
      } catch (error) {
        console.error('Erro ao remover despesa:', error);
        alert('Erro ao remover despesa. Tente novamente.');
      }
    }
  };

  const totalCardExpenses = cardExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatReferenceMonth = (yearMonth) => {
    if (!yearMonth) return '';
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center font-inter">
      <div className="bg-gray-800 text-gray-100 p-8 rounded-3xl shadow-2xl max-w-2xl w-full">
        <header className="flex justify-between items-center mb-6 border-b pb-4 border-gray-700">
            <div className="flex items-center space-x-4">
                <img
                    src="/dindion_logo.png"
                    alt="Logo DindiOn"
                    className="w-10 h-10 object-contain rounded-md shadow-sm"
                />
                <span className="text-3xl font-extrabold">
                    <span className="text-[#30CFCF]">Dindi</span><span className="text-[#A6E22E]">On</span>
                </span>
            </div>
            <div className="flex space-x-3">
                <button
                    onClick={onBack}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition duration-200 shadow-md"
                >
                    Voltar
                </button>
                <button
                    onClick={onLogout}
                    className="bg-gray-800 text-white py-2 px-5 rounded-lg font-semibold hover:bg-gray-900 transition duration-300 transform hover:scale-105 shadow-md"
                >
                    Sair
                </button>
            </div>
        </header>

        <div className="mb-8 p-6 bg-gray-900 rounded-2xl shadow-inner border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Despesas do Cartão: {cardName}</h2>
          {cardExpenses.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhuma despesa para este cartão ainda.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {cardExpenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600"
                  >
                    <div>
                      <p className="text-gray-100 font-medium">{expense.description}</p>
                      <p className="text-gray-400 text-sm">
                        R$ {Math.abs(expense.amount).toFixed(2)} - {new Date(expense.date + 'T00:00:00').toLocaleDateString()} (Mês Ref.: {formatReferenceMonth(expense.referenceMonth)})
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-900 transition duration-200 shadow-sm"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-700 text-right">
                <p className="text-xl font-bold text-gray-100">
                  Total no {cardName}: <span className={totalCardExpenses >= 0 ? 'text-emerald-400' : 'text-red-400'}>R$ {Math.abs(totalCardExpenses).toFixed(2)}</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditCardExpensesPage;



