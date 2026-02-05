// ==============================
// Catálogo de productos
$(document).on("pageinit", "#catalogo", function() {
  $.getJSON("data/productos.json", function(productos) {
    var grid = $("#lista-productos");
    grid.empty();

    $.each(productos, function(i, producto) {
      grid.append(
        '<div class="producto-card">' +
          '<img src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
          '<h3>' + producto.nombre + '</h3>' +
          '<p>Código: ' + producto.codigo + '</p>' +
          '<a href="#detalle" class="btn-detalle ui-btn ui-corner-all ui-shadow" ' +
          'data-id="' + producto.codigo + '" ' +
          'style="background:#27ae60; color:white; font-weight:bold; margin-top:10px;">Ver detalles</a>' +
        '</div>'
      );
    });
  });
});

// Evento para el botón "Ver detalles"
$(document).on("click", ".btn-detalle", function(e) {
  e.preventDefault(); // evitamos comportamiento por defecto
  var codigo = $(this).data("id");

  $.getJSON("data/productos.json", function(productos) {
    var producto = productos.find(p => p.codigo === codigo);
    var detalle = $("#detalle-contenido");

    detalle.html(
      '<div style="text-align:center;">' +
        '<img id="producto-img" src="' + producto.imagen + '" style="width:100%; max-width:300px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-bottom:15px; cursor:pointer;">' +
        '<h2 style="color:#2c3e50; margin-bottom:10px;">' + producto.nombre + '</h2>' +
        '<p><b>Código:</b> ' + producto.codigo + '</p>' +
        '<p><b>W:</b> ' + producto.W + '</p>' +
        '<p><b>H:</b> ' + producto.H + '</p>' +
        '<p><b>L:</b> ' + producto.L + '</p>' +
        '<p style="color:#27ae60; font-weight:bold;"><b>Precio:</b> ' + producto.precio + '</p>' +
        '<a href="#" id="btn-demo" class="ui-btn ui-corner-all ui-shadow" ' +
        'style="background:#3498db; color:white; font-weight:bold; margin-top:15px;">Ver demo</a>' +
      '</div>' +
      // Modal imagen
      '<div id="img-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">' +
        '<img src="' + producto.imagen + '" style="max-width:90%; max-height:90%; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">' +
      '</div>' +
      // Modal video
      '<div id="video-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">' +
        '<video id="video-player" controls style="max-width:90%; max-height:90%; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.5); background:#000;">' +
          '<source src="https://www.mediafire.com/file/7qr9q2bn7t1hdti/video' + producto.codigo + '.mp4" type="video/mp4">' +
          'Tu navegador no soporta video.' +
        '</video>' +
      '</div>'
    );

    // Botón demo → abre video
    $("#btn-demo").off("click").on("click", function(e) {
      e.preventDefault();
      $("#video-modal").css("display", "flex");
      document.getElementById("video-player").play();
    });

    // Cerrar video
    $("#video-modal").off("click").on("click", function(e) {
      if (e.target.id === "video-modal") {
        document.getElementById("video-player").pause();
        $(this).hide();
      }
    });

    // Imagen ampliada
    $("#producto-img").off("click").on("click", function() {
      $("#img-modal").css("display", "flex");
    });

    // Cerrar imagen
    $("#img-modal").off("click").on("click", function() {
      $(this).hide();
    });

    // 🔑 Navegar a la página de detalle
    $.mobile.changePage("#detalle");
  });
});



