function crearSelectCustom(contenedorId, opciones, placeholder, onChange) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    const wrapper  = document.createElement('div');
    wrapper.className = 'select-custom';
    const selected = document.createElement('div');
    selected.className = 'select-selected';
    selected.textContent = placeholder || 'Seleccione una opción...';
    const lista = document.createElement('ul');
    lista.className = 'select-opciones';
    const inputOculto = document.createElement('input');
    inputOculto.type  = 'hidden';
    inputOculto.className = 'select-oculto';
    inputOculto.value = '';
    let idx = 0;
    while (idx < opciones.length) {
        const op  = opciones[idx];
        const li  = document.createElement('li');
        li.textContent      = op.texto;
        li.dataset.valor    = op.valor;

        li.addEventListener('click', function() {
            const valor = this.dataset.valor;
            const texto = this.textContent;
            let j = 0;
            const items = lista.querySelectorAll('li');
            while (j < items.length) {
                items[j].classList.remove('seleccionado');
                j++;
            }
            this.classList.add('seleccionado');
            selected.textContent = texto;
            selected.classList.remove('abierto');
            lista.classList.remove('abierto');
            inputOculto.value = valor;
            if (onChange) onChange(valor, texto);
        });

        lista.appendChild(li);
        idx++;
    }
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
    contenedor.appendChild(wrapper);
}
function cerrarTodosLosSelects() {
    const selects  = document.querySelectorAll('.select-selected');
    const opciones = document.querySelectorAll('.select-opciones');
    let i = 0;
    while (i < selects.length) {
        selects[i].classList.remove('abierto');
        i++;
    }
    let j = 0;
    while (j < opciones.length) {
        opciones[j].classList.remove('abierto');
        j++;
    }
}
function getValorSelect(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return '';
    const input = contenedor.querySelector('.select-oculto');
    return input ? input.value : '';
}
document.addEventListener('click', cerrarTodosLosSelects);