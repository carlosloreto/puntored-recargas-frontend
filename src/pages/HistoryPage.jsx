import { Header } from '../components/Layout/Header'
import { TransactionList } from '../components/Transactions/TransactionList'

export const HistoryPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TransactionList />
      </main>
    </div>
  )
}

