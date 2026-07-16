import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Auth from './pages/Auth';
import SavedJobs from './pages/SavedJobs';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/saved" element={<SavedJobs />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;