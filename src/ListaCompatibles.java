public class ListaCompatibles {
    public static class NodoCompat {
        public Voluntario dato;
        public NodoCompat siguiente;
        NodoCompat(Voluntario dato) {
            this.dato = dato;
            this.siguiente = null;
        }
    }
    private NodoCompat cabeza;
    private int tamanio;
    public ListaCompatibles() {
        this.cabeza = null;
        this.tamanio = 0;
    }
    public void insertar(Voluntario v) {
        NodoCompat nuevo = new NodoCompat(v);
        nuevo.siguiente = cabeza;
        cabeza = nuevo;
        tamanio++;
    }
    public boolean estaVacia() {
        return cabeza == null;
    }
    public int getTamanio() {
        return tamanio;
    }
    public NodoCompat getCabeza() {
        return cabeza;
    }
}