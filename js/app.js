// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- VARIABLES GLOBALES ---
    let currentLanguage = 'es'; // Idioma por defecto
    let allCots = []; // Array para almacenar todas las CoTs (se llenará con fetch)
    
    // Contenedores del DOM
    const showcaseContainer = document.getElementById('cot-showcase-container');
    const modal = document.getElementById('cot-modal');
    const modalCloseButton = modal.querySelector('.modal-close');

    // --- 1. INICIALIZACIÓN (Modificada con Async/Await) ---
    async function init() {
        try {
            // Paso 1: Cargar el manifiesto que lista todas las CoTs
            const manifestResponse = await fetch('./data/cot_manifest.json');
            if (!manifestResponse.ok) throw new Error('No se pudo cargar el manifiesto');
            const manifest = await manifestResponse.json();

            // Paso 2: Crear un array de promesas para cargar CADA archivo CoT
            const cotPromises = manifest.cots.map(path => fetch(path));
            
            // Paso 3: Esperar a que todos los archivos se descarguen
            const cotResponses = await Promise.all(cotPromises);

            // Paso 4: Convertir todas las respuestas a JSON
            const cotsData = await Promise.all(cotResponses.map(res => {
                if (!res.ok) throw new Error(`Error al cargar ${res.url}`);
                return res.json();
            }));

            // Paso 5: ¡Tenemos los datos! Asignarlos a la variable global
            allCots = cotsData;
            
            // Paso 6: Ahora que allCots está lleno, renderizar la página
            switchLanguage(currentLanguage); // Esto llamará a renderShowcase y renderFeaturedCots
            
            // Configurar los listeners
            setupListeners();

        } catch (error) {
            console.error("Error al inicializar la aplicación:", error);
            if (showcaseContainer) {
                showcaseContainer.innerHTML = `<p style="color: red;">Error al cargar las Cadenas de Pensamiento. Revisa la consola para más detalles.</p>`;
            }
        }
    }

    // --- 2. RENDERIZADO DEL ESCAPARATE PRINCIPAL ---
    function renderShowcase(filterCategory) {
        if (!showcaseContainer) return;
        
        // Limpiar el contenedor
        showcaseContainer.innerHTML = '';
        
        // Filtrar las CoTs según la categoría seleccionada
        const filteredCots = (filterCategory === 'all')
            ? allCots
            : allCots.filter(cot => cot.category === filterCategory);

        // MODIFICACIÓN: Si el filtro es 'all', quitamos las que ya son destacadas
        // para evitar duplicados. Si es un filtro de categoría (ej: 'latin'), 
        // sí mostramos todo (destacadas y no destacadas).
        const finalCots = (filterCategory === 'all')
            ? filteredCots.filter(cot => !cot.isFeatured)
            : filteredCots;
        
        // Crear una tarjeta HTML por cada CoT filtrada
        finalCots.forEach(cot => {
            const card = document.createElement('article');
            card.className = 'cot-card';
            card.dataset.id = cot.id; 
            
            card.innerHTML = `
                <span class="cot-category">${cot.category}</span>
                <h3>${cot.title[currentLanguage]}</h3>
                <p>${cot.description[currentLanguage]}</p>
            `;
            
            card.addEventListener('click', () => openModal(cot.id));
            showcaseContainer.appendChild(card);
        });
    }

    // --- 3. NUEVA FUNCIÓN: RENDERIZADO DE DESTACADOS ---
    function renderFeaturedCots() {
        const featuredContainer = document.getElementById('featured-cots-grid');
        const featuredSection = document.getElementById('featured-cots-section');
        if (!featuredContainer || !featuredSection) return;

        featuredContainer.innerHTML = '';
        
        // Filtrar las CoTs que tengan la propiedad "isFeatured: true"
        const featuredCots = allCots.filter(cot => cot.isFeatured === true);

        // Ocultar la sección entera si no hay destacados
        if (featuredCots.length === 0) {
            featuredSection.style.display = 'none';
            return;
        }
        
        // Mostrar la sección (por si estaba oculta)
        featuredSection.style.display = 'block';

        // Crear una tarjeta HTML por cada CoT destacada
        featuredCots.forEach(cot => {
            const card = document.createElement('article');
            // Añadimos la clase 'featured' para el estilo opcional
            card.className = 'cot-card featured'; 
            card.dataset.id = cot.id;
            
            card.innerHTML = `
                <span class="cot-category">${cot.category}</span>
                <h3>${cot.title[currentLanguage]}</h3>
                <p>${cot.description[currentLanguage]}</p>
            `;
            
            card.addEventListener('click', () => openModal(cot.id));
            featuredContainer.appendChild(card);
        });
    }


    // --- 4. GESTIÓN DEL MODAL (Sin cambios) ---
    function openModal(cotId) {
        const cot = allCots.find(c => c.id === cotId);
        if (!cot) return;
        
        modal.querySelector('#modal-title').textContent = cot.title[currentLanguage];
        modal.querySelector('#modal-prompt').textContent = cot.prompt[currentLanguage];
        modal.querySelector('#modal-explanation').innerHTML = cot.explanation[currentLanguage];
        modal.querySelector('#modal-cot-steps').innerHTML = `<pre>${cot.cot_steps[currentLanguage]}</pre>`;
        
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // --- 5. CAMBIO DE IDIOMA (Modificado) ---
    function switchLanguage(lang) {
        // Comprobar si ui_text está disponible
        if (typeof ui_text === 'undefined' || !ui_text[lang]) {
            console.error(`Textos de UI para el idioma '${lang}' no encontrados.`);
            return;
        }
        
        currentLanguage = lang;
        document.documentElement.lang = lang; 
        
        const langStrings = ui_text[lang];
        
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.dataset.langKey;
            if (langStrings[key]) {
                element.textContent = langStrings[key];
            }
        });
        
        // Volver a renderizar ambos escaparates para que los títulos de las tarjetas se actualicen
        const currentFilter = document.querySelector('.filters button.active')?.id.replace('filter-', '') || 'all';
        renderShowcase(currentFilter);
        renderFeaturedCots(); // <-- Añadida llamada
    }

    // --- 6. CONFIGURACIÓN DE LISTENERS (Sin cambios) ---
    function setupListeners() {
        // Listeners para botones de idioma
        document.getElementById('lang-es').addEventListener('click', () => switchLanguage('es'));
        document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
        document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
        
        // Listeners para botones de filtro
        document.querySelectorAll('.filters button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.id.replace('filter-', '');
                renderShowcase(filter);
            });
        });
        
        // Listeners para cerrar el modal
        modalCloseButton.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
    }

    // --- EJECUTAR LA APLICACIÓN ---
    init();
});
