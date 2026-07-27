import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../firebase';
import { updateProfile, sendEmailVerification } from 'firebase/auth';

interface LoginModalProps {
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
            onLogin();
        } catch (err: any) {
            setError(err.message || 'Failed to log in with Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await sendEmailVerification(userCredential.user);
                setVerificationSent(true);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if (!userCredential.user.emailVerified) {
                    throw new Error("Please verify your email address before logging in.");
                }
                onLogin();
            }
        } catch (err: any) {
            if (err.code === 'auth/operation-not-allowed') {
                setError('Email/Password authentication is not enabled. Please enable it in your Firebase Console.');
            } else {
                setError(err.message || 'Authentication failed.');
            }
        } finally {
            setLoading(false);
        }
    };

  if (verificationSent) {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUpFadeIn text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Verify Your Email</h2>
            <p className="text-text-secondary mb-6">
                We've sent a verification email to <strong>{email}</strong>. Please check your inbox and verify your email address before logging in.
            </p>
            <button
                onClick={() => {
                    setVerificationSent(false);
                    setIsSignUp(false);
                }}
                className="w-full bg-secondary hover:bg-secondary-hover text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300"
            >
                Back to Login
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUpFadeIn max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-text-primary mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-text-secondary text-center mb-6">
            Please sign up or log in with Google or your email address to continue.
        </p>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}

        <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 font-medium py-3 px-8 rounded-lg transition-all duration-300 mb-6 disabled:opacity-50"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
        </button>

        <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-text-tertiary text-sm">Or continue with email</span>
            <div className="flex-grow border-t border-border"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isSignUp && (
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                    />
                </div>
            )}
            <div>
                 <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                />
            </div>
             <div>
                <label htmlFor="password-login" className="block text-sm font-medium text-text-primary mb-1">Password</label>
                <input
                    type="password"
                    id="password-login"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                />
            </div>
            {isSignUp && (
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                    />
                </div>
            )}
             <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary-hover text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 mt-2"
            >
                {loading ? 'Processing...' : (isSignUp ? 'Sign up with Email' : 'Log in')}
            </button>
        </form>

        <p className="text-center text-text-tertiary text-sm mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-medium text-secondary hover:underline">
                 {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;