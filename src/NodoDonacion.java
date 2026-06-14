public class NodoDonacion {
    private String  cip;
    private String  nombre;
    private String  correo;
    private double  monto;
    private String  metodo;
    private String  fecha;
    private NodoDonacion siguiente;

    public NodoDonacion(String cip, String nombre, String correo, double monto, String metodo, String fecha) {
        this.cip      = cip;
        this.nombre   = nombre;
        this.correo   = correo;
        this.monto    = monto;
        this.metodo   = metodo;
        this.fecha    = fecha;
        this.siguiente = null;
    }
    public String       getCip()       { return cip; }
    public String       getNombre()    { return nombre; }
    public String       getCorreo()    { return correo; }
    public double       getMonto()     { return monto; }
    public String       getMetodo()    { return metodo; }
    public String       getFecha()     { return fecha; }
    public NodoDonacion getSiguiente() { return siguiente; }
    public void         setSiguiente(NodoDonacion siguiente) { this.siguiente = siguiente; }
}