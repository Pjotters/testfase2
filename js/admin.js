import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://lmfvilfnwsylaxgdnolc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZnZpbGZud3N5bGF4Z2Rub2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1Mzc2OTMsImV4cCI6MjA1MjExMzY5M30.7to9Db88XzGtJLvjL07Th5ssCqL2e88niyISIBDB9qI'
);

// Voeg toe aan het begin van admin.js
function showLoading(element) {
    element.innerHTML = '<div class="loading">Laden...</div>';
}

// Panel management
async function showPanel(panelName) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${panelName}-panel`).classList.add('active');

    // Load panel content
    switch(panelName) {
        case 'dashboard':
            await loadRecentPages();
            break;
        case 'pages':
            await loadAllPages();
            break;
        case 'media':
            await loadMediaLibrary();
            break;
    }
}

// Recent pages laden
async function loadRecentPages() {
    const recentList = document.getElementById('recentPagesList');
    showLoading(recentList);
    
    const { data: pages, error } = await supabase
        .from('websites')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        recentList.innerHTML = '<div class="error">Er ging iets mis bij het laden</div>';
        console.error('Error loading recent pages:', error);
        return;
    }

    recentList.innerHTML = pages.map(page => `
        <div class="page-item">
            <h3>${page.title || 'Untitled'}</h3>
            <p>Laatst bewerkt: ${new Date(page.updated_at).toLocaleString()}</p>
            <div class="page-actions">
                <button class="edit" onclick="editPage('${page.id}')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Bewerken
                </button>
                <button class="delete" onclick="deletePage('${page.id}')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Verwijderen
                </button>
            </div>
        </div>
    `).join('');
}

// Nieuwe pagina maken
async function createNewPage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert('Je moet ingelogd zijn om een pagina te maken');
        return;
    }

    const { data, error } = await supabase
        .from('websites')
        .insert([
            {
                user_id: user.id,
                title: 'Nieuwe Pagina',
                content: '',
                template: 'basic-template',
                created_at: new Date(),
                updated_at: new Date()
            }
        ])
        .select();

    if (error) {
        console.error('Error creating page:', error);
        return;
    }

    window.location.href = `/editor.html?page=${data[0].id}`;
}

// Media library
async function openMediaLibrary() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            await uploadMedia(file);
        }
        await loadMediaLibrary();
    };

    input.click();
}

async function uploadMedia(file) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
        // Upload naar Cloudinary
        const cloudinaryResponse = await uploadToCloudinary(file, 'media')

        // Sla referentie op in Supabase
        const { error } = await supabase
            .from('media')
            .insert([
                {
                    user_id: user.id,
                    url: cloudinaryResponse.secure_url,
                    cloudinary_id: cloudinaryResponse.public_id,
                    type: file.type,
                    filename: file.name
                }
            ])

        if (error) throw error

        return cloudinaryResponse.secure_url
    } catch (error) {
        console.error('Upload error:', error)
        showError('Upload mislukt')
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    await loadRecentPages();
}); 

async function deletePage(id) {
    if (!confirm('Weet je zeker dat je deze pagina wilt verwijderen?')) return;
    
    const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting page:', error);
        return;
    }

    await loadRecentPages();
} 

function editPage(id) {
    window.location.href = `/editor.html?page=${id}`;
} 