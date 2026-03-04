// ==============================
// CATÁLOGO DE PRODUCTOS CON SUPABASE (VERSIÓN CORREGIDA + COMPARTIR + ALERTAS)
// ==============================

// --- CONFIGURACIÓN INICIAL ---
const SUPABASE_URL = 'https://sfsmfoaecsozwejshitx.supabase.co'   // <-- TU URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmc21mb2FlY3NvendlanNoaXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzA5NDIsImV4cCI6MjA4ODE0Njk0Mn0.bACSidiEcc9zfLKzF8vTWECwK6iTUHoVaJb5CgWOAcw' // <-- TU ANON KEY
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

alert('✅ Supabase cliente inicializado: ' + (supabaseClient ? 'OK' : 'ERROR'))

// Variables globales
var PRODUCTOS = []
var CATEGORIAS = []
var currentUser = null
var authInitialized = false

// ==============================
// MODO OSCURO
// ==============================
function aplicarTema(esOscuro) {
  if (esOscuro) {
    $('body').addClass('dark-mode')
    $('#toggle-darkmode').text('☀️')
  } else {
    $('body').removeClass('dark-mode')
    $('#toggle-darkmode').text('🌙')
  }
  localStorage.setItem('darkMode', esOscuro ? 'true' : 'false')
}

$(document).on('pagebeforeshow', '#catalogo', function() {
  const darkModeGuardado = localStorage.getItem('darkMode') === 'true'
  aplicarTema(darkModeGuardado)
})

$(document).on('click', '#toggle-darkmode', function(e) {
  e.preventDefault()
  const esOscuro = !$('body').hasClass('dark-mode')
  aplicarTema(esOscuro)
})

// ==============================
// AUTENTICACIÓN CON SUPABASE
// ==============================

// Función para manejar el estado de autenticación inicial
async function manejarAuth() {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession()
    if (error) throw error

    if (session) {
      currentUser = session.user
      alert('🔐 Usuario autenticado: ' + currentUser.email)
      await cargarProductos()
      await cargarCategorias()
      renderCategoriasEnPanel()
      // Redirigir al catálogo si no estamos ahí
      if ($.mobile.activePage && $.mobile.activePage.attr('id') !== 'catalogo') {
        $.mobile.changePage('#catalogo')
      }
    } else {
      currentUser = null
      PRODUCTOS = []
      CATEGORIAS = []
      renderProductos([])
      // Redirigir al login si no estamos ahí
      if ($.mobile.activePage && $.mobile.activePage.attr('id') !== 'login') {
        $.mobile.changePage('#login')
      }
    }
  } catch (error) {
    alert('Error en manejarAuth: ' + error.message)
  } finally {
    authInitialized = true
  }
}

// Escuchar cambios en el estado de autenticación (login/logout en tiempo real)
supabaseClient.auth.onAuthStateChange((event, session) => {
  alert('📡 Auth event: ' + event)
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    currentUser = session.user
    cargarProductos()
    cargarCategorias().then(() => renderCategoriasEnPanel())
    if ($.mobile.activePage && $.mobile.activePage.attr('id') !== 'catalogo') {
      $.mobile.changePage('#catalogo')
    }
  } else if (event === 'SIGNED_OUT') {
    currentUser = null
    PRODUCTOS = []
    CATEGORIAS = []
    renderProductos([])
    $.mobile.changePage('#login')
  }
})

// Inicializar autenticación cuando la página esté lista
$(document).on('pageinit', function() {
  if (!authInitialized) {
    manejarAuth()
  }
})

// ==============================
// LOGIN
// ==============================
$(document).on('submit', '#login-form', async function(e) {
  e.preventDefault()
  alert('🔑 Intento de login')

  const email = $('#login-email').val().trim()
  const password = $('#login-password').val().trim()

  // Validaciones básicas
  if (!email || !password) {
    alert('Por favor completa todos los campos.')
    return
  }

  // Deshabilitar botón y mostrar estado
  $('#btn-login').text('Ingresando...').prop('disabled', true)

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) throw error

    // Éxito: el evento onAuthStateChange redirigirá automáticamente
    alert('Login exitoso, redirigiendo...')

  } catch (error) {
    alert('❌ Error en login: ' + error.message)
    $('#btn-login').text('Ingresar').prop('disabled', false)
  }
})

