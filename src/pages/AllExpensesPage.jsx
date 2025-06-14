// src/pages/AllExpensesPage.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';

const AllExpensesPage = ({ user, onBack, onLogout }) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'cash', 'credit', 'recipe'
  const [selectedReferenceMonth, setSelectedReferenceMonth] = useState(''); // Estado para o mês de referência selecionado

  useEffect(() => {
    if (user) {
      const transactionsRef = ref(database, `users/${user.uid}/transactions`); // Aponta para 'transactions'
      const unsubscribe = onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedTransactions = [];
        for (let id in data) {
          if (data[id].referenceMonth === undefined || data[id].referenceMonth === null) {
              data[id].referenceMonth = '';
          }
          loadedTransactions.push({ id, ...data[id] });
        }
        setAllTransactions(loadedTransactions); // Atualiza para allTransactions
      });
      return () => unsubscribe();
    }
  }, [user]);

  const getUniqueReferenceMonths = () => {
    const months = new Set();
    allTransactions.forEach(transaction => { // Itera sobre allTransactions
      if (transaction.referenceMonth && transaction.referenceMonth !== '') {
        months.add(transaction.referenceMonth);
      }
    });
    const sortedMonths = Array.from(months).sort((a, b) => a.localeCompare(b));
    return sortedMonths;
  };

  const referenceMonthOptions = getUniqueReferenceMonths();

  const formatReferenceMonth = (yearMonth) => {
    if (!yearMonth) return '';
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    if (!selectedReferenceMonth || !referenceMonthOptions.includes(selectedReferenceMonth)) {
      if (referenceMonthOptions.length === 0) {
        setSelectedReferenceMonth('');
        return;
      }

      const currentMonth = new Date().toISOString().substring(0, 7);

      if (referenceMonthOptions.includes(currentMonth)) {
        setSelectedReferenceMonth(currentMonth);
      } else {
        setSelectedReferenceMonth(referenceMonthOptions[referenceMonthOptions.length - 1]);
      }
    }
  }, [allTransactions, referenceMonthOptions]);

  const filteredTransactions = allTransactions.filter(transaction => { // Filtra allTransactions
    // Filtro por tipo de pagamento/transação
    const matchesType = (
      filterType === 'all' ||
      (filterType === 'cash' && transaction.type === 'expense' && transaction.paymentType === 'cash') ||
      (filterType === 'credit' && transaction.type === 'expense' && transaction.paymentType === 'credit') ||
      (filterType === 'recipe' && transaction.type === 'recipe')
    );
    
    // Filtro por mês de referência
    const transactionRefMonth = String(transaction.referenceMonth || '');
    const matchesReferenceMonth = (selectedReferenceMonth === '' && referenceMonthOptions.length === 0) || (transactionRefMonth === selectedReferenceMonth);

    return matchesType && matchesReferenceMonth;
  });

  const totalFilteredBalance = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0); // Calcula o saldo

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6 sm:px-6 md:px-8 flex flex-col items-center font-inter">
      <div className="bg-gray-800 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl w-full lg:max-w-4xl">
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

        <div className="mb-6 p-4 sm:p-6 bg-gray-900 rounded-2xl shadow-inner border border-gray-700 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-emerald-500"
              name="expenseTypeFilter"
              value="all"
              checked={filterType === 'all'}
              onChange={() => setFilterType('all')}
            />
            <span className="ml-2 text-gray-400">Total Geral</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-emerald-500"
              name="expenseTypeFilter"
              value="cash"
              checked={filterType === 'cash'}
              onChange={() => setFilterType('cash')}
            />
            <span className="ml-2 text-gray-400">Despesas À Vista</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-emerald-500"
              name="expenseTypeFilter"
              value="credit"
              checked={filterType === 'credit'}
              onChange={() => setFilterType('credit')}
            />
            <span className="ml-2 text-gray-400">Despesas de Crédito</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-emerald-500"
              name="expenseTypeFilter"
              value="recipe"
              checked={filterType === 'recipe'}
              onChange={() => setFilterType('recipe')}
            />
            <span className="ml-2 text-gray-400">Receitas</span>
          </label>

          <div className="sm:ml-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <label htmlFor="referenceMonthSelect" className="block text-gray-400 text-sm font-medium mb-2">
              Filtrar por Mês de Referência
            </label>
            <select
              id="referenceMonthSelect"
              className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 bg-gray-900 text-gray-100"
              value={selectedReferenceMonth}
              onChange={(e) => {
                setSelectedReferenceMonth(e.target.value);
              }}
              disabled={referenceMonthOptions.length === 0}
            >
              {referenceMonthOptions.map(month => (
                <option key={month} value={month}>
                  {formatReferenceMonth(month)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mb-8 p-4 sm:p-6 bg-gray-900 rounded-2xl shadow-inner border border-gray-700">
          {filteredTransactions.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhuma transação encontrada com o filtro selecionado.</p>
          ) : (
            <table className="min-w-full bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-700 text-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">DESCRIÇÃO</th>
                  <th className="py-3 px-4 text-left font-semibold">TIPO</th>
                  <th className="py-3 px-4 text-left font-semibold">DATA</th>
                  <th className="py-3 px-4 text-left font-semibold">MÊS DE REF.</th>
                  <th className="py-3 px-4 text-right font-semibold">VALOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-700">
                    <td className="py-3 px-4 text-gray-100">{transaction.description}</td>
                    <td className="py-3 px-4 text-gray-100">
                      {transaction.type === 'expense' ? (
                        transaction.paymentType === 'cash' ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Despesa À Vista
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Despesa {transaction.cardName || 'Crédito'}
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                          Receita
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-100">
                      {new Date(transaction.date + 'T00:00:00').toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-100">
                      {formatReferenceMonth(transaction.referenceMonth)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      R$ {Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-6 pt-4 border-t border-gray-700 text-right">
            <p className="text-xl font-bold text-gray-100">
              Saldo do Filtro: <span className={totalFilteredBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}>R$ {totalFilteredBalance.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllExpensesPage;
