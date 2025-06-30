// public/js/notificaciones.js

////notificaciones.js
console.log("Activo notificaciones");
document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const usuarioId = window.usuarioId;

  const contadorElem = document.getElementById("contador-notificaciones");
  const panel = document.getElementById("panel-notificaciones");
  const lista = document.getElementById("lista-notificaciones");
  const icono = document.getElementById("icono-notificacion");

  if (!icono || !panel || !lista || !contadorElem) {
    console.warn("Elementos de notificaciones no encontrados en el DOM");
    return;
  }

  if (usuarioId) {
    socket.emit("register", usuarioId);

    socket.on("nuevaNotificacion", (data) => {
      agregarNotificacionAlPanel(data);
      actualizarContador(1);
    });

    fetch("/notificaciones/api")
      .then((res) => res.json())
      .then((data) => {
        console.log('Esto es data:', data);
        limpiarNotificaciones();

        if (Array.isArray(data)) {
          if (data.length === 0) {
            mostrarMensajeSinNotificaciones();
          } else {
            data.forEach((n) => agregarNotificacionAlPanel(n));
            actualizarContador(data.length);
          }
        } else {
          console.error("La respuesta no es un arreglo:", data);
          mostrarMensajeSinNotificaciones();
        }
      })
      .catch((err) => console.error("Error al cargar notificaciones:", err));
  } else {
    console.warn("No se encontró usuarioId para registrar en socket");
  }

  icono.addEventListener("click", () => {
    if (panel.style.display === "none" || panel.style.display === "") {
      panel.style.display = "block";
      actualizarContador(0);
    } else {
      panel.style.display = "none";
    }
  });

  function agregarNotificacionAlPanel(notif) {
    const li = document.createElement("li");

    if (notif.tipo === "amistad") {
      li.innerHTML = `
      <span>Solicitud de amistad de <strong>${notif.remitente}</strong></span><br>
      <button class="btn-aceptar">Aceptar</button>
      <button class="btn-rechazar">Rechazar</button>
    `;
      li.querySelector(".btn-aceptar").addEventListener("click", () => {
        responderSolicitud(notif.remitente_id, notif.ref_id, "aceptar", li);
      });
      li.querySelector(".btn-rechazar").addEventListener("click", () => {
        responderSolicitud(notif.remitente_id, notif.ref_id, "rechazar", li);
      });
    } else if (notif.tipo === "aceptacion") {
      li.innerHTML = `
      <span><strong>${notif.remitente}</strong> aceptó tu solicitud de amistad.</span>
      <button class="btn-leer">Marcar como leída</button>
    `;
      li.querySelector(".btn-leer").addEventListener("click", () => {
        marcarComoLeida(notif.id_notificacion, li);
      });
    } else {
   
      li.textContent = notif.mensaje || "Notificación";
    }

    // Agregar al panel
    lista.prepend(li);
    if (lista.children.length > 20) {
      lista.removeChild(lista.lastChild);
    }
  }

  function responderSolicitud(
    id_usuario_remitente,
    id_solicitud,
    accion,
    elementoLi
  ) {
    fetch("/solicitudes/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_solicitud, accion }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          Swal.fire("Listo", data.mensaje, "success");
          elementoLi.remove();
          actualizarContador(-1);
        } else {
          Swal.fire(
            "Error",
            data.error || "No se pudo procesar la solicitud",
            "error"
          );
        }
      })
      .catch(() =>
        Swal.fire("Error", "Fallo al conectar con el servidor", "error")
      );
  }

  function marcarComoLeida(id_notificacion, elementoLi) {
    fetch(`/notificaciones/${id_notificacion}/leida`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          Swal.fire("Listo", "Notificación marcada como leída", "success");
          elementoLi.remove();
          actualizarContador(-1);
        } else {
          Swal.fire("Error", "No se pudo marcar como leída", "error");
        }
      })
      .catch(() =>
        Swal.fire("Error", "Fallo al conectar con el servidor", "error")
      );
  }

  function actualizarContador(n) {
    let actual = parseInt(contadorElem.textContent) || 0;
    actual += n;
    if (actual > 0) {
      contadorElem.style.display = "inline-block";
      contadorElem.textContent = actual;
    } else {
      contadorElem.style.display = "none";
      contadorElem.textContent = "0";
    }
  }

  function limpiarNotificaciones() {
    while (lista.firstChild) lista.removeChild(lista.firstChild);
  }

  function mostrarMensajeSinNotificaciones() {
    limpiarNotificaciones();
    const li = document.createElement("li");
    li.textContent = "No tienes notificaciones nuevas.";
    lista.appendChild(li);
  }
});