// ==============================
// REGISTRO
// ==============================
$(document).on('submit', '#registro-form', async function(e) {
  e.preventDefault()
  alert('📝 Intento de registro')

  const email = $('#reg-email').val().trim()
  const password = $('#reg-password').val().trim()
  const confirm = $('#reg-confirm').val().trim()

  // Validaciones
  if (!email || !password || !confirm) {
    alert('Por favor completa todos los campos.')
    return
  }

  if (password !== confirm) {
    alert('Las contraseñas no coinciden.')
    return
  }

  if (password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres.')
    return
  }

  // Deshabilitar botón
  $('#btn-registro').text('Registrando...').prop('disabled', true)

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    })

    if (error) throw error

    alert('📦 Respuesta de registro: ' + JSON.stringify(data))

    // Verificar si el usuario necesita confirmación de email
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      // El usuario ya existe o requiere confirmación
      alert('Este email ya está registrado o requiere confirmación. Revisa tu bandeja de entrada.')
      $('#btn-registro').text('Crear cuenta').prop('disabled', false)
    } else {
      // Registro exitoso
      alert('¡Registro exitoso! Redirigiendo...')
      setTimeout(() => {
        $.mobile.changePage('#catalogo')
      }, 1500)
    }

  } catch (error) {
    alert('❌ Error en registro: ' + error.message)
    $('#btn-registro').text('Crear cuenta').prop('disabled', false)
  }
})

// ==============================
// LOGOUT
// ==============================
$(document).on('click', '#btn-logout', async function(e) {
  e.preventDefault()
  await supabaseClient.auth.signOut()
})

// ==============================
// FUNCIONES DE PRODUCTOS (CRUD)
// ==============================

// Cargar productos del usuario actual
async function cargarProductos() {
  if (!currentUser) return

  try {
    const { data, error } = await supabaseClient
      .from('productos')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    PRODUCTOS = data || []
    renderProductos(PRODUCTOS)
  } catch (error) {
    alert('Error cargando productos: ' + error.message)
  }
}

// Renderizar productos en el grid
function renderProductos(productos) {
  const grid = $('#lista-productos')
  grid.empty()

  if (!productos || productos.length === 0) {
    grid.append('<p style="text-align:center; padding:20px;">No hay productos aún. ¡Agrega uno!</p>')
    return
  }

  $.each(productos, function(i, producto) {
    const card = $(
      '<div class="producto-card">' +
        '<img src="' + producto.imagen + '" alt="' + producto.nombre + '" onerror="this.src=\'img/placeholder.jpg\'">' +
        '<h3>' + producto.nombre + '</h3>' +
        '<p>Código: ' + producto.codigo + '</p>' +
        '<a href="#detalle" class="btn-detalle" ' +
        'data-role="button" data-theme="a" ' +
        'data-id="' + producto.id + '">Ver detalles</a>' +
      '</div>'
    )
    grid.append(card)
  })
  grid.trigger('create')
}

