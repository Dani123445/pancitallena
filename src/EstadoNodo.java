public class EstadoNodo {
    private String estado;      
    private String fecha;
    private EstadoNodo siguiente;
    public EstadoNodo(String estado, String fecha) {
        this.estado    = estado;
        this.fecha     = fecha;
        this.siguiente = null;
    }
    public String    getEstado()    { return estado; }
    public String    getFecha()     { return fecha; }
    public EstadoNodo getSiguiente() { return siguiente; }
    public void      setSiguiente(EstadoNodo siguiente) { this.siguiente = siguiente; }
}