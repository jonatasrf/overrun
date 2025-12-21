'use client'

import { createUser } from '@/app/actions/admin'
import { Plus } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
            <Plus className="h-4 w-4" /> {pending ? 'Creating...' : 'Create User'}
        </button>
    )
}

export function CreateUserForm() {
    const [error, setError] = useState<string | null>(null)

    async function clientAction(formData: FormData) {
        setError(null)
        const res = await createUser(formData)
        if (res?.error) {
            setError(res.error)
            toast.error(res.error)
        } else {
            toast.success('User created successfully!')
            // Success - form clears automatically if not controlled, or we can reset
            // Just clearing error is enough for now, server revalidates path
            const form = document.getElementById('create-user-form') as HTMLFormElement
            form?.reset()
        }
    }

    return (
        <form id="create-user-form" action={clientAction} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">New User</label>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    required
                />
            </div>
            <div>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    required
                />
            </div>
            <div>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    required
                />
            </div>
            <div>
                <select
                    name="role"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white"
                >
                    <option value="USER">User (Read-only)</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                    {error}
                </div>
            )}

            <SubmitButton />
        </form>
    )
}