// ==============================
// DETALLE DEL PRODUCTO (con botón compartir)
// ==============================
$(document).on('click', '.btn-detalle', function(e) {
  e.preventDefault()
  const id = $(this).data('id')
  const producto = PRODUCTOS.find(p => p.id == id)
  if (!producto) return

  const detalle = $('#detalle-contenido')
  detalle.html(`
    <div style="text-align:center;">
      <img id="producto-img" src="${producto.imagen}" style="width:100%; max-width:300px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3); margin-bottom:15px; cursor:pointer;" onerror="this.src='img/placeholder.jpg'">
      <h2 style="color:#2c3e50; margin-bottom:10px;">${producto.nombre}</h2>
      <p><b>Código:</b> ${producto.codigo}</p>
      <div style="display:flex; justify-content:center; gap:15px; margin:15px 0;">
        <div style="background:#ecf0f1; padding:10px; border-radius:8px; min-width:70px;">
          <p style="margin:0; font-weight:bold; color:#2c3e50;">W</p>
          <p style="margin:0; color:#27ae60;">${producto.w}</p>
        </div>
        <div style="background:#ecf0f1; padding:10px; border-radius:8px; min-width:70px;">
          <p style="margin:0; font-weight:bold; color:#2c3e50;">L</p>
          <p style="margin:0; color:#27ae60;">${producto.l}</p>
        </div>
        <div style="background:#ecf0f1; padding:10px; border-radius:8px; min-width:70px;">
          <p style="margin:0; font-weight:bold; color:#2c3e50;">H</p>
          <p style="margin:0; color:#27ae60;">${producto.h}</p>
        </div>
      </div>
      <p style="color:#27ae60; font-weight:bold;"><b>Precio:</b> ${producto.precio}</p>
      <div style="display:flex; gap:10px; justify-content:center; margin-top:15px; flex-wrap:wrap;">
        <a href="#form-producto" class="ui-btn ui-corner-all ui-shadow ui-btn-a" id="btn-editar" data-id="${producto.id}" style="background:#3498db; color:white;">Editar</a>
        <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a" id="btn-eliminar" data-id="${producto.id}" style="background:#c0392b; color:white;">Eliminar</a>
        <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-a" id="btn-compartir" data-id="${producto.id}" style="background:#25D366; color:white;">📱 Compartir</a>
      </div>
      <a href="#" id="btn-video" class="ui-btn ui-corner-all ui-shadow" style="background:#3498db; color:white; margin-top:10px;">Ver video</a>
      
      <!-- Modales -->
      <div id="img-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">
        <img src="${producto.imagen}" style="max-width:90%; max-height:90%; border-radius:10px;">
      </div>
      <div id="video-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:9999;">
        <video id="video-player" controls style="max-width:90%; max-height:90%; background:#000;">
          <source src="video/video${producto.codigo}.mp4" type="video/mp4">
          Tu navegador no soporta video.
        </video>
      </div>
    </div>
  `)

  // Eventos para modales
  $('#producto-img').off('click').on('click', function() {
    $('#img-modal').css('display', 'flex')
  })
  $('#img-modal').off('click').on('click', function() {
    $(this).hide()
  })
  $('#btn-video').off('click').on('click', function(e) {
    e.preventDefault()
    $('#video-modal').css('display', 'flex')
    document.getElementById('video-player').play()
  })
  $('#video-modal').off('click').on('click', function(e) {
    if (e.target.id === 'video-modal') {
      document.getElementById('video-player').pause()
      $(this).hide()
    }
  })

  $.mobile.changePage('#detalle')
})

// ==============================
// COMPARTIR PRODUCTO POR WHATSAPP
// ==============================
$(document).on('click', '#btn-compartir', function(e) {
  e.preventDefault()
  const id = $(this).data('id')
  const producto = PRODUCTOS.find(p => p.id == id)
  if (!producto) return

  // Construir mensaje
  const mensaje = `*${producto.nombre}*\n` +
                  `📦 Código: ${producto.codigo}\n` +
                  `📏 W: ${producto.w} | L: ${producto.l} | H: ${producto.h}\n` +
                  `💰 Precio: ${producto.precio}\n` +
                  `🖼️ Imagen: ${producto.imagen}`

  // Intentar usar Web Share API (en móviles)
  if (navigator.share) {
    navigator.share({
      title: producto.nombre,
      text: mensaje,
      url: producto.imagen
    }).catch(error => {
      alert('Error al compartir: ' + error.message)
      compartirPorWhatsApp(mensaje)
    })
  } else {
    compartirPorWhatsApp(mensaje)
  }
})

function compartirPorWhatsApp(mensaje) {
  const textoCodificado = encodeURIComponent(mensaje)
  const whatsappUrl = `whatsapp://send?text=${textoCodificado}`
  const whatsappWebUrl = `https://wa.me/?text=${textoCodificado}`

  // Intenta abrir la app
  window.location.href = whatsappUrl

  // Fallback a web si no se abre la app
  setTimeout(() => {
    window.location.href = whatsappWebUrl
  }, 500)
}

// ==============================
// ELIMINAR PRODUCTO
// ==============================
$(document).on('click', '#btn-eliminar', async function(e) {
  e.preventDefault()
  const id = $(this).data('id')

  if (!confirm('¿Estás seguro de eliminar este producto?')) return
  if (!currentUser) return

  try {
    const { error } = await supabaseClient
      .from('productos')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id) // seguridad extra

    if (error) throw error

    // Eliminar localmente y recargar vista
    PRODUCTOS = PRODUCTOS.filter(p => p.id != id)
    renderProductos(PRODUCTOS)
    $.mobile.changePage('#catalogo')

  } catch (error) {
    alert('Error al eliminar: ' + error.message)
  }
})

