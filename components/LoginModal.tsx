import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(true);

    // In a real app, this would handle form submission with validation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin();
    };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUpFadeIn">
        <h2 className="text-3xl font-bold text-center text-white mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-400 text-center mb-8">
            {isSignUp ? 'Join Tidfy to start creating.' : 'Log in to continue your work.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        required
                        className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-white"
                    />
                </div>
            )}
            <div>
                 <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    required
                    className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-white"
                />
            </div>
             <div>
                <label htmlFor="password-login" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                    type="password"
                    id="password-login"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-white"
                />
            </div>
             <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
            >
                Continue
            </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-cyan-400 hover:underline">
                 {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;