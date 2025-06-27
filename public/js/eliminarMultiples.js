// public/js/eliminarMultiples.js
//NO SE ESTA USANDO
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-multieliminar');
  const btn = document.getElementById('btn-multieliminar');
  if (form && btn) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const checkboxes = form.querySelectorAll('.elim-multi-checkbox:checked');
      if (checkboxes.length === 0) {
        Swal.fire('Nada seleccionado', 'Por favor selecciona al menos una imagen.', 'info');
        return;
      }
      Swal.fire({
        title: '¿Seguro que deseas eliminar las imágenes seleccionadas?',
        text: '¡Esta acción no se puede deshacer!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          form.submit();
        }
      });
    });
  }
});
