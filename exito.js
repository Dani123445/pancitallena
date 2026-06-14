const datos = JSON.parse(localStorage.getItem('resultadoVoluntario'));
if (datos) {
    document.getElementById('localidad-seleccionada').textContent = datos.localidad;
    const contenedorTabla = document.getElementById('contenedor-tabla-companeros');
 if (datos.match && datos.companeros) {
    const listaCompaneros = new ListaEnlazada();
    let idx = 0;
    function cargarCompaneros(companeros) {
        if (idx >= companeros.length) return;
        listaCompaneros.insertar(companeros[idx]);
        idx++;
        cargarCompaneros(companeros);
    }
    cargarCompaneros(datos.companeros);

    if (!listaCompaneros.estaVacia()) {
        let filas = '';
        function generarFilas(nodo) {
            if (!nodo) return;
            filas += `
                <tr>
                    <td style="padding:10px;border:1px solid #ddd;text-align:center;">${nodo.dato.nombre}</td>
                    <td style="padding:10px;border:1px solid #ddd;text-align:center;">${nodo.dato.celular}</td>
                    <td style="padding:10px;border:1px solid #ddd;text-align:center;">${nodo.dato.correo}</td>
                </tr>`;
            generarFilas(nodo.siguiente);
        }
        generarFilas(listaCompaneros.cabeza);
        contenedorTabla.innerHTML = `
            <table class="tabla-companeros" style="width:100%;border-collapse:collapse;margin-top:10px;">
                <thead>
                    <tr style="background-color:#f2eb2b;color:white;">
                        <th style="padding:10px;border:1px solid #ddd;">Nombre</th>
                        <th style="padding:10px;border:1px solid #ddd;">Celular</th>
                        <th style="padding:10px;border:1px solid #ddd;">Correo</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>`;
    }
} 
}

document.querySelector('.salir').addEventListener('click', async function() {
    if (!confirm("¿Seguro que deseas dejar de ser voluntario?")) return;
   if (!datos || !datos.dni) {
    localStorage.removeItem('resultadoVoluntario');
    window.location.href = '/index.html';
    return;
}
    try {
        const response = await fetch(`https://pancitallena.onrender.com/registrar?id=${datos.dni}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.status === 'success') {
            localStorage.removeItem('resultadoVoluntario');
            window.location.href = "index.html";
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        alert("Error de conexión.");
    }
});
const datosActuales = JSON.parse(localStorage.getItem('resultadoVoluntario'));
if (datosActuales && datosActuales.dni && !datosActuales.match) {
    fetch(`https://pancitallena.onrender.com/companero?id=${datosActuales.dni}`)
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success' && data.companeros) {
                const contenedorTabla = document.getElementById('contenedor-tabla-companeros');
                const lista = new ListaEnlazada();
                function cargarCompaneros(companeros, idx) {
                    if (idx >= companeros.length) return;
                    lista.insertar(companeros[idx]);
                    cargarCompaneros(companeros, idx + 1);
                }
                cargarCompaneros(data.companeros, 0);
                let filas = '';
                function generarFilas(nodo) {
                    if (!nodo) return;
                    filas += `
                        <tr>
                            <td style="padding:10px;border:1px solid #ddd;text-align:center;">${nodo.dato.nombre}</td>
                            <td style="padding:10px;border:1px solid #ddd;text-align:center;">${nodo.dato.celular}</td>
                            <td style="padding:10px;border:1px solid #ddd;text-align:center;">${nodo.dato.correo}</td>
                        </tr>`;
                    generarFilas(nodo.siguiente);
                }
                generarFilas(lista.cabeza);
                contenedorTabla.innerHTML = `
                    <table class="tabla-companeros" style="width:100%;border-collapse:collapse;margin-top:10px;">
                        <thead>
                            <tr style="background-color:#f2eb2b;color:white;">
                                <th style="padding:10px;border:1px solid #ddd;">Nombre</th>
                                <th style="padding:10px;border:1px solid #ddd;">Celular</th>
                                <th style="padding:10px;border:1px solid #ddd;">Correo</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>`;
            }
        })
        .catch(() => {});
}