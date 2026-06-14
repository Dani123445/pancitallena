const datos = JSON.parse(localStorage.getItem('donacionActual'));
if (datos) {
    document.getElementById('cip-numero').textContent = datos.cip;
    document.getElementById('resumen-donacion').innerHTML = `
        <table style="width:100%; font-family:sans-serif; font-size:14px; 
                    border-collapse:collapse; margin-top:10px; color:#555;">
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Nombre</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.nombre}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Monto</td>
                <td style="padding:8px; border:1px solid #ddd;">S/ ${datos.monto}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Método</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.metodo}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Fecha</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.fecha}</td>
            </tr>
        </table>
    `;
}
function verHistorial() {
    const contenedor = document.getElementById('historial-container');
    if (contenedor.style.display === 'block') {
        contenedor.style.display = 'none';
        return;
    }
    const correo = datos ? datos.correo : '';
    if (!correo) { alert('No se encontró tu correo.'); return; }
    fetch(`https://pancitallena.onrender.com/historial-donaciones?correo=${encodeURIComponent(correo)}`)
        .then(r => r.json())
        .then(historial => {
            if (historial.length === 0) {
                document.getElementById('tabla-historial').innerHTML =
                    '<p style="font-family:sans-serif;color:#666;">No hay donaciones registradas.</p>';
            } else {
                let filas = '';
                historial.forEach(d => {
                    filas += `
                        <tr>
                            <td style="padding:8px; border:1px solid #ddd;">${d.cip}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${d.nombre}</td>
                            <td style="padding:8px; border:1px solid #ddd;">S/ ${d.monto}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${d.metodo}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${d.fecha}</td>
                        </tr>`;
                });
                document.getElementById('tabla-historial').innerHTML = `
                    <table style="width:100%; border-collapse:collapse; font-family:sans-serif; font-size:13px;">
                        <thead>
                            <tr style="background-color:#2ec4b6; color:white;">
                                <th style="padding:8px; border:1px solid #ddd;">CIP</th>
                                <th style="padding:8px; border:1px solid #ddd;">Nombre</th>
                                <th style="padding:8px; border:1px solid #ddd;">Monto</th>
                                <th style="padding:8px; border:1px solid #ddd;">Método</th>
                                <th style="padding:8px; border:1px solid #ddd;">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>`;
            }
            contenedor.style.display = 'block';
        })
        .catch(() => alert('Error al cargar historial.'));
}
function exportarHistorial() {
    const correo = datos ? datos.correo : '';
    if (!correo) { alert('No se encontró tu correo.'); return; }

    fetch(`https://pancitallena.onrender.com/historial-donaciones?correo=${encodeURIComponent(correo)}`)
        .then(r => r.json())
        .then(historial => {
            if (historial.length === 0) {
                alert('No tienes donaciones registradas.');
                return;
            }

            let filas = '';
            historial.forEach(d => {
                filas += `
                    <tr>
                        <td>${d.cip}</td>
                        <td>${d.nombre}</td>
                        <td>${d.correo}</td>
                        <td>S/ ${d.monto}</td>
                        <td>${d.metodo}</td>
                        <td>${d.fecha}</td>
                    </tr>`;
            });

            const ventana = window.open('', '_blank');
            ventana.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Historial de Donaciones - Pancita Llena</title>
                    <style>
                        body {
                            font-family: sans-serif;
                            padding: 30px;
                            color: #333;
                        }
                        .encabezado {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .encabezado h1 {
                            color: #5ec42e;
                            font-size: 24px;
                            margin-bottom: 5px;
                        }
                        .encabezado p {
                            color: #888;
                            font-size: 13px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 13px;
                        }
                        thead tr {
                            background-color: #2ec44a;
                            color: white;
                        }
                        th, td {
                            padding: 10px 12px;
                            border: 1px solid #ddd;
                            text-align: left;
                        }
                        tbody tr:nth-child(even) {
                            background-color: #f7f9f6;
                        }
                        .pie {
                            margin-top: 30px;
                            text-align: center;
                            font-size: 12px;
                            color: #aaa;
                        }
                        @media print {
                            body { padding: 10px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="encabezado">
                        <h1> Pancita Llena</h1>
                        <p>Historial de donaciones de: <strong>${correo}</strong></p>
                        <p>Generado el: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Código Validación</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                    <div class="pie">
                        <p>© 2026 Pancita Llena. Todos los derechos reservados.</p>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `);
            ventana.document.close();
        })
        .catch(() => alert('Error al exportar historial.'));
}
