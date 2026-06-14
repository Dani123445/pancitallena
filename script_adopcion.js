window.addEventListener('DOMContentLoaded', () => {
    function convertirSelectCustom(selectId, contenedorId, onChange) {
        const selectNativo = document.getElementById(selectId);
        if (!selectNativo) return;

        const wrapper  = document.createElement('div');
        wrapper.className = 'select-custom';
        const selected = document.createElement('div');
        selected.className = 'select-selected';
        const inputOculto = document.createElement('input');
        inputOculto.type  = 'hidden';
        inputOculto.name  = selectNativo.name;
        inputOculto.value = '';
        const lista = document.createElement('ul');
        lista.className = 'select-opciones';

        let placeholder = 'Seleccione una opción...';
        let idx = 0;
        while (idx < selectNativo.options.length) {
            const op = selectNativo.options[idx];
            if (op.disabled) { placeholder = op.text; idx++; continue; }
            const li = document.createElement('li');
            li.textContent   = op.text;
            li.dataset.valor = op.value;
            li.addEventListener('click', function() {
                const items = lista.querySelectorAll('li');
                let j = 0;
                while (j < items.length) { items[j].classList.remove('seleccionado'); j++; }
                this.classList.add('seleccionado');
                selected.textContent = this.textContent;
                selected.classList.remove('abierto');
                lista.classList.remove('abierto');
                inputOculto.value = this.dataset.valor;
                if (onChange) onChange(this.dataset.valor);
            });
            lista.appendChild(li);
            idx++;
        }

        selected.textContent = placeholder;
        selectNativo.style.display = 'none';
        selectNativo.removeAttribute('required');

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
        let i = 0;
        while (i < selects.length)  { selects[i].classList.remove('abierto');  i++; }
        let j = 0;
        while (j < opciones.length) { opciones[j].classList.remove('abierto'); j++; }
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

    function agregarOpcionMascota(perros, idx, lista, selected, mascotaValorInput) {
        if (idx >= perros.length) return;
        const p = perros[idx];
        if (p.estado === 'Disponible') {
            const li = document.createElement('li');
            li.textContent   = p.nombre;
            li.dataset.valor = p.nombre;
            li.addEventListener('click', function() {
                const items = lista.querySelectorAll('li');
                let j = 0;
                while (j < items.length) { items[j].classList.remove('seleccionado'); j++; }
                this.classList.add('seleccionado');
                selected.textContent = this.textContent;
                selected.classList.remove('abierto');
                lista.classList.remove('abierto');
                mascotaValorInput.value = this.dataset.valor;
            });
            lista.appendChild(li);
        }
        agregarOpcionMascota(perros, idx + 1, lista, selected, mascotaValorInput);
    }

    fetch('http://127.0.0.1:8080/perros')
        .then(r => r.json())
        .then(perros => {
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

            mascotaValorInput = document.createElement('input');
            mascotaValorInput.type  = 'hidden';
            mascotaValorInput.name  = 'Mascota_Elegida';
            mascotaValorInput.value = '';

            agregarOpcionMascota(perros, 0, lista, selected, mascotaValorInput);
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
            const animal = urlParams.get('animal');
            if (animal) {
                mascotaValorInput.value  = animal;
                selected.textContent     = animal;
                const items = lista.querySelectorAll('li');
                let k = 0;
                while (k < items.length) {
                    if (items[k].dataset.valor === animal) items[k].classList.add('seleccionado');
                    k++;
                }
            }
        })
        .catch(() => {
            const contenedor = document.getElementById('select-mascota');
            const msg = document.createElement('p');
            msg.style.color  = 'red';
            msg.textContent  = 'Error al cargar mascotas. Recarga la página.';
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

        const formData = new FormData();
        const entradas = new FormData(this);
        for (const [key, value] of entradas.entries()) {
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
        .then(() => { window.location.href = 'espera.html'; })
        .catch(() => { window.location.href = 'espera.html'; });
    });
});