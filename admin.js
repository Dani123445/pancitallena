let arbolAnimales = null; 
let sesionActiva  = sessionStorage.getItem('adminSesion') === 'true';
function crearNodoBST(a) {
    return { id: a.id, nombre: a.nombre, tipo: a.tipo,
             imagen: a.imagen, descripcion: a.descripcion,
             estado: a.estado, izquierda: null, derecha: null };
}
function insertarBST(raiz, nodo) {
    if (!raiz) return nodo;
    if (nodo.id < raiz.id) raiz.izquierda = insertarBST(raiz.izquierda, nodo);
    else if (nodo.id > raiz.id) raiz.derecha = insertarBST(raiz.derecha, nodo);
    return raiz;
}
function buscarBST(raiz, id) {
    if (!raiz) return null;
    if (id === raiz.id) return raiz;
    if (id < raiz.id)  return buscarBST(raiz.izquierda, id);
    return buscarBST(raiz.derecha, id);
}
function eliminarBST(raiz, id) {
    if (!raiz) return null;
    if (id < raiz.id)      { raiz.izquierda = eliminarBST(raiz.izquierda, id); return raiz; }
    if (id > raiz.id)      { raiz.derecha   = eliminarBST(raiz.derecha,   id); return raiz; }
    if (!raiz.izquierda) return raiz.derecha;
    if (!raiz.derecha)   return raiz.izquierda;
    let sucesor = raiz.derecha;
    while (sucesor.izquierda) sucesor = sucesor.izquierda;
    raiz.id          = sucesor.id;
    raiz.nombre      = sucesor.nombre;
    raiz.tipo        = sucesor.tipo;
    raiz.imagen      = sucesor.imagen;
    raiz.descripcion = sucesor.descripcion;
    raiz.estado      = sucesor.estado;
    raiz.derecha     = eliminarBST(raiz.derecha, sucesor.id);
    return raiz;
}
function construirBSTdesdeJson(nodoJson) {
    if (!nodoJson) return null;
    return insertarBST(
        insertarBST(null, crearNodoBST(nodoJson)),
        null 
    );
}
function insertarDesdeJson(raiz, nodoJson) {
    if (!nodoJson) return raiz;
    raiz = insertarBST(raiz, crearNodoBST(nodoJson));
    raiz = insertarDesdeJson(raiz, nodoJson._izq || null);
    raiz = insertarDesdeJson(raiz, nodoJson._der || null);
    return raiz;
}
function verificarContrasena() {
    const input = document.getElementById('input-contrasena').value;
    fetch('https://pancitallena.onrender.com/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contrasena: input })
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            sesionActiva = true;
            sessionStorage.setItem('adminSesion', 'true');
            document.getElementById('panel-login').style.display = 'none';
            document.getElementById('panel-admin').style.display = 'block';
            mostrarTab('animales');
        } else {
            document.getElementById('error-login').style.display = 'block';
            document.getElementById('input-contrasena').value    = '';
        }
    })
    .catch(() => alert('Error de conexión.'));
}
function mostrarTab(tab) {
    document.getElementById('seccion-comunidad').style.display      = 'none';
    document.getElementById('tab-comunidad').style.backgroundColor  = '#ccc';
    document.getElementById('tab-comunidad').style.color            = '#333';
    document.getElementById('seccion-animales').style.display    = 'none';
    document.getElementById('seccion-voluntarios').style.display = 'none';
    document.getElementById('seccion-donaciones').style.display  = 'none';
    document.getElementById('seccion-arbol').style.display       = 'none';
    document.getElementById('tab-animales').style.backgroundColor    = '#ccc';
    document.getElementById('tab-animales').style.color              = '#333';
    document.getElementById('tab-voluntarios').style.backgroundColor = '#ccc';
    document.getElementById('tab-voluntarios').style.color           = '#333';
    document.getElementById('tab-donaciones').style.backgroundColor  = '#ccc';
    document.getElementById('tab-donaciones').style.color            = '#333';
    document.getElementById('tab-arbol').style.backgroundColor       = '#ccc';
    document.getElementById('tab-arbol').style.color                 = '#333';
    if (tab === 'animales') {
        document.getElementById('seccion-animales').style.display        = 'block';
        document.getElementById('tab-animales').style.backgroundColor    = '#2ec4b6';
        document.getElementById('tab-animales').style.color              = 'white';
        cargarAnimales();
    } else if (tab === 'voluntarios') {
        document.getElementById('seccion-voluntarios').style.display     = 'block';
        document.getElementById('tab-voluntarios').style.backgroundColor = '#2ec4b6';
        document.getElementById('tab-voluntarios').style.color           = 'white';
        cargarVoluntarios();
    } else if (tab === 'donaciones') {
        document.getElementById('seccion-donaciones').style.display      = 'block';
        document.getElementById('tab-donaciones').style.backgroundColor  = '#2ec4b6';
        document.getElementById('tab-donaciones').style.color            = 'white';
        cargarDonaciones();
    } else if (tab === 'arbol') {
        document.getElementById('seccion-arbol').style.display           = 'block';
        document.getElementById('tab-arbol').style.backgroundColor       = '#54719f';
        document.getElementById('tab-arbol').style.color                 = 'white';
        dibujarArbolEnPantalla();
    }
    else if (tab === 'comunidad') {
    document.getElementById('seccion-comunidad').style.display      = 'block';
    document.getElementById('tab-comunidad').style.backgroundColor  = '#2ec4b6';
    document.getElementById('tab-comunidad').style.color            = 'white';
    cargarComunidad();
}}

