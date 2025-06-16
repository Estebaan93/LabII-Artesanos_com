document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-imagen');
  const cerrarModal = document.getElementById('cerrar-modal');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalUsuario = document.getElementById('modal-usuario');

  document.querySelectorAll('.imagen-clickable').forEach(img => {
    img.addEventListener('click', () => {
      modalTitulo.textContent = img.dataset.titulo || 'Sin título';
      modalUsuario.textContent = `Usuario: ${img.dataset.usuario || 'Desconocido'}`;
      modal.style.display = 'flex';
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
