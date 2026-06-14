const datos = JSON.parse(localStorage.getItem('resultadoVoluntario'));
if (datos) {
    document.getElementById('localidad-seleccionada').textContent = datos.localidad;
    const contenedorTabla = document.getElementById('contenedor-tabla-companeros');
    if (datos.match && datos.companeros && datos.companeros.length > 0) {
        let filas = '';
        datos.companeros.forEach(comp => {
            filas += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${comp.nombre}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${comp.celular}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${comp.correo}</td>
                </tr>
            `;
        });
        contenedorTabla.innerHTML = `
            <table class="tabla-companeros" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #f2eb2b; color: white;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Nombre</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Celular</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Correo</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        `;
    } else {
        contenedorTabla.innerHTML = `
            <p style="color: #666; padding: 10px; background: #eefaf8; border-radius: 4px; border-left: 4px solid #3bc42e;">
                Por el momento eres el primer voluntario en esta zona. ¡Pronto te asignaremos un compañero!
            </p>
        `;
    }
}

document.querySelector('.salir').addEventListener('click', async function() {
    if (!confirm("¿Seguro que deseas dejar de ser voluntario?")) return;
    const datos = JSON.parse(localStorage.getItem('resultadoVoluntario'));
    if (!datos || !datos.dni) {
        alert("No se encontró tu información.");
        return;
    }
    try {
        const response = await fetch(`http://127.0.0.1:8080/registrar?id=${datos.dni}`, {
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