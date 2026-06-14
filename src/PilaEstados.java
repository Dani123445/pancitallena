public class PilaEstados {
    private EstadoNodo tope;
    public PilaEstados() { this.tope = null; }
    public void push(String estado) {
        EstadoNodo nuevo = new EstadoNodo(estado, new java.util.Date().toString());
        nuevo.setSiguiente(tope);
        tope = nuevo;
    }
    public String peek() {
        return tope != null ? tope.getEstado() : "Disponible";
    }
    public void mostrarHistorial() {
        EstadoNodo actual = tope;
        while (actual != null) {
            System.out.println("  [" + actual.getFecha() + "] " + actual.getEstado());
            actual = actual.getSiguiente();
        }
    }
}