function cargarAnimales() {
    fetch('https://pancitallena.onrender.com/perros')
        .then(r => r.json())
        .then(jsonData => {
            arbolAnimales = null;
            cargarNodosRecursivo(jsonData);
            renderizarAnimales(arbolAnimales, null);
        })
        .catch(() => alert('Error al cargar animales.'));
}
function construirBSTbalanceado(jsonData, inicio, fin) {
    if (inicio > fin) return;
    const medio = Math.floor((inicio + fin) / 2);
    arbolAnimales = insertarBST(arbolAnimales, crearNodoBST(jsonData[medio]));
    construirBSTbalanceado(jsonData, inicio, medio - 1);
    construirBSTbalanceado(jsonData, medio + 1, fin);
}
function cargarNodosRecursivo(jsonData) {
    construirBSTbalanceado(jsonData, 0, jsonData.length - 1);
}
function acumularFilas(nodo, ref, filtroEstado) {
    if (!nodo) return;
    acumularFilas(nodo.izquierda, ref, filtroEstado);
    if (!filtroEstado || nodo.estado === filtroEstado) {
        const badgeColor = nodo.estado === 'Disponible' ? '#28a745' :
                           nodo.estado === 'En proceso'  ? '#ffc107' : '#c0392b';
        const badgeText  = nodo.estado === 'En proceso' ? '#333' : 'white';
        ref.filas += `
            <tr id="fila-${nodo.id}">
                <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                    <img src="${nodo.imagen}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                </td>
                <td style="padding:10px;border:1px solid #ddd;">${nodo.nombre}</td>
                <td style="padding:10px;border:1px solid #ddd;">${nodo.tipo}</td>
                <td style="padding:10px;border:1px solid #ddd;font-size:12px;max-width:180px;">${nodo.descripcion}</td>
                <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                    <span style="background-color:${badgeColor};color:${badgeText};
                        padding:4px 12px;border-radius:20px;font-size:13px;font-family:sans-serif;">
                        ${nodo.estado}
                    </span>
                </td>
                <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                        <button onclick="cambiarEstado(${nodo.id},'Disponible')"
                                style="background-color:#28a745;font-size:12px;padding:6px 12px;">Disponible</button>
                        <button onclick="cambiarEstado(${nodo.id},'En proceso')"
                                style="background-color:#ffc107;color:#333;font-size:12px;padding:6px 12px;">En proceso</button>
                        <button onclick="cambiarEstado(${nodo.id},'Adoptado')"
                                style="background-color:#c0392b;font-size:12px;padding:6px 12px;">Adoptado</button>
                        <button onclick="eliminarAnimal(${nodo.id},'${nodo.nombre}')"
                                style="background-color:#333;font-size:12px;padding:6px 12px;">Eliminar</button>
                    </div>
                </td>
            </tr>`;
        ref.count++;
    }
    acumularFilas(nodo.derecha, ref, filtroEstado);
}
function renderizarAnimales(raiz, filtroEstado) {
    const contenedor = document.getElementById('contenedor-animales');
    if (!raiz) {
        contenedor.innerHTML = '<p style="font-family:sans-serif;color:#888;">No hay animales registrados.</p>';
        return;
    }
    const ref = { filas: '', count: 0 };
    acumularFilas(raiz, ref, filtroEstado);
    if (ref.count === 0) {
        contenedor.innerHTML = '<p style="font-family:sans-serif;color:#888;">No hay animales con ese estado.</p>';
        return;
    }
    contenedor.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">
            <thead>
                <tr style="background-color:#2ec4b6;color:white;">
                    <th style="padding:10px;border:1px solid #ddd;">Foto</th>
                    <th style="padding:10px;border:1px solid #ddd;">Nombre</th>
                    <th style="padding:10px;border:1px solid #ddd;">Tipo</th>
                    <th style="padding:10px;border:1px solid #ddd;">Descripción</th>
                    <th style="padding:10px;border:1px solid #ddd;">Estado</th>
                    <th style="padding:10px;border:1px solid #ddd;">Acciones</th>
                </tr>
            </thead>
            <tbody>${ref.filas}</tbody>
        </table>`;
}
function filtrar(estado) {
    if (!arbolAnimales) return;
    if (estado === 'todos') { renderizarAnimales(arbolAnimales, null); return; }
    renderizarAnimales(arbolAnimales, estado);
}
function cambiarEstado(id, estado) {
    fetch(`https://pancitallena.onrender.com/adoptar?id=${id}&estado=${encodeURIComponent(estado)}`)
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                const nodo = buscarBST(arbolAnimales, id);
                if (nodo) nodo.estado = estado;
                const fila = document.getElementById('fila-' + id);
                if (fila) {
                    const badgeColor = estado === 'Disponible' ? '#28a745' :
                                       estado === 'En proceso'  ? '#ffc107' : '#c0392b';
                    const badgeText  = estado === 'En proceso' ? '#333' : 'white';
                    fila.cells[4].innerHTML = `
                        <span style="background-color:${badgeColor};color:${badgeText};
                            padding:4px 12px;border-radius:20px;font-size:13px;font-family:sans-serif;">
                            ${estado}
                        </span>`;
                }
            } else { alert('Error: ' + data.message); }
        })
        .catch(() => alert('Error de conexión.'));
}
function eliminarAnimal(id, nombre) {
    if (!confirm('¿Seguro que deseas eliminar a ' + nombre + '? Esta acción no se puede deshacer.')) return;
    fetch(`https://pancitallena.onrender.com/perros?id=${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                arbolAnimales = eliminarBST(arbolAnimales, id);
                const fila = document.getElementById('fila-' + id);
                if (fila) fila.remove();
            } else { alert('Error: ' + data.message); }
        })
        .catch(() => alert('Error de conexión.'));
}
function cargarVoluntarios() {
    fetch('https://pancitallena.onrender.com/voluntarios')
        .then(r => r.json())
        .then(voluntarios => {
            const contenedor = document.getElementById('contenedor-voluntarios');
            if (!voluntarios || voluntarios.length === 0) {
                contenedor.innerHTML = '<p style="font-family:sans-serif;color:#888;">No hay voluntarios registrados.</p>';
                return;
            }
            const ref = { filas: '', i: 0 };
            generarFilasVoluntarios(voluntarios, ref);
            contenedor.innerHTML = `
                <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">
                    <thead>
                        <tr style="background-color:#3b6b5c;color:white;">
                            <th style="padding:10px;border:1px solid #ddd;">DNI</th>
                            <th style="padding:10px;border:1px solid #ddd;">Nombre</th>
                            <th style="padding:10px;border:1px solid #ddd;">Ciudad</th>
                            <th style="padding:10px;border:1px solid #ddd;">Correo</th>
                            <th style="padding:10px;border:1px solid #ddd;">Celular</th>
                            <th style="padding:10px;border:1px solid #ddd;">Horario</th>
                            <th style="padding:10px;border:1px solid #ddd;">Compañero</th>
                        </tr>
                    </thead>
                    <tbody>${ref.filas}</tbody>
                </table>`;
        })
        .catch(() => alert('Error al cargar voluntarios.'));
}
function generarFilasVoluntarios(jsonData, ref) {
    if (ref.i >= jsonData.length) return;
    const v = jsonData[ref.i];
    ref.i++;
    ref.filas += `
        <tr>
            <td style="padding:10px;border:1px solid #ddd;">${v.id}</td>
            <td style="padding:10px;border:1px solid #ddd;">${v.nombre}</td>
            <td style="padding:10px;border:1px solid #ddd;">${v.ciudad}</td>
            <td style="padding:10px;border:1px solid #ddd;">${v.correo}</td>
            <td style="padding:10px;border:1px solid #ddd;">${v.celular}</td>
            <td style="padding:10px;border:1px solid #ddd;font-size:12px;">${v.horario}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                ${v.asociado !== null
                    ? '<span style="background-color:#28a745;color:white;padding:4px 10px;border-radius:20px;font-size:12px;">ID: ' + v.asociado + '</span>'
                    : '<span style="background-color:#ccc;color:#555;padding:4px 10px;border-radius:20px;font-size:12px;">Sin pareja</span>'}
            </td>
        </tr>`;
    generarFilasVoluntarios(jsonData, ref);
}
function cargarDonaciones() {
    fetch('https://pancitallena.onrender.com/donaciones')
        .then(r => r.json())
        .then(donaciones => {
            const contenedor = document.getElementById('contenedor-donaciones');
            if (!donaciones || donaciones.length === 0) {
                contenedor.innerHTML = '<p style="font-family:sans-serif;color:#888;">No hay donaciones registradas.</p>';
                return;
            }
            const ref = { filas: '', i: 0 };
            generarFilasDonaciones(donaciones, ref);
            contenedor.innerHTML = `
                <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">
                    <thead>
                        <tr style="background-color:#54719f;color:white;">
                            <th style="padding:10px;border:1px solid #ddd;">Código Validación</th>
                            <th style="padding:10px;border:1px solid #ddd;">Nombre</th>
                            <th style="padding:10px;border:1px solid #ddd;">Correo</th>
                            <th style="padding:10px;border:1px solid #ddd;">Monto</th>
                            <th style="padding:10px;border:1px solid #ddd;">Método</th>
                            <th style="padding:10px;border:1px solid #ddd;">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>${ref.filas}</tbody>
                </table>`;
        })
        .catch(() => alert('Error al cargar donaciones.'));
}
function generarFilasDonaciones(jsonData, ref) {
    if (ref.i >= jsonData.length) return;
    const d = jsonData[ref.i];
    ref.i++;
    ref.filas += `
        <tr>
            <td style="padding:10px;border:1px solid #ddd;font-family:monospace;">${d.cip}</td>
            <td style="padding:10px;border:1px solid #ddd;">${d.nombre}</td>
            <td style="padding:10px;border:1px solid #ddd;">${d.correo}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;font-weight:bold;">S/ ${d.monto}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;">${d.metodo}</td>
            <td style="padding:10px;border:1px solid #ddd;text-align:center;">${d.fecha}</td>
        </tr>`;
    generarFilasDonaciones(jsonData, ref);
}
function dibujarArbolEnPantalla() {
    const contenedor = document.getElementById('contenedor-arbol');
    if (!arbolAnimales) {
        fetch('https://pancitallena.onrender.com/perros')
            .then(r => r.json())
            .then(jsonData => {
                arbolAnimales = null;
                construirBSTbalanceado(jsonData, 0, jsonData.length - 1);
                contenedor.innerHTML = generarSVGArbol(arbolAnimales);
            })
            .catch(() => {
                contenedor.innerHTML = '<p style="font-family:sans-serif;color:#c0392b;">Error al cargar el árbol.</p>';
            });
    } else {
        contenedor.innerHTML = generarSVGArbol(arbolAnimales);
    }
}
function contarHojas(nodo) {
    if (!nodo) return 1;
    return contarHojas(nodo.izquierda) + contarHojas(nodo.derecha);
}
function calcularAltura(nodo) {
    if (!nodo) return 0;
    const izq = calcularAltura(nodo.izquierda);
    const der = calcularAltura(nodo.derecha);
    return 1 + (izq > der ? izq : der);
}
function acumularSVG(nodo, nivel, xMin, xMax, svgRef) {
    if (!nodo) return;
    const ANCHO = 160, ALTO = 55, SEP_V = 100;
    const xCentro = (xMin + xMax) / 2;
    const y = nivel * SEP_V + 40;

    const hojasIzq = contarHojas(nodo.izquierda);
    const hojasDer = contarHojas(nodo.derecha);
    const total    = hojasIzq + hojasDer;
    const xMid     = xMin + (xMax - xMin) * (hojasIzq / total);

    if (nodo.izquierda) {
        const xHijo = (xMin + xMid) / 2;
        const y2    = (nivel + 1) * SEP_V + 40 - ALTO / 2;
        svgRef.lineas += `<line x1="${xCentro}" y1="${y + ALTO/2}" x2="${xHijo}" y2="${y2}" stroke="#aaa" stroke-width="2"/>`;
        acumularSVG(nodo.izquierda, nivel + 1, xMin, xMid, svgRef);
    }
    if (nodo.derecha) {
        const xHijo = (xMid + xMax) / 2;
        const y2    = (nivel + 1) * SEP_V + 40 - ALTO / 2;
        svgRef.lineas += `<line x1="${xCentro}" y1="${y + ALTO/2}" x2="${xHijo}" y2="${y2}" stroke="#aaa" stroke-width="2"/>`;
        acumularSVG(nodo.derecha, nivel + 1, xMid, xMax, svgRef);
    }
    const color = nodo.estado === 'Disponible' ? '#28a745' :
                  nodo.estado === 'En proceso'  ? '#ffc107' : '#c0392b';
    const texto = nodo.estado === 'En proceso' ? '#333' : '#fff';
    const emoji = nodo.tipo === 'gato' ? '' : '';
    svgRef.nodos += `
        <g>
            <rect x="${xCentro - ANCHO/2}" y="${y - ALTO/2}" width="${ANCHO}" height="${ALTO}"
                  rx="10" ry="10" fill="${color}" stroke="#fff" stroke-width="2"/>
            <text x="${xCentro}" y="${y - 8}" text-anchor="middle"
                  font-family="sans-serif" font-size="12" font-weight="bold" fill="${texto}">
                ${emoji} ${nodo.nombre}
            </text>
            <text x="${xCentro}" y="${y + 10}" text-anchor="middle"
                  font-family="sans-serif" font-size="10" fill="${texto}">ID: ${nodo.id}</text>
            <text x="${xCentro}" y="${y + 23}" text-anchor="middle"
                  font-family="sans-serif" font-size="10" fill="${texto}">${nodo.estado}</text>
        </g>`;
}
function generarSVGArbol(raiz) {
    if (!raiz) return '<p style="font-family:sans-serif;color:#888;">No hay animales registrados.</p>';
    const ANCHO = 160, SEP_V = 100;
    const totalHojas = contarHojas(raiz);
    const svgAncho = totalHojas * ANCHO + 400 > 400 ? totalHojas * ANCHO + 400 : 400;    const altura     = calcularAltura(raiz);
    const svgAlto    = altura * SEP_V + 80;
    const svgRef     = { lineas: '', nodos: '' };
acumularSVG(raiz, 0, 150, svgAncho - 150, svgRef);
    const leyenda = `
        <g transform="translate(10,${svgAlto - 30})">
            <rect x="0"   y="0" width="14" height="14" rx="3" fill="#28a745"/>
            <text x="18"  y="11" font-family="sans-serif" font-size="11" fill="#555">Disponible</text>
            <rect x="90"  y="0" width="14" height="14" rx="3" fill="#ffc107"/>
            <text x="108" y="11" font-family="sans-serif" font-size="11" fill="#555">En proceso</text>
            <rect x="195" y="0" width="14" height="14" rx="3" fill="#c0392b"/>
            <text x="213" y="11" font-family="sans-serif" font-size="11" fill="#555">Adoptado</text>
        </g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgAncho}" height="${svgAlto}"
                 style="font-family:sans-serif;display:block;margin:auto;">
        ${svgRef.lineas}${svgRef.nodos}${leyenda}
    </svg>`;
}
function mostrarFormularioAgregar() {
    document.getElementById('seccion-agregar').style.display  = 'block';
    document.getElementById('btn-mostrar-form').style.display = 'none';
}
function cancelarAgregar() {
    document.getElementById('seccion-agregar').style.display  = 'none';
    document.getElementById('btn-mostrar-form').style.display = 'inline-block';
    limpiarFormulario();
}
function limpiarFormulario() {
    document.getElementById('nuevo-id').value          = '';
    document.getElementById('nuevo-nombre').value      = '';
    document.getElementById('nuevo-tipo').value        = 'perro';
    document.getElementById('nuevo-raza').value        = '';
    document.getElementById('nuevo-descripcion').value = '';
    document.getElementById('nuevo-foto').value        = '';
    document.getElementById('preview-imagen').style.display = 'none';
    document.getElementById('preview-imagen').src      = '';
    document.getElementById('nombre-foto').textContent = 'Ningún archivo seleccionado';
    window._imagenSubida = null;
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('nuevo-foto').addEventListener('change', function() {
        const archivo = this.files[0];
        if (!archivo) return;
        document.getElementById('nombre-foto').textContent = archivo.name;
        const reader = new FileReader();
        reader.onload = e => {
            const preview         = document.getElementById('preview-imagen');
            preview.src           = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(archivo);
        window._imagenSubida = null;
    });
});
async function agregarAnimal() {
    const id          = parseInt(document.getElementById('nuevo-id').value);
    const nombre      = document.getElementById('nuevo-nombre').value.trim();
    const tipo        = document.getElementById('nuevo-tipo').value;
    const raza        = document.getElementById('nuevo-raza').value.trim() || 'Mestizo';
    const descripcion = document.getElementById('nuevo-descripcion').value.trim();
    const archivo     = document.getElementById('nuevo-foto').files[0];
    if (!id || !nombre || !descripcion || !archivo) {
        alert('Por favor completa todos los campos y selecciona una foto.');
        return;
    }
    const btnGuardar       = document.getElementById('btn-guardar-animal');
    btnGuardar.disabled    = true;
    btnGuardar.textContent = 'Subiendo foto...';
    try {
        const respImagen = await fetch('https://pancitallena.onrender.com/subir-imagen', {
            method:  'POST',
            headers: { 'X-Filename': archivo.name },
            body:    archivo
        });
        const dataImagen = await respImagen.json();
        if (dataImagen.status !== 'success') {
            alert('Error al subir la foto: ' + dataImagen.message);
            return;
        }
        btnGuardar.textContent = 'Guardando animal...';
        const respAnimal = await fetch('https://pancitallena.onrender.com/perros', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id, nombre, raza, tipo,
                                     imagen: dataImagen.nombreArchivo, descripcion })
        });
        const dataAnimal = await respAnimal.json();
        if (dataAnimal.status === 'success') {
            alert('Animal registrado correctamente.');
            cancelarAgregar();
            cargarAnimales();
        } else {
            alert('Error al registrar animal: ' + dataAnimal.message);
        }
    } catch (e) {
        alert('Error de conexión con el servidor.');
    } finally {
        btnGuardar.disabled    = false;
        btnGuardar.textContent = 'Guardar animal';
    }
}
function cerrarSesion() {
    sesionActiva  = false;
    arbolAnimales = null;
    sessionStorage.removeItem('adminSesion');
    document.getElementById('panel-admin').style.display = 'none';
    document.getElementById('panel-login').style.display = 'block';
    document.getElementById('input-contrasena').value    = '';
    document.getElementById('error-login').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function() {
    if (sesionActiva) {
        document.getElementById('panel-login').style.display = 'none';
        document.getElementById('panel-admin').style.display = 'block';
        mostrarTab('animales');
    }
});
function mostrarFormularioComunidad() {
    document.getElementById('seccion-agregar-comunidad').classList.remove('oculto');
    document.getElementById('btn-mostrar-form-comunidad').classList.add('oculto');
}

function cancelarComunidad() {
   
    document.getElementById('seccion-agregar-comunidad').classList.add('oculto');
    document.getElementById('btn-mostrar-form-comunidad').classList.remove('oculto');
    document.getElementById('comunidad-titulo').value = '';
    document.getElementById('comunidad-descripcion').value = '';
    document.getElementById('comunidad-foto').value   = '';
    document.getElementById('comunidad-preview').style.display = 'none';
    document.getElementById('comunidad-nombre-foto').textContent = 'Ningún archivo seleccionado';
}

document.addEventListener('DOMContentLoaded', function() {
    const inputFoto = document.getElementById('comunidad-foto');
    if (inputFoto) {
        inputFoto.addEventListener('change', function() {
            const archivo = this.files[0];
            if (!archivo) return;
            document.getElementById('comunidad-nombre-foto').textContent = archivo.name;
            const reader = new FileReader();
            reader.onload = e => {
                const preview = document.getElementById('comunidad-preview');
                preview.src           = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(archivo);
        });
    }
});
async function agregarImagenComunidad() {
    const titulo      = document.getElementById('comunidad-titulo').value.trim();
    const descripcion = document.getElementById('comunidad-descripcion').value.trim();
    const archivo     = document.getElementById('comunidad-foto').files[0];

    if (!titulo || !archivo) {
        alert('Completa el título y selecciona una imagen.');
        return;
    }
    const btnGuardar       = document.getElementById('btn-guardar-comunidad');
    btnGuardar.disabled    = true;
    btnGuardar.textContent = 'Subiendo imagen...';
    try {
        const respImagen = await fetch('https://pancitallena.onrender.com/subir-imagen', {
            method:  'POST',
            headers: { 'X-Filename': archivo.name },
            body:    archivo
        });
        const dataImagen = await respImagen.json();
        if (dataImagen.status !== 'success') {
            alert('Error al subir la imagen: ' + dataImagen.message);
            return;
        }
        const respComunidad = await fetch('https://pancitallena.onrender.com/comunidad', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ titulo, descripcion, imagen: dataImagen.nombreArchivo })
        });
        const dataComunidad = await respComunidad.json();
        if (dataComunidad.status === 'success') {
            alert('Imagen agregada correctamente.');
            cancelarComunidad();
            cargarComunidad();
        } else {
            alert('Error: ' + dataComunidad.message);
        }
    } catch (e) {
        alert('Error de conexión con el servidor.');
    } finally {
        btnGuardar.disabled    = false;
        btnGuardar.textContent = 'Guardar imagen';
    }
}
function cargarComunidad() {
    fetch('https://pancitallena.onrender.com/comunidad')
        .then(r => r.json())
        .then(imagenes => {
            const contenedor = document.getElementById('contenedor-comunidad');
            if (!imagenes || imagenes.length === 0) {
                contenedor.innerHTML = '<p>No hay imágenes en la galería de comunidad.</p>';
                return;
            }
            let filas = '';
            imagenes.forEach(img => {
                filas += `
                    <tr id="fila-comunidad-${img.id}">
                        <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                            <img src="${img.imagen}" style="width:80px;height:60px;object-fit:cover;border-radius:8px;">
                        </td>
                        <td style="padding:10px;border:1px solid #ddd;">${img.titulo}</td>
                        <td style="padding:10px;border:1px solid #ddd;font-size:12px;max-width:200px;">${img.descripcion || '-'}</td>
                        <td style="padding:10px;border:1px solid #ddd;text-align:center;">${img.fecha}</td>
                        <td style="padding:10px;border:1px solid #ddd;text-align:center;">
                            <button onclick="eliminarImagenComunidad(${img.id})" style="background-color:#333;font-size:12px;padding:6px 12px;">Eliminar</button>
                        </td>
                    </tr>`;
            });
            contenedor.innerHTML = `
                <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;">
                    <thead>
                        <tr style="background-color:#2ec4b6;color:white;">
                            <th style="padding:10px;border:1px solid #ddd;">Imagen</th>
                            <th style="padding:10px;border:1px solid #ddd;">Título</th>
                            <th style="padding:10px;border:1px solid #ddd;">Descripción</th>
                            <th style="padding:10px;border:1px solid #ddd;">Fecha</th>
                            <th style="padding:10px;border:1px solid #ddd;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>`;
        })
        .catch(() => alert('Error al cargar la galería de comunidad.'));
}
function eliminarImagenComunidad(id) {
    if (!confirm('¿Eliminar esta imagen de la galería de comunidad?')) return;
    fetch(`https://pancitallena.onrender.com/comunidad?id=${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') cargarComunidad();
            else alert('Error: ' + data.message);
        })
        .catch(() => alert('Error de conexión.'));
}
