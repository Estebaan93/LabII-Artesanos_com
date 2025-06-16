document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedorFormaciones');
  const btnAgregar = document.getElementById('btnAgregarFormacion');

  btnAgregar.addEventListener('click', () => {
    const index = contenedor.children.length;
    const div = document.createElement('div');
    div.classList.add('formacion-item');
    div.setAttribute('data-index', index);

    div.innerHTML = `
      <label for="formaciones[${index}][tipo]">Formación:</label>
      <select name="formaciones[${index}][tipo]" required>
        <option value="">-- Seleccione una formación --</option>
        ${opcionesFormacion.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
      </select>

      <label for="formaciones[${index}][fecha]">Fecha:</label>
      <input type="date" name="formaciones[${index}][fecha]" required />

      <label for="formaciones[${index}][institucion]">Institución:</label>
      <input type="text" name="formaciones[${index}][institucion]" required />

      <label for="formaciones[${index}][descripcion]">Descripción:</label>
      <textarea name="formaciones[${index}][descripcion]"></textarea>

      <button type="button" class="btn-eliminar-formacion">Eliminar</button>
    `;

    contenedor.appendChild(div);
    agregarEventoEliminar(div.querySelector('.btn-eliminar-formacion'));
  });

  function agregarEventoEliminar(boton) {
    boton.addEventListener('click', () => {
      const formacionItem = boton.closest('.formacion-item');
      formacionItem.remove();
    });
  }

  document.querySelectorAll('.btn-eliminar-formacion').forEach(boton => {
    agregarEventoEliminar(boton);
  });
});