// ==============================
// EDITAR PRODUCTO (cargar datos en formulario)
// ==============================
$(document).on('click', '#btn-editar', function(e) {
  e.preventDefault()
  const id = $(this).data('id')
  const producto = PRODUCTOS.find(p => p.id == id)

  if (producto) {
    $('#edit-id').val(producto.id)
    $('#edit-codigo').val(producto.codigo)
    $('#codigo').val(producto.codigo)
    $('#nombre').val(producto.nombre)
    // La categoría se seleccionará al llenar el select en pagebeforeshow
    $('#W').val(producto.w)
    $('#L').val(producto.l)
    $('#H').val(producto.h)
    $('#precio').val(producto.precio)

    // Si la imagen es base64, mostrarla en preview
    if (producto.imagen && producto.imagen.startsWith('data:image')) {
      $('#imagen-base64').val(producto.imagen)
      $('#preview-img').attr('src', producto.imagen).show()
    } else {
      $('#imagen-base64').val('')
      $('#preview-img').attr('src', '#').hide()
    }
  }
  $.mobile.changePage('#form-producto')
})

// ==============================
// SELECCIÓN DE IMAGEN (convertir a base64) - VERSIÓN CON ALERTAS
// ==============================
$(document).on('change', '#imagen', function(e) {
  alert('Evento change disparado en input file')
  const file = e.target.files[0]
  if (!file) {
    alert('No se seleccionó ningún archivo')
    return
  }

  alert('Archivo seleccionado: ' + file.name + ', tamaño: ' + file.size + ' bytes')

  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen es demasiado grande. Máximo 2MB.')
    $(this).val('')
    return
  }

  alert('Iniciando FileReader...')
  const reader = new FileReader()
  reader.onload = function(ev) {
    alert('FileReader onload disparado, resultado obtenido')
    const base64 = ev.target.result
    $('#imagen-base64').val(base64)
    $('#preview-img').attr('src', base64).show()
    alert('Preview actualizado')
  }
  reader.onerror = function(ev) {
    alert('Error en FileReader: ' + ev.target.error)
  }
  reader.readAsDataURL(file)
  alert('readAsDataURL llamado')
})

// ==============================
// GUARDAR PRODUCTO (INSERTAR O ACTUALIZAR) - VERSIÓN CON ALERTAS
// ==============================
$(document).on('click', '#guardar-producto', async function(e) {
  e.preventDefault()

  alert('Iniciando guardar producto')

  if (!currentUser) {
    alert('Debes iniciar sesión')
    $.mobile.changePage('#login')
    return
  }

  const idEdicion = $('#edit-id').val()
  const codigo = $('#codigo').val().trim()
  const nombre = $('#nombre').val().trim()
  const categoria = $('#categoria').val()
  const W = $('#W').val().trim()
  const L = $('#L').val().trim()
  const H = $('#H').val().trim()
  const precio = $('#precio').val().trim()
  let imagenBase64 = $('#imagen-base64').val()

  alert('Valores capturados: codigo=' + codigo + ', nombre=' + nombre + ', categoria=' + categoria + ', W=' + W + ', L=' + L + ', H=' + H + ', precio=' + precio)
  alert('imagenBase64 (primeros 50 chars): ' + (imagenBase64 ? imagenBase64.substring(0,50) : 'vacío'))

  // Validaciones
  if (!codigo || !nombre || !W || !L || !H || !precio) {
    alert('Por favor completa todos los campos.')
    return
  }

  if (!idEdicion && !imagenBase64) {
    alert('Debes seleccionar una imagen.')
    return
  }

  if (idEdicion && !imagenBase64) {
    const original = PRODUCTOS.find(p => p.id == idEdicion)
    if (original) {
      imagenBase64 = original.imagen
      alert('Usando imagen original')
    } else {
      alert('Error al recuperar la imagen original.')
      return
    }
  }

  const producto = {
    user_id: currentUser.id,
    codigo: codigo,
    nombre: nombre,
    categoria: categoria,
    w: W,
    l: L,
    h: H,
    precio: precio,
    imagen: imagenBase64
  }

  alert('Objeto producto construido: ' + JSON.stringify(producto))

  try {
    if (idEdicion) {
      alert('Modo edición')
      // ACTUALIZAR: verificar código duplicado (excluyendo el actual)
      if (codigo !== $('#edit-codigo').val()) {
        const { data: existentes, error: countError } = await supabaseClient
          .from('productos')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('codigo', codigo)
          .neq('id', idEdicion)

        if (countError) throw countError

        if (existentes && existentes.length > 0) {
          alert('Ya existe otro producto con ese código.')
          return
        }
      }

      const { error } = await supabaseClient
        .from('productos')
        .update(producto)
        .eq('id', idEdicion)
        .eq('user_id', currentUser.id)

      if (error) throw error
      alert('Producto actualizado correctamente')
    } else {
      alert('Modo inserción')
      // INSERTAR: verificar código único
      const { data: existentes, error: countError } = await supabaseClient
        .from('productos')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('codigo', codigo)

      if (countError) throw countError

      if (existentes && existentes.length > 0) {
        alert('Ya existe un producto con ese código.')
        return
      }

      const { error } = await supabaseClient
        .from('productos')
        .insert([producto])

      if (error) throw error
      alert('Producto insertado correctamente')
    }

    // Éxito: recargar productos y volver al catálogo
    await cargarProductos()
    $.mobile.changePage('#catalogo')
    limpiarFormulario()

  } catch (error) {
    alert('Error al guardar: ' + error.message)
  }
})

