// ==============================
// Catálogo de productos
// ==============================
$(document).on("pageinit", "#catalogo", function() {
  $.getJSON("data/productos.json", function(productos) {
    var lista = $("#lista-productos");
    $.each(productos, function(i, producto) {
      lista.append(
        '<li style="border-bottom:1px solid #ddd; padding:10px;">' +
          '<a href="#detalle" data-id="' + producto.codigo + '" style="display:flex; align-items:center;">' +
            '<img src="' + producto.imagen + '" style="width:80px; height:80px; object-fit:cover; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.2); margin-right:10px;">' +
            '<div>' +
              '<h2 style="margin:0; font-size:18px; color:#333;">' + producto.nombre + '</h2>' +
              '<p style="margin:0; color:#666;">Código: ' + producto.codigo + '</p>' +
            '</div>' +
          '</a>' +
        '</li>'
      );
    });
    lista.listview("refresh");
  });
});

$(document).on("click", "#lista-productos li a", function() {
  var codigo = $(this).data("id");
  $.getJSON("data/productos.json", function(productos) {
    var producto = productos.find(p => p.codigo === codigo);
    var detalle = $("#detalle-contenido");
    detalle.html(
      '<div style="text-align:center;">' +
        '<img src="' + producto.imagen + '" style="width:100%; max-width:300px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-bottom:15px;">' +
        '<h2 style="color:#2c3e50; margin-bottom:10px;">' + producto.nombre + '</h2>' +
        '<p style="color:#555;"><b>Código:</b> ' + producto.codigo + '</p>' +
        '<p style="color:#555;"><b>W:</b> ' + producto.W + '</p>' +
        '<p style="color:#555;"><b>H:</b> ' + producto.H + '</p>' +
        '<p style="color:#555;"><b>L:</b> ' + producto.L + '</p>' +
        '<p style="color:#27ae60; font-weight:bold;"><b>Precio:</b> ' + producto.precio + '</p>' +
      '</div>'
    );
  });
});




