
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('demo@cumapp.com');
    const [password, setPassword] = useState('demo123');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (email === 'demo@cumapp.com' && password === 'demo123') {
            demoLogin();
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                navigate('/dashboard');
            } else {
                const error = await response.json();
                alert(error.detail || 'Login failed');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };

    const demoLogin = () => {
        localStorage.setItem('token', 'demo_token_12345');
        localStorage.setItem('user', JSON.stringify({
            id: 1,
            email: 'demo@cumapp.com',
            username: 'demo',
            credits: 25.50
        }));
        navigate('/dashboard');
    };

    return (
        <div className="login-page-container">
            <div className="login-form-container">
                <div className="login-form-card">
                    <div className="login-form-header">
                        <h2 className="text-3xl font-bold text-blue-600">CumApp</h2>
                        <p className="text-gray-600 mt-2">Sign in to your account</p>
                    </div>
                        
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center">
                            <i className="fas fa-sign-in-alt mr-2"></i>Sign In
                        </button>
                        
                        <button type="button" onClick={demoLogin} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                            <i className="fas fa-rocket mr-2"></i>Demo Login (Skip)
                        </button>
                    </form>
                        
                    <div className="text-center mt-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Demo Account:</strong><br />
                                Email: demo@cumapp.com<br />
                                Password: demo123
                            </p>
                        </div>
                        <p className="text-gray-600">Don't have an account? <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">Sign up</a></p>
                    </div>
                </div>
            </div>
            
            <div className="login-info-panel">
                <div className="text-center px-8">
                    <i className="fas fa-mobile-alt text-6xl mb-8 opacity-90"></i>
                    <h3 className="text-3xl font-bold mb-4">Welcome Back</h3>
                    <p className="text-xl mb-8 text-blue-100">Access your SMS verification dashboard</p>
                    <ul className="space-y-3 text-left">
                        <li className="flex items-center"><i className="fas fa-check mr-3"></i>Manage Verifications</li>
                        <li className="flex items-center"><i className="fas fa-check mr-3"></i>Purchase Numbers</li>
                        <li className="flex items-center"><i className="fas fa-check mr-3"></i>Track Usage</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
