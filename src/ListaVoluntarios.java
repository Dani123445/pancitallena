public class ListaVoluntarios {

    private static class NodoCompanero {
        NodoVoluntario dato;
        NodoCompanero  siguiente;
        NodoCompanero(NodoVoluntario dato) {
            this.dato      = dato;
            this.siguiente = null;
        }
    }

    private static class NodoVoluntario {
        Voluntario    dato;
        HistorialNodo historialCabeza;
        NodoCompanero companerosCabeza; 
        NodoVoluntario siguiente;

        NodoVoluntario(Voluntario dato) {
            this.dato             = dato;
            this.historialCabeza  = null;
            this.companerosCabeza = null;
            this.siguiente        = null;
            agregarHistorial("Se unió el " + dato.getFechaUnion() +
                        " con horario: " + dato.getHorarioDiaMes());
        }

        void agregarHistorial(String evento) {
            HistorialNodo nuevo = new HistorialNodo(evento);
            nuevo.setSiguiente(historialCabeza);
            historialCabeza = nuevo;
        }

        boolean yaEstaAsociado(int id) {
            NodoCompanero actual = companerosCabeza;
            while (actual != null) {
                if (actual.dato.dato.getId() == id) return true;
                actual = actual.siguiente;
            }
            return false;
        }

        void asociarCon(NodoVoluntario compañero) {
            if (yaEstaAsociado(compañero.dato.getId())) return;
            NodoCompanero nuevo = new NodoCompanero(compañero);
            nuevo.siguiente  = companerosCabeza;
            companerosCabeza = nuevo;
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
            if (actual.companerosCabeza != null) {
                System.out.print("Compañeros: ");
                NodoCompanero comp = actual.companerosCabeza;
                while (comp != null) {
                    System.out.print(comp.dato.dato.getNombre());
                    if (comp.siguiente != null) System.out.print(", ");
                    comp = comp.siguiente;
                }
                System.out.println();
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
                    actual.asociarCon(compañero);
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

    public String toJson() {
        StringBuilder sb = new StringBuilder("[");
        NodoVoluntario actual = cabeza;
        boolean primero = true;
        while (actual != null) {
            Voluntario v = actual.dato;
            if (!primero) sb.append(",");

            // Construir lista de IDs de compañeros
            StringBuilder compañerosIds = new StringBuilder("[");
            NodoCompanero comp = actual.companerosCabeza;
            boolean primeroComp = true;
            while (comp != null) {
                if (!primeroComp) compañerosIds.append(",");
                compañerosIds.append(comp.dato.dato.getId());
                primeroComp = false;
                comp = comp.siguiente;
            }
            compañerosIds.append("]");
            String primerAsociado = actual.companerosCabeza != null
                ? String.valueOf(actual.companerosCabeza.dato.dato.getId())
                : "null";

            sb.append("{")
                .append("\"id\":").append(v.getId()).append(",")
                .append("\"nombre\":\"").append(v.getNombre()).append("\",")
                .append("\"ciudad\":\"").append(v.getCiudad()).append("\",")
                .append("\"correo\":\"").append(v.getCorreo()).append("\",")
                .append("\"celular\":\"").append(v.getCelular()).append("\",")
                .append("\"horario\":\"").append(v.getHorarioDiaMes()).append("\",")
                .append("\"asociado\":").append(primerAsociado).append(",")
                .append("\"companeros\":").append(compañerosIds)
                .append("}");
            primero = false;
            actual  = actual.siguiente;
        }
        sb.append("]");
        return sb.toString();
    }
}