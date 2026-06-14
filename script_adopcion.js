window.addEventListener('DOMContentLoaded', () => {

    function convertirSelectCustom(selectId, contenedorId, onChange) {
        const selectNativo = document.getElementById(selectId);
        if (!selectNativo) return;

        const opciones = new ListaEnlazada();
        let placeholder = 'Seleccione una opción...';

        function cargarOpciones(options, idx) {
            if (idx >= options.length) return;
            const o = options[idx];
            if (o.disabled) {
                placeholder = o.text;
            } else {
                opciones.insertar({ valor: o.value, texto: o.text });
            }
            cargarOpciones(options, idx + 1);
        }
        cargarOpciones(selectNativo.options, 0);

        selectNativo.style.display = 'none';
        selectNativo.removeAttribute('required');

        const contenedor = document.getElementById(contenedorId) || selectNativo.parentElement;
        const wrapper    = document.createElement('div');
        wrapper.className = 'select-custom';

        const selected = document.createElement('div');
        selected.className = 'select-selected';
        selected.textContent = placeholder;

        const lista = document.createElement('ul');
        lista.className = 'select-opciones';

        const inputOculto = document.createElement('input');
        inputOculto.type  = 'hidden';
        inputOculto.name  = selectNativo.name;
        inputOculto.value = '';

        function agregarOpcionSelect(nodo) {
            if (!nodo) return;
            const op = nodo.dato;
            const li = document.createElement('li');
            li.textContent   = op.texto;
            li.dataset.valor = op.valor;
            li.addEventListener('click', function() {
                const items = lista.querySelectorAll('li');
                function limpiarSeleccion(items, idx) {
                    if (idx >= items.length) return;
                    items[idx].classList.remove('seleccionado');
                    limpiarSeleccion(items, idx + 1);
                }
                limpiarSeleccion(items, 0);
                this.classList.add('seleccionado');
                selected.textContent = this.textContent;
                selected.classList.remove('abierto');
                lista.classList.remove('abierto');
                inputOculto.value = this.dataset.valor;
                if (onChange) onChange(this.dataset.valor);
            });
            lista.appendChild(li);
            agregarOpcionSelect(nodo.siguiente);
        }
        agregarOpcionSelect(opciones.cabeza);

        selected.addEventListener('click', function(e) {
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
        selectNativo.insertAdjacentElement('afterend', wrapper);

        return inputOculto;
    }

    function cerrarTodosLosSelects() {
        const selects  = document.querySelectorAll('.select-selected');
        const opciones = document.querySelectorAll('.select-opciones');
        function limpiar(items, idx) {
            if (idx >= items.length) return;
            items[idx].classList.remove('abierto');
            limpiar(items, idx + 1);
        }
        limpiar(selects, 0);
        limpiar(opciones, 0);
    }

    document.addEventListener('click', cerrarTodosLosSelects);

    convertirSelectCustom('distrito',     'select-distrito');
    convertirSelectCustom('vivienda',     'select-vivienda', function(valor) {
        document.getElementById('vivienda_otro').style.display =
            valor === 'otro' ? 'block' : 'none';
    });
    convertirSelectCustom('tiempo',       'select-tiempo');
    convertirSelectCustom('tipo_mascota', 'select-tipo-mascota');

    document.getElementById('vivienda_otro').style.display = 'none';

    let mascotaValorInput = null;

    fetch('https://pancitallena.onrender.com/perros')
        .then(r => r.json())
        .then(perros => {
            const disponibles = new ListaEnlazada();
            function filtrarDisponibles(data, idx) {
                if (idx >= data.length) return;
                if (data[idx].estado === 'Disponible') disponibles.insertar(data[idx]);
                filtrarDisponibles(data, idx + 1);
            }
            filtrarDisponibles(perros, 0);

            const selectNativo = document.getElementById('mascota_elegida');
            selectNativo.style.display = 'none';
            selectNativo.removeAttribute('required');

            const contenedor = document.getElementById('select-mascota');
            const wrapper    = document.createElement('div');
            wrapper.className = 'select-custom';

            const selected = document.createElement('div');
            selected.className   = 'select-selected';
            selected.textContent = 'Seleccione una opción...';

            const lista = document.createElement('ul');
            lista.className = 'select-opciones';

            mascotaValorInput       = document.createElement('input');
            mascotaValorInput.type  = 'hidden';
            mascotaValorInput.name  = 'Mascota_Elegida';
            mascotaValorInput.value = '';

            function agregarOpcion(nodo) {
                if (!nodo) return;
                const p  = nodo.dato;
                const li = document.createElement('li');
                li.textContent   = p.nombre;
                li.dataset.valor = p.nombre;
                li.addEventListener('click', function() {
                    const items = lista.querySelectorAll('li');
                    function limpiarSeleccion(items, idx) {
                        if (idx >= items.length) return;
                        items[idx].classList.remove('seleccionado');
                        limpiarSeleccion(items, idx + 1);
                    }
                    limpiarSeleccion(items, 0);
                    this.classList.add('seleccionado');
                    selected.textContent = this.textContent;
                    selected.classList.remove('abierto');
                    lista.classList.remove('abierto');
                    mascotaValorInput.value = this.dataset.valor;
                });
                lista.appendChild(li);
                agregarOpcion(nodo.siguiente);
            }
            agregarOpcion(disponibles.cabeza);

            selected.addEventListener('click', function(e) {
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

            const urlParams = new URLSearchParams(window.location.search);
            const animal    = urlParams.get('animal');
            if (animal) {
                mascotaValorInput.value = animal;
                selected.textContent    = animal;
                const items = lista.querySelectorAll('li');
                function preseleccionar(items, idx) {
                    if (idx >= items.length) return;
                    if (items[idx].dataset.valor === animal) items[idx].classList.add('seleccionado');
                    preseleccionar(items, idx + 1);
                }
                preseleccionar(items, 0);
            }
        })
        .catch(() => {
            const contenedor = document.getElementById('select-mascota');
            const msg = document.createElement('p');
            msg.style.color = 'red';
            msg.textContent = 'Error al cargar mascotas. Recarga la página.';
            contenedor.appendChild(msg);
        });

    document.getElementById('archivo_input').addEventListener('change', function() {
        document.getElementById('nombre_archivo').textContent =
            this.files[0] ? this.files[0].name : 'Ningún archivo seleccionado';
    });

    document.querySelector('.form_adopcion').addEventListener('submit', function(e) {
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

        const formData       = new FormData();
        const rawFormData    = new FormData(this);
        const formDataLista  = new ListaEnlazada();

        function cargarEntradas(keys, idx) {
            if (idx >= keys.length) return;
            const key   = keys[idx];
            const value = rawFormData.get(key);
            formDataLista.insertar({ key, value });
            cargarEntradas(keys, idx + 1);
        }
        const keys = Object.keys(Object.fromEntries(rawFormData));
        cargarEntradas(keys, 0);

        function procesarEntradas(nodo) {
            if (!nodo) return;
            const key   = nodo.dato.key;
            const value = nodo.dato.value;
            if (value instanceof File) {
                if (value.name) formData.append('Certificado_Nombre', value.name);
            } else {
                formData.append(key, value);
            }
            procesarEntradas(nodo.siguiente);
        }
        procesarEntradas(formDataLista.cabeza);
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