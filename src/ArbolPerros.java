public class ArbolPerros {
    public static class NodoArbol {
        Perro    dato;
        NodoArbol izquierda;
        NodoArbol derecha;
        NodoArbol(Perro dato) {
            this.dato      = dato;
            this.izquierda = null;
            this.derecha   = null;
        }
    }
    private NodoArbol raiz;
    public ArbolPerros() {
        this.raiz = null;
    }
    public void insertar(Perro p) {
        raiz = insertarRecursivo(raiz, p);
    }
    private NodoArbol insertarRecursivo(NodoArbol nodo, Perro p) {
        if (nodo == null) return new NodoArbol(p);
        if (p.getId() < nodo.dato.getId())
            nodo.izquierda = insertarRecursivo(nodo.izquierda, p);
        else if (p.getId() > nodo.dato.getId())
            nodo.derecha = insertarRecursivo(nodo.derecha, p);
        return nodo;
    }
    public Perro buscarPorId(int id) {
        return buscarRecursivo(raiz, id);
    }
    private Perro buscarRecursivo(NodoArbol nodo, int id) {
        if (nodo == null) return null;
        if (id == nodo.dato.getId()) return nodo.dato;
        if (id < nodo.dato.getId())  return buscarRecursivo(nodo.izquierda, id);
        return buscarRecursivo(nodo.derecha, id);
    }
    public void mostrarTodos() {
        mostrarInorden(raiz);
    }
    private void mostrarInorden(NodoArbol nodo) {
        if (nodo == null) return;
        mostrarInorden(nodo.izquierda);
        Perro p = nodo.dato;
        System.out.println("\nNombre: " + p.getNombre()
            + " | Raza: "   + p.getRaza()
            + " | Estado: " + p.getEstadoActual());
        p.mostrarHistorial();
        mostrarInorden(nodo.derecha);
    }
    private static class BoolRef {
        boolean valor;
        BoolRef(boolean v) { this.valor = v; }
    }
    public String toJson() {
        StringBuilder sb = new StringBuilder("[");
        BoolRef primero = new BoolRef(true);
        toJsonInorden(raiz, sb, primero);
        sb.append("]");
        return sb.toString();
    }
       public NodoArbol getRaiz() {
        return raiz;
    }
    public void eliminar(int id) {
    raiz = eliminarRecursivo(raiz, id);
    }
    private NodoArbol eliminarRecursivo(NodoArbol nodo, int id) {
    if (nodo == null) return null;
    if (id < nodo.dato.getId()) {
        nodo.izquierda = eliminarRecursivo(nodo.izquierda, id);
    } else if (id > nodo.dato.getId()) {
        nodo.derecha = eliminarRecursivo(nodo.derecha, id);
    } else {
        if (nodo.izquierda == null) return nodo.derecha;
        if (nodo.derecha   == null) return nodo.izquierda;
        NodoArbol sucesor = buscarMinimo(nodo.derecha);
        nodo.dato         = sucesor.dato;
        nodo.derecha      = eliminarRecursivo(nodo.derecha, sucesor.dato.getId());
    }
    return nodo;
    }
        private NodoArbol buscarMinimo(NodoArbol nodo) {
            while (nodo.izquierda != null) nodo = nodo.izquierda;
            return nodo;
}
    private void toJsonInorden(NodoArbol nodo, StringBuilder sb, BoolRef primero) {
        if (nodo == null) return;
        toJsonInorden(nodo.izquierda, sb, primero);
        Perro p = nodo.dato;
        if (!primero.valor) sb.append(",");
        sb.append("{")
            .append("\"id\":").append(p.getId()).append(",")
            .append("\"nombre\":\"").append(p.getNombre()).append("\",")
            .append("\"raza\":\"").append(p.getRaza()).append("\",")
            .append("\"tipo\":\"").append(p.getTipo()).append("\",")
            .append("\"imagen\":\"").append(p.getImagen()).append("\",")
            .append("\"descripcion\":\"").append(p.getDescripcion()).append("\",")
            .append("\"estado\":\"").append(p.getEstadoActual()).append("\"")
            .append("}");
        primero.valor = false;
        toJsonInorden(nodo.derecha, sb, primero);
    }
}