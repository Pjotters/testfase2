document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/login.html';
        return;
    }
}); 