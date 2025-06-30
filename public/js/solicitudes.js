// public/js/solicitudes.js
document.addEventListener("DOMContentLoaded", () => {
  const inputNombre = document.getElementById("inputNombre");

  // Mostrar todos los usuarios al hacer clic en el input
  inputNombre.addEventListener("focus", async () => {
    inputNombre.blur(); // evita que se vuelva a abrir el modal al cerrar

    try {
      const response = await fetch(`/api/usuarios/buscar?nombre=`);
      const usuarios = await response.json();

      if (!usuarios.length) return;

      mostrarModalUsuarios(usuarios);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  });

  function mostrarModalUsuarios(usuarios) {
    Swal.fire({
      title: "Buscar y agregar amigos",
      html: `
        <input id="filtroUsuarios" class="swal2-input" placeholder="Escribí un nombre...">
        <div id="contenedorUsuarios" style="text-align:left; max-height:300px; overflow:auto;">
          ${usuarios.map(usuarioCard).join("")}
        </div>
      `,
      showConfirmButton: false,
      width: 600,
      allowOutsideClick: true,
      allowEscapeKey: true,
      scrollbarPadding: false,
      didOpen: () => {
        const inputFiltro = document.getElementById("filtroUsuarios");
        const contenedor = document.getElementById("contenedorUsuarios");

        inputFiltro.focus();

        inputFiltro.addEventListener("input", () => {
          const valor = inputFiltro.value.toLowerCase();
          const filtrados = usuarios.filter(
            u =>
              u.nombre.toLowerCase().includes(valor) ||
              u.apellido.toLowerCase().includes(valor)
          );
          contenedor.innerHTML = filtrados.length
            ? filtrados.map(usuarioCard).join("")
            : "<p>No hay coincidencias</p>";

          asignarEventosAgregar();
        });

        asignarEventosAgregar();
      }
    });
  }

  function usuarioCard(u) {
    return `
      <div class="usuario-card" style="display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid #ccc;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="/img/perfiles/${u.avatarUrl || 'default.png'}" width="40" height="40" style="border-radius:50%;">
          <div>
            <strong>${u.nombre} ${u.apellido}</strong><br>
            <small>${u.email}</small>
          </div>
        </div>
        <button class="btn-agregar" data-id="${u.id_usuario}" data-nombre="${u.nombre}" style="padding:5px 10px;">Agregar</button>
      </div>
    `;
  }

  function asignarEventosAgregar() {
    document.querySelectorAll(".btn-agregar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const nombre = btn.getAttribute("data-nombre");

        Swal.fire({
          title: `¿Agregar a ${nombre} como amigo?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, agregar",
          cancelButtonText: "Cancelar",
        }).then((r) => {
          if (r.isConfirmed) {
            fetch("/solicitudes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_destinatario: id }),
            })
              .then(async (res) => {
                const contentType = res.headers.get("content-type") || "";
                if (!res.ok || !contentType.includes("application/json")) {
                  const errorText = await res.text();
                  throw new Error(errorText || "Respuesta inesperada del servidor");
                }

                const data = await res.json();
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
      });
    });
  }
});
