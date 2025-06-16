// public/js/solicitudes.js
document.addEventListener("DOMContentLoaded", () => {
  const formBuscar = document.getElementById("formBuscar");
  const inputNombre = document.getElementById("inputNombre");

  formBuscar.addEventListener("submit", async (e) => {
    e.preventDefault(); // evitar recarga

    const nombre = inputNombre.value.trim();

    if (!nombre) {
      Swal.fire({
        icon: "warning",
        title: "Por favor ingresa un nombre para buscar",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/usuarios/buscar?nombre=${encodeURIComponent(nombre)}`
      );
      if (!response.ok) {
        throw new Error("Error en la búsqueda");
      }
      const usuarios = await response.json();

      if (usuarios.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No se encontraron usuarios con ese nombre",
        });
        return;
      }

      // Armar un listado HTML para mostrar
      Swal.fire({
        title: `Resultados de la búsqueda (${usuarios.length})`,
        html: `
          <ul style="text-align:left;">
            ${usuarios
              .map(
                (u) => `
                  <li>
                    ${u.nombre} ${u.apellido} (${u.email})
                    <button class="btn-agregar" data-id="${u.id_usuario}" data-nombre="${u.nombre}">Agregar</button>
                  </li>`
              )
              .join("")}
          </ul>`,
        width: 600,
        scrollbarPadding: false,
        showConfirmButton: false, 
        didOpen: () => {
          // alert con evento agregfar
          const botones = Swal.getPopup().querySelectorAll(".btn-agregar");
          botones.forEach((btn) => {
            btn.addEventListener("click", () => {
              const id = btn.getAttribute("data-id");
              const nombre = btn.getAttribute("data-nombre");
              agregarAmigo(id, nombre); 
            });
          });
        },
      });

      function agregarAmigo(id, nombre) {
        Swal.fire({
          title: `¿Querés agregar a ${nombre} como amigo?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, agregar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            // envio sol servidor
            fetch("/solicitudes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_destinatario: id }),
            })
              .then(async (res) => {
                const data = await res.json();

                if (!res.ok) {
                  // Si el estado HTTP no es OK, muestro error
                  return Swal.fire(
                    "Error",
                    data.error || data.message || "No se pudo enviar la solicitud",
                    "error"
                  );
                }

                // Si la respuesta fue OK, muestro exito
                Swal.fire("¡Solicitud enviada!", "", "success");
              })
              .catch(() =>
                Swal.fire(
                  "Error",
                  "No se pudo conectar con el servidor",
                  "error"
                )
              );
          }
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error al buscar usuarios",
        text: error.message,
      });
    }
  });
});
