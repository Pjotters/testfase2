import { createClient } from '@supabase/supabase-js'

// Supabase configuratie
const supabaseUrl = 'https://lmfvilfnwsylaxgdnolc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZnZpbGZud3N5bGF4Z2Rub2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1Mzc2OTMsImV4cCI6MjA1MjExMzY5M30.7to9Db88XzGtJLvjL07Th5ssCqL2e88niyISIBDB9qI'

// Cloudinary configuratie
const cloudinaryConfig = {
    cloudName: 'qcrulxlgz',
    uploadPreset: 'website_builder',
    apiKey: '943948986565829',
    apiSecret: '69A1BxafYABwOM5JFCtaQ2IUDp8'
}

// Initialiseer Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Exporteer Cloudinary config
export const cloudinary = cloudinaryConfig

// Helper functie voor Cloudinary uploads
export async function uploadToCloudinary(file, folder = 'websites') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryConfig.uploadPreset)
    formData.append('folder', folder)

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
        {
            method: 'POST',
            body: formData
        }
    )

    if (!response.ok) {
        throw new Error('Upload failed')
    }

    return await response.json()
}

// Maak de configuratie globaal beschikbaar
window.cloudinaryConfig = {
    cloudName: 'qcrulxlgz',
    uploadPreset: 'website_builder'
};

window.supabase = supabase;
window.uploadToCloudinary = uploadToCloudinary; 
