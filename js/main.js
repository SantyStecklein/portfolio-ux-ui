/* Portfolio · Santiago Stecklein — JavaScript vanilla, sin dependencias */
(function () {
  "use strict";

  var raiz = document.documentElement;

  /* ---- Modo claro / oscuro ------------------------------------------- */
  var botonTema = document.querySelector("[data-tema-toggle]");

  function actualizarBotonTema() {
    if (!botonTema) return;
    var oscuro = raiz.getAttribute("data-theme") === "dark";
    botonTema.setAttribute("aria-label", oscuro ? "Activar modo claro" : "Activar modo oscuro");
  }

  if (botonTema) {
    actualizarBotonTema();
    botonTema.addEventListener("click", function () {
      var nuevo = raiz.getAttribute("data-theme") === "dark" ? "light" : "dark";
      raiz.setAttribute("data-theme", nuevo);
      try { localStorage.setItem("tema", nuevo); } catch (e) { /* almacenamiento no disponible */ }
      actualizarBotonTema();
    });
  }

  /* ---- Header: difuminado al scrollear ------------------------------- */
  var header = document.querySelector("[data-header]");

  function alScrollear() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", alScrollear, { passive: true });
  alScrollear();

  /* ---- Menú mobile ---------------------------------------------------- */
  var botonMenu = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");

  function cerrarMenu(devolverFoco) {
    if (!menu || !botonMenu) return;
    menu.classList.remove("is-abierto");
    botonMenu.setAttribute("aria-expanded", "false");
    if (devolverFoco) botonMenu.focus();
  }

  if (botonMenu && menu) {
    botonMenu.addEventListener("click", function () {
      var abierto = menu.classList.toggle("is-abierto");
      botonMenu.setAttribute("aria-expanded", String(abierto));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) cerrarMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-abierto")) cerrarMenu(true);
    });
    window.matchMedia("(min-width: 64em)").addEventListener("change", function () { cerrarMenu(false); });
  }
  
  /* ---- Copiar email (se copia al tocar la dirección) ---- */
  var botonCopiar = document.querySelector("[data-copiar]");
  if (botonCopiar) {
    var aviso = document.querySelector("[data-copiado]");
    botonCopiar.addEventListener("click", function () {
      var correo = botonCopiar.getAttribute("data-copiar");
      function avisar(texto) {
        if (aviso) aviso.textContent = texto;
        setTimeout(function () { if (aviso) aviso.textContent = ""; }, 2500);
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(correo).then(function () { avisar("✓ Email copiado"); }, function () { avisar("No se pudo copiar"); });
      } else {
        avisar("No se pudo copiar");
      }
    });
  }
  
  /* ---- Formulario de contacto (Formspree) ------------------------------ */
  var formulario = document.querySelector("[data-formulario]");
  if (!formulario) return;

  var estado = formulario.querySelector("[data-estado]");
  var mensajes = {
    nombre: "Escribí tu nombre.",
    email: "Ingresá un mail válido, por ejemplo nombre@ejemplo.com.",
    mensaje: "Contame en qué puedo ayudarte."
  };

  function validarCampo(campo) {
    var error = document.getElementById(campo.id + "-error");
    var valido = campo.checkValidity();
    campo.setAttribute("aria-invalid", valido ? "false" : "true");
    if (error) error.textContent = valido ? "" : mensajes[campo.name];
    return valido;
  }

  var campos = Array.prototype.slice.call(formulario.querySelectorAll("input[required], textarea[required]"));
  campos.forEach(function (campo) {
    campo.addEventListener("blur", function () { validarCampo(campo); });
    campo.addEventListener("input", function () {
      if (campo.getAttribute("aria-invalid") === "true") validarCampo(campo);
    });
  });

  function mostrarEstado(texto, clase) {
    estado.textContent = texto;
    estado.className = "formulario__estado " + clase;
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    var invalidos = campos.filter(function (c) { return !validarCampo(c); });
    if (invalidos.length) {
      invalidos[0].focus();
      mostrarEstado("Revisá los campos marcados.", "is-error");
      return;
    }
    var boton = formulario.querySelector("button[type='submit']");
    boton.disabled = true;
    mostrarEstado("Enviando…", "");

    fetch(formulario.action, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(formulario)
    }).then(function (respuesta) {
      if (!respuesta.ok) throw new Error("Respuesta " + respuesta.status);
      formulario.reset();
      mostrarEstado("Tu mensaje ha sido enviado y se responderá a la brevedad.", "is-ok");
    }).catch(function () {
      mostrarEstado("No se pudo enviar el mensaje. Intentá nuevamente o escribí a holasanti66@gmail.com.", "is-error");
    }).then(function () {
      boton.disabled = false;
    });
  });
})();
