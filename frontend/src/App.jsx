import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ArticleDetail from './pages/ArticleDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import EditorDashboard from './pages/editor/EditorDashboard';
import AuthorDashboard from './pages/author/AuthorDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/article/:slug" element={<ArticleDetail />} />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/editor"
                        element={
                            <ProtectedRoute roles={['editor']}>
                                <EditorDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/author"
                        element={
                            <ProtectedRoute roles={['author']}>
                                <AuthorDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;
