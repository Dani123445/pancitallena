import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class pancitallena {
    private static ListaVoluntarios lista      = new ListaVoluntarios();
    private static ArbolPerros      listaPerros = new ArbolPerros();

    public static void main(String[] args) {
        BaseDatos.inicializarBD();
        BaseDatos.insertarAnimalesIniciales();
        BaseDatos.cargarDatos(lista);
        BaseDatos.cargarPerros(listaPerros);
        lista.reconstruirAsociaciones();
        arrancarServidorWeb();
        System.out.println("[SISTEMA] Servidor listo. Esperando peticiones...");
    }
    private static void arrancarServidorWeb() {
        try {
            String puertoNube = System.getenv("PORT");
            int puerto = (puertoNube != null) ? Integer.parseInt(puertoNube) : 8080;
            HttpServer servidor = HttpServer.create(new InetSocketAddress(puerto), 0);
            servidor.createContext("/registrar",            new WebRegistrarHandler());
            servidor.createContext("/perros",               new WebPerrosHandler());
            servidor.createContext("/adoptar",              new WebAdoptarHandler());
            servidor.createContext("/donar",                new WebDonarHandler());
            servidor.createContext("/historial-donaciones", new WebHistorialDonacionesHandler());
            servidor.createContext("/admin-login",          new WebAdminLoginHandler());
            servidor.createContext("/subir-imagen",         new WebSubirImagenHandler());
            servidor.createContext("/voluntarios",  new WebVoluntariosHandler());
            servidor.createContext("/donaciones",   new WebDonacionesHandler());
            servidor.createContext("/companero", new WebCompaneroHandler());
            servidor.createContext("/", new WebArchivosHandler());
            servidor.setExecutor(null);
            servidor.start();
            System.out.println("[SERVIDOR WEB ACTIVO] Escuchando en el puerto: " + puerto);
        } catch (IOException e) {
            System.out.println("Error al iniciar el servidor: " + e.getMessage());
        }
    }
    static class WebSubirImagenHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, X-Filename");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String jsonRespuesta;
            try {
                String nombreOriginal = exchange.getRequestHeaders().getFirst("X-Filename");
                if (nombreOriginal == null || nombreOriginal.isBlank()) {
                    jsonRespuesta = "{\"status\":\"error\",\"message\":\"Falta el header X-Filename.\"}";
                } else {
                    String nombreLimpio = nombreOriginal.replaceAll("[^a-zA-Z0-9._-]", "_");
                    String dirActual    = System.getProperty("user.dir");
                    System.out.println("[IMAGEN] Directorio actual: " + dirActual);
                    Path destino = Paths.get(dirActual, nombreLimpio);
                    System.out.println("[IMAGEN] Guardando en: " + destino.toAbsolutePath());
                    byte[] datos = exchange.getRequestBody().readAllBytes();
                    Files.write(destino, datos, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                    System.out.println("[IMAGEN] Guardada: " + nombreLimpio + " (" + datos.length + " bytes)");
                    jsonRespuesta = "{\"status\":\"success\",\"nombreArchivo\":\"" + nombreLimpio + "\"}";
                }
            } catch (Exception e) {
                System.out.println("[IMAGEN] Error: " + e.getMessage());
                jsonRespuesta = "{\"status\":\"error\",\"message\":\"Error al guardar imagen: " + e.getMessage() + "\"}";
            }
            byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }
    static class WebRegistrarHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if ("DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                String jsonRespuesta;
                try {
                    int id = Integer.parseInt(query.replace("id=", "").trim());
                    Voluntario v = lista.buscarPorId(id);
                    if (v == null) {
                        jsonRespuesta = "{\"status\":\"error\",\"message\":\"Voluntario no encontrado.\"}";
                    } else {
                        BaseDatos.eliminarVoluntario(id);
                        lista.eliminar(id);
                        jsonRespuesta = "{\"status\":\"success\",\"message\":\"Voluntario eliminado.\"}";
                        System.out.println("[WEB] Voluntario eliminado con DNI: " + id);
                    }
                } catch (Exception e) {
                    jsonRespuesta = "{\"status\":\"error\",\"message\":\"Error al eliminar.\"}";
                }
                byte[] respuestaBytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
                exchange.sendResponseHeaders(200, respuestaBytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(respuestaBytes);
                os.close();
                return;
            }
            if (!("POST".equalsIgnoreCase(exchange.getRequestMethod()))) return;
            BufferedReader br = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8));
            StringBuilder jsonBuilder = new StringBuilder();
            String linea;
            while ((linea = br.readLine()) != null) jsonBuilder.append(linea);
            String json = jsonBuilder.toString();
            String jsonRespuesta;
            try {
                int    id            = Integer.parseInt(buscarValorJson(json, "id"));
                String nombre        = buscarValorJson(json, "nombre");
                String ciudad        = buscarValorJson(json, "ciudad");
                String fechaUnion    = buscarValorJson(json, "fechaUnion");
                String correo        = buscarValorJson(json, "correo");
                String celular       = buscarValorJson(json, "celular");
                String horarioDiaMes = buscarValorJson(json, "horarioDiaMes");
                if (lista.buscarPorId(id) != null) {
                    jsonRespuesta = "{\"status\":\"error\",\"message\":\"El DNI ya se encuentra registrado.\"}";
                } else {
                    Voluntario nuevoWeb = new Voluntario(id, nombre, ciudad, fechaUnion, correo, celular, horarioDiaMes);
                    lista.insertar(nuevoWeb);
                    BaseDatos.guardarVoluntario(nuevoWeb);
                    ListaCompatibles compatibles = lista.buscarTodosPorCiudadYHorario(ciudad, horarioDiaMes, id);
                    if (!compatibles.estaVacia()) {
                        StringBuilder sbCompaneros = new StringBuilder("[");
                        ListaCompatibles.NodoCompat actual = compatibles.getCabeza();
                        boolean primero = true;
                        while (actual != null) {
                            Voluntario compañero = actual.dato;
                            lista.asociar(id, compañero.getId());
                            BaseDatos.actualizarAsociado(id, compañero.getId());
                            BaseDatos.actualizarAsociado(compañero.getId(), id);
                            if (!primero) sbCompaneros.append(",");
                            sbCompaneros.append("{")
                                .append("\"nombre\":\"").append(compañero.getNombre()).append("\",")
                                .append("\"celular\":\"").append(compañero.getCelular()).append("\",")
                                .append("\"correo\":\"").append(compañero.getCorreo()).append("\"")
                                .append("}");
                            primero = false;
                            actual  = actual.siguiente;
                        }
                        sbCompaneros.append("]");
                        jsonRespuesta = "{\"status\":\"success\",\"match\":true,\"companeros\":"
                                    + sbCompaneros + "}";
                    } else {
                        jsonRespuesta = "{\"status\":\"success\",\"match\":false}";
                    }
                    System.out.println("[WEB] Nuevo voluntario registrado: " + nombre);
                }
            } catch (Exception e) {
                jsonRespuesta = "{\"status\":\"error\",\"message\":\"Error al procesar datos en el servidor.\"}";
            }
            byte[] respuestaBytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, respuestaBytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(respuestaBytes);
            os.close();
        }
        private String buscarValorJson(String json, String llave) {
            String patron = "\"" + llave + "\":\"";
            int inicio = json.indexOf(patron);
            if (inicio == -1) {
                patron = "\"" + llave + "\":";
                inicio = json.indexOf(patron);
                if (inicio == -1) return "";
                int fin = json.indexOf(",", inicio);
                if (fin == -1) fin = json.indexOf("}", inicio);
                return json.substring(inicio + patron.length(), fin).trim();
            }
            inicio += patron.length();
            int fin = json.indexOf("\"", inicio);
            return json.substring(inicio, fin);
        }
    }
    static class WebPerrosHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String jsonRespuesta;
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                jsonRespuesta = listaPerros.toJson();
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                BufferedReader br = new BufferedReader(
                    new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String linea;
                while ((linea = br.readLine()) != null) sb.append(linea);
                String json = sb.toString();
                try {
                    int    id          = Integer.parseInt(buscarValorJson(json, "id"));
                    String nombre      = buscarValorJson(json, "nombre");
                    String raza        = buscarValorJson(json, "raza");
                    String tipo        = buscarValorJson(json, "tipo");
                    String imagen      = buscarValorJson(json, "imagen");
                    String descripcion = buscarValorJson(json, "descripcion");
                    Perro nuevo = new Perro(id, nombre, raza, tipo, imagen, descripcion);
                    listaPerros.insertar(nuevo);
                    BaseDatos.guardarPerro(nuevo);
                    jsonRespuesta = "{\"status\":\"success\",\"message\":\"Animal registrado.\"}";
                    System.out.println("[WEB] Nuevo animal registrado: " + nombre);
                } catch (Exception e) {
                    jsonRespuesta = "{\"status\":\"error\",\"message\":\"Error al registrar.\"}";
                }
            } else if ("DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                try {
                    int   id    = Integer.parseInt(query.replace("id=", "").trim());
                    Perro perro = listaPerros.buscarPorId(id);
                    if (perro == null) {
                        jsonRespuesta = "{\"status\":\"error\",\"message\":\"Animal no encontrado.\"}";
                    } else {
                        listaPerros.eliminar(id);
                        BaseDatos.eliminarPerro(id);
                        jsonRespuesta = "{\"status\":\"success\",\"message\":\"Animal eliminado.\"}";
                        System.out.println("[ADMIN] Animal eliminado con ID: " + id);
                    }
                } catch (Exception e) {
                    jsonRespuesta = "{\"status\":\"error\",\"message\":\"Error al eliminar.\"}";
                }
            } else {
                jsonRespuesta = "{\"status\":\"error\",\"message\":\"Método no permitido.\"}";
            }
            byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
        private String buscarValorJson(String json, String llave) {
            String patron = "\"" + llave + "\":\"";
            int inicio = json.indexOf(patron);
            if (inicio == -1) {
                patron = "\"" + llave + "\":";
                inicio = json.indexOf(patron);
                if (inicio == -1) return "";
                int fin = json.indexOf(",", inicio);
                if (fin == -1) fin = json.indexOf("}", inicio);
                return json.substring(inicio + patron.length(), fin).trim();
            }
            inicio += patron.length();
            int fin = json.indexOf("\"", inicio);
            return json.substring(inicio, fin);
        }
    }
    static class WebAdoptarHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String query = exchange.getRequestURI().getQuery();
            String jsonRespuesta;
            try {
                int sepIdx = query.indexOf("&");
                String parteId     = query.substring(0, sepIdx);
                String parteEstado = query.substring(sepIdx + 1);
                int    id     = Integer.parseInt(parteId.replace("id=", "").trim());
                String estado = java.net.URLDecoder.decode(
                                parteEstado.replace("estado=", "").trim(), "UTF-8");
                if (!estado.equals("Disponible") &&
                    !estado.equals("En proceso") &&
                    !estado.equals("Adoptado")) {
                    jsonRespuesta = "{\"status\":\"error\",\"message\":\"Estado inválido.\"}";
                } else {
                    Perro perro = listaPerros.buscarPorId(id);
                    if (perro == null) {
                        jsonRespuesta = "{\"status\":\"error\",\"message\":\"Animal no encontrado.\"}";
                    } else {
                        perro.cambiarEstado(estado);
                        BaseDatos.actualizarEstadoPerro(id, estado);
                        jsonRespuesta = "{\"status\":\"success\",\"message\":\"Estado actualizado a: " + estado + "\"}";
                        System.out.println("[ADMIN] " + perro.getNombre() + " → " + estado);
                    }
                }
            } catch (Exception e) {
                jsonRespuesta = "{\"status\":\"error\",\"message\":\"Error al procesar.\"}";
            }
            byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }
    static class WebDonarHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            BufferedReader br = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String linea;
            while ((linea = br.readLine()) != null) sb.append(linea);
            String json = sb.toString();
            String jsonRespuesta;
            try {
                String nombre = buscarValorJson(json, "nombre");
                String correo = buscarValorJson(json, "correo");
                String metodo = buscarValorJson(json, "metodo");
                double monto  = Double.parseDouble(buscarValorJson(json, "monto"));
                String fecha  = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm")
                                    .format(new java.util.Date());
                String cip    = String.valueOf((long)(Math.random() * 9_000_000_000L) + 1_000_000_000L);
                NodoDonacion donacion = new NodoDonacion(cip, nombre, correo, monto, metodo, fecha);
                BaseDatos.guardarDonacion(donacion);
                System.out.println("[WEB] Donación registrada: " + cip + " | " + nombre);
                jsonRespuesta = "{\"status\":\"success\","
                    + "\"cip\":\""    + cip    + "\","
                    + "\"nombre\":\"" + nombre + "\","
                    + "\"monto\":"    + monto  + ","
                    + "\"metodo\":\"" + metodo + "\","
                    + "\"fecha\":\""  + fecha  + "\"}";
            } catch (Exception e) {
                jsonRespuesta = "{\"status\":\"error\",\"message\":\"Error al procesar donación.\"}";
            }
            byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
        private String buscarValorJson(String json, String llave) {
            String patron = "\"" + llave + "\":\"";
            int inicio = json.indexOf(patron);
            if (inicio == -1) {
                patron = "\"" + llave + "\":";
                inicio = json.indexOf(patron);
                if (inicio == -1) return "";
                int fin = json.indexOf(",", inicio);
                if (fin == -1) fin = json.indexOf("}", inicio);
                return json.substring(inicio + patron.length(), fin).trim();
            }
            inicio += patron.length();
            int fin = json.indexOf("\"", inicio);
            return json.substring(inicio, fin);
        }
    }
    static class WebHistorialDonacionesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            String query = exchange.getRequestURI().getQuery();
            String jsonRespuesta;
            try {
                String correo = query.replace("correo=", "").trim();
                PilaDonaciones pila = new PilaDonaciones();
                BaseDatos.cargarDonacionesPorCorreo(correo, pila);
                jsonRespuesta = pila.toJson();
            } catch (Exception e) {
                jsonRespuesta = "[]";
            }
            byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }
    static class WebAdminLoginHandler implements HttpHandler {
        private static final String CONTRASENA = System.getenv("ADMIN_PASSWORD") != null 
        ? System.getenv("ADMIN_PASSWORD") 
        : "cambiar_en_produccion";
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            BufferedReader br = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String linea;
            while ((linea = br.readLine()) != null) sb.append(linea);
            String json  = sb.toString();
            String clave = buscarValorJson(json, "contrasena");
            String jsonRespuesta = CONTRASENA.equals(clave)
                ? "{\"status\":\"success\"}"
                : "{\"status\":\"error\"}";
            byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
        private String buscarValorJson(String json, String llave) {
            String patron = "\"" + llave + "\":\"";
            int inicio = json.indexOf(patron);
            if (inicio == -1) return "";
            inicio += patron.length();
            int fin = json.indexOf("\"", inicio);
            return json.substring(inicio, fin);
        }
    }
    static class WebVoluntariosHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        String jsonRespuesta = lista.toJson();
        byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
        }
    }
    static class WebDonacionesHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        PilaDonaciones pila = new PilaDonaciones();
        BaseDatos.cargarTodasLasDonaciones(pila);
        String jsonRespuesta = pila.toJson();
        byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
        }
    }
    static class WebArchivosHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String ruta = exchange.getRequestURI().getPath();
        if (ruta.equals("/")) ruta = "/index.html";
        Path archivo = Paths.get(System.getProperty("user.dir") + ruta);
        if (!Files.exists(archivo)) {
            byte[] msg = "404 Not Found".getBytes();
            exchange.sendResponseHeaders(404, msg.length);
            exchange.getResponseBody().write(msg);
            exchange.getResponseBody().close();
            return;
        }
        String tipo = ruta.endsWith(".html") ? "text/html" :
                      ruta.endsWith(".css")  ? "text/css" :
                      ruta.endsWith(".js")   ? "application/javascript" :
                      "application/octet-stream";
        byte[] bytes = Files.readAllBytes(archivo);
        exchange.getResponseHeaders().set("Content-Type", tipo);
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.getResponseBody().close();
    }
}
static class WebCompaneroHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        String query = exchange.getRequestURI().getQuery();
        String jsonRespuesta;
        try {
           int id = Integer.parseInt(query.replace("id=", "").trim());
                Voluntario companero = BaseDatos.obtenerCompanero(id);
                if (companero == null) {
                    jsonRespuesta = "{\"status\":\"sin_companero\"}";
                } else {
                    jsonRespuesta = "{\"status\":\"success\","
                        + "\"nombre\":\"" + companero.getNombre() + "\","
                        + "\"celular\":\"" + companero.getCelular() + "\","
                        + "\"correo\":\"" + companero.getCorreo() + "\"}";
                }
        } catch (Exception e) {
            jsonRespuesta = "{\"status\":\"error\"}";
        }
        byte[] bytes = jsonRespuesta.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}
}