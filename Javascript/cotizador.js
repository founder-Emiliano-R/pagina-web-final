// ============================================
// COTIZADOR - JAVASCRIPT SIMPLIFICADO
// ============================================
// Los servicios y precios estan en el HTML
// Este archivo solo maneja la logica

let currentStep = 1;
const totalSteps = 5;

// Estado del cotizador
const cotizadorState = {
    tipoEvento: '',
    fechaEvento: '',
    lugarEvento: '',
    numeroInvitados: 0,
    moneda: 'MXN',
    serviciosSeleccionados: [],
    addOnsSeleccionados: [],
    subtotal: 0,
    total: 0,
    nombreCliente: '',
    email: '',
    telefono: '',
    notas: ''
};

// ============================================
// INICIALIZACION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Cotizador inicializado');

    // Event listeners
    inicializarEventListeners();

    // Configurar fecha minima (hoy)
    const fechaInput = document.getElementById('fechaEvento');
    if (fechaInput) {
        fechaInput.min = new Date().toISOString().split('T')[0];
    }
});

// ============================================
// EVENT LISTENERS
// ============================================

function inicializarEventListeners() {

    // Botones de navegacion
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', siguientePaso);
    });

    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', pasoAnterior);
    });

    // Seleccion de tipo de evento
    document.querySelectorAll('.evento-card').forEach(card => {
        card.addEventListener('click', function() {
            seleccionarTipoEvento(this);
        });
    });

    // Cambio de moneda
    const monedaRadios = document.querySelectorAll('input[name="moneda"]');
    monedaRadios.forEach(radio => {
        radio.addEventListener('change', cambiarMoneda);
    });

    // Envio del formulario
    const form = document.getElementById('cotizadorForm');
    if (form) {
        form.addEventListener('submit', enviarCotizacion);
    }
}

// ============================================
// NAVEGACION ENTRE PASOS
// ============================================

function siguientePaso() {
    if (validarPasoActual()) {
        if (currentStep < totalSteps) {
            currentStep++;
            actualizarPaso();
            
            // Cargar servicios cuando entras al paso 2
            if (currentStep === 2) {
                mostrarServiciosPorEvento();
                agregarEventListenersServicios();
            }
            
            // Cargar add-ons cuando entras al paso 3
            if (currentStep === 3) {
                mostrarAddonsPorEvento();
                agregarEventListenersAddons();
            }
            
            // Generar resumen en paso 5
            if (currentStep === 5) {
                generarResumen();
            }
        }
    }
}

function pasoAnterior() {
    if (currentStep > 1) {
        currentStep--;
        actualizarPaso();
    }
}

function actualizarPaso() {
    // Ocultar todos los pasos
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });

    // Mostrar paso actual
    const pasoActual = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    if (pasoActual) {
        pasoActual.classList.add('active');
    }

    // Actualizar barra de progreso
    document.querySelectorAll('.progress-bar .step').forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('active');
            step.classList.add('completed');
        } else if (index === currentStep - 1) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active');
            step.classList.remove('completed');
        }
    });

    // Scroll al inicio de la seccion
    const cotizadorSection = document.querySelector('.cotizador-section');
    if (cotizadorSection) {
        cotizadorSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ============================================
// VALIDACION
// ============================================

function validarPasoActual() {
    switch(currentStep) {
        case 1:
            return validarPaso1();
        case 2:
            return validarPaso2();
        case 3:
            return true; // Add-ons son opcionales
        case 4:
            return validarPaso4();
        default:
            return true;
    }
}

function validarPaso1() {
    if (!cotizadorState.tipoEvento) {
        alert('Por favor selecciona un tipo de evento');
        return false;
    }

    const fechaEvento = document.getElementById('fechaEvento').value;
    if (!fechaEvento) {
        alert('Por favor indica la fecha del evento');
        document.getElementById('fechaEvento').focus();
        return false;
    }

    cotizadorState.fechaEvento = fechaEvento;
    cotizadorState.lugarEvento = document.getElementById('lugarEvento').value;

    return true;
}

function validarPaso2() {
    if (cotizadorState.serviciosSeleccionados.length === 0) {
        alert('Por favor selecciona al menos un servicio');
        return false;
    }
    return true;
}

function validarPaso4() {
    const nombre = document.getElementById('nombreCliente').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!nombre) {
        alert('Por favor ingresa tu nombre completo');
        document.getElementById('nombreCliente').focus();
        return false;
    }

    if (!email) {
        alert('Por favor ingresa tu correo electronico');
        document.getElementById('email').focus();
        return false;
    }

    if (!validarEmail(email)) {
        alert('Por favor ingresa un correo electronico valido');
        document.getElementById('email').focus();
        return false;
    }

    if (!telefono) {
        alert('Por favor ingresa tu telefono');
        document.getElementById('telefono').focus();
        return false;
    }

    cotizadorState.nombreCliente = nombre;
    cotizadorState.email = email;
    cotizadorState.telefono = telefono;
    cotizadorState.numeroInvitados = document.getElementById('numeroInvitados').value || 0;
    cotizadorState.notas = document.getElementById('notas').value.trim();

    return true;
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// SELECCION DE TIPO DE EVENTO
// ============================================

function seleccionarTipoEvento(card) {
    // Remover seleccion previa
    document.querySelectorAll('.evento-card').forEach(c => {
        c.classList.remove('selected');
    });

    // Seleccionar nueva card
    card.classList.add('selected');

    // Guardar tipo de evento
    cotizadorState.tipoEvento = card.dataset.tipo;

    // Actualizar sidebar
    actualizarSidebar();
}

// ============================================
// MOSTRAR/OCULTAR SERVICIOS POR EVENTO
// ============================================

function mostrarServiciosPorEvento() {
    // Ocultar todos los contenedores de servicios
    document.querySelectorAll('.servicios-container').forEach(container => {
        container.style.display = 'none';
    });

    // Mostrar solo el contenedor del evento seleccionado
    const contenedor = document.getElementById(`servicios-${cotizadorState.tipoEvento}`);
    if (contenedor) {
        contenedor.style.display = 'block';
        console.log('Mostrando servicios para:', cotizadorState.tipoEvento);
    }
}

function agregarEventListenersServicios() {
    // Agregar event listeners a todas las cards de servicio
    document.querySelectorAll('.servicio-card').forEach(card => {
        // Remover listener previo si existe
        card.removeEventListener('click', toggleServicio);
        // Agregar nuevo listener
        card.addEventListener('click', toggleServicio);
    });
}

function toggleServicio() {
    const servicioId = this.dataset.id;
    const precioMXN = parseFloat(this.dataset.precioMxn);
    const precioUSD = parseFloat(this.dataset.precioUsd);
    const nombre = this.querySelector('h4').textContent;
    const descripcion = this.querySelector('.descripcion').textContent;

    // Verificar si ya esta seleccionado
    const index = cotizadorState.serviciosSeleccionados.findIndex(s => s.id === servicioId);

    if (index > -1) {
        // Deseleccionar
        cotizadorState.serviciosSeleccionados.splice(index, 1);
        this.classList.remove('selected');
    } else {
        // Seleccionar
        cotizadorState.serviciosSeleccionados.push({
            id: servicioId,
            nombre: nombre,
            descripcion: descripcion,
            precioMXN: precioMXN,
            precioUSD: precioUSD
        });
        this.classList.add('selected');
    }

    // Actualizar totales
    calcularTotal();
    actualizarSidebar();
}

// ============================================
// MOSTRAR/OCULTAR ADDONS POR EVENTO
// ============================================

function mostrarAddonsPorEvento() {
    // Ocultar todos los contenedores de add-ons
    document.querySelectorAll('.addons-container').forEach(container => {
        container.style.display = 'none';
    });

    // Determinar que add-ons mostrar segun el tipo de evento
    let contenedorId = '';
    
    if (cotizadorState.tipoEvento === 'boda' || cotizadorState.tipoEvento === 'quinceanera' || cotizadorState.tipoEvento === 'otro') {
        contenedorId = 'addons-eventos';
    } else if (cotizadorState.tipoEvento === 'individual' || cotizadorState.tipoEvento === 'maternidad' || cotizadorState.tipoEvento === 'newborn') {
        contenedorId = 'addons-sesiones';
    } else if (cotizadorState.tipoEvento === 'gastronomia' || cotizadorState.tipoEvento === 'moda') {
        contenedorId = 'addons-comercial';
    }

    // Mostrar el contenedor correspondiente
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.style.display = 'block';
        console.log('Mostrando add-ons para:', cotizadorState.tipoEvento);
    }
}

function agregarEventListenersAddons() {
    // Agregar event listeners a todas las cards de add-ons
    document.querySelectorAll('.addon-card').forEach(card => {
        // Remover listener previo si existe
        card.removeEventListener('click', toggleAddon);
        // Agregar nuevo listener
        card.addEventListener('click', toggleAddon);
    });
}

function toggleAddon() {
    const addonId = this.dataset.id;
    const precioMXN = parseFloat(this.dataset.precioMxn);
    const precioUSD = parseFloat(this.dataset.precioUsd);
    const nombre = this.querySelector('h4').textContent;
    const descripcion = this.querySelector('.descripcion').textContent;

    // Verificar si ya esta seleccionado
    const index = cotizadorState.addOnsSeleccionados.findIndex(a => a.id === addonId);

    if (index > -1) {
        // Deseleccionar
        cotizadorState.addOnsSeleccionados.splice(index, 1);
        this.classList.remove('selected');
    } else {
        // Seleccionar
        cotizadorState.addOnsSeleccionados.push({
            id: addonId,
            nombre: nombre,
            descripcion: descripcion,
            precioMXN: precioMXN,
            precioUSD: precioUSD
        });
        this.classList.add('selected');
    }

    // Actualizar totales
    calcularTotal();
    actualizarSidebar();
}

// ============================================
// CAMBIAR MONEDA
// ============================================

function cambiarMoneda() {
    cotizadorState.moneda = this.value;
    
    // Mostrar/ocultar precios en HTML
    const mostrarMXN = cotizadorState.moneda === 'MXN';
    
    document.querySelectorAll('.precio-mxn').forEach(el => {
        el.style.display = mostrarMXN ? 'inline' : 'none';
    });
    
    document.querySelectorAll('.precio-usd').forEach(el => {
        el.style.display = mostrarMXN ? 'none' : 'inline';
    });

    // Actualizar totales
    calcularTotal();
    actualizarSidebar();
}

// ============================================
// CALCULAR TOTAL
// ============================================

function calcularTotal() {
    const campoPrecio = cotizadorState.moneda === 'MXN' ? 'precioMXN' : 'precioUSD';

    // Calcular subtotal de servicios
    let subtotal = cotizadorState.serviciosSeleccionados.reduce((total, servicio) => {
        return total + (servicio[campoPrecio] || 0);
    }, 0);

    // Agregar add-ons
    subtotal += cotizadorState.addOnsSeleccionados.reduce((total, addon) => {
        return total + (addon[campoPrecio] || 0);
    }, 0);

    cotizadorState.subtotal = subtotal;
    cotizadorState.total = subtotal;

    return cotizadorState.total;
}

// ============================================
// ACTUALIZAR SIDEBAR
// ============================================