// Función auxiliar para limpiar el formulario
function limpiarFormulario() {
  $('#producto-form')[0].reset()
  $('#edit-id').val('')
  $('#edit-codigo').val('')
  $('#imagen-base64').val('')
  $('#preview-img').attr('src', '#').hide()
}

// ==============================
// FUNCIONES DE CATEGORÍAS
// ==============================

async function cargarCategorias() {
  if (!currentUser) return []
  try {
    const { data, error } = await supabaseClient
      .from('categorias')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('nombre', { ascending: true })
    if (error) throw error
    CATEGORIAS = data || []
    return CATEGORIAS
  } catch (error) {
    alert('Error cargando categorías: ' + error.message)
    return []
  }
}

function renderCategoriasEnPanel() {
  const lista = $('#lista-categorias')
  lista.empty()
  
  // Opción "Todos" (siempre presente)
  lista.append('<li><a href="#" class="cat-option" data-cat="todos">Todos</a></li>')
  
  // Categorías del usuario
  CATEGORIAS.forEach(cat => {
    lista.append(`<li><a href="#" class="cat-option" data-cat="${cat.nombre}">${cat.nombre}</a></li>`)
  })
  lista.listview('refresh')
}

function renderCategoriasEnGestion() {
  const lista = $('#lista-categorias-gestion')
  lista.empty()
  
  CATEGORIAS.forEach(cat => {
    const item = $(`
      <li data-id="${cat.id}">
        <h3>${cat.nombre}</h3>
        <p>ID: ${cat.id}</p>
        <a href="#" class="edit-categoria" data-id="${cat.id}" data-nombre="${cat.nombre}">Editar</a>
        <a href="#" class="delete-categoria" data-id="${cat.id}">Eliminar</a>
      </li>
    `)
    lista.append(item)
  })
  lista.listview('refresh')
}

// ==============================
// GESTIÓN DE CATEGORÍAS
// ==============================

// Al abrir la página de gestión, cargar categorías
$(document).on('pagebeforeshow', '#gestion-categorias', async function() {
  await cargarCategorias()
  renderCategoriasEnGestion()
})

// Botón Nueva categoría
$(document).on('click', '#btn-nueva-categoria', function(e) {
  e.preventDefault()
  $('#edit-categoria-id').val('')
  $('#nombre-categoria').val('')
  $('#form-categoria-container').slideDown()
})

// Cancelar
$(document).on('click', '#cancelar-categoria', function(e) {
  e.preventDefault()
  $('#form-categoria-container').slideUp()
})

// Guardar categoría (nueva o editada)
$(document).on('submit', '#form-categoria', async function(e) {
  e.preventDefault()
  const id = $('#edit-categoria-id').val()
  const nombre = $('#nombre-categoria').val().trim()
  
  if (!nombre) {
    alert('El nombre no puede estar vacío')
    return
  }
  
  if (!currentUser) {
    alert('Debes iniciar sesión')
    return
  }
  
  try {
    if (id) {
      // Editar
      const { error } = await supabaseClient
        .from('categorias')
        .update({ nombre })
        .eq('id', id)
        .eq('user_id', currentUser.id)
      if (error) throw error
      alert('Categoría actualizada')
    } else {
      // Nueva
      const { error } = await supabaseClient
        .from('categorias')
        .insert([{ user_id: currentUser.id, nombre }])
      if (error) throw error
      alert('Categoría creada')
    }
    
    // Recargar categorías y actualizar UI
    await cargarCategorias()
    renderCategoriasEnGestion()
    renderCategoriasEnPanel()
    $('#form-categoria-container').slideUp()
    $('#nombre-categoria').val('')
    
  } catch (error) {
    alert('Error al guardar categoría: ' + error.message)
  }
})

// Editar categoría (desde la lista)
$(document).on('click', '.edit-categoria', function(e) {
  e.preventDefault()
  const id = $(this).data('id')
  const nombre = $(this).data('nombre')
  $('#edit-categoria-id').val(id)
  $('#nombre-categoria').val(nombre)
  $('#form-categoria-container').slideDown()
})

// Eliminar categoría
$(document).on('click', '.delete-categoria', async function(e) {
  e.preventDefault()
  const id = $(this).data('id')
  
  if (!confirm('¿Estás seguro de eliminar esta categoría? Los productos que la usan conservarán el nombre pero ya no aparecerá en la lista.')) return
  
  try {
    const { error } = await supabaseClient
      .from('categorias')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id)
    if (error) throw error
    
    alert('Categoría eliminada')
    // Recargar
    await cargarCategorias()
    renderCategoriasEnGestion()
    renderCategoriasEnPanel()
  } catch (error) {
    alert('Error al eliminar: ' + error.message)
  }
})

// ==============================
// FILTROS LOCALES (búsqueda y categorías)
// ==============================
$(document).on('pageinit', '#catalogo', function() {
  // Buscador en tiempo real
  $('#search-input').on('input', function() {
    const q = $(this).val().toLowerCase().trim()
    const filtrados = PRODUCTOS.filter(p =>
      Object.values(p).some(val => String(val).toLowerCase().includes(q))
    )
    renderProductos(filtrados)
  })

  // Filtro por categoría (desde el panel lateral)
  $(document).on('click', '.cat-option', function(e) {
    e.preventDefault()
    const categoria = $(this).data('cat').toLowerCase()
    let filtrados

    if (categoria === 'todos') {
      filtrados = PRODUCTOS.slice()
    } else {
      filtrados = PRODUCTOS.filter(p => {
        const catProducto = (p.categoria || '').toString().toLowerCase().trim()
        return catProducto === categoria // coincidencia exacta
      })
    }
    renderProductos(filtrados)
    $('#panel-categorias').panel('close')
  })
})

// Limpiar formulario y llenar select de categorías al abrir la página de producto
$(document).on('pagebeforeshow', '#form-producto', async function() {
  if (!$('#edit-id').val()) {
    limpiarFormulario()
  }
  // Cargar categorías y llenar select
  await cargarCategorias() // asegura que CATEGORIAS esté actualizado
  const select = $('#categoria')
  select.empty()
  CATEGORIAS.forEach(cat => {
    select.append(`<option value="${cat.nombre}">${cat.nombre}</option>`)
  })
  // Si estamos editando, seleccionar la categoría del producto
  const idEdicion = $('#edit-id').val()
  if (idEdicion) {
    const producto = PRODUCTOS.find(p => p.id == idEdicion)
    if (producto) {
      select.val(producto.categoria)
    }
  }
  // Si no hay categorías, mostrar opción por defecto
  if (CATEGORIAS.length === 0) {
    select.append('<option value="Otros">Otros (sin categoría)</option>')
  }
  select.selectmenu('refresh')
})