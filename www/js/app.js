// ==============================
// Catálogo de productos
// ==============================
$(document).on("pageinit", "#catalogo", function() {
  $.getJSON("data/productos.json", function(productos) {
    var grid = $("#lista-productos");
    grid.empty(); // limpiamos antes

    $.each(productos, function(i, producto) {
      grid.append(
        '<div class="producto-card" data-id="' + producto.codigo + '">' +
          '<img src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
          '<h3>' + producto.nombre + '</h3>' +
          '<p>Código: ' + producto.codigo + '</p>' +
        '</div>'
      );
    });
  });
});

// Al hacer clic en una tarjeta, mostramos detalle
$(document).on("click", ".producto-card", function() {
  var codigo = $(this).data("id");
  $.getJSON("data/productos.json", function(productos) {
    var producto = productos.find(p => p.codigo === codigo);
    var detalle = $("#detalle-contenido");
    detalle.html(
      '<div style="text-align:center;">' +
        '<img src="' + producto.imagen + '" style="width:100%; max-width:300px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-bottom:15px;">' +
        '<h2 style="color:#2c3e50; margin-bottom:10px;">' + producto.nombre + '</h2>' +
        '<p><b>Código:</b> ' + producto.codigo + '</p>' +
        '<p><b>W:</b> ' + producto.W + '</p>' +
        '<p><b>H:</b> ' + producto.H + '</p>' +
        '<p><b>L:</b> ' + producto.L + '</p>' +
        '<p style="color:#27ae60; font-weight:bold;"><b>Precio:</b> ' + producto.precio + '</p>' +
        '<a href="#" id="btn-demo" class="ui-btn ui-corner-all ui-shadow" ' +
        'style="background:#3498db; color:white; font-weight:bold; margin-top:15px;">Ver demo</a>' +
      '</div>'
    );

    // Acción del botón demo
    $("#btn-demo").off("click").on("click", function(e) {
      e.preventDefault();
      alert("Video promocional");
    });
  });
});





