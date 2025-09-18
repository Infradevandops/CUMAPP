
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/molecules/FormField';

const LoginPage = () => {
    const [email, setEmail] = useState('demo@cumapp.com');
    const [password, setPassword] = useState('demo123');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

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
                setErrors({ form: error.detail || 'Login failed' });
            }
        } catch (error) {
            setErrors({ form: 'Network error. Please try again.' });
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-4xl flex bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="w-1/2 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-blue-600">CumApp</h2>
                        <p className="text-gray-600 mt-2">Sign in to your account</p>
                    </div>
                        
                    <form onSubmit={handleLogin} className="space-y-6">
                        <FormField
                            label="Email"
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            required
                        />
                        
                        <FormField
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                        />

                        {errors.form && (
                            <p className="text-sm text-red-600" role="alert">
                                {errors.form}
                            </p>
                        )}
                        
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
                
                <div className="w-1/2 bg-blue-600 text-white flex items-center justify-center p-8">
                    <div className="text-center">
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
        </div>
    );
};

export default LoginPage;
