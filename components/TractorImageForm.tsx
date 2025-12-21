'use client'

import { createTractor } from '@/app/actions/admin'
import { Plus, Tractor, Image as ImageIcon, X } from 'lucide-react'
import { useState, useRef, ChangeEvent } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
            <Plus className="h-4 w-4" /> {pending ? 'Adding...' : 'Add'}
        </button>
    )
}

export function TractorImageForm() {
    const [preview, setPreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Resize image client-side to max 600px
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 2500 // Increased from 600 for print quality
                let width = img.width
                let height = img.height

                if (width > MAX_WIDTH) {
                    const scaleSize = MAX_WIDTH / width
                    width = MAX_WIDTH
                    height = height * scaleSize
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                canvas.toBlob((blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        })
                        setImageFile(resizedFile)
                        setPreview(URL.createObjectURL(resizedFile))
                    }
                }, 'image/jpeg', 0.9) // 90% quality JPEG for better print result
            }
        }
    }

    const clearImage = () => {
        setPreview(null)
        setImageFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    async function handleSubmit(formData: FormData) {
        // Append the resized image file to the FormData
        if (imageFile) {
            formData.set('image', imageFile)
        }

        const res = await createTractor(formData)
        if (res?.success) {
            // Reset form
            clearImage()
            const form = document.getElementById('tractor-form') as HTMLFormElement
            form?.reset()
        } else {
            alert('Failed to create tractor')
        }
    }

    return (
        <form id="tractor-form" action={handleSubmit} className="flex flex-col gap-4 mb-8">
            <div className="flex gap-4 items-start">
                <input
                    type="text"
                    name="name"
                    placeholder="Model Name"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                    required
                />
                <input
                    type="number"
                    step="0.0001"
                    name="gearRatio"
                    placeholder="Ratio (e.g. 1.5177)"
                    className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                    required
                />
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm text-gray-300"
                    >
                        <ImageIcon className="h-4 w-4" />
                        {preview ? 'Change Photo' : 'Add Photo'}
                    </button>
                </div>

                {preview && (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-10 w-16 object-cover rounded border border-gray-600"
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                <div className="border-l border-gray-700 h-8 mx-2"></div>

                <SubmitButton />
            </div>
        </form>
    )
}
