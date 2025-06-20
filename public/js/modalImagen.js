//public/js/modalImagen.js

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-imagen');
  const cerrarModal = document.getElementById('cerrar-modal');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalUsuario = document.getElementById('modal-usuario');
  const modalComentario= document.getElementById('modal-comentarios');

  document.querySelectorAll('.imagen-clickable').forEach(img => {
    img.addEventListener('click', async () => {
      modalTitulo.textContent = img.dataset.titulo || 'Sin título';
      modalUsuario.textContent = `Usuario: ${img.dataset.usuario || 'Desconocido'}`;
      modal.style.display = 'flex';

      //Limpiar comentarios previos
      modalComentario.innerHTML="<li>Cargando comentarios..</li>"

      //Obtemer el id_imagen
      const idImagen= img.dataset.id; // asegurate que data-id esté en el HTML  
      
      if(!idImagen){
        modalComentario.innerHTML= "<li>No se encontró la imagen.</li>";
        return;
      }

            // Traer comentarios por AJAX
      try {
        const res = await fetch(`/obras/${idImagen}/comentarios`);
        if (res.ok) {
          const comentarios = await res.json();
          if (comentarios.length === 0) {
            modalComentarios.innerHTML = "<li>No hay comentarios aún.</li>";
          } else {
            modalComentarios.innerHTML = comentarios.map(c =>
              `<li><strong>${c.usuario}:</strong> ${c.descripcion}</li>`
            ).join('');
          }
        } else {
          modalComentarios.innerHTML = "<li>No se pudieron cargar los comentarios.</li>";
        }
      } catch (err) {
        modalComentarios.innerHTML = "<li>Error al cargar comentarios.</li>";
      }


    });
  });

  cerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});
