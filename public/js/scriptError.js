//public/js/scriptError.js
document.addEventListener('DOMContentLoaded', function() {
  Swal.fire({
    icon: 'error',
    title: 'Límite alcanzado',
    text: 'El álbum no puede contener más de 20 imágenes!',
    confirmButtonText: 'Volver'
  }).then(() => {
    window.location.href = '/albumes/' + window.id_album;
  });
});
