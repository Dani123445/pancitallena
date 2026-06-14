class NodoLista {
    constructor(dato) {
        this.dato = dato;
        this.siguiente = null;
    }
}
class ListaEnlazada {
    constructor() {
        this.cabeza = null;
        this.tamanio = 0;
    }

    insertar(dato) {
        const nuevo = new NodoLista(dato);
        if (!this.cabeza) {
            this.cabeza = nuevo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevo;
        }
        this.tamanio++;
    }
    estaVacia() {
        return this.cabeza === null;
    }

    obtenerPorIndice(indice) {
        let actual = this.cabeza;
        let i = 0;
        while (actual) {
            if (i === indice) return actual.dato;
            actual = actual.siguiente;
            i++;
        }
        return null;
    }
    recorrer(callback) {
        let actual = this.cabeza;
        while (actual) {
            callback(actual.dato);
            actual = actual.siguiente;
        }
    }
}