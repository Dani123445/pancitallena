const datos = JSON.parse(sessionStorage.getItem('solicitudAdopcion'));
if (datos) {
    const resumen = document.getElementById('resumen-solicitud');
    resumen.innerHTML = `
        <h3 style="margin-top:20px; color:#333;">Resumen de tu solicitud:</h3>
        <table style="width:100%; font-family:sans-serif; font-size:14px; border-collapse:collapse; margin-top:10px;">
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Mascota solicitada</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.mascota}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Nombre</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.nombre}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Correo</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.correo}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Teléfono</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.telefono}</td>
            </tr>
            <tr>
                <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Fecha de solicitud</td>
                <td style="padding:8px; border:1px solid #ddd;">${datos.fecha}</td>
            </tr>
        </table>
    `;
}