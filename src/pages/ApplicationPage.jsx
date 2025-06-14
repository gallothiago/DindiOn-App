// src/pages/ApplicationPage.jsx
import React, { useState, useEffect } from 'react';
import { ref, push, onValue, remove } from 'firebase/database';
import { database } from '../firebaseConfig';

// Função auxiliar para obter a data atual no formato YYYY-MM-DD no fuso horário local
const getTodayLocalISO = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Componente para a página principal da aplicação (quando o usuário está logado)
const ApplicationPage = ({ user, onLogout, onViewCardExpenses, onViewAllExpenses }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayLocalISO());
  const [selectedMonthForNewExpense, setSelectedMonthForNewExpense] = useState('');
  const [paymentType, setPaymentType] = useState('cash'); // 'cash' ou 'credit'
  const [selectedCardId, setSelectedCardId] = useState('');
  const [transactions, setTransactions] = useState([]); // Agora armazena despesas E receitas
  const [creditCards, setCreditCards] = useState([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [numberOfInstallments, setNumberOfInstallments] = useState(1);
  const [transactionType, setTransactionType] = useState('expense'); // 'expense' ou 'recipe'

  // Geração das opções de mês para o formulário de adição
  const getMonthsForNewExpense = () => {
    const months = [];
    const startDate = new Date('2025-06-01');
    const endDate = new Date('2027-12-01');

    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (currentDate <= endDate) {
      months.push(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
  };

  const monthsForNewExpenseOptions = getMonthsForNewExpense();

  useEffect(() => {
    if (user) {
      // Listener para transações (despesas e receitas)
      const transactionsRef = ref(database, `users/${user.uid}/transactions`);
      const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedTransactions = [];
        for (let id in data) {
          loadedTransactions.push({ id, ...data[id] });
        }
        setTransactions(loadedTransactions);
      });

      // Listener para cartões de crédito
      const cardsRef = ref(database, `users/${user.uid}/creditCards`);
      const unsubscribeCards = onValue(cardsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedCards = [];
        for (let id in data) {
          loadedCards.push({ id, ...data[id] });
        }
        setCreditCards(loadedCards);
        if (loadedCards.length > 0 && !selectedCardId) {
          setSelectedCardId(loadedCards[0].id);
        }
      });

      return () => {
        unsubscribeTransactions();
        unsubscribeCards();
      };
    }
  }, [user, selectedCardId]);

  // Define o mês atual como padrão para o campo de seleção de mês ao adicionar despesa
  useEffect(() => {
    if (monthsForNewExpenseOptions.length > 0 && !selectedMonthForNewExpense) {
      const currentMonth = getTodayLocalISO().substring(0, 7);
      if (monthsForNewExpenseOptions.includes(currentMonth)) {
        setSelectedMonthForNewExpense(currentMonth);
      } else {
        setSelectedMonthForNewExpense(monthsForNewExpenseOptions[0]);
      }
    }
  }, [monthsForNewExpenseOptions, selectedMonthForNewExpense]);


  const handleAddCard = async () => {
    if (!newCardName.trim()) {
      alert('Por favor, digite o nome do cartão.');
      return;
    }
    try {
      await push(ref(database, `users/${user.uid}/creditCards`), { name: newCardName });
      setNewCardName('');
      setShowAddCardModal(false);
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      alert('Erro ao adicionar cartão. Tente novamente.');
    }
  };

  const handleRemoveCard = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este cartão? Isso também removerá as despesas associadas a ele!')) {
      try {
        await remove(ref(database, `users/${user.uid}/creditCards/${id}`));
        if (selectedCardId === id) {
          setSelectedCardId('');
        }
      } catch (error) {
        console.error('Erro ao remover cartão:', error);
        alert('Erro ao remover cartão. Tente novamente.');
      }
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      alert('Por favor, preencha a descrição e o valor.');
      return;
    }

    if (transactionType === 'expense' && paymentType === 'credit' && !selectedCardId) {
      alert('Por favor, selecione um cartão de crédito.');
      return;
    }
    
    if (!selectedMonthForNewExpense) {
        alert('Por favor, selecione o mês de referência da transação.');
        return;
    }

    // O valor será armazenado como negativo para despesas e positivo para receitas
    const parsedAmount = parseFloat(amount);
    const finalAmount = transactionType === 'expense' ? -parsedAmount : parsedAmount;

    try {
      if (transactionType === 'expense' && paymentType === 'credit' && numberOfInstallments > 1) {
        const installmentAmount = finalAmount / numberOfInstallments; // Já é negativo
        
        const initialDay = parseInt(expenseDate.split('-')[2]);
        const [startYear, startMonth] = selectedMonthForNewExpense.split('-').map(Number);
        let currentInstallmentDate = new Date(startYear, startMonth - 1, initialDay);
        const lastDayOfStartMonth = new Date(startYear, startMonth, 0).getDate(); 
        if (currentInstallmentDate.getDate() !== initialDay && currentInstallmentDate.getDate() < initialDay) {
            currentInstallmentDate.setDate(lastDayOfStartMonth);
        } else if (initialDay > lastDayOfStartMonth) {
            currentInstallmentDate.setDate(lastDayOfStartMonth);
        }

        for (let i = 0; i < numberOfInstallments; i++) {
          const installmentDescription = `${description} (${i + 1}/${numberOfInstallments})`;
          const installmentReferenceMonth = `${currentInstallmentDate.getFullYear()}-${(currentInstallmentDate.getMonth() + 1).toString().padStart(2, '0')}`;
          const formattedInstallmentDate = `${currentInstallmentDate.getFullYear()}-${(currentInstallmentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentInstallmentDate.getDate().toString().padStart(2, '0')}`;

          const transactionToSave = {
            description: installmentDescription,
            amount: installmentAmount,
            date: formattedInstallmentDate,
            referenceMonth: installmentReferenceMonth,
            type: transactionType, // 'expense'
            paymentType,
            cardId: selectedCardId,
            cardName: creditCards.find(card => card.id === selectedCardId)?.name,
            totalInstallments: numberOfInstallments,
            currentInstallment: i + 1,
          };
          await push(ref(database, `users/${user.uid}/transactions`), transactionToSave);

          currentInstallmentDate.setMonth(currentInstallmentDate.getMonth() + 1);
          const lastDayOfNextCalculatedMonth = new Date(currentInstallmentDate.getFullYear(), currentInstallmentDate.getMonth() + 1, 0).getDate();
          currentInstallmentDate.setDate(Math.min(initialDay, lastDayOfNextCalculatedMonth));
        }
      } else {
        // Transação única (à vista ou receita)
        const singleTransaction = {
          description,
          amount: finalAmount,
          date: expenseDate,
          referenceMonth: selectedMonthForNewExpense,
          type: transactionType, // 'expense' ou 'recipe'
          // Campos opcionais para despesas de crédito
          paymentType: transactionType === 'expense' ? paymentType : null,
          cardId: transactionType === 'expense' && paymentType === 'credit' ? selectedCardId : null,
          cardName: transactionType === 'expense' && paymentType === 'credit' ? creditCards.find(card => card.id === selectedCardId)?.name : null,
        };
        await push(ref(database, `users/${user.uid}/transactions`), singleTransaction);
      }

      setDescription('');
      setAmount('');
      setExpenseDate(getTodayLocalISO());
      setNumberOfInstallments(1);
      setTransactionType('expense'); // Volta para o padrão 'expense'
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao adicionar transação. Tente novamente.');
    }
  };

  const handleRemoveTransaction = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta transação?')) {
      try {
        await remove(ref(database, `users/${user.uid}/transactions/${id}`));
      } catch (error) {
        console.error('Erro ao remover transação:', error);
        alert('Erro ao remover transação. Tente novamente.');
      }
    }
  };

  // Calcula o saldo total (receitas - despesas)
  const totalBalance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

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
          <button
            onClick={onLogout}
            className="bg-gray-800 text-white py-2 px-5 rounded-lg font-semibold hover:bg-gray-900 transition duration-300 transform hover:scale-105 shadow-md"
          >
            Sair
          </button>
        </header>

        <p className="text-lg mb-6 text-center text-gray-400">Bem-vindo(a), <span className="font-semibold">{user.email}</span>!</p>

        <div className="mb-8 p-6 bg-gray-900 rounded-2xl shadow-inner border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-100 flex justify-between items-center">
            Meus Cartões de Crédito
            <button
              onClick={() => setShowAddCardModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition duration-300 shadow-md"
            >
              Adicionar Cartão
            </button>
          </h2>
          {creditCards.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhum cartão adicionado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {creditCards.map((card) => (
                <li key={card.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600">
                  <span className="text-gray-100 font-medium">{card.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewCardExpenses(card.id, card.name)}
                      className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm hover:bg-emerald-600 transition duration-200 shadow-sm"
                      title="Ver despesas deste cartão"
                    >
                      Ver Despesas
                    </button>
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-900 transition duration-200 shadow-sm"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showAddCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-sm">
              <h3 className="text-2xl font-bold mb-4 text-gray-100">Adicionar Novo Cartão</h3>
              <div className="mb-4">
                <label htmlFor="newCardName" className="block text-gray-400 text-sm font-medium mb-2">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  id="newCardName"
                  className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-gray-100 bg-gray-900"
                  placeholder="Ex: Cartão Nubank, Visa Work"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCard}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition duration-200"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulário para adicionar despesas/receitas */}
        <form onSubmit={handleAddTransaction} className="mb-8 p-6 bg-gray-900 rounded-2xl shadow-inner border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Adicionar Nova Transação</h2>
          
          {/* Campo para selecionar o tipo de transação */}
          <div className="mb-4">
            <span className="block text-gray-400 text-sm font-medium mb-2">Tipo de Transação</span>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-emerald-500"
                  name="transactionType"
                  value="expense"
                  checked={transactionType === 'expense'}
                  onChange={() => setTransactionType('expense')}
                />
                <span className="ml-2 text-gray-400">Despesa</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-emerald-500"
                  name="transactionType"
                  value="recipe"
                  checked={transactionType === 'recipe'}
                  onChange={() => {
                    setTransactionType('recipe');
                    setPaymentType('cash');
                    setNumberOfInstallments(1);
                  }}
                />
                <span className="ml-2 text-gray-400">Receita</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-400 text-sm font-medium mb-2">
              Descrição
            </label>
            <input
              type="text"
              id="description"
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
              placeholder={transactionType === 'expense' ? 'Ex: Conta de luz, Compras de supermercado' : 'Ex: Salário, Venda de item'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-400 text-sm font-medium mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              id="amount"
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
              placeholder="0.00"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="selectedMonthForNewExpense" className="block text-gray-400 text-sm font-medium mb-2">
              Mês de Referência
            </label>
            <select
              id="selectedMonthForNewExpense"
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
              value={selectedMonthForNewExpense}
              onChange={(e) => setSelectedMonthForNewExpense(e.target.value)}
            >
              {monthsForNewExpenseOptions.map(month => (
                <option key={month} value={month}>
                  {formatReferenceMonth(month)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="expenseDate" className="block text-gray-400 text-sm font-medium mb-2">
              Data da Transação (Opcional)
            </label>
            <input
              type="date"
              id="expenseDate"
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          {transactionType === 'expense' && (
            <>
              <div className="mb-4">
                <span className="block text-gray-400 text-sm font-medium mb-2">Tipo de Pagamento</span>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-emerald-500"
                      name="paymentType"
                      value="cash"
                      checked={paymentType === 'cash'}
                      onChange={() => {
                        setPaymentType('cash');
                        setNumberOfInstallments(1);
                      }}
                    />
                    <span className="ml-2 text-gray-400">À vista</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-emerald-500"
                      name="paymentType"
                      value="credit"
                      checked={paymentType === 'credit'}
                      onChange={() => setPaymentType('credit')}
                    />
                    <span className="ml-2 text-gray-400">Crédito</span>
                  </label>
                </div>
              </div>

              {paymentType === 'credit' && (
                <div className="mb-4">
                  <label htmlFor="installments" className="block text-gray-400 text-sm font-medium mb-2">
                    Número de Parcelas
                  </label>
                  <select
                    id="installments"
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
                    value={numberOfInstallments}
                    onChange={(e) => setNumberOfInstallments(parseInt(e.target.value))}
                  >
                    {[...Array(12).keys()].map(i => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              {paymentType === 'credit' && (
                <div className="mb-6">
                  <label htmlFor="cardSelect" className="block text-gray-400 text-sm font-medium mb-2">
                    Selecionar Cartão de Crédito
                  </label>
                  <select
                    id="cardSelect"
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    disabled={creditCards.length === 0}
                  >
                    <option value="">{creditCards.length > 0 ? 'Selecione um cartão' : 'Nenhum cartão disponível'}</option>
                    {creditCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition duration-300 transform hover:scale-105 shadow-md"
          >
            Adicionar Transação
          </button>
        </form>

        {/* Lista de transações (resumida, com botão para ver todas) */}
        <div className="mb-8 p-6 bg-gray-900 rounded-2xl shadow-inner border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-100 flex justify-between items-center">
            Últimas Transações
            <button
              onClick={onViewAllExpenses}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition duration-300 shadow-md"
            >
              Ver Todas
            </button>
          </h2>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhuma transação adicionada ainda.</p>
          ) : (
            <>
              <ul className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600"
                  >
                    <div>
                      <p className="text-gray-100 font-medium">{transaction.description}</p>
                      <p className={`text-sm ${transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                        R$ {Math.abs(transaction.amount).toFixed(2)} - {new Date(transaction.date + 'T00:00:00').toLocaleDateString()} (Mês Ref.: {formatReferenceMonth(transaction.referenceMonth)})
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveTransaction(transaction.id)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-900 transition duration-200 shadow-sm"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-700 text-right">
                <p className="text-xl font-bold text-gray-100">
                  Saldo Total: <span className={totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}>R$ {totalBalance.toFixed(2)}</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
