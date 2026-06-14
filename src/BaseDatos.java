import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class BaseDatos {
   private static final String URL = buildUrl();

private static String buildUrl() {
    String dbUrl = System.getenv("DATABASE_URL");
    if (dbUrl == null) return "jdbc:sqlite:/app/pancitallena.db";
    
    dbUrl = dbUrl.replace("postgresql://", "");
    
    int arrobaIdx = dbUrl.indexOf("@");
    String credenciales = dbUrl.substring(0, arrobaIdx);
    String resto = dbUrl.substring(arrobaIdx + 1);
    
    int dospuntosIdx = credenciales.indexOf(":");
    String usuario = credenciales.substring(0, dospuntosIdx);
    String contrasena = credenciales.substring(dospuntosIdx + 1);
    
    int barraIdx = resto.indexOf("/");
    String host = resto.substring(0, barraIdx);
    String db = resto.substring(barraIdx + 1);
    
    return "jdbc:postgresql://" + host + ":5432/" + db + "?user=" + usuario + "&password=" + contrasena + "&sslmode=require";
}

    public static void inicializarBD() {
        String sqlTablaVoluntarios = "CREATE TABLE IF NOT EXISTS voluntarios ("
                + " id INTEGER PRIMARY KEY,"
                + " nombre TEXT NOT NULL,"
                + " ciudad TEXT NOT NULL,"
                + " fechaUnion TEXT NOT NULL,"
                + " correo TEXT NOT NULL,"
                + " celular TEXT NOT NULL,"
                + " horarioDiaMes TEXT NOT NULL,"
                + " idAsociado INTEGER DEFAULT NULL"
                + ");";
              String sqlTablaHistorial = "CREATE TABLE IF NOT EXISTS historial ("
                + " id_historial SERIAL PRIMARY KEY,"
                + " id_voluntario INTEGER NOT NULL,"
                + " descripcion TEXT NOT NULL,"
                + " fecha TEXT DEFAULT CURRENT_TIMESTAMP"
                + ");";
              String sqlTablaPerros = "CREATE TABLE IF NOT EXISTS perros ("
                + " id SERIAL PRIMARY KEY,"
                + " nombre TEXT NOT NULL,"
                + " raza TEXT,"
                + " tipo TEXT,"
                + " imagen TEXT,"
                + " descripcion TEXT,"
                + " estado TEXT DEFAULT 'Disponible'"
                + ");";
                String sqlTablaDonaciones = "CREATE TABLE IF NOT EXISTS donaciones ("
                + " cip TEXT PRIMARY KEY,"
                + " nombre TEXT NOT NULL,"
                + " correo TEXT NOT NULL,"
                + " monto REAL NOT NULL,"
                + " metodo TEXT NOT NULL,"
                + " fecha TEXT NOT NULL"
                + ");";
        try (Connection conexion = DriverManager.getConnection(URL);
            Statement stmt = conexion.createStatement()) {
            stmt.execute(sqlTablaVoluntarios);
            stmt.execute(sqlTablaHistorial);
            stmt.execute(sqlTablaPerros);
            stmt.execute(sqlTablaDonaciones);
            System.out.println("[Base de Datos] Inicializada con éxito. Tablas 'voluntarios' e 'historial' listas.");
        } catch (SQLException e) {
            System.out.println("Error al inicializar la Base de Datos: " + e.getMessage());
        }
    }
    public static void guardarVoluntario(Voluntario v) {
        String sql = "INSERT INTO voluntarios(id, nombre, ciudad, fechaUnion, correo, celular, horarioDiaMes) "
                + "VALUES(?,?,?,?,?,?,?);";
        
        try (Connection conexion = DriverManager.getConnection(URL);
            PreparedStatement pstmt = conexion.prepareStatement(sql)) {
            
            pstmt.setInt(1, v.getId()); 
            pstmt.setString(2, v.getNombre());
            pstmt.setString(3, v.getCiudad());
            pstmt.setString(4, v.getFechaUnion());
            pstmt.setString(5, v.getCorreo());
            pstmt.setString(6, v.getCelular());
            pstmt.setString(7, v.getHorarioDiaMes());
            
            pstmt.executeUpdate();
            System.out.println("[Base de Datos] Voluntario con DNI " + v.getId() + " guardado en el disco.");
        } catch (SQLException e) {
            System.out.println("Error al guardar voluntario en SQL: " + e.getMessage());
        }
    }
    public static void cargarDatos(ListaVoluntarios lista) {
    String sql = "SELECT id, nombre, ciudad, fechaUnion, correo, celular, horarioDiaMes, idAsociado FROM voluntarios;";
    try (Connection conexion = DriverManager.getConnection(URL);
        Statement stmt = conexion.createStatement();
        ResultSet rs = stmt.executeQuery(sql)) {
        while (rs.next()) {
            Voluntario v = new Voluntario(
                rs.getInt("id"), rs.getString("nombre"), rs.getString("ciudad"),
                rs.getString("fechaUnion"), rs.getString("correo"),
                rs.getString("celular"), rs.getString("horarioDiaMes")
            );
            int idAsociado = rs.getInt("idAsociado");
            if (!rs.wasNull()) {
                v.setIdAsociado(idAsociado);
            }
            
            lista.insertar(v);
        }
    } catch (SQLException e)  {
            System.out.println("Error al cargar los datos desde SQL: " + e.getMessage());
        }
    }
    public static void actualizarAsociado(int idVoluntario, int idAsociado) {
        String sql = "UPDATE voluntarios SET idAsociado = ? WHERE id = ?;";
        try (Connection conexion = DriverManager.getConnection(URL);
            PreparedStatement pstmt = conexion.prepareStatement(sql)) {
            
            pstmt.setInt(1, idAsociado);
            pstmt.setInt(2, idVoluntario);
            pstmt.executeUpdate();
            System.out.println("[Base de Datos] Asociación actualizada entre voluntarios.");
            
        } catch (SQLException e) {
            System.out.println("Error al actualizar el compañero en SQL: " + e.getMessage());
        }
    }
    public static void guardarHistorial(int idVoluntario, String descripcion) {
        String sql = "INSERT INTO historial(id_voluntario, descripcion) VALUES(?, ?);";
        try (Connection conexion = DriverManager.getConnection(URL);
            PreparedStatement pstmt = conexion.prepareStatement(sql)) {
            
            pstmt.setInt(1, idVoluntario);
            pstmt.setString(2, descripcion);
            pstmt.executeUpdate();
            System.out.println("[Base de Datos] Historial registrado.");
        } catch (SQLException e) {
            System.out.println("Error al guardar en el historial: " + e.getMessage());
        }
    }
    public static void eliminarVoluntario(int id) {
    String sql = "DELETE FROM voluntarios WHERE id = ?;";
    try (Connection conexion = DriverManager.getConnection(URL);
        PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        pstmt.setInt(1, id);
        pstmt.executeUpdate();
        System.out.println("[Base de Datos] Voluntario con DNI " + id + " eliminado.");
        } catch (SQLException e) {
        System.out.println("Error al eliminar voluntario: " + e.getMessage());
    }
}


public static void guardarPerro(Perro p) {
   String sql = "INSERT INTO perros(id, nombre, raza, tipo, imagen, descripcion, estado) VALUES(?,?,?,?,?,?,?) ON CONFLICT (id) DO NOTHING;";
    try (Connection conexion = DriverManager.getConnection(URL);
        PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        pstmt.setInt(1, p.getId());
        pstmt.setString(2, p.getNombre());
        pstmt.setString(3, p.getRaza());
        pstmt.setString(4, p.getTipo());
        pstmt.setString(5, p.getImagen());
        pstmt.setString(6, p.getDescripcion());
        pstmt.setString(7, p.getEstadoActual());
        pstmt.executeUpdate();
        System.out.println("[Base de Datos] Animal guardado: " + p.getNombre());
    } catch (SQLException e) {
        System.out.println("Error al guardar animal: " + e.getMessage());
    }
}
public static void actualizarEstadoPerro(int id, String estado) {
    String sql = "UPDATE perros SET estado = ? WHERE id = ?;";
    try (Connection conexion = DriverManager.getConnection(URL);
        PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        pstmt.setString(1, estado);
        pstmt.setInt(2, id);
        pstmt.executeUpdate();
        System.out.println("[Base de Datos] Estado actualizado: " + estado);
    } catch (SQLException e) {
        System.out.println("Error al actualizar estado: " + e.getMessage());
    }
    }
    public static void cargarPerros(ArbolPerros lista) {
    String sql = "SELECT id, nombre, raza, tipo, imagen, descripcion, estado FROM perros;";
    try (Connection conexion = DriverManager.getConnection(URL);
        Statement stmt = conexion.createStatement();
        ResultSet rs = stmt.executeQuery(sql)) {
        while (rs.next()) {
            Perro p = new Perro(
                rs.getInt("id"),
                rs.getString("nombre"),
                rs.getString("raza"),
                rs.getString("tipo"),
                rs.getString("imagen"),
                rs.getString("descripcion")
            );
            String estado = rs.getString("estado");
            if (estado != null && !estado.equals("Disponible")) {
                p.cambiarEstado(estado);
            }
            lista.insertar(p);
        }
        System.out.println("[Base de Datos] Animales cargados.");
    } catch (SQLException e) {
        System.out.println("Error al cargar animales: " + e.getMessage());
    }
}
/*PERROS*/
public static void insertarAnimalesIniciales() {
    String sqlCheck = "SELECT COUNT(*) FROM perros;";
    try (Connection conexion = DriverManager.getConnection(URL);
        Statement stmt = conexion.createStatement();
        ResultSet rs = stmt.executeQuery(sqlCheck)) {
        if (rs.next() && rs.getInt(1) > 0) {
            System.out.println("[Base de Datos] Animales ya existen, no se insertan.");
            return; 
        }
    } catch (SQLException e) {
        System.out.println("Error al verificar animales: " + e.getMessage());
        return;
    }
    ArbolPerros animalesIniciales = new ArbolPerros();
    animalesIniciales.insertar(new Perro(1, "Santa Teresa",         "Doméstico", "gato",  "g1.png",  "Gatita atigrada, arisca, preñada, Urgencia de adopción"));
    animalesIniciales.insertar(new Perro(2, "La Hermelinda Gatos",  "Doméstico", "gato",  "g2.png",  "Grupo de gatitos hermanitos, juguetones. Sin esterilizar/ sin castrar, posiblemente sanos"));
    animalesIniciales.insertar(new Perro(3, "La Esperanza Gato",    "Doméstico", "gato",  "g3.png",  "Gatita cálico, juguetona, tranquila, le gusta los mimos, sana. Sin esterilizar"));
    animalesIniciales.insertar(new Perro(4, "Manuel Arevalo Macho", "Mestizo",   "perro", "p1.png",  "Macho 3 años, 20-30kg, cariñoso, jugueton. Sin castrar. Posiblemente sano"));
    animalesIniciales.insertar(new Perro(5, "Manuel Arevalo Hembra","Mestizo",   "perro", "p2.png",  "Hembra 4 años, bicolor, amigable, 24kg. Sin esterilizar, posiblemente sana."));
    animalesIniciales.insertar(new Perro(6, "Hermelinda Macho 1",   "Mestizo",   "perro", "p3.png",  "Macho 5 años, mediano, juguetón, pasivo, sociable. Sin castar"));
    animalesIniciales.insertar(new Perro(7, "Hermelinda Macho 2",   "Mestizo",   "perro", "p4.jpeg", "Macho negrito patitas amarillas, tranquilo, serio, agradable. Sin esterilizar, posiblemente sano."));
    animalesIniciales.insertar(new Perro(8, "Hermelinda Macho 3",   "Mestizo",   "perro", "p5.jpeg", "Macho marrón caoba, curioso, le gustan los mimos. Sin castrar, posiblemente sano."));
    animalesIniciales.insertar(new Perro(9, "Hermelinda Macho 4",   "Mestizo",   "perro", "p6.jpeg", "Macho dorado, juguetón, sociable, pasivo. Sin castar, posiblemente sano."));
    String sql = "INSERT INTO perros(id, nombre, raza, tipo, imagen, descripcion, estado) VALUES(?,?,?,?,?,?,?);";
    try (Connection conexion = DriverManager.getConnection(URL);
        PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        insertarNodosArbol(animalesIniciales.getRaiz(), pstmt);
        System.out.println("[Base de Datos] Animales iniciales insertados desde árbol.");
    } catch (SQLException e) {
        System.out.println("Error al insertar animales: " + e.getMessage());
    }
}
private static void insertarNodosArbol(ArbolPerros.NodoArbol nodo, PreparedStatement pstmt) throws SQLException {
    if (nodo == null) return;
    Perro p = nodo.dato;
    pstmt.setInt(1,    p.getId());
    pstmt.setString(2, p.getNombre());
    pstmt.setString(3, p.getRaza());
    pstmt.setString(4, p.getTipo());
    pstmt.setString(5, p.getImagen());
    pstmt.setString(6, p.getDescripcion());
    pstmt.setString(7, p.getEstadoActual());
    pstmt.executeUpdate();
    insertarNodosArbol(nodo.izquierda, pstmt);
    insertarNodosArbol(nodo.derecha,   pstmt);
}
public static void eliminarPerro(int id) {
    String sql = "DELETE FROM perros WHERE id = ?;";
    try (Connection conexion = DriverManager.getConnection(URL);
        PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        pstmt.setInt(1, id);
        pstmt.executeUpdate();
        System.out.println("[Base de Datos] Animal eliminado con ID: " + id);
    } catch (SQLException e) {
        System.out.println("Error al eliminar animal: " + e.getMessage());
    }
}
/*DONACIONES*/
public static void guardarDonacion(NodoDonacion d) {
    String sql = "INSERT INTO donaciones(cip, nombre, correo, monto, metodo, fecha) VALUES(?,?,?,?,?,?);";
    try (Connection conexion = DriverManager.getConnection(URL);
        PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        pstmt.setString(1, d.getCip());
        pstmt.setString(2, d.getNombre());
        pstmt.setString(3, d.getCorreo());
        pstmt.setDouble(4, d.getMonto());
        pstmt.setString(5, d.getMetodo());
        pstmt.setString(6, d.getFecha());
        pstmt.executeUpdate();
        System.out.println("[Base de Datos] Donación guardada: " + d.getCip());
    } catch (SQLException e) {
        System.out.println("Error al guardar donación: " + e.getMessage());
    }
}
public static void cargarDonacionesPorCorreo(String correo, PilaDonaciones pila) {
    String sql = "SELECT cip, nombre, correo, monto, metodo, fecha FROM donaciones WHERE correo = ? ORDER BY fecha DESC;";
    try (Connection conexion = DriverManager.getConnection(URL);
        PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        pstmt.setString(1, correo);
        ResultSet rs = pstmt.executeQuery();
        while (rs.next()) {
            NodoDonacion nodo = new NodoDonacion(
                rs.getString("cip"), rs.getString("nombre"), rs.getString("correo"),
                rs.getDouble("monto"), rs.getString("metodo"), rs.getString("fecha")
            );
            pila.push(nodo);
        }
    } catch (SQLException e) {
        System.out.println("Error al cargar donaciones: " + e.getMessage());
    }
}
public static void cargarTodasLasDonaciones(PilaDonaciones pila) {
    String sql = "SELECT cip, nombre, correo, monto, metodo, fecha FROM donaciones ORDER BY fecha DESC;";
    try (Connection conexion = DriverManager.getConnection(URL);
        Statement stmt      = conexion.createStatement();
        ResultSet rs        = stmt.executeQuery(sql)) {
        while (rs.next()) {
            pila.push(new NodoDonacion(
                rs.getString("cip"),    rs.getString("nombre"),
                rs.getString("correo"), rs.getDouble("monto"),
                rs.getString("metodo"), rs.getString("fecha")
            ));
        }
    } catch (SQLException e) {
        System.out.println("Error al cargar donaciones: " + e.getMessage());
    }
}
public static Voluntario obtenerCompanero(int idVoluntario) {
    String sql = "SELECT v.id, v.nombre, v.ciudad, v.fechaUnion, v.correo, v.celular, v.horarioDiaMes " +
                 "FROM voluntarios v " +
                 "INNER JOIN voluntarios v2 ON v2.idAsociado = v.id " +
                 "WHERE v2.id = ?;";
    try (Connection conexion = DriverManager.getConnection(URL);
         PreparedStatement pstmt = conexion.prepareStatement(sql)) {
        pstmt.setInt(1, idVoluntario);
        ResultSet rs = pstmt.executeQuery();
        if (rs.next()) {
            return new Voluntario(
                rs.getInt("id"), rs.getString("nombre"), rs.getString("ciudad"),
                rs.getString("fechaUnion"), rs.getString("correo"),
                rs.getString("celular"), rs.getString("horarioDiaMes")
            );
        }
    } catch (SQLException e) {
        System.out.println("Error al obtener compañero: " + e.getMessage());
    }
    return null;
}
}