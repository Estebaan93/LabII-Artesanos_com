// public/js/eliminarImagen.js

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.eliminar-imagen-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      Swal.fire({
        title: '¿Seguro que deseas eliminar esta imagen?',
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
  });
});
