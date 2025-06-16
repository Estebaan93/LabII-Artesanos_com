document.addEventListener('DOMContentLoaded', () => {
  const visibilidad = document.getElementById('visibilidad');
  const campoAmigos = document.getElementById('amigos-personalizados');
  const formSubir = document.getElementById('form-subir');

  // Validar que haya archivo o URL antes de enviar
  formSubir.addEventListener('submit', (e) => {
    const inputArchivo = document.getElementById('imagen_local');
    const inputUrl = document.getElementById('imagen_url');
    
    if (!inputArchivo.files.length && !inputUrl.value.trim()) {
      e.preventDefault();
      Swal.fire('Debe subir un archivo o ingresar una URL.');
    }
  });

  visibilidad.addEventListener('change', async () => {
    if (visibilidad.value === 'personalizada') {
      try {
        const res = await fetch('/amigos');
        const amigos = await res.json();

        if (!amigos || amigos.length === 0) {
          Swal.fire('No tenés amigos aún para personalizar la visibilidad.');
          visibilidad.value = 'personal'; // vuelve a "Solo yo"
          return;
        }

        const opciones = {};
        amigos.forEach(amigo => {
          opciones[amigo.id_usuario] = amigo.nombre + ' ' + amigo.apellido;
        });

        const { value: seleccionados } = await Swal.fire({
          title: 'Seleccioná amigos',
          input: 'checkbox',
          inputOptions: opciones,
          inputPlaceholder: 'Seleccioná uno o más amigos',
          confirmButtonText: 'Aceptar',
          inputValidator: (value) => {
            if (!value.length) {
              return '¡Tenés que seleccionar al menos uno!';
            }
            return null;
          }
        });

        if (seleccionados) {
          campoAmigos.value = JSON.stringify(seleccionados);
        } else {
          campoAmigos.value = '';
        }

      } catch (error) {
        console.error('Error al obtener amigos:', error);
        Swal.fire('Aún no tienes amistades disponibles.');
      }
    } else {
      campoAmigos.value = '';
    }
  });

  document.querySelector('.cerrar').addEventListener('click', () => {
    document.querySelector('.div-fondo').style.display = 'none';
  });
});
