import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-purple-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="ml-3 text-xl font-bold text-white">Dashboard</span>
          </div>
          <div>
            {isAuthenticated ? (
              <Link to={isAdmin ? '/dashboard' : '/services/dashboard'}>
                <Button variant="secondary">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Business Analytics
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
            Dashboard
          </span>
        </h1>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Track your sales, monitor expenses, and gain valuable insights into your business performance with our comprehensive analytics dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link to={isAdmin ? '/dashboard' : '/services/dashboard'}>
              <Button size="large" className="bg-white text-primary-600 hover:bg-gray-100">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="large" className="bg-white text-primary-600 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Sales Tracking</h3>
            <p className="text-white/70">
              Monitor your sales performance across different services and departments with detailed breakdowns.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="w-14 h-14 bg-green-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Visual Analytics</h3>
            <p className="text-white/70">
              Beautiful charts and graphs to visualize trends, comparisons, and key performance indicators.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="w-14 h-14 bg-pink-400 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-pink-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Expense Management</h3>
            <p className="text-white/70">
              Keep track of all your business expenses with categorization and detailed reporting.
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-white/60">
        <p>© 2025 Dashboard.</p>
      </footer>
    </div>
  );
}
export default Home;
