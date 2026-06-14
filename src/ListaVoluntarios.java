public class ListaVoluntarios {
    private static class NodoVoluntario {
        Voluntario     dato;
        HistorialNodo  historialCabeza;
        NodoVoluntario voluntarioAsociado;
        NodoVoluntario siguiente;
        NodoVoluntario(Voluntario dato) {
            this.dato               = dato;
            this.historialCabeza    = null;
            this.voluntarioAsociado = null;
            this.siguiente          = null;
            agregarHistorial("Se unió el " + dato.getFechaUnion() +
                        " con horario: " + dato.getHorarioDiaMes());
        }
        void agregarHistorial(String evento) {
            HistorialNodo nuevo = new HistorialNodo(evento);
            nuevo.setSiguiente(historialCabeza);
            historialCabeza = nuevo;
        }
        void asociarCon(NodoVoluntario compañero) {
            this.voluntarioAsociado = compañero;
            agregarHistorial("Asociado con el compañero local: "
                    + compañero.dato.getNombre()
                    + " (Contacto: " + compañero.dato.getCelular()
                    + " / "          + compañero.dato.getCorreo() + ")");
        }
        void mostrarHistorial() {
            HistorialNodo actual = historialCabeza;
            while (actual != null) {
                System.out.println("  - " + actual.getEvento());
                actual = actual.getSiguiente();
            }
        }
    }                                          
    private NodoVoluntario cabeza;
    public ListaVoluntarios() {
        this.cabeza = null;
    }
    public void insertar(Voluntario v) {
        NodoVoluntario nuevo = new NodoVoluntario(v);
        nuevo.siguiente = cabeza;
        cabeza = nuevo;
    }
    private NodoVoluntario buscarNodoPorId(int id) {
        NodoVoluntario actual = cabeza;
        while (actual != null) {
            if (actual.dato.getId() == id) return actual;
            actual = actual.siguiente;
        }
        return null;
    }
    public Voluntario buscarPorId(int id) {
        NodoVoluntario nodo = buscarNodoPorId(id);
        return nodo != null ? nodo.dato : null;
    }
    public Voluntario buscarPorCiudadYHorario(String ciudad, String horario, int idExcluir) {
        NodoVoluntario actual = cabeza;
        while (actual != null) {
            Voluntario v = actual.dato;
            if (v.getCiudad().equalsIgnoreCase(ciudad) &&
                v.getHorarioDiaMes().equalsIgnoreCase(horario) &&
                v.getId() != idExcluir) {
                return v;
            }
            actual = actual.siguiente;
        }
        return null;
    }
    public void asociar(int idA, int idB) {
        NodoVoluntario nodoA = buscarNodoPorId(idA);
        NodoVoluntario nodoB = buscarNodoPorId(idB);
        if (nodoA != null && nodoB != null) {
            nodoA.asociarCon(nodoB);
            nodoB.asociarCon(nodoA);
        }
    }
    public void mostrarLista() {
        if (cabeza == null) {
            System.out.println("No hay voluntarios registrados.");
            return;
        }
        NodoVoluntario actual = cabeza;
        while (actual != null) {
            Voluntario v = actual.dato;
            System.out.println("\nNombre: " + v.getNombre());
            System.out.println("Ciudad: "  + v.getCiudad());
            if (actual.voluntarioAsociado != null) {
                System.out.println("Compañero local: " +
                    actual.voluntarioAsociado.dato.getNombre());
            } else {
                System.out.println("Compañero local: Ninguno");
            }
            System.out.println("Historial:");
            actual.mostrarHistorial();
            actual = actual.siguiente;
        }
    }
    public void reconstruirAsociaciones() {
        NodoVoluntario actual = cabeza;
        while (actual != null) {
            if (actual.dato.getIdAsociado() != null) {
                NodoVoluntario compañero = buscarNodoPorId(actual.dato.getIdAsociado());
                if (compañero != null) {
                    actual.voluntarioAsociado = compañero;
                }
            }
            actual = actual.siguiente;
        }
    }
    public ListaCompatibles buscarTodosPorCiudadYHorario(String ciudad, String horario, int idExcluir) {
        ListaCompatibles compatibles = new ListaCompatibles();
        NodoVoluntario actual = cabeza;
        while (actual != null) {
            Voluntario v = actual.dato;
            if (v.getCiudad().equalsIgnoreCase(ciudad) &&
                v.getHorarioDiaMes().equalsIgnoreCase(horario) &&
                v.getId() != idExcluir) {
                compatibles.insertar(v);
            }
            actual = actual.siguiente;
        }
        return compatibles;
    }
    public void eliminar(int id) {
    if (cabeza == null) return;
    if (cabeza.dato.getId() == id) {
        cabeza = cabeza.siguiente;
        return;
    }
    NodoVoluntario actual = cabeza;
    while (actual.siguiente != null) {
        if (actual.siguiente.dato.getId() == id) {
            actual.siguiente = actual.siguiente.siguiente;
            return;
            }
        actual = actual.siguiente;
        }
    }
//lector 
    public String toJson() {
    StringBuilder sb = new StringBuilder("[");
    NodoVoluntario actual = cabeza;
    boolean primero = true;
    while (actual != null) {
        Voluntario v = actual.dato;
        if (!primero) sb.append(",");
        sb.append("{")
            .append("\"id\":").append(v.getId()).append(",")
            .append("\"nombre\":\"").append(v.getNombre()).append("\",")
            .append("\"ciudad\":\"").append(v.getCiudad()).append("\",")
            .append("\"correo\":\"").append(v.getCorreo()).append("\",")
            .append("\"celular\":\"").append(v.getCelular()).append("\",")
            .append("\"horario\":\"").append(v.getHorarioDiaMes()).append("\",")
            .append("\"asociado\":").append(v.getIdAsociado() != null ? v.getIdAsociado() : "null")
            .append("}");
        primero = false;
        actual  = actual.siguiente;
    }
    sb.append("]");
    return sb.toString();
}
}                                       