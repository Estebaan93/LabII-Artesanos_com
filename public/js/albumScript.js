//public/js/albumScript.js
function traducirVisibilidad(vis) {
  switch (vis) {
    case 'personal': return 'Solo yo';
    case 'amigos': return 'Amigos';
    case 'mejores_amigos': return 'Mejores amigos';
    case 'publico': return 'Público';
    case 'personalizada': return 'Personalizada';
    default: return vis;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modal-obra');
  const cerrar = document.getElementById('cerrar-modal');
  const modalImg = document.getElementById('modal-imagen');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalVisibilidad = document.getElementById('modal-visibilidad');
  const modalComentarios = document.getElementById('modal-comentarios');

  // Asignar evento click a todas las miniaturas para abrir modal y cargar comentarios
  document.querySelectorAll('.obra-miniatura').forEach(img => {
    img.addEventListener('click', async function() {
      modalImg.src = img.src;
      modalTitulo.textContent = img.dataset.titulo;
      modalVisibilidad.textContent = "Visibilidad: " + traducirVisibilidad(img.dataset.visibilidad);

      modalComentarios.innerHTML = 'Cargando comentarios...';
      try {
        const res = await fetch(`/obras/${img.dataset.id}/comentarios`);
        const data = await res.json();
        if (data.length > 0) {
          modalComentarios.innerHTML = '<h4>Comentarios</h4>';
          data.forEach(c => {
            modalComentarios.innerHTML += `<p><b>${c.usuario}:</b> ${c.descripcion}</p>`;
          });
        } else {
          modalComentarios.innerHTML = '<p>Sin comentarios aún.</p>';
        }
      } catch {
        modalComentarios.innerHTML = '<p>No se pudieron cargar los comentarios.</p>';
      }

      modal.style.display = 'flex';
    });
  });

  cerrar.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // NUEVO: Manejar envío de comentarios desde cada formulario
  document.querySelectorAll('form.form-comentario').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id_imagen = form.dataset.id;
      const textarea = form.querySelector('textarea[name="descripcion"]');
      const descripcion = textarea.value.trim();
      if (!descripcion) return alert('El comentario no puede estar vacío');

      try {
        const res = await fetch(`/obras/${id_imagen}/comentarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ descripcion })
        });
        const data = await res.json();
        if (data.ok) {
          // Limpiar textarea
          textarea.value = '';

          // Actualizo lista
          const contenedorComentarios = document.querySelector(`div.comentarios[data-id="${id_imagen}"]`);
          // Recargar comentarios del servidor
          const resComentarios = await fetch(`/obras/${id_imagen}/comentarios`);
          const comentarios = await resComentarios.json();

          if (comentarios.length > 0) {
            let html = '<h4>Comentarios</h4>';
            comentarios.forEach(c => {
              html += `<p><b>${c.usuario}:</b> ${c.descripcion}</p>`;
            });
            contenedorComentarios.innerHTML = html;
          } else {
            contenedorComentarios.innerHTML = '<p>Sin comentarios aún.</p>';
          }
        } else {
          alert('No se pudo agregar el comentario');
        }
      } catch {
        alert('Error al enviar el comentario');
      }
    });
  });

});
