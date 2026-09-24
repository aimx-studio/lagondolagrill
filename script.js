const NUMERO_WHATSAPP_MEDIODIA = "573102730055"; // 11:45am - 4:00pm
const NUMERO_WHATSAPP_TARDE = "573114667501"; // 4:00pm - 12:00am

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

  function elegirSeccion(tipo){
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

  function volverLanding(){
    document.getElementById("menuContent").style.display = "none";
    document.getElementById("landingScreen").style.display = "block";
    window.scrollTo(0,0);
  }

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
    calcularTotal();
  }

  function toggleTipoPago(){
    const tipo = document.getElementById("tipoPago").value;
    document.getElementById("efectivoField").style.display = (tipo === "Efectivo") ? "block" : "none";
    document.getElementById("avisoPagoParcial").style.display = tipo ? "block" : "none";
  }

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
      let linea = `- ${cb.value} x${cantidad}`;
      const tamanoSel = item.querySelector(".tamano");
      if (tamanoSel) linea += ` (${tamanoSel.options[tamanoSel.selectedIndex].text})`;
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
      platos.push(linea);
    });

    if (platos.length === 0){
      alert("Por favor selecciona al menos un producto.");
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

    let mensaje = `🛵 *NUEVO PEDIDO - LA GÓNDOLA GRILL*\n\n`;
    mensaje += `👤 Nombre: ${nombre}\n`;
    mensaje += `📞 WhatsApp: ${telefono}\n\n`;
    mensaje += `🍽️ *Pedido:*\n${platos.join("\n")}\n\n`;
    mensaje += `📦 Entrega: ${tipoEntrega}\n`;
    if (tipoEntrega === "A domicilio" && direccion) mensaje += `📍 Dirección: ${direccion} (domicilio a coordinar por WhatsApp)\n`;
    if (tipoEntrega === "Comer dentro del local" && numeroMesa) mensaje += `🔢 Mesa: ${numeroMesa}\n`;
    mensaje += `💰 Pago: ${tipoPago}\n`;
    if (tipoPago === "Efectivo" && efectivoMonto) mensaje += `💵 Paga con: ${efectivoMonto}\n`;
    if (especificaciones) mensaje += `📒 Especificaciones: ${especificaciones}\n`;
    mensaje += `\nSubtotal: ${subtotal}`;
    mensaje += `\nCosto de empaque: ${empaque}`;
    mensaje += `\n💸 *Total: ${total}*`;

    // ===== Registro en Google Sheets (silencioso, no bloquea el envío a WhatsApp) =====
    const formData = new FormData();
    formData.append('entry.1010418838', nombre);
    formData.append('entry.918253492', telefono);
    formData.append('entry.978353877', platos.join("\n"));
    formData.append('entry.1807804644', tipoEntrega);
    formData.append('entry.1988956583', direccion || numeroMesa || '');
    formData.append('entry.521689781', tipoPago);
    formData.append('entry.720280543', especificaciones || '');
    formData.append('entry.856852556', document.getElementById("subtotalPedido").value);
    formData.append('entry.2008181289', document.getElementById("empaquePedido").value);
    formData.append('entry.861860538', document.getElementById("totalPedido").value);

    fetch('https://docs.google.com/forms/u/0/d/e/1FAIpQLScvb1-6YGHaLol6SshDqVPVm8zu25T2e_XUsItnUiH_0m0Hzg/formResponse', {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });

    const btn = document.querySelector(".btn");
    btn.disabled = true;
    enviando = true;
    setTimeout(() => { btn.disabled = false; enviando = false; }, 5000);

    window.location.href = "https://wa.me/" + obtenerNumeroWhatsApp() + "?text=" + encodeURIComponent(mensaje);
  });