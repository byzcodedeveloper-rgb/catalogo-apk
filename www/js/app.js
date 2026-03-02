// ==============================
// Catálogo de productos con CRUD, localStorage y selección de imágenes (base64)

var PRODUCTOS = [];

// Cargar productos desde localStorage o desde JSON
function cargarProductos() {
  var stored = localStorage.getItem("catalogoProductos");
  if (stored) {
    PRODUCTOS = JSON.parse(stored);
    renderProductos(PRODUCTOS);
  } else {
    $.getJSON("data/productos.json", function(productos) {
      PRODUCTOS = productos; // las imágenes vienen como rutas (img/*.jpg)
      guardarProductos(PRODUCTOS);
      renderProductos(PRODUCTOS);
    });
  }
}

// Guardar productos en localStorage y actualizar variable global
function guardarProductos(productos) {
  PRODUCTOS = productos;
  localStorage.setItem("catalogoProductos", JSON.stringify(productos));
}

// Renderizar productos
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
        'data-role="button" data-theme="a" ' +
        'data-id="' + producto.codigo + '">Ver detalles</a>' +
      '</div>'
    );
    grid.append(card);
  });
  grid.trigger("create");
}

// Inicialización de la página catálogo
$(document).on("pageinit", "#catalogo", function() {
  cargarProductos();

  $("#search-input").on("input", function() {
    var q = $(this).val().toLowerCase().trim();
    var filtrados = PRODUCTOS.filter(p =>
      Object.values(p).some(val => String(val).toLowerCase().includes(q))
    );
    renderProductos(filtrados);
  });

  $(document).on("click", ".cat-option", function(e) {
    e.preventDefault();
    var categoria = $(this).data("cat").toLowerCase();
    var filtrados;
    if (categoria === 'otros' || categoria === 'todos') {
      filtrados = PRODUCTOS.slice();
    } else {
      filtrados = PRODUCTOS.filter(p => {
        var catProducto = (p.categoria || "").toString().toLowerCase().trim();
        return catProducto.includes(categoria);
      });
    }
    renderProductos(filtrados);
    $("#panel-categorias").panel("close");
  });
});

// ==============================
// Detalle del producto
$(document).on("click", ".btn-detalle", function(e) {
  e.preventDefault();
  var codigo = $(this).data("id");
  var producto = PRODUCTOS.find(p => p.codigo === codigo);
  if (!producto) return;

  var detalle = $("#detalle-contenido");
  detalle.html(
    '<div style="text-align:center;">' +
      '<img id="producto-img" src="' + producto.imagen + '" style="width:100%; max-width:300px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-bottom:15px; cursor:pointer;">' +
      '<h2 style="color:#2c3e50; margin-bottom:10px;">' + producto.nombre + '</h2>' +
      '<p><b>Código:</b> ' + producto.codigo + '</p>' +
      '<div style="display:flex; justify-content:center; gap:15px; margin:15px 0;">' +
        '<div style="background:#ecf0f1; padding:10px; border-radius:8px; min-width:70px;">' +
          '<p style="margin:0; font-weight:bold; color:#2c3e50;">W</p>' +
          '<p style="margin:0; color:#27ae60;">' + producto.W + '</p>' +
        '</div>' +
        '<div style="background:#ecf0f1; padding:10px; border-radius:8px; min-width:70px;">' +
          '<p style="margin:0; font-weight:bold; color:#2c3e50;">L</p>' +
          '<p style="margin:0; color:#27ae60;">' + producto.L + '</p>' +
        '</div>' +
        '<div style="background:#ecf0f1; padding:10px; border-radius:8px; min-width:70px;">' +
          '<p style="margin:0; font-weight:bold; color:#2c3e50;">H</p>' +
          '<p style="margin:0; color:#27ae60;">' + producto.H + '</p>' +
        '</div>' +
      '</div>' +
      '<p style="color:#27ae60; font-weight:bold;"><b>Precio:</b> ' + producto.precio + '</p>' +
      '<div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">' +
        '<a href="#form-producto" class="ui-btn ui-corner-all ui-shadow ui-btn-a" id="btn-editar" data-id="' + producto.codigo + '" style="background:#3498db; color:white;">Editar</a>' +
        '<a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a" id="btn-eliminar" data-id="' + producto.codigo + '" style="background:#c0392b; color:white;">Eliminar</a>' +
      '</div>' +
      '<a href="#" id="btn-video" class="ui-btn ui-corner-all ui-shadow" style="background:#3498db; color:white; margin-top:10px;">Ver video</a>' +
      // Modales
      '<div id="img-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">' +
        '<img src="' + producto.imagen + '" style="max-width:90%; max-height:90%; border-radius:10px;">' +
      '</div>' +
      '<div id="video-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">' +
        '<video id="video-player" controls style="max-width:90%; max-height:90%; background:#000;">' +
          '<source src="video/video' + producto.codigo + '.mp4" type="video/mp4">' +
          'Tu navegador no soporta video.' +
        '</video>' +
      '</div>' +
    '</div>'
  );

  // Eventos para imagen y video
  $("#producto-img").off("click").on("click", function() {
    $("#img-modal").css("display", "flex");
  });
  $("#img-modal").off("click").on("click", function() {
    $(this).hide();
  });
  $("#btn-video").off("click").on("click", function(e) {
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

  $.mobile.changePage("#detalle");
});

// ==============================
// Eliminar producto
$(document).on("click", "#btn-eliminar", function(e) {
  e.preventDefault();
  var codigo = $(this).data("id");
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    PRODUCTOS = PRODUCTOS.filter(p => p.codigo !== codigo);
    guardarProductos(PRODUCTOS);
    $.mobile.changePage("#catalogo");
    renderProductos(PRODUCTOS);
  }
});

// ==============================
// Cargar formulario para editar (con imagen actual)
$(document).on("click", "#btn-editar", function(e) {
  e.preventDefault();
  var codigo = $(this).data("id");
  var producto = PRODUCTOS.find(p => p.codigo === codigo);
  if (producto) {
    $("#edit-codigo").val(producto.codigo);
    $("#codigo").val(producto.codigo);
    $("#nombre").val(producto.nombre);
    $("#categoria").val(producto.categoria);
    $("#W").val(producto.W);
    $("#L").val(producto.L);
    $("#H").val(producto.H);
    $("#precio").val(producto.precio);
    
    // Si la imagen es base64, mostrarla; si es ruta, también podemos mostrar la previsualización (si la ruta existe)
    if (producto.imagen) {
      $("#imagen-base64").val(producto.imagen);
      $("#preview-img").attr("src", producto.imagen).show();
    } else {
      $("#imagen-base64").val("");
      $("#preview-img").attr("src", "#").hide();
    }
  }
  $.mobile.changePage("#form-producto");
});

// ==============================
// Evento para cuando se selecciona un archivo de imagen
$(document).on("change", "#imagen", function(e) {
  var file = e.target.files[0];
  if (file) {
    // Limitar tamaño a 2MB para evitar problemas en localStorage
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 2MB.");
      $(this).val('');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(ev) {
      var base64 = ev.target.result;
      $("#imagen-base64").val(base64);
      $("#preview-img").attr("src", base64).show();
    };
    reader.readAsDataURL(file);
  }
});

// ==============================
// Guardar producto (nuevo o editado)
$(document).on("click", "#guardar-producto", function(e) {
  e.preventDefault();

  var codigoOriginal = $("#edit-codigo").val();
  var nuevoCodigo = $("#codigo").val().trim();
  var nombre = $("#nombre").val().trim();
  var categoria = $("#categoria").val();
  var W = $("#W").val().trim();
  var L = $("#L").val().trim();
  var H = $("#H").val().trim();
  var precio = $("#precio").val().trim();
  var imagenBase64 = $("#imagen-base64").val();

  // Validaciones básicas
  if (!nuevoCodigo || !nombre || !W || !L || !H || !precio) {
    alert("Por favor completa todos los campos.");
    return;
  }

  // Si es nuevo, debe tener imagen
  if (!codigoOriginal && !imagenBase64) {
    alert("Debes seleccionar una imagen.");
    return;
  }

  // Si es edición y no se seleccionó nueva imagen, conservar la anterior
  if (codigoOriginal && !imagenBase64) {
    var original = PRODUCTOS.find(p => p.codigo === codigoOriginal);
    if (original) {
      imagenBase64 = original.imagen;
    } else {
      alert("Error al recuperar la imagen original.");
      return;
    }
  }

  var producto = {
    codigo: nuevoCodigo,
    nombre: nombre,
    categoria: categoria,
    W: W,
    L: L,
    H: H,
    precio: precio,
    imagen: imagenBase64
  };

  if (codigoOriginal) {
    // Modo edición
    var index = PRODUCTOS.findIndex(p => p.codigo === codigoOriginal);
    if (index !== -1) {
      if (codigoOriginal !== nuevoCodigo) {
        PRODUCTOS.splice(index, 1);
        PRODUCTOS.push(producto);
      } else {
        PRODUCTOS[index] = producto;
      }
    }
  } else {
    // Modo nuevo: verificar código duplicado
    if (PRODUCTOS.some(p => p.codigo === nuevoCodigo)) {
      alert("Ya existe un producto con ese código.");
      return;
    }
    PRODUCTOS.push(producto);
  }

  guardarProductos(PRODUCTOS);
  $.mobile.changePage("#catalogo");
  renderProductos(PRODUCTOS);
  
  // Limpiar formulario
  $("#producto-form")[0].reset();
  $("#edit-codigo").val("");
  $("#imagen-base64").val("");
  $("#preview-img").attr("src", "#").hide();
});

// ==============================
// Limpiar formulario al abrir la página de nuevo producto
$(document).on("pagebeforeshow", "#form-producto", function() {
  if (!$("#edit-codigo").val()) {
    $("#producto-form")[0].reset();
    $("#categoria").val("Lacteos");
    $("#imagen-base64").val("");
    $("#preview-img").attr("src", "#").hide();
  }
});