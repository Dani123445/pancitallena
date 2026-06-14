public class PilaDonaciones {
    private NodoDonacion tope;
    public PilaDonaciones() { this.tope = null; }
    public void push(NodoDonacion nodo) {
        nodo.setSiguiente(tope);
        tope = nodo;
    }
    public NodoDonacion peek() { return tope; }
    public boolean estaVacia() { return tope == null; }
    public String toJson() {
        StringBuilder sb = new StringBuilder("[");
        NodoDonacion actual = tope;
        boolean primero = true;
        while (actual != null) {
            if (!primero) sb.append(",");
            sb.append("{")
                .append("\"cip\":\"").append(actual.getCip()).append("\",")
                .append("\"nombre\":\"").append(actual.getNombre()).append("\",")
                .append("\"correo\":\"").append(actual.getCorreo()).append("\",")
                .append("\"monto\":").append(actual.getMonto()).append(",")
                .append("\"metodo\":\"").append(actual.getMetodo()).append("\",")
                .append("\"fecha\":\"").append(actual.getFecha()).append("\"")
                .append("}");
            primero = false;
            actual = actual.getSiguiente();
        }
        sb.append("]");
        return sb.toString();
    }
}
