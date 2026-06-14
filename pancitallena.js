document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("miModal");
    const botonCerrar = document.getElementById("btnCerrarModal");
    if (!sessionStorage.getItem("modalCerrado")) {
        modal.classList.add("mostrar");
    }
    botonCerrar.addEventListener("click", function() {
        modal.classList.remove("mostrar");
        sessionStorage.setItem("modalCerrado", "true");
    });
});