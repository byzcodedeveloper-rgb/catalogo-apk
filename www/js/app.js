// ==============================
// Catálogo de productos
// ==============================
$(document).on("pageinit", "#catalogo", function() {
  $.getJSON("data/productos.json", function(productos) {
    var lista = $("#lista-productos");
    $.each(productos, function(i, producto) {
      lista.append(
        '<li><a href="#detalle" data-id="' + producto.codigo + '">' +
        '<img src="' + producto.imagen + '">' +
        '<h2>' + producto.nombre + '</h2>' +
        '<p>Código: ' + producto.codigo + '</p>' +
        '</a></li>'
      );
    });
    lista.listview("refresh");
  });
});

// ==============================
// Vista de detalle con rotación táctil
// ==============================
$(document).on("click", "#lista-productos li a", function() {
  var codigo = $(this).data("id");
  $.getJSON("data/productos.json", function(productos) {
    var producto = productos.find(p => p.codigo === codigo);
    var detalle = $("#detalle-contenido");

    // Renderizamos la imagen con ID para manipularla
    detalle.html(
      '<img id="producto-img" src="' + producto.imagen + '" style="width:100%; max-width:300px; display:block; margin:auto; transform-style:preserve-3d;">' +
      '<h2>' + producto.nombre + '</h2>' +
      '<p><b>Código:</b> ' + producto.codigo + '</p>' +
      '<p><b>W:</b> ' + producto.W + '</p>' +
      '<p><b>H:</b> ' + producto.H + '</p>' +
      '<p><b>L:</b> ' + producto.L + '</p>' +
      '<p><b>Precio:</b> ' + producto.precio + '</p>'
    );

    // ==============================
    // Rotación manual con el dedo
    // ==============================
    const img = document.getElementById("producto-img");
    let startX = 0;
    let currentRotation = 0;

    img.addEventListener("touchstart", function(e) {
      startX = e.touches[0].clientX;
    });

    img.addEventListener("touchmove", function(e) {
      let deltaX = e.touches[0].clientX - startX;
      img.style.transform = `rotateY(${currentRotation + deltaX}deg)`;
    });

    img.addEventListener("touchend", function(e) {
      let deltaX = e.changedTouches[0].clientX - startX;
      currentRotation += deltaX;
    });
  });
});