function actualizarSidebar() {
    const simbolo = cotizadorState.moneda === 'MXN' ? '$' : 'US$';

    // Tipo de evento
    const sidebarEvento = document.getElementById('sidebarEvento');
    if (sidebarEvento) {
        sidebarEvento.textContent = cotizadorState.tipoEvento 
            ? formatearTipoEvento(cotizadorState.tipoEvento)
            : '-';
    }

    // Fecha
    const sidebarFecha = document.getElementById('sidebarFecha');
    if (sidebarFecha) {
        sidebarFecha.textContent = cotizadorState.fechaEvento 
            ? formatearFecha(cotizadorState.fechaEvento)
            : '-';
    }

    // Numero de servicios
    const sidebarNumServicios = document.getElementById('sidebarNumServicios');
    if (sidebarNumServicios) {
        sidebarNumServicios.textContent = cotizadorState.serviciosSeleccionados.length;
    }

    // Numero de add-ons
    const sidebarNumAddons = document.getElementById('sidebarNumAddons');
    if (sidebarNumAddons) {
        sidebarNumAddons.textContent = cotizadorState.addOnsSeleccionados.length;
    }

    // Total
    const sidebarTotal = document.getElementById('sidebarTotal');
    if (sidebarTotal) {
        const total = calcularTotal();
        sidebarTotal.textContent = `${simbolo}${total.toLocaleString()}`;
    }
}

// ============================================
// GENERAR RESUMEN
// ============================================

function generarResumen() {
    const simbolo = cotizadorState.moneda === 'MXN' ? '$' : 'US$';
    const campoPrecio = cotizadorState.moneda === 'MXN' ? 'precioMXN' : 'precioUSD';

    // Resumen del evento
    const resumenEvento = document.getElementById('resumenEvento');
    if (resumenEvento) {
        resumenEvento.innerHTML = `
            <p><strong>Tipo de evento:</strong> ${formatearTipoEvento(cotizadorState.tipoEvento)}</p>
            <p><strong>Fecha:</strong> ${formatearFecha(cotizadorState.fechaEvento)}</p>
            ${cotizadorState.lugarEvento ? `<p><strong>Lugar:</strong> ${cotizadorState.lugarEvento}</p>` : ''}
            ${cotizadorState.numeroInvitados > 0 ? `<p><strong>Invitados:</strong> ${cotizadorState.numeroInvitados}</p>` : ''}
            <p><strong>Nombre:</strong> ${cotizadorState.nombreCliente}</p>
            <p><strong>Email:</strong> ${cotizadorState.email}</p>
            <p><strong>Telefono:</strong> ${cotizadorState.telefono}</p>
        `;
    }

    // Resumen de servicios
    const resumenServicios = document.getElementById('resumenServicios');
    if (resumenServicios) {
        let html = '<ul>';
        cotizadorState.serviciosSeleccionados.forEach(servicio => {
            const precio = servicio[campoPrecio];
            html += `
                <li>
                    <strong>${servicio.nombre}</strong> - ${simbolo}${precio.toLocaleString()}
                    <br><small>${servicio.descripcion}</small>
                </li>
            `;
        });
        html += '</ul>';
        resumenServicios.innerHTML = html;
    }

    // Resumen de add-ons
    const resumenAddons = document.getElementById('resumenAddons');
    const resumenAddonsSection = document.getElementById('resumenAddonsSection');
    
    if (cotizadorState.addOnsSeleccionados.length > 0) {
        if (resumenAddonsSection) {
            resumenAddonsSection.style.display = 'block';
        }
        if (resumenAddons) {
            let html = '<ul>';
            cotizadorState.addOnsSeleccionados.forEach(addon => {
                const precio = addon[campoPrecio];
                html += `
                    <li>
                        <strong>${addon.nombre}</strong> - ${simbolo}${precio.toLocaleString()}
                        <br><small>${addon.descripcion}</small>
                    </li>
                `;
            });
            html += '</ul>';
            resumenAddons.innerHTML = html;
        }
    } else {
        if (resumenAddonsSection) {
            resumenAddonsSection.style.display = 'none';
        }
    }

    // Totales
    const resumenSubtotal = document.getElementById('resumenSubtotal');
    const resumenTotal = document.getElementById('resumenTotal');

    if (resumenSubtotal) {
        resumenSubtotal.textContent = `${simbolo}${cotizadorState.subtotal.toLocaleString()}`;
    }

    if (resumenTotal) {
        resumenTotal.textContent = `${simbolo}${cotizadorState.total.toLocaleString()}`;
    }
}

// ============================================
// ENVIAR COTIZACION CON EMAILJS
// ============================================

async function enviarCotizacion(e) {
    e.preventDefault();

    const btnSubmit = document.querySelector('.btn-submit');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        const simbolo = cotizadorState.moneda === 'MXN' ? '$' : 'US$';
        const campoPrecio = cotizadorState.moneda === 'MXN' ? 'precioMXN' : 'precioUSD';

        // Crear lista de servicios
        let serviciosTexto = '';
        cotizadorState.serviciosSeleccionados.forEach(servicio => {
            const precio = servicio[campoPrecio];
            serviciosTexto += `- ${servicio.nombre}: ${simbolo}${precio.toLocaleString()}\n  ${servicio.descripcion}\n\n`;
        });

        // Crear lista de add-ons
        let addonsTexto = '';
        if (cotizadorState.addOnsSeleccionados.length > 0) {
            cotizadorState.addOnsSeleccionados.forEach(addon => {
                const precio = addon[campoPrecio];
                addonsTexto += `- ${addon.nombre}: ${simbolo}${precio.toLocaleString()}\n  ${addon.descripcion}\n\n`;
            });
        }

        // Generar numero de cotizacion
        const numeroCotizacion = 'AVM-' + Date.now();

        // Parametros para EmailJS
        const templateParams = {
            numero_cotizacion: numeroCotizacion,
            nombre_cliente: cotizadorState.nombreCliente,
            email_cliente: cotizadorState.email,
            telefono_cliente: cotizadorState.telefono,
            tipo_evento: formatearTipoEvento(cotizadorState.tipoEvento),
            fecha_evento: formatearFecha(cotizadorState.fechaEvento),
            lugar_evento: cotizadorState.lugarEvento || 'No especificado',
            numero_invitados: cotizadorState.numeroInvitados || 'No especificado',
            servicios: serviciosTexto,
            addons: addonsTexto || 'Ninguno',
            subtotal: `${simbolo}${cotizadorState.subtotal.toLocaleString()}`,
            descuento: 'Sin descuento',
            total: `${simbolo}${cotizadorState.total.toLocaleString()}`,
            moneda: cotizadorState.moneda,
            notas: cotizadorState.notas || 'Ninguna',
            fecha_cotizacion: new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        // Enviar email con EmailJS
        // Email principal al cliente, CC al fundador
        await emailjs.send(
            'service_bvffiiw',
            'template_8w9xev8',
            templateParams,
            'KmFZOET7b8HIyyt03'
        );

        // Mostrar modal de exito
        document.getElementById('numeroCotizacion').textContent = numeroCotizacion;
        document.getElementById('emailConfirmacion').textContent = cotizadorState.email;
        mostrarModal('successModal');

    } catch (error) {
        console.error('Error al enviar cotizacion:', error);
        document.getElementById('errorMessage').textContent = 
            'Hubo un problema al enviar tu cotizacion. Por favor intenta nuevamente o contactanos directamente.';
        mostrarModal('errorModal');
        
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function formatearTipoEvento(tipo) {
    const tipos = {
        'boda': 'Boda',
        'quinceanera': 'XV Anos',
        'individual': 'Retratos / Branding',
        'maternidad': 'Maternidad',
        'newborn': 'Newborn',
        'gastronomia': 'Gastronomia',
        'moda': 'Moda / E-commerce',
        'otro': 'Otro Evento'
    };
    return tipos[tipo] || tipo;
}

function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function mostrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============================================
// BOTÓN SIGUIENTE FIJO EN MÓVILES
// ============================================

window.addEventListener('scroll', () => {
    const form = document.querySelector('.cotizador-form');
    const btnNext = document.querySelector('.form-step.active .btn-next');

    if (!form || !btnNext) return;

    const formRect = form.getBoundingClientRect();
    const inView = formRect.top < window.innerHeight && formRect.bottom > 900;

    if (window.innerWidth <= 760 && inView) {
        btnNext.classList.add('fixed-mobile');  
    } else {
        btnNext.classList.remove('fixed-mobile');
    }
});
