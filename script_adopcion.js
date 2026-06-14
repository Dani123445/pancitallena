window.addEventListener('DOMContentLoaded', () => {

    // ── Función helper: convierte un <select> nativo en select-custom ──
    function convertirSelectCustom(selectId, contenedorId, onChange) {
        const selectNativo = document.getElementById(selectId);
        if (!selectNativo) return;

        // Recoger opciones del select nativo (saltando la disabled)
        const opciones = Array.from(selectNativo.options)
            .filter(o => !o.disabled)
            .map(o => ({ valor: o.value, texto: o.text }));

        const placeholder = Array.from(selectNativo.options).find(o => o.disabled)?.text
            || 'Seleccione una opción...';

        // Ocultar select nativo y quitarle required para que no bloquee el submit
        selectNativo.style.display = 'none';
        selectNativo.removeAttribute('required');

        const contenedor = document.getElementById(contenedorId) || selectNativo.parentElement;

        const wrapper = document.createElement('div');
        wrapper.className = 'select-custom';

        const selected = document.createElement('div');
        selected.className = 'select-selected';
        selected.textContent = placeholder;

        const lista = document.createElement('ul');
        lista.className = 'select-opciones';

        const inputOculto = document.createElement('input');
        inputOculto.type = 'hidden';
        inputOculto.name = selectNativo.name;
        inputOculto.value = '';

        opciones.forEach(op => {
            const li = document.createElement('li');
            li.textContent = op.texto;
            li.dataset.valor = op.valor;
            li.addEventListener('click', function () {
                lista.querySelectorAll('li').forEach(i => i.classList.remove('seleccionado'));
                this.classList.add('seleccionado');
                selected.textContent = this.textContent;
                selected.classList.remove('abierto');
                lista.classList.remove('abierto');
                inputOculto.value = this.dataset.valor;
                if (onChange) onChange(this.dataset.valor);
            });
            lista.appendChild(li);
        });

        selected.addEventListener('click', function (e) {
            e.stopPropagation();
            const estaAbierto = lista.classList.contains('abierto');
            cerrarTodosLosSelects();
            if (!estaAbierto) {
                selected.classList.add('abierto');
                lista.classList.add('abierto');
            }
        });

        wrapper.appendChild(selected);
        wrapper.appendChild(lista);
        wrapper.appendChild(inputOculto);

        // Insertar justo después del select nativo
        selectNativo.insertAdjacentElement('afterend', wrapper);

        return inputOculto; // retorna referencia para leer el valor luego
    }

    function cerrarTodosLosSelects() {
        document.querySelectorAll('.select-selected').forEach(s => s.classList.remove('abierto'));
        document.querySelectorAll('.select-opciones').forEach(s => s.classList.remove('abierto'));
    }

    document.addEventListener('click', cerrarTodosLosSelects);
    convertirSelectCustom('distrito',      'select-distrito');
    convertirSelectCustom('vivienda',      'select-vivienda', function(valor) {
        document.getElementById('vivienda_otro').style.display =
            valor === 'otro' ? 'block' : 'none';
    });
    convertirSelectCustom('tiempo',        'select-tiempo');
    convertirSelectCustom('tipo_mascota',  'select-tipo-mascota');

    document.getElementById('vivienda_otro').style.display = 'none';
    let mascotaValorInput = null;

    fetch('https://pancitallena.onrender.com/perros')
        .then(r => r.json())
        .then(perros => {
            const disponibles = perros.filter(p => p.estado === 'Disponible');

            const selectNativo = document.getElementById('mascota_elegida');
            selectNativo.style.display = 'none';
            selectNativo.removeAttribute('required');

            const contenedor = document.getElementById('select-mascota');

            const wrapper = document.createElement('div');
            wrapper.className = 'select-custom';

            const selected = document.createElement('div');
            selected.className = 'select-selected';
            selected.textContent = 'Seleccione una opción...';

            const lista = document.createElement('ul');
            lista.className = 'select-opciones';

            mascotaValorInput = document.createElement('input');
            mascotaValorInput.type = 'hidden';
            mascotaValorInput.name = 'Mascota_Elegida';
            mascotaValorInput.value = '';

            disponibles.forEach(p => {
                const li = document.createElement('li');
                li.textContent = p.nombre;
                li.dataset.valor = p.nombre;
                li.addEventListener('click', function () {
                    lista.querySelectorAll('li').forEach(i => i.classList.remove('seleccionado'));
                    this.classList.add('seleccionado');
                    selected.textContent = this.textContent;
                    selected.classList.remove('abierto');
                    lista.classList.remove('abierto');
                    mascotaValorInput.value = this.dataset.valor;
                });
                lista.appendChild(li);
            });

            selected.addEventListener('click', function (e) {
                e.stopPropagation();
                const estaAbierto = lista.classList.contains('abierto');
                cerrarTodosLosSelects();
                if (!estaAbierto) {
                    selected.classList.add('abierto');
                    lista.classList.add('abierto');
                }
            });

            wrapper.appendChild(selected);
            wrapper.appendChild(lista);
            wrapper.appendChild(mascotaValorInput);
            contenedor.appendChild(wrapper);

            // Preseleccionar si viene por URL
            const urlParams = new URLSearchParams(window.location.search);
            const animal = urlParams.get('animal');
            if (animal) {
                mascotaValorInput.value = animal;
                selected.textContent = animal;
                lista.querySelectorAll('li').forEach(li => {
                    if (li.dataset.valor === animal) li.classList.add('seleccionado');
                });
            }
        })
        .catch(() => {
            const contenedor = document.getElementById('select-mascota');
            const msg = document.createElement('p');
            msg.style.color = 'red';
            msg.textContent = 'Error al cargar mascotas. Recarga la página.';
            contenedor.appendChild(msg);
        });

    // ── Archivo ──
    document.getElementById('archivo_input').addEventListener('change', function () {
        document.getElementById('nombre_archivo').textContent =
            this.files[0] ? this.files[0].name : 'Ningún archivo seleccionado';
    });

    // ── Submit ──
    document.querySelector('.form_adopcion').addEventListener('submit', function (e) {
        e.preventDefault();

        const mascota = mascotaValorInput ? mascotaValorInput.value : '';
        if (!mascota) { alert('Por favor selecciona una mascota.'); return; }

        const dni = document.getElementById('dni').value;
        if (!/^\d{8}$/.test(dni)) { alert('El DNI debe tener exactamente 8 números.'); return; }

        const nombre = document.getElementById('nombre').value.trim();
        if (!nombre || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)) {
            alert('Ingrese un nombre válido (solo letras y espacios).'); return;
        }

        const edad = parseInt(document.getElementById('edad').value);
        if (!edad || edad < 18) { alert('Debes ser mayor de 18 años para adoptar.'); return; }
        if (edad > 100)         { alert('Ingrese una edad válida.'); return; }

        const telefono = document.getElementById('telefono').value;
        if (!/^\d{9}$/.test(telefono)) { alert('El teléfono debe tener exactamente 9 números.'); return; }

        if (document.getElementById('alquiler_si').checked &&
            document.getElementById('arrendador_no').checked) {
            alert('Lo sentimos, tu arrendador no permite mascotas. No puedes continuar con la adopción.');
            return;
        }

        if (document.getElementById('alergias_si').checked) {
            if (!document.getElementById('alergias_detalle').value.trim()) {
                alert('Por favor, describe las alergias y las medidas tomadas.'); return;
            }
            if (!confirm('Alguien en tu hogar tiene alergias. ¿Estás seguro de que deseas continuar?')) return;
        }

        const expSi = document.getElementById('experiencia_si').checked;
        const expNo = document.getElementById('experiencia_no').checked;
        if (!expSi && !expNo) { alert('Indica si tienes experiencia previa con mascotas.'); return; }

        if (!document.getElementById('motivo').value.trim()) {
            alert('Por favor, describe tu motivo para adoptar.'); return;
        }
        if (document.getElementById('archivo_input').files.length === 0) {
            alert('Debes subir tu certificado de antecedentes penales.'); return;
        }
        if (!document.getElementById('agreement').checked) {
            alert('Debes aceptar las condiciones de seguimiento y responsabilidad.'); return;
        }

        localStorage.setItem('solicitudAdopcion', JSON.stringify({
            mascota,
            nombre:   document.getElementById('nombre').value,
            correo:   document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            fecha:    new Date().toLocaleDateString()
        }));

        // Construir FormData sin el archivo (Formspree plan gratuito no permite archivos)
        const formData = new FormData();
        for (const [key, value] of new FormData(this).entries()) {
            if (value instanceof File) {
                if (value.name) formData.append('Certificado_Nombre', value.name);
                continue;
            }
            formData.append(key, value);
        }
        formData.set('Mascota_Elegida', mascota);

        fetch(this.action, {
            method:  'POST',
            body:    formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(r => {
            if (r.ok) {
                window.location.href = 'espera.html';
            } else {
                alert('Error al enviar. Intenta nuevamente.');
            }
        })
        .catch(() => alert('Error de conexión.'));
    });
});
document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const datos = {
        mascota: document.getElementById('mascota_elegida').value,
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        fecha: new Date().toLocaleDateString('es-PE')
    };

    // Enviar a Formspree
    const respuesta = await fetch('https://formspree.io/f/mlgkgnqq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (respuesta.ok) {
        sessionStorage.setItem('solicitudAdopcion', JSON.stringify(datos));
        window.location.href = 'espera.html';
    } else {
        alert('Hubo un error al enviar. Inténtalo de nuevo.');
    }
});
