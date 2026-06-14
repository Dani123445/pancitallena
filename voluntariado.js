if (localStorage.getItem('resultadoVoluntario')) {
    window.location.href = 'exito.html';
}

document.addEventListener('DOMContentLoaded', function() {
    crearSelectCustom('select-localidad', [
        { valor: 'La Esperanza',        texto: 'La Esperanza' },
        { valor: 'El Milagro',          texto: 'El Milagro' },
        { valor: 'Trujillo (centro)',   texto: 'Trujillo (centro)' },
        { valor: 'Florencia de Mora',   texto: 'Florencia de Mora' },
        { valor: 'Víctor Larco Herrera',texto: 'Víctor Larco Herrera' },
        { valor: 'Moche',               texto: 'Moche' },
        { valor: 'Salaverry',           texto: 'Salaverry' },
        { valor: 'Huanchaco',           texto: 'Huanchaco' },
        { valor: 'Laredo',              texto: 'Laredo' }
    ], 'Seleccione una localidad...');

    crearSelectCustom('select-disponibilidad', [
        { valor: '08:00', texto: 'Mañana (8:00 - 12:00)' },
        { valor: '14:00', texto: 'Tarde (14:00 - 18:00)' },
        { valor: '18:00', texto: 'Noche (18:00 - 20:00)' }
    ], '¿En qué horario está disponible?');
});
function procesarRegistro(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    } else if (window.event) {
        window.event.preventDefault();
    }
    const checkboxes = document.querySelectorAll('.dia-check:checked');
    let diasSeleccionados = '';
    let i = 0;
    while (i < checkboxes.length) {
        if (diasSeleccionados !== '') diasSeleccionados += '-';
        diasSeleccionados += checkboxes[i].value;
        i++;
    }
    if (!diasSeleccionados) diasSeleccionados = 'CualquierDia';
    const localidadStr         = getValorSelect('select-localidad');
    const disponibilidadSelect = getValorSelect('select-disponibilidad');
    const edad                 = parseInt(document.getElementById('edad').value);
    const datosVoluntario = {
        id:           parseInt(document.getElementById('dni').value) || 0,
        nombre:       document.getElementById('nombre').value,
        ciudad:       localidadStr,
        fechaUnion:   new Date().toLocaleDateString(),
        correo:       document.getElementById('email').value,
        celular:      document.getElementById('telefono').value,
        horarioDiaMes: diasSeleccionados + ' (' + (disponibilidadSelect || 'No especificado') + ')'
    };
    if (!datosVoluntario.id || !datosVoluntario.nombre || !localidadStr) {
        alert('Por favor, completa los campos requeridos.');
        return false;
    }
    if (!edad || edad < 1) {
        alert('Error, edad inválida.');
        return false;
    } else if (edad < 18) {
        alert('Aún no puedes participar, te esperamos más adelante.');
        return false;
    } else if (edad > 80) {
        alert('La edad debe ser menor a 80 años.');
        return false;
    }
    fetch('https://pancitallena.onrender.com/registrar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(datosVoluntario)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error en el servidor');
        return response.json();
    })
    .then(data => {
    console.log('Respuesta del servidor:', JSON.stringify(data));
    localStorage.setItem('resultadoVoluntario', JSON.stringify({
            localidad:  localidadStr,
            match:      data.match,
            companeros: data.companeros,
            dni:        datosVoluntario.id
        }));
        window.location.href = 'exito.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema al conectar con el servidor.');
    });
    return false;
}
