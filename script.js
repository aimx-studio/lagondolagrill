const NUMERO_WHATSAPP_MEDIODIA = "573102730055"; // 11:45am - 4:00pm
const NUMERO_WHATSAPP_TARDE = "573114667501"; // 4:00pm - 12:00am

function efectivoDisponibleAhora(){
  const ahora = new Date();
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  return minutos >= 12 * 60 && minutos < 22 * 60; // 12:00pm - 10:00pm
}

function obtenerNumeroWhatsApp(){
  const ahora = new Date();
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();
  const inicioMediodia = 11 * 60 + 45; // 11:45am
  const finMediodia = 16 * 60; // 4:00pm
  if (minutos >= inicioMediodia && minutos < finMediodia){
    return NUMERO_WHATSAPP_MEDIODIA;
  }
  return NUMERO_WHATSAPP_TARDE;
}

  function mostrarVistaMenu(tipo){
    document.getElementById("landingScreen").style.display = "none";
    document.getElementById("menuContent").style.display = "block";
    document.getElementById("grupoRapidas").style.display = (tipo === "rapidas") ? "block" : "none";
    document.getElementById("grupoBandejas").style.display = (tipo === "bandejas") ? "block" : "none";

    if (tipo === "bandejas"){
      const h2 = document.querySelector("#grupoBandejas .menu-section h2");
      const platos = h2?.nextElementSibling;
      if (platos){ platos.style.display = "block"; h2.classList.add("open"); }
    }

    window.scrollTo(0,0);
  }

  function mostrarVistaLanding(){
    document.getElementById("menuContent").style.display = "none";
    document.getElementById("landingScreen").style.display = "block";
    window.scrollTo(0,0);
  }

  function elegirSeccion(tipo){
    mostrarVistaMenu(tipo);
    history.pushState({ vista: "menu", tipo: tipo }, "");
  }

  function volverLanding(){
    history.back();
  }

  window.addEventListener("popstate", function(e){
    if (e.state && e.state.vista === "menu"){
      mostrarVistaMenu(e.state.tipo);
    } else {
      mostrarVistaLanding();
    }
  });

  history.replaceState({ vista: "landing" }, "");

  function toggleMenu(titulo){
    const seccion = titulo.nextElementSibling;
    if (!seccion) return;
    const abrir = seccion.style.display !== "block";
    seccion.style.display = abrir ? "block" : "none";
    titulo.classList.toggle("open", abrir);
  }

  function toggleCantidad(checkbox){
    const item = checkbox.closest(".item");
    if (!item) return;
    const cantidad = item.querySelector(".cantidad");
    if (!cantidad) return;
    if (checkbox.checked){
      cantidad.disabled = false;
      if (Number(cantidad.value) === 0) cantidad.value = 1;
      item.classList.add("marcado");
    } else {
      cantidad.value = 0;
      cantidad.disabled = true;
      item.classList.remove("marcado");
      const tamanoSel = item.querySelector(".tamano");
      if (tamanoSel){ tamanoSel.selectedIndex = 0; toggleGuarnicion(tamanoSel); }
    }
    toggleMejoraChorizo(item);
    calcularTotal();
  }

  function toggleMejoraChorizo(item){
    const wrap = item.querySelector(".mejora-wrap");
    if (!wrap) return;
    const cb = item.querySelector(".check-plato");
    const cantidadInput = item.querySelector(".cantidad");
    const cantidad = Math.max(1, Math.floor(Number(cantidadInput?.value)) || 1);

    if (!cb || !cb.checked){
      wrap.style.display = "none";
      wrap.querySelectorAll(".mejora-fila").forEach(f => f.remove());
      return;
    }
    wrap.style.display = "block";

    const previos = {};
    wrap.querySelectorAll(".mejora-fila input").forEach(inp => {
      previos[inp.dataset.unidad] = inp.checked;
    });
    wrap.querySelectorAll(".mejora-fila").forEach(f => f.remove());

    for (let u = 1; u <= cantidad; u++){
      const fila = document.createElement("label");
      fila.className = "mejora-fila";
      fila.innerHTML = '<input type="checkbox" class="check-mejora-chorizo" data-unidad="' + u + '" onchange="calcularTotal()"> ' +
        (cantidad > 1 ? "Perro " + u + ": " : "") + "Cambiar por chorizo artesanal (+$5.000)";
      fila.querySelector("input").checked = !!previos[u];
      wrap.appendChild(fila);
    }
  }

  const GUARNICIONES = ["Papa a la francesa", "Yuca frita", "Chips de plátano", "Papas en casquitos"];

  function toggleGuarnicion(select){
    const item = select.closest(".item");
    if (!item) return;
    const wrap = item.querySelector(".guarnicion-wrap");
    if (!wrap) return;
    const opt = select.options[select.selectedIndex];
    const esCombo = opt && opt.dataset.combo === "1";

    // guarda lo que ya había elegido (por combo y por posición)
    const previos = {};
    wrap.querySelectorAll(".guarnicion").forEach(g => {
      if (g.dataset.k) previos[g.dataset.k] = g.value;
    });
    wrap.querySelectorAll(".combo-bloque, .guarnicion").forEach(el => el.remove());

    wrap.style.display = esCombo ? "block" : "none";
    if (!esCombo) return;

    let n = 1, ml = 250;
    if (opt.text.includes("Personal")){ n = 2; ml = 400; }
    else if (opt.text.includes("Súper")){ n = 3; ml = 600; }

    const cantidad = Math.max(1, Math.floor(Number(item.querySelector(".cantidad")?.value)) || 1);

    const label = wrap.querySelector("label");
    if (label){
      label.textContent = "🥤 Cada combo incluye gaseosa de " + ml + " ml (o limonada / té frío con $1.000 menos) + " +
        n + (n === 1 ? " guarnición" : " guarniciones") + ". Elige:";
    }

    for (let c = 1; c <= cantidad; c++){
      const bloque = document.createElement("div");
      bloque.className = "combo-bloque";
      bloque.style.cssText = "margin-top:8px;padding:8px 10px;border:1px solid rgba(217,164,65,.25);border-radius:8px;";
      if (cantidad > 1){
        const titulo = document.createElement("div");
        titulo.textContent = "Combo " + c + " de " + cantidad;
        titulo.style.cssText = "font-weight:700;font-size:12px;color:var(--gold-light);margin-bottom:6px;";
        bloque.appendChild(titulo);
      }
      for (let s = 1; s <= n; s++){
        const sel = document.createElement("select");
        sel.className = "guarnicion";
        sel.dataset.k = c + "-" + s;
        sel.style.marginTop = s > 1 ? "6px" : "0";
        sel.innerHTML = '<option value="">-- Selecciona --</option>' +
          GUARNICIONES.map(x => '<option>' + x + '</option>').join("");
        sel.value = previos[c + "-" + s] || "";
        bloque.appendChild(sel);
      }
      wrap.appendChild(bloque);
    }
  }

  function actualizarTextosCombo(){
    document.querySelectorAll('select.tamano option[data-combo="1"]').forEach(opt => {
      if (opt.dataset.comboActualizado) return;
      let detalle = "(1 guarnición + gaseosa 250ml)";
      let nombreCorto = "Combo Mini";
      if (opt.text.includes("Súper")){
        detalle = "(3 guarniciones + gaseosa 600ml)";
        nombreCorto = "Combo Súper";
      } else if (opt.text.includes("Personal")){
        detalle = "(2 guarniciones + gaseosa 400ml)";
        nombreCorto = "Combo Personal";
      }
      opt.dataset.nombreCorto = nombreCorto;
      opt.text = opt.text.replace(/(\$[\d.,]+)/, detalle + " $1");
      opt.dataset.comboActualizado = "1";
    });
  }
  actualizarTextosCombo();

  const VARIANTES_ITEMS = {
    clasica: [
      { id: "solo", label: "Solo", precio: 11000 },
      { id: "mini", label: "Combo Mini", precio: 18500, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 21000, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 22500, guarniciones: 3, ml: 600 },
      { id: "familiar", label: "Familiar", precio: 64500, nota: "4 hamburguesas + jarra de 1.5 Lts o limonada + 2 porciones" }
    ],
    criolla: [
      { id: "solo", label: "Solo", precio: 14800 },
      { id: "mini", label: "Combo Mini", precio: 22300, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 24800, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 26300, guarniciones: 3, ml: 600 }
    ],
    parrillera: [
      { id: "solo", label: "Solo", precio: 16500 },
      { id: "mini", label: "Combo Mini", precio: 23500, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 26000, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 27500, guarniciones: 3, ml: 600 }
    ],
    cheesepower: [
      { id: "solo", label: "Solo", precio: 17000 },
      { id: "mini", label: "Combo Mini", precio: 24500, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 27000, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 28500, guarniciones: 3, ml: 600 }
    ],
    doblecarne: [
      { id: "solo", label: "Solo", precio: 19000 },
      { id: "mini", label: "Combo Mini", precio: 26500, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 29000, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 30500, guarniciones: 3, ml: 600 }
    ],
    mexicana: [
      { id: "solo", label: "Solo", precio: 21000 },
      { id: "mini", label: "Combo Mini", precio: 28500, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 31000, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 32500, guarniciones: 3, ml: 600 }
    ],
    especialidadgondola: [
      { id: "solo", label: "Solo", precio: 23000 },
      { id: "mini", label: "Combo Mini", precio: 30500, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 33000, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 34500, guarniciones: 3, ml: 600 }
    ],
    hotdogclasico: [
      { id: "solo", label: "Solo", precio: 16500, permiteChorizo: true },
      { id: "mini", label: "Combo Mini", precio: 24000, guarniciones: 1, ml: 250, permiteChorizo: true },
      { id: "personal", label: "Combo Personal", precio: 26500, guarniciones: 2, ml: 400, permiteChorizo: true },
      { id: "super", label: "Combo Súper", precio: 28000, guarniciones: 3, ml: 600, permiteChorizo: true },
      { id: "familiar", label: "Familiar", precio: 86500, nota: "4 hot dogs + jarra de 1.5 Lts o limonada + 2 porciones" }
    ],
    hotdogmexicano: [
      { id: "solo", label: "Solo", precio: 18500, permiteChorizo: true },
      { id: "mini", label: "Combo Mini", precio: 26000, guarniciones: 1, ml: 250, permiteChorizo: true },
      { id: "personal", label: "Combo Personal", precio: 28500, guarniciones: 2, ml: 400, permiteChorizo: true },
      { id: "super", label: "Combo Súper", precio: 30000, guarniciones: 3, ml: 600, permiteChorizo: true }
    ],
    hotdogcheesepower: [
      { id: "solo", label: "Solo", precio: 19500, permiteChorizo: true },
      { id: "mini", label: "Combo Mini", precio: 27000, guarniciones: 1, ml: 250, permiteChorizo: true },
      { id: "personal", label: "Combo Personal", precio: 29500, guarniciones: 2, ml: 400, permiteChorizo: true },
      { id: "super", label: "Combo Súper", precio: 31000, guarniciones: 3, ml: 600, permiteChorizo: true }
    ],
    hotdogchili: [
      { id: "solo", label: "Solo", precio: 19500, permiteChorizo: true },
      { id: "mini", label: "Combo Mini", precio: 27000, guarniciones: 1, ml: 250, permiteChorizo: true },
      { id: "personal", label: "Combo Personal", precio: 29500, guarniciones: 2, ml: 400, permiteChorizo: true },
      { id: "super", label: "Combo Súper", precio: 31000, guarniciones: 3, ml: 600, permiteChorizo: true }
    ],
    choripan: [
      { id: "solo", label: "Solo", precio: 13500 },
      { id: "mini", label: "Combo Mini", precio: 21000, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 23500, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 25000, guarniciones: 3, ml: 600 }
    ],
    burrito: [
      { id: "solo", label: "Solo", precio: 17000 },
      { id: "mini", label: "Combo Mini", precio: 24500, guarniciones: 1, ml: 250 },
      { id: "personal", label: "Combo Personal", precio: 27000, guarniciones: 2, ml: 400 },
      { id: "super", label: "Combo Súper", precio: 28500, guarniciones: 3, ml: 600 }
    ],
    mazorcada: [
      { id: "mediana", label: "Mediana", precio: 18000 },
      { id: "agrandada", label: "Agrandada", precio: 20000 }
    ]
  };

  const GUARNICIONES_LISTA_VARIANTE = ["Papa a la francesa", "Yuca frita", "Chips de plátano", "Papas en casquitos"];

  let unidadesVarianteContador = 0;

  // Muestra "Desde $X" en los platos con selector de tamaño/combo, para que
  // se vea un precio de referencia aunque el precio real dependa de lo que elija.
  function inicializarPreciosVariante(){
    document.querySelectorAll(".item[data-item-key]").forEach(item => {
      if (item.querySelector(".precio-variante")) return;
      const itemKey = item.dataset.itemKey;
      const variantes = VARIANTES_ITEMS[itemKey];
      if (!variantes || !variantes.length) return;
      const minPrecio = Math.min(...variantes.map(v => v.precio));
      const cantidadInput = item.querySelector(".item-linea input.cantidad");
      if (!cantidadInput) return;
      const span = document.createElement("span");
      span.className = "precio-variante";
      span.textContent = `Desde $${minPrecio.toLocaleString("es-CO")}`;
      cantidadInput.parentNode.insertBefore(span, cantidadInput);
    });
  }

  // Agrega un campo de observaciones a todos los platos que NO tengan ya
  // observación por unidad (los de combo/tamaño) y que no sean bebidas.
  function inicializarObservacionesSimples(){
    document.querySelectorAll(".item").forEach(item => {
      if (item.dataset.itemKey) return;
      if (item.querySelector(".observaciones-simple")) return;
      const seccion = item.closest(".menu-section");
      const tituloSeccion = seccion?.querySelector("h2")?.textContent || "";
      if (tituloSeccion.includes("Bebidas")) return;

      const bloque = document.createElement("div");
      bloque.innerHTML = `<label class="obs-label-variante">📝 Observación:</label><textarea class="observaciones-unidad observaciones-simple" rows="2" placeholder="Ej: sin cebolla, extra picante..."></textarea>`;

      let desc = item.querySelector(".descripcion");
      if (!desc){
        desc = document.createElement("div");
        desc.className = "descripcion";
        desc.style.display = "none";
        item.appendChild(desc);
      }
      desc.appendChild(bloque);
    });
  }

  inicializarPreciosVariante();
  inicializarObservacionesSimples();

  function construirBloqueVariante(itemKey, unidad){
    unidadesVarianteContador++;
    const prefijo = `${itemKey}_u${unidad}_${unidadesVarianteContador}`;
    const variantes = VARIANTES_ITEMS[itemKey];
    const pills = variantes.map(v =>
      `<label class="variante-pill" data-variante="${v.id}">
         <input type="radio" name="${prefijo}_variante" value="${v.id}" onchange="seleccionarVariante(this)">
         ${v.label} — $${v.precio.toLocaleString("es-CO")}
       </label>`
    ).join("");

    return `<div class="unidad-variante" data-unidad="${unidad}" data-item-key="${itemKey}">
      <div class="variante-pills">${pills}</div>
      <div class="variante-detalle" style="display:none;"></div>
      <div class="guarnicion-wrap-variante"></div>
      <div class="mejora-wrap-variante"></div>
      <label class="obs-label-variante">📝 Observación Plato ${unidad}:</label>
      <textarea class="observaciones-unidad" rows="2" placeholder="Ej: sin cebolla, extra picante..."></textarea>
    </div>`;
  }

  function mostrarAvisoVariante(checkbox){
    if (!checkbox.checked) return;
    const item = checkbox.closest(".item");
    const aviso = item?.querySelector(".aviso-variante");
    if (!aviso) return;
    aviso.style.display = "block";
    aviso.style.animation = "none";
    void aviso.offsetWidth;
    aviso.style.animation = "avisoParpadeo 2.6s ease forwards";
    setTimeout(() => { aviso.style.display = "none"; }, 2600);
  }

  function actualizarUnidadesVariante(el){
    const item = el.closest(".item");
    if (!item) return;
    const itemKey = item.dataset.itemKey;
    const cont = item.querySelector(".unidades-variante");
    const cantidadInput = item.querySelector(".cantidad");
    const cantidad = Number(cantidadInput.value) || 0;

    let bloques = cont.querySelectorAll(".unidad-variante");
    while (bloques.length > cantidad){
      cont.removeChild(cont.lastElementChild);
      bloques = cont.querySelectorAll(".unidad-variante");
    }
    for (let i = bloques.length + 1; i <= cantidad; i++){
      cont.insertAdjacentHTML("beforeend", construirBloqueVariante(itemKey, i));
    }

    actualizarTabsVariante(item, cont, cantidad);
    calcularTotal();
  }

  function actualizarTabsVariante(item, cont, cantidad){
    let nav = item.querySelector(".unidad-tabs-variante");
    let hint = item.querySelector(".tabs-hint-variante");
    const bloques = Array.from(cont.querySelectorAll(".unidad-variante"));

    if (cantidad <= 1){
      if (nav) nav.remove();
      if (hint) hint.remove();
      bloques.forEach(b => b.style.display = "block");
      return;
    }

    if (!hint){
      hint = document.createElement("p");
      hint.className = "tabs-hint-variante";
      hint.textContent = "👉 Toca cada pestaña para elegir diferente en cada plato";
      cont.parentNode.insertBefore(hint, cont);
    }
    if (!nav){
      nav = document.createElement("div");
      nav.className = "unidad-tabs-variante";
      cont.parentNode.insertBefore(nav, cont);
    }

    const activaPrevia = nav.querySelector(".unidad-tab-variante.activa");
    const unidadActiva = Math.min(activaPrevia ? Number(activaPrevia.dataset.unidad) : 1, cantidad);

    nav.innerHTML = bloques.map((b, idx) => {
      const u = idx + 1;
      return `<button type="button" class="unidad-tab-variante${u === unidadActiva ? ' activa' : ''}" data-unidad="${u}" onclick="mostrarUnidadVariante(this)">Plato ${u}</button>`;
    }).join("");

    bloques.forEach((b, idx) => {
      b.style.display = (idx + 1 === unidadActiva) ? "block" : "none";
    });
  }

  function mostrarUnidadVariante(btn){
    const item = btn.closest(".item");
    const unidad = btn.dataset.unidad;
    item.querySelectorAll(".unidad-tab-variante").forEach(t => t.classList.toggle("activa", t === btn));
    item.querySelectorAll(".unidad-variante").forEach(b => {
      b.style.display = (b.dataset.unidad === unidad) ? "block" : "none";
    });
  }

  function seleccionarVariante(radio){
    const bloque = radio.closest(".unidad-variante");
    const itemKey = bloque.dataset.itemKey;
    const varianteId = radio.value;
    const variante = VARIANTES_ITEMS[itemKey].find(v => v.id === varianteId);

    bloque.querySelectorAll(".variante-pill").forEach(p => {
      p.classList.toggle("activa", p.dataset.variante === varianteId);
    });

    const detalle = bloque.querySelector(".variante-detalle");
    const guarnicionWrap = bloque.querySelector(".guarnicion-wrap-variante");

    if (variante.guarniciones){
      detalle.style.display = "block";
      detalle.textContent = `🥤 Incluye gaseosa de ${variante.ml} ml (o limonada / té frío con $1.000 menos) + ${variante.guarniciones} ${variante.guarniciones === 1 ? "guarnición" : "guarniciones"}.`;
      guarnicionWrap.innerHTML = Array.from({length: variante.guarniciones}, (_, i) =>
        `<select class="guarnicion-variante">
           <option value="">-- Selecciona guarnición ${i+1} --</option>
           ${GUARNICIONES_LISTA_VARIANTE.map(g => `<option>${g}</option>`).join("")}
         </select>`
      ).join("");
    } else if (variante.nota){
      detalle.style.display = "block";
      detalle.textContent = `ℹ️ ${variante.nota}`;
      guarnicionWrap.innerHTML = "";
    } else {
      detalle.style.display = "none";
      guarnicionWrap.innerHTML = "";
    }

    const mejoraWrap = bloque.querySelector(".mejora-wrap-variante");
    if (variante.permiteChorizo){
      mejoraWrap.innerHTML = `<label class="mejora-fila-variante"><input type="checkbox" class="check-mejora-chorizo-variante" onchange="calcularTotal()"> 🌶️ Cambiar la salchicha por chorizo artesanal (+$5.000)</label>`;
    } else {
      mejoraWrap.innerHTML = "";
    }

    bloque.dataset.precioSeleccionado = variante.precio;
    calcularTotal();
  }

  // al cambiar la cantidad, se rehacen los bloques de guarniciones y de chorizo
  document.addEventListener("input", function(e){
    if (!e.target.classList || !e.target.classList.contains("cantidad")) return;
    const item = e.target.closest(".item");
    if (!item) return;
    const tamanoSel = item.querySelector(".tamano");
    if (tamanoSel) toggleGuarnicion(tamanoSel);
    toggleMejoraChorizo(item);
  });

  // al tocar la cantidad se selecciona el número: escribes encima sin borrar
  function seleccionarCantidad(e){
    const el = e.target;
    if (!el.classList || !el.classList.contains("cantidad")) return;
    setTimeout(() => { try { el.select(); } catch(err){} }, 0);
  }
  document.addEventListener("focusin", seleccionarCantidad);
  document.addEventListener("click", seleccionarCantidad);

  function toggleDescripcion(checkbox){
    const item = checkbox.closest(".item");
    if (!item) return;
    const desc = item.querySelector(".descripcion");
    if (!desc) return;
    desc.style.display = checkbox.checked ? "block" : "none";
  }

  function calcularTotal(){
    let subtotal = 0;
    let unidadesEmpaque = 0;

    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      if (!item) return;
      const cantidadInput = item.querySelector(".cantidad");
      const cantidad = Number(cantidadInput?.value) || 0;
      if (cantidad <= 0) return;

      const contVariante = item.querySelector(".unidades-variante");
      if (contVariante){
        contVariante.querySelectorAll(".unidad-variante").forEach(bloque => {
          subtotal += Number(bloque.dataset.precioSeleccionado) || 0;
          if (bloque.querySelector(".check-mejora-chorizo-variante")?.checked){
            subtotal += 5000;
          }
        });
        if (item.dataset.tipo === "bandeja") unidadesEmpaque += cantidad;
        return;
      }

      let precio = 0;
      const tamanoSel = item.querySelector(".tamano");
      if (tamanoSel){
        precio = Number(tamanoSel.value) || 0;
      } else {
        precio = Number(cb.dataset.precio) || 0;
      }
      subtotal += precio * cantidad;

      const chorizosSeleccionados = item.querySelectorAll(".check-mejora-chorizo:checked").length;
      subtotal += 5000 * chorizosSeleccionados;

      if (item.dataset.tipo === "bandeja"){
        unidadesEmpaque += cantidad;
      }
    });

    const tipoEntrega = document.getElementById("tipoEntrega")?.value;
    let empaque = 0;
    if (tipoEntrega && tipoEntrega !== "Comer dentro del local"){
      empaque = unidadesEmpaque * 1500;
    }
    const total = subtotal + empaque;

    document.getElementById("total").innerText = "$" + total.toLocaleString("es-CO");
    document.getElementById("subtotalDisplay").innerText = "$" + subtotal.toLocaleString("es-CO");
    document.getElementById("empaqueDisplay").innerText = "$" + empaque.toLocaleString("es-CO");
    document.getElementById("totalDisplay").innerText = "$" + total.toLocaleString("es-CO");

    document.getElementById("totalPedido").value = total;
    document.getElementById("subtotalPedido").value = subtotal;
    document.getElementById("empaquePedido").value = empaque;
  }

  function toggleEntrega(){
    const tipo = document.getElementById("tipoEntrega").value;
    const direccionField = document.getElementById("direccionField");
    const mesaField = document.getElementById("mesaField");
    const costoDomicilio = document.getElementById("costoDomicilio");

    direccionField.style.display = "none";
    mesaField.style.display = "none";
    costoDomicilio.style.display = "none";

    if (tipo === "A domicilio"){
      direccionField.style.display = "block";
      costoDomicilio.style.display = "block";
      document.getElementById("direccion").required = true;
      document.getElementById("numeroMesa").required = false;
    } else if (tipo === "Comer dentro del local"){
      mesaField.style.display = "block";
      document.getElementById("numeroMesa").required = true;
      document.getElementById("direccion").required = false;
    } else {
      document.getElementById("direccion").required = false;
      document.getElementById("numeroMesa").required = false;
    }

    const opcionEfectivo = document.getElementById("opcionEfectivo");
    const tipoPagoSelect = document.getElementById("tipoPago");
    const permiteEfectivo = efectivoDisponibleAhora();
    opcionEfectivo.hidden = !permiteEfectivo;
    opcionEfectivo.disabled = !permiteEfectivo;
    if (!permiteEfectivo && tipoPagoSelect.value === "Efectivo"){
      tipoPagoSelect.value = "";
      toggleTipoPago();
    }

    calcularTotal();
  }

  function toggleTipoPago(){
    const tipo = document.getElementById("tipoPago").value;
    document.getElementById("efectivoField").style.display = (tipo === "Efectivo") ? "block" : "none";
    document.getElementById("avisoPagoParcial").style.display = tipo ? "block" : "none";
  }

  toggleEntrega();

  let enviando = false;

  document.getElementById("pedidoForm").addEventListener("submit", function(e){
    e.preventDefault();
    if (enviando) return;

    const platos = [];
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
      if (cantidad <= 0) return;

      const contVariante = item.querySelector(".unidades-variante");
      if (contVariante){
        const unidadesInfo = Array.from(contVariante.querySelectorAll(".unidad-variante")).map(bloque => {
          const radioMarcado = bloque.querySelector('input[type="radio"]:checked');
          const varianteId = radioMarcado ? radioMarcado.value : null;
          const variante = varianteId ? VARIANTES_ITEMS[bloque.dataset.itemKey].find(v => v.id === varianteId) : null;
          const guarniciones = Array.from(bloque.querySelectorAll(".guarnicion-variante")).map(s => s.value).filter(Boolean);
          const chorizoVariante = bloque.querySelector(".check-mejora-chorizo-variante")?.checked;
          const obs = bloque.querySelector(".observaciones-unidad")?.value.trim();
          const partes = [];
          if (variante) partes.push(variante.label);
          if (guarniciones.length) partes.push(`Guarnición: ${guarniciones.join(" + ")}`);
          if (chorizoVariante) partes.push("Chorizo artesanal (+$5.000)");
          if (obs) partes.push(`Obs: ${obs}`);
          return { clave: JSON.stringify(partes), partes };
        });

        const grupos = [];
        unidadesInfo.forEach(u => {
          const existente = grupos.find(g => g.clave === u.clave);
          if (existente) existente.cantidad++;
          else grupos.push({ clave: u.clave, partes: u.partes, cantidad: 1 });
        });

        grupos.forEach(g => {
          let linea = `• ${g.cantidad} × ${cb.value}`;
          if (g.partes.length) linea += ` (${g.partes.join(" - ")})`;
          platos.push(linea);
        });
        return;
      }

      let linea = `• ${cantidad} × ${cb.value}`;
      const tamanoSel = item.querySelector(".tamano");
      if (tamanoSel){
        const opcionTamano = tamanoSel.options[tamanoSel.selectedIndex];
        const textoTamano = opcionTamano.dataset.nombreCorto || opcionTamano.text;
        linea += ` (${textoTamano})`;
      }
      const saborSel = item.querySelector(".sabor");
      if (saborSel) linea += ` - Sabor: ${saborSel.value}`;
      const chorizoBoxes = [...item.querySelectorAll(".check-mejora-chorizo")];
      const chorizoCount = chorizoBoxes.filter(c => c.checked).length;
      if (chorizoCount > 0){
        linea += cantidad > 1
          ? ` — ${chorizoCount} de ${cantidad} con chorizo artesanal (+$5.000 c/u)`
          : ` + Chorizo artesanal (+$5.000)`;
      }
      const bloques = [...item.querySelectorAll(".combo-bloque")];
      if (bloques.length){
        const partes = bloques.map((b, i) => {
          const g = [...b.querySelectorAll(".guarnicion")].map(s => s.value).filter(Boolean).join(" + ");
          return bloques.length > 1 ? `Combo ${i + 1}: ${g}` : g;
        });
        linea += ` - Guarnición: ${partes.join(" | ")}`;
      }
      const obsSimple = item.querySelector(".observaciones-simple")?.value.trim();
      if (obsSimple) linea += ` - Obs: ${obsSimple}`;
      platos.push(linea);
    });

    if (platos.length === 0){
      alert("Por favor selecciona al menos un producto.");
      return;
    }

    let varianteFaltante = false;
    document.querySelectorAll(".unidades-variante .unidad-variante").forEach(bloque => {
      const radioMarcado = bloque.querySelector('input[type="radio"]:checked');
      if (!radioMarcado){ varianteFaltante = true; return; }
      const variante = VARIANTES_ITEMS[bloque.dataset.itemKey].find(v => v.id === radioMarcado.value);
      if (variante && variante.guarniciones){
        const selects = bloque.querySelectorAll(".guarnicion-variante");
        if ([...selects].some(s => !s.value)) varianteFaltante = true;
      }
    });
    if (varianteFaltante){
      alert("Por favor elige la opción (Solo/Combo) y la guarnición de cada plato antes de enviar.");
      return;
    }

    let guarnicionFaltante = false;
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
      if (cantidad <= 0) return;
      const wrap = item.querySelector(".guarnicion-wrap");
      if (wrap && wrap.style.display === "block"){
        const sels = item.querySelectorAll(".guarnicion");
        if (sels.length === 0 || [...sels].some(g => !g.value)) guarnicionFaltante = true;
      }
    });
    if (guarnicionFaltante){
      alert("Por favor elige la guarnición de cada combo antes de enviar el pedido.");
      return;
    }

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const tipoEntrega = document.getElementById("tipoEntrega").value;
    const direccion = document.getElementById("direccion").value;
    const numeroMesa = document.getElementById("numeroMesa").value;
    const tipoPago = document.getElementById("tipoPago").value;
    const efectivoMonto = document.getElementById("efectivoCliente").value;
    const especificaciones = document.getElementById("especificaciones").value;
    const subtotal = document.getElementById("subtotalDisplay").innerText;
    const empaque = document.getElementById("empaqueDisplay").innerText;
    const total = document.getElementById("total").innerText;

    let mensaje = `🛵 NUEVO PEDIDO\n\n`;
    mensaje += `👤 Nombre: ${nombre}\n`;
    mensaje += `📞 WhatsApp: ${telefono}\n\n`;
    mensaje += `🍽️ *Pedido:*\n${platos.join("\n\n")}\n\n`;
    mensaje += `📦 Entrega: ${tipoEntrega}\n`;
    if (tipoEntrega === "A domicilio" && direccion) mensaje += `📍 Dirección: ${direccion} (domicilio a coordinar por WhatsApp)\n`;
    if (tipoEntrega === "Comer dentro del local" && numeroMesa) mensaje += `🔢 Mesa: ${numeroMesa}\n`;
    mensaje += `💰 Pago: ${tipoPago}\n`;
    if (tipoPago === "Efectivo" && efectivoMonto) mensaje += `💵 Paga con: ${efectivoMonto}\n`;
    if (especificaciones) mensaje += `📒 Especificaciones: ${especificaciones}\n`;

    const empaqueValor = Number(document.getElementById("empaquePedido").value) || 0;
    if (empaqueValor > 0){
      mensaje += `\nSubtotal: ${subtotal}`;
      mensaje += `\nCosto de empaque: ${empaque}`;
    }
    mensaje += `\n💸 *Total: ${total}*`;

    // ===== Registro en Google Sheets (silencioso, no bloquea el envío a WhatsApp) =====
    const datosPedido = new URLSearchParams();
    datosPedido.append('entry.1010418838', nombre);
    datosPedido.append('entry.918253492', telefono);
    datosPedido.append('entry.978353877', platos.join("\n"));
    datosPedido.append('entry.1807804644', tipoEntrega);
    datosPedido.append('entry.1988956583', direccion || numeroMesa || '');
    datosPedido.append('entry.521689781', tipoPago);
    datosPedido.append('entry.720280543', especificaciones || '');
    datosPedido.append('entry.856852556', document.getElementById("subtotalPedido").value);
    datosPedido.append('entry.2008181289', document.getElementById("empaquePedido").value);
    datosPedido.append('entry.861860538', document.getElementById("totalPedido").value);

    const urlFormulario = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScvb1-6YGHaLol6SshDqVPVm8zu25T2e_XUsItnUiH_0m0Hzg/formResponse';

    const urlWhatsApp = "https://wa.me/" + obtenerNumeroWhatsApp() + "?text=" + encodeURIComponent(mensaje);
    let redirigido = false;
    const irAWhatsApp = () => { if (redirigido) return; redirigido = true; window.location.href = urlWhatsApp; };

    fetch(urlFormulario, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: datosPedido.toString()
    }).catch(() => {
      if (navigator.sendBeacon){
        navigator.sendBeacon(urlFormulario, datosPedido);
      }
    }).finally(irAWhatsApp);

    const btn = document.querySelector(".btn");
    btn.disabled = true;
    enviando = true;
    setTimeout(() => { btn.disabled = false; enviando = false; }, 5000);

    setTimeout(irAWhatsApp, 1500);
  });