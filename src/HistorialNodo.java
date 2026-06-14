public class HistorialNodo{
    private String evento;             
    private HistorialNodo siguiente;  
    public HistorialNodo(String evento) {
        this.evento = evento;         
        this.siguiente = null;        
    }
    public String getEvento() { 
        return evento; 
    }
        public HistorialNodo getSiguiente() { 
        return siguiente; 
    }
    public void setSiguiente(HistorialNodo siguiente) { 
        this.siguiente = siguiente; 
    }
}
