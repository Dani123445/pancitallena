public class Perro {
    private int         id;
    private String      nombre;
    private String      raza;
    private String      tipo;       
    private String      imagen;
    private String      descripcion;
    private PilaEstados historialEstados;
    public Perro(int id, String nombre, String raza, String tipo, String imagen, String descripcion) {
        this.id               = id;
        this.nombre           = nombre;
        this.raza             = raza;
        this.tipo             = tipo;
        this.imagen           = imagen;
        this.descripcion      = descripcion;
        this.historialEstados = new PilaEstados();
        this.historialEstados.push("Disponible");
    }
    public int    getId()          { return id; }
    public String getNombre()      { return nombre; }
    public String getRaza()        { return raza; }
    public String getTipo()        { return tipo; }
    public String getImagen()      { return imagen; }
    public String getDescripcion() { return descripcion; }
    public String getEstadoActual() { return historialEstados.peek(); }
    public void   cambiarEstado(String estado) { historialEstados.push(estado); }
    public void   mostrarHistorial() { historialEstados.mostrarHistorial(); }
}