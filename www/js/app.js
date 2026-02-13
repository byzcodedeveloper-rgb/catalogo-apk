// ==============================
// Catálogo de productos

// Función para renderizar productos
function renderProductos(productos) {
  var grid = $("#lista-productos");
  grid.empty();

  $.each(productos, function(i, producto) {
    var card = $(
      '<div class="producto-card">' +
        '<img src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
        '<h3>' + producto.nombre + '</h3>' +
        '<p>Código: ' + producto.codigo + '</p>' +
        '<a href="#detalle" class="btn-detalle" ' +
        'data-role="button" data-theme="a" ' +   // 👈 fuerza tu tema azul
        'data-id="' + producto.codigo + '">Ver detalles</a>' +
      '</div>'
    );
    grid.append(card);
  });

  // Refresca estilos para que jQuery Mobile aplique el tema
  grid.trigger("create");
}



var PRODUCTOS = [];

// Inicialización catálogo
$(document).on("pageinit", "#catalogo", function() {
  $.getJSON("data/productos.json", function(productos) {
    PRODUCTOS = productos;
    renderProductos(PRODUCTOS);
  });

  // 🔎 Buscador universal
  $("#search-input").on("input", function() {
    var q = $(this).val().toLowerCase().trim();
    var filtrados = PRODUCTOS.filter(p =>
      Object.values(p).some(val =>
        String(val).toLowerCase().includes(q)
      )
    );
    renderProductos(filtrados);
  });

  // 📂 Filtro por categoría
  $(document).on("click", ".cat-option", function(e) {
    e.preventDefault();
    var categoria = $(this).data("cat").toLowerCase();
    var filtrados = PRODUCTOS.filter(p =>
      String(p.categoria || "").toLowerCase().includes(categoria)
    );
    renderProductos(filtrados);
    $("#panel-categorias").panel("close"); // cerrar panel al seleccionar
  });
});

// ==============================
// Evento para el botón "Ver detalles"
$(document).on("click", ".btn-detalle", function(e) {
  e.preventDefault();
  var codigo = $(this).data("id");

  $.getJSON("data/productos.json", function(productos) {
    var producto = productos.find(p => p.codigo === codigo);
    var detalle = $("#detalle-contenido");

    detalle.html(
      '<div style="text-align:center;">' +
        '<img id="producto-img" src="' + producto.imagen + '" style="width:100%; max-width:300px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-bottom:15px; cursor:pointer;">' +
        '<h2 style="color:#2c3e50; margin-bottom:10px;">' + producto.nombre + '</h2>' +
        '<p><b>Código:</b> ' + producto.codigo + '</p>' +
         '<div style="display:flex; justify-content:center; gap:15px; margin:15px 0;">' +
           '<div style="background:#ecf0f1; padding:10px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.2); min-width:70px;">' +
             '<p style="margin:0; font-weight:bold; color:#2c3e50;">W</p>' +
             '<p style="margin:0; color:#27ae60;">' + producto.W + '</p>' +
           '</div>' +
           '<div style="background:#ecf0f1; padding:10px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.2); min-width:70px;">' +
             '<p style="margin:0; font-weight:bold; color:#2c3e50;">H</p>' +
             '<p style="margin:0; color:#27ae60;">' + producto.H + '</p>' +
           '</div>' +
           '<div style="background:#ecf0f1; padding:10px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.2); min-width:70px;">' +
             '<p style="margin:0; font-weight:bold; color:#2c3e50;">L</p>' +
             '<p style="margin:0; color:#27ae60;">' + producto.L + '</p>' +
           '</div>' +
         '</div>' +
        '<p style="color:#27ae60; font-weight:bold;"><b>Precio:</b> ' + producto.precio + '</p>' +
        '<a href="#" id="btn-demo" class="ui-btn ui-corner-all ui-shadow" ' +
        'style="background:#3498db; color:white; font-weight:bold; margin-top:15px;">Ver demo</a>' +
      '</div>' +
      '<div id="img-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">' +
        '<img src="' + producto.imagen + '" style="max-width:90%; max-height:90%; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.5);">' +
      '</div>' +
      '<div id="video-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">' +
        '<video id="video-player" controls style="max-width:90%; max-height:90%; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.5); background:#000;">' +
          '<source src="video/video' + producto.codigo + '.mp4" type="video/mp4">' +
          'Tu navegador no soporta video.' +
        '</video>' +
      '</div>'
    );

    $("#btn-demo").off("click").on("click", function(e) {
      e.preventDefault();
      $("#video-modal").css("display", "flex");
      document.getElementById("video-player").play();
    });

    $("#video-modal").off("click").on("click", function(e) {
      if (e.target.id === "video-modal") {
        document.getElementById("video-player").pause();
        $(this).hide();
      }
    });

    $("#producto-img").off("click").on("click", function() {
      $("#img-modal").css("display", "flex");
    });

    $("#img-modal").off("click").on("click", function() {
      $(this).hide();
    });

    $.mobile.changePage("#detalle");
  });
});
