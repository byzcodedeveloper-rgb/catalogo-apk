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

$(document).on("click", "#lista-productos li a", function() {
  var codigo = $(this).data("id");
  $.getJSON("data/productos.json", function(productos) {
    var producto = productos.find(p => p.codigo === codigo);
    var detalle = $("#detalle-contenido");
    detalle.html(
      '<img src="' + producto.imagen + '" style="width:100%;">' +
      '<h2>' + producto.nombre + '</h2>' +
      '<p><b>Código:</b> ' + producto.codigo + '</p>' +
      '<p><b>W:</b> ' + producto.W + '</p>' +
      '<p><b>H:</b> ' + producto.H + '</p>' +
      '<p><b>L:</b> ' + producto.L + '</p>' +
      '<p><b>Precio:</b> ' + producto.precio + '</p>'
    );
  });
});

