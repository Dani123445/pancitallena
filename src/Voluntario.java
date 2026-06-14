public class Voluntario {
    private int    id;
    private String nombre;
    private String ciudad;
    private String fechaUnion;
    private String correo;
    private String celular;
    private String horarioDiaMes;
    private Integer idAsociado;

    public Voluntario(int id, String nombre, String ciudad, String fechaUnion, 
        String correo, String celular, String horarioDiaMes) { 
        this.id            = id;
        this.nombre        = nombre;
        this.ciudad        = ciudad;
        this.fechaUnion    = fechaUnion;
        this.correo        = correo;
        this.celular       = celular;
        this.horarioDiaMes = horarioDiaMes;
        this.idAsociado    = null;
    }
    public int    getId()            { return id; }
    public String getNombre()        { return nombre; }
    public String getCiudad()        { return ciudad; }
    public String getFechaUnion()    { return fechaUnion; }
    public String getCorreo()        { return correo; }
    public String getCelular()       { return celular; }
    public String getHorarioDiaMes() { return horarioDiaMes; }
    public void setIdAsociado(Integer idAsociado)
    { this.idAsociado = idAsociado; }
    public Integer getIdAsociado() { return idAsociado; }
}