document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:8080/comunidad')
        .then(r => r.json())
        .then(imagenes => {
            const contenedor = document.getElementById('galeria-comunidad');
            if (!imagenes || imagenes.length === 0) {
                contenedor.innerHTML = '<p class="cargando">Aún no hay imágenes en la galería.</p>';
                return;
            }
            const ref = { html: '', i: 0 };
            generarTarjetas(imagenes, ref);
            contenedor.innerHTML = ref.html;
        })
        .catch(() => {
            document.getElementById('galeria-comunidad').innerHTML =
                '<p class="cargando">Error al cargar la galería.</p>';
        });
});
function generarTarjetas(imagenes, ref) {
    if (ref.i >= imagenes.length) return;
    const img = imagenes[ref.i];
    ref.i++;
    ref.html += `
        <div class="comunidad-card">
            <img src="${img.imagen}" alt="${img.titulo}">
            <div class="comunidad-card-info">
                <div class="comunidad-card-titulo">${img.titulo}</div>
                ${img.descripcion ? `<div class="comunidad-card-descripcion">${img.descripcion}</div>` : ''}
            </div>
        </div>`;
    generarTarjetas(imagenes, ref);
}