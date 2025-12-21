'use client'

import { useState } from 'react'
import { login, register } from '@/app/actions/auth'
import { Lock, User, UserPlus } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const action = isLogin ? login : register

        if (!isLogin) {
            const password = formData.get('password') as string
            const confirm = formData.get('confirmPassword') as string
            if (password !== confirm) {
                setError("Passwords don't match")
                setLoading(false)
                return
            }
        }

        const res = await action(formData)
        if (res?.error) {
            setError(res.error)
            setLoading(false)
        }
        // Redirect happens in action
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-6 sm:p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-teal-400 mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {isLogin ? 'Sign in to access your dashboard' : 'Join Overrun to start testing'}
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="relative animate-in fade-in slide-in-from-top-4 duration-300">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                            required
                            minLength={6}
                        />
                    </div>

                    {!isLogin && (
                        <div className="relative animate-in fade-in slide-in-from-top-4 duration-300">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-in shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                        }}
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                        {isLogin ? (
                            <>Don't have an account? <span className="text-blue-400 font-bold">Sign Up</span></>
                        ) : (
                            <>Already have an account? <span className="text-blue-400 font-bold">Sign In</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
