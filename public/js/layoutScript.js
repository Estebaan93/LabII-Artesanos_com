//public/js/layoutScript.js

document.addEventListener("DOMContentLoaded", () => {
  const modalLogin = document.getElementById("modal-login");
  const modalRegister = document.getElementById("modal-registrarse");
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");
  const btnCloseLogin = document.getElementById("btn-close");
  const btnCloseRegister = document.getElementById("btn-close-reg");
  const overlay = document.getElementById("overlay");

  const loginForm = modalLogin ? modalLogin.querySelector("form") : null;
  const registerForm = document.getElementById("form-registro");

  // Abrir modal login + mostrar overlay
  btnLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    modalLogin.style.display = "block";
    overlay.style.display = "block";
  });

  // Cerrar modal login + ocultar overlay
  btnCloseLogin?.addEventListener("click", () => {
    modalLogin.style.display = "none";
    overlay.style.display = "none";
  });

  // Abrir modal registro + mostrar overlay, ocultar login
  btnRegister?.addEventListener("click", () => {
    modalLogin.style.display = "none";
    modalRegister.style.display = "block";
    overlay.style.display = "block";
  });

  // Cerrar modal registro + ocultar overlay
  btnCloseRegister?.addEventListener("click", () => {
    modalRegister.style.display = "none";
    overlay.style.display = "none";
  });

  // Cerrar modales si clickeas sobre el overlay
  overlay?.addEventListener("click", () => {
    if (modalLogin) modalLogin.style.display = "none";
    if (modalRegister) modalRegister.style.display = "none";
    overlay.style.display = "none";
  });

  // -------- LOGIN AJAX --------
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const payload = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          await Swal.fire({
            icon: "success",
            title: "Bienvenido",
            text: "Sesión iniciada correctamente",
            timer: 1500,
            showConfirmButton: false,
          });
          window.location.href = "/home";
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al iniciar sesión",
            text: data.error || "Usuario o contraseña incorrectos",
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          text: "No se pudo conectar con el servidor",
        });
      }
    });
  }

 // -------- REGISTRO AJAX CON SWEETALERT --------
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);

    try {
      const response = await fetch("/logueado", {
        method: "POST",
        body: formData, // No agregues headers, el navegador los agrega automáticamente
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Usuario registrado",
            text: "¡Tu cuenta ha sido creada correctamente!",
            timer: 1500,
            showConfirmButton: false,
          });
          window.location.href = "/home";
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al registrarse",
            text: data.error || "Datos inválidos o usuario ya existente",
          });
        }
      } catch (e) {
        console.error("La respuesta no fue JSON válida:", text);
        Swal.fire({
          icon: "error",
          title: "Error inesperado",
          text: "El servidor respondió con un formato inesperado",
        });
      }

    } catch (error) {
      console.error("Error al registrar:", error);
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "No se pudo enviar el formulario",
      });
    }
  });
}


  // -------- PROTECCIÓN DE RUTAS CON JWT --------
  const token = localStorage.getItem("token");
  if (token) {
    fetch("/home", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          alert("Sesión expirada, inicia sesión nuevamente.");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      })
      .catch((err) => console.error("Error de autenticación:", err));
  }

  // -------- LOGOUT con confirmación --------
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      const result = await Swal.fire({
        title: "¿Cerrar sesión?",
        text: "¿Estás seguro de que deseas cerrar la sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar",
        cancelButtonText: "Cancelar",
      });
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        await Swal.fire({
          icon: "success",
          title: "Sesión cerrada",
          showConfirmButton: false,
          timer: 1200,
        });
        window.location.href = "/logout";
      }
    });
  } else {
    console.warn("Botón logout no encontrado en el DOM");
  }
});
