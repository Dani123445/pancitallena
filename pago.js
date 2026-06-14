document.addEventListener('DOMContentLoaded', () => {
    crearSelectCustom('select-metodo-pago', [
        { valor: 'yape',                  texto: 'Yape' },
        { valor: 'transferencia_bancaria', texto: 'Transferencia Bancaria' }
    ], 'Seleccione una opción...', function(valor) {
        document.getElementById('info-yape').style.display =
            (valor === 'yape') ? 'block' : 'none';
        document.getElementById('info-transferencia').style.display =
            (valor === 'transferencia_bancaria') ? 'block' : 'none';
    });

    document.getElementById('captura_pago').addEventListener('change', function() {
        document.getElementById('file-chosen').textContent =
            this.files[0] ? this.files[0].name : 'No se ha seleccionado archivo';
    });

    document.getElementById('form-donacion').addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre  = document.getElementById('nombre').value.trim();
        const correo  = document.getElementById('email').value.trim();
        const monto   = parseFloat(document.getElementById('monto').value);
        const metodo  = getValorSelect('select-metodo-pago');
        const archivo = document.getElementById('captura_pago').files.length;

        if (!nombre)              { alert('Ingresa tu nombre.');              return; }
        if (!correo)              { alert('Ingresa tu correo.');              return; }
        if (!monto || monto <= 0) { alert('Ingresa un monto válido.');        return; }
        if (!metodo)              { alert('Selecciona un método de pago.');   return; }
        if (archivo === 0)        { alert('Adjunta el comprobante de pago.'); return; }

        function guardarYRedirigir(datos) {
            localStorage.setItem('donacionActual', JSON.stringify(datos));
            const formData = new FormData(document.getElementById('form-donacion'));
            formData.set('metodo_pago', metodo);
            window.location.href = 'confirmacion.html';
        }
 
        fetch('https://pancitallena.onrender.com/donar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, monto, metodo })
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                guardarYRedirigir({
                    cip: data.cip, nombre: data.nombre,
                    correo, monto: data.monto,
                    metodo: data.metodo, fecha: data.fecha
                });
            } else {
                alert('Error al registrar: ' + data.message);
            }
        })
        .catch(() => {
            const ahora = new Date();
            guardarYRedirigir({
                cip:    'PL-' + Math.random().toString(36).substring(2,10).toUpperCase(),
                nombre, correo, monto, metodo,
                fecha:  ahora.toLocaleDateString('es-PE') + ' ' + ahora.toLocaleTimeString('es-PE')
            });
        });
    });
});
