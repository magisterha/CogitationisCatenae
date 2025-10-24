// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- VARIABLES GLOBALES ---
    let currentLanguage = 'es'; // Idioma por defecto
    let allCots = []; // Array para almacenar todas las CoTs
    
    // Contenedores del DOM
    const showcaseContainer = document.getElementById('cot-showcase-container');
    const modal = document.getElementById('cot-modal');
    const modalCloseButton = modal.querySelector('.modal-close');

    // --- 1. INICIALIZACIÓN ---
    function init() {
        // Combinamos todas las CoTs de los archivos de datos en un solo array
        // Usamos '|| []' por si algún archivo está vacío y la variable no existe
        allCots = [
            ...(cots_latin || []),
            ...(cots_greek || []),
            ...(cots_chinese || [])
        ];
        
        // Renderizar la interfaz inicial
        switchLanguage(currentLanguage);
        renderShowcase('all'); // Mostrar todas las CoTs al inicio
        
        // Configurar los listeners (botones de idioma, filtros, modal)
        setupListeners();
    }

    // --- 2. RENDERIZADO DEL ESCAPARATE ---
    function renderShowcase(filterCategory) {
        // Limpiar el contenedor
        showcaseContainer.innerHTML = '';
        
        // Filtrar las CoTs según la categoría seleccionada
        const filteredCots = (filterCategory === 'all')
            ? allCots
            : allCots.filter(cot => cot.category === filterCategory);
        
        // Crear una tarjeta HTML por cada CoT filtrada
        filteredCots.forEach(cot => {
            const card = document.createElement('article');
            card.className = 'cot-card';
            card.dataset.id = cot.id; // Guardamos el ID para abrir el modal
            
            card.innerHTML = `
                <span class="cot-category">${cot.category}</span>
                <h3>${cot.title[currentLanguage]}</h3>
                <p>${cot.description[currentLanguage]}</p>
            `;
            
            // Añadir listener a la tarjeta para abrir el modal
            card.addEventListener('click', () => openModal(cot.id));
            
            showcaseContainer.appendChild(card);
        });
    }

    // --- 3. GESTIÓN DEL MODAL ---
    function openModal(cotId) {
        // Encontrar la CoT completa usando su ID
        const cot = allCots.find(c => c.id === cotId);
        if (!cot) return;
        
        // Rellenar el contenido del modal con el idioma actual
        modal.querySelector('#modal-title').textContent = cot.title[currentLanguage];
        modal.querySelector('#modal-prompt').textContent = cot.prompt[currentLanguage];
        modal.querySelector('#modal-explanation').innerHTML = cot.explanation[currentLanguage]; // innerHTML por si quieres usar <strong>, <p>, etc.
        
        // Formatear los pasos de la CoT (asumiendo que es un <pre>)
        modal.querySelector('#modal-cot-steps').innerHTML = `<pre>${cot.cot_steps[currentLanguage]}</pre>`;
        
        // Mostrar el modal
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // --- 4. CAMBIO DE IDIOMA ---
    function switchLanguage(lang) {
        currentLanguage = lang;
        document.documentElement.lang = lang; // Actualizar el lang del <html>
        
        // Obtener los textos de la UI para el idioma seleccionado
        const langStrings = ui_text[lang];
        
        // Iterar sobre todos los elementos que tienen una 'data-lang-key'
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.dataset.langKey;
            if (langStrings[key]) {
                element.textContent = langStrings[key];
            }
        });
        
        // Volver a renderizar el escaparate para que los títulos de las tarjetas se actualicen
        // (Mantenemos el filtro que esté activo)
        const currentFilter = document.querySelector('.filters button.active')?.id.replace('filter-', '') || 'all';
        renderShowcase(currentFilter);
    }

    // --- 5. CONFIGURACIÓN DE LISTENERS ---
    function setupListeners() {
        // Listeners para botones de idioma
        document.getElementById('lang-es').addEventListener('click', () => switchLanguage('es'));
        document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
        document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
        
        // Listeners para botones de filtro
        document.querySelectorAll('.filters button').forEach(button => {
            button.addEventListener('click', (e) => {
                // Quitar 'active' de todos
                document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
                // Añadir 'active' al clicado
                e.target.classList.add('active');
                
                // Extraer la categoría del ID del botón (ej: 'filter-latin' -> 'latin')
                const filter = e.target.id.replace('filter-', '');
                renderShowcase(filter);
            });
        });
        
        // Listeners para cerrar el modal
        modalCloseButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            // Cerrar si se hace clic en el fondo oscuro (el overlay)
            if (e.target === modal) {
                closeModal();
            }
        });
        // Cerrar con la tecla 'Escape'
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
    }

    // --- EJECUTAR LA APLICACIÓN ---
    init();
});
