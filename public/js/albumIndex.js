// public/js/albumIndex.js

document.addEventListener('DOMContentLoaded', () => {
  // Función para eliminar álbum vía fetch (DELETE)
  const eliminarAlbum = async (idAlbum, cardElement) => {
    if (!confirm('¿Estás seguro de eliminar este álbum? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`/albumes/${idAlbum}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        alert('Álbum eliminado');
        cardElement.remove();
      } else {
        alert('Error al eliminar el álbum');
      }
    } catch (error) {
      alert('Error de red al eliminar el álbum');
    }
  };

  // Agregar botón eliminar a cada tarjeta y evento click
  document.querySelectorAll('.album-card').forEach(card => {
    const idAlbum = card.querySelector('a').getAttribute('href').split('/').pop();

    // Crear botón eliminar
    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.style.marginTop = '8px';
    btnEliminar.style.backgroundColor = '#dc3545';
    btnEliminar.style.color = 'white';
    btnEliminar.style.border = 'none';
    btnEliminar.style.padding = '6px 12px';
    btnEliminar.style.borderRadius = '4px';
    btnEliminar.style.cursor = 'pointer';

    btnEliminar.addEventListener('click', (e) => {
      e.preventDefault();
      eliminarAlbum(idAlbum, card);
    });

    card.appendChild(btnEliminar);
  });

  // Filtro por título
  const inputFiltro = document.createElement('input');
inputFiltro.type = 'text';
inputFiltro.placeholder = 'Filtrar álbumes por título...';
inputFiltro.classList.add('filtro-album');


  const albumsGrid = document.querySelector('.albums-grid');
  albumsGrid.parentNode.insertBefore(inputFiltro, albumsGrid);

  inputFiltro.addEventListener('input', () => {
    const textoFiltro = inputFiltro.value.toLowerCase();
    document.querySelectorAll('.album-card').forEach(card => {
      const titulo = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = titulo.includes(textoFiltro) ? '' : 'none';
    });
  });
});


document.querySelector('.cerrar').addEventListener('click', () => {
  document.querySelector('.div-fondo').style.display = 'none';
});
