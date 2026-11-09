/* ==========================================================================
   MORENAS FOOD · Lógica de la interfaz
   Menú dinámico, carrito persistente, pedidos y validación de formularios.
   ========================================================================== */

(() => {
  'use strict';

  const RESTAURANT_PHONE = '59171234567';
  const RESTAURANT_PHONE_DISPLAY = '+591 712 345 67';
  const DELIVERY_FEE = 8;
  const FREE_DELIVERY_MIN = 80;
  const CART_KEY = 'morenasFood.cart.v1';
  const FAVORITES_KEY = 'morenasFood.favorites.v1';
  const NEWSLETTER_KEY = 'morenasFood.newsletter.v1';
  const TIME_ZONE = 'America/La_Paz';
  const OPENING_MINUTES = 11 * 60 + 30;
  const CLOSING_MINUTES = 22 * 60 + 30;

  const menuItems = [
    {
      id: 'sajta-pacena',
      name: 'Sajta Paceña',
      category: 'pacenos',
      categoryLabel: 'Paceño',
      price: 25,
      rating: 4.9,
      badge: 'El más pedido',
      badgeClass: '',
      description: 'Pollo bañado en ají colorado, arroz, papa y tunta. El pique paceño que buscabas.',
      image: 'sajta-pacena.jpg',
      time: '20 min'
    },
    {
      id: 'silpancho',
      name: 'Silpancho Especial',
      category: 'pacenos',
      categoryLabel: 'Clásico boliviano',
      price: 28,
      rating: 4.8,
      badge: 'Favorito de la casa',
      badgeClass: 'dish-badge--orange',
      description: 'Filete empanizado, arroz, papa dorada, huevo frito y salsa criolla. Contundente y feliz.',
      image: 'silpancho.jpg',
      time: '20 min'
    },
    {
      id: 'milanesa',
      name: 'Milanesa de Res',
      category: 'pacenos',
      categoryLabel: 'Bien servido',
      price: 27,
      rating: 4.7,
      badge: '',
      badgeClass: '',
      description: 'Milanesa de res bien crocante con papas, arroz, ensalada y limón. Un clásico que no falla.',
      image: 'milanesa.jpg',
      time: '20 min'
    },
    {
      id: 'pollo-dorado',
      name: 'Pollo Dorado',
      category: 'pollo',
      categoryLabel: 'Pollo',
      price: 30,
      rating: 4.8,
      badge: 'Recién hecho',
      badgeClass: 'dish-badge--orange',
      description: 'Cuarto de pollo dorado y jugoso, papas fritas, arroz y salsa de la casa.',
      image: 'pollo-dorado.jpg',
      time: '22 min'
    },
    {
      id: 'pollo-broaster',
      name: 'Pollo a la Broaster',
      category: 'pollo',
      categoryLabel: 'Pollo',
      price: 32,
      rating: 4.9,
      badge: 'Crujiente total',
      badgeClass: 'dish-badge--green',
      description: 'Presas marinadas y fritas al momento, con papas y dip especial. Crunch garantizado.',
      image: 'pollo-broaster.jpg',
      time: '25 min'
    },
    {
      id: 'caldo-de-pollo',
      name: 'Caldo de Pollo',
      category: 'caldos',
      categoryLabel: 'Reconfortante',
      price: 18,
      rating: 4.7,
      badge: '',
      badgeClass: '',
      description: 'Caldo de pollo con fideos, papa, verduras y hierbas frescas. Un abrazo en taza.',
      image: 'caldo-de-pollo.jpg',
      time: '15 min'
    },
    {
      id: 'chicharron-paceno',
      name: 'Chicharrón Paceño',
      category: 'pacenos',
      categoryLabel: 'Tradicional',
      price: 30,
      rating: 4.8,
      badge: 'Tradición',
      badgeClass: 'dish-badge--green',
      description: 'Chicharrón de cerdo crocante con mote, papa y salsa de ají. Sabor de feria, bien servido.',
      image: 'chicharron-paceno.jpg',
      time: '20 min'
    },
    {
      id: 'saltena',
      name: 'Salteña de Pollo',
      category: 'picar',
      categoryLabel: 'Para picar',
      price: 8,
      rating: 4.8,
      badge: '',
      badgeClass: '',
      description: 'Salteña jugosa de pollo, recién horneada. Para abrir el apetito o repetir.',
      image: 'saltena.jpg',
      time: '10 min'
    },
    {
      id: 'combo-morenas',
      name: 'Combo Morenas',
      category: 'combos',
      categoryLabel: 'Para compartir',
      price: 89,
      rating: 4.9,
      badge: 'Ahorra Bs 12',
      badgeClass: 'dish-badge--green',
      description: '8 presas de pollo, papas, arroz, ensalada y 4 refrescos. Ideal para compartir (o no).',
      image: 'combo-morenas.jpg',
      time: '30 min'
    }
  ];

  const occasionLabels = {
    cumpleanos: 'Cumpleaños',
    aniversario: 'Aniversario',
    familia: 'Reunión familiar',
    trabajo: 'Almuerzo de trabajo',
    otro: 'Otro motivo'
  };

  const zoneOptions = [
    'Sopocachi', 'Centro', 'Miraflores', 'San Jorge', 'San Miguel',
    'Obrajes', 'Calacoto', 'Villa Fátima', 'El Alto', 'Otra zona'
  ];

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const moneyFormatter = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const formatMoney = (value) => `Bs ${moneyFormatter.format(value)}`;
  const normalize = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
  const capitalize = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  const encode = encodeURIComponent;

  function safeStorageGet(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* El carrito sigue funcionando durante la sesión aunque el navegador
         tenga el almacenamiento bloqueado. */
    }
  }

  function loadCart() {
    const saved = safeStorageGet(CART_KEY, []);
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((entry) => entry && typeof entry.id === 'string' && Number.isInteger(entry.qty))
      .map((entry) => ({
        id: entry.id,
        qty: Math.min(30, Math.max(1, entry.qty))
      }))
      .filter((entry) => menuItems.some((item) => item.id === entry.id));
  }

  function loadFavorites() {
    const saved = safeStorageGet(FAVORITES_KEY, []);
    const validIds = new Set(menuItems.map((item) => item.id));
    return new Set(Array.isArray(saved) ? saved.filter((id) => validIds.has(id)) : []);
  }

  const state = {
    filter: 'todos',
    search: '',
    cart: loadCart(),
    favorites: loadFavorites()
  };

  const getItem = (id) => menuItems.find((item) => item.id === id);
  const getCartDetails = () => state.cart
    .map((entry) => ({ ...entry, item: getItem(entry.id) }))
    .filter((entry) => entry.item);
  const getCartCount = () => state.cart.reduce((sum, entry) => sum + entry.qty, 0);
  const getSubtotal = () => getCartDetails().reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);

  function saveCart() {
    safeStorageSet(CART_KEY, state.cart);
  }

  function saveFavorites() {
    safeStorageSet(FAVORITES_KEY, [...state.favorites]);
  }

  function getLaPazNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date()).reduce((result, part) => {
      if (part.type !== 'literal') result[part.type] = part.value;
      return result;
    }, {});

    const hour = Number(parts.hour);
    const minute = Number(parts.minute);
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      minutes: hour * 60 + minute,
      label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    };
  }

  function addDaysToIso(isoDate, days) {
    const date = new Date(`${isoDate}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function formatDateLong(isoDate) {
    if (!isoDate) return '';
    try {
      return capitalize(new Intl.DateTimeFormat('es-BO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(`${isoDate}T12:00:00`)));
    } catch (error) {
      return isoDate;
    }
  }

  function whatsappUrl(message) {
    return `https://wa.me/${RESTAURANT_PHONE}?text=${encode(message)}`;
  }

  function getFirstName(name) {
    return String(name || '').trim().split(/\s+/)[0] || 'moreno';
  }

  function getDeliveryMethod() {
    return $('input[name="deliveryMethod"]:checked')?.value || 'delivery';
  }

  function getPaymentMethod() {
    return $('input[name="paymentMethod"]:checked')?.value || '';
  }

  function getCheckoutTotals() {
    const subtotal = getSubtotal();
    const method = getDeliveryMethod();
    const delivery = method === 'delivery' && subtotal < FREE_DELIVERY_MIN && subtotal > 0 ? DELIVERY_FEE : 0;
    return { subtotal, delivery, total: subtotal + delivery, method };
  }

  // -------------------------------------------------------------------------
  // Toasts
  // -------------------------------------------------------------------------

  function showToast(message, type = 'success', action = null) {
    const stack = $('#toastStack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = `site-toast site-toast--${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `
      <span class="site-toast__icon" aria-hidden="true"><i class="bi bi-${type === 'error' ? 'exclamation-lg' : 'check-lg'}"></i></span>
      <p>${escapeHtml(message)}</p>
    `;

    if (action) {
      const actionButton = document.createElement('button');
      actionButton.type = 'button';
      actionButton.textContent = action.label;
      actionButton.addEventListener('click', () => {
        action.onClick();
        dismissToast();
      });
      toast.append(actionButton);
    }

    stack.append(toast);
    window.requestAnimationFrame(() => toast.classList.add('show'));

    const timeout = window.setTimeout(dismissToast, 3800);
    function dismissToast() {
      window.clearTimeout(timeout);
      toast.classList.remove('show');
      window.setTimeout(() => toast.remove(), 280);
    }
  }

  // -------------------------------------------------------------------------
  // Estado de apertura
  // -------------------------------------------------------------------------

  function updateOpenStatus() {
    const now = getLaPazNow();
    const isOpen = now.minutes >= OPENING_MINUTES && now.minutes < CLOSING_MINUTES;
    $$('.js-open-status').forEach((status) => {
      status.classList.toggle('is-closed', !isOpen);
    });
    $$('[data-open-text]').forEach((label) => {
      label.textContent = isOpen ? 'Abierto ahora' : 'Cerrado · abre 11:30';
    });
    $$('.js-open-status').forEach((status) => {
      status.setAttribute('title', isOpen ? 'Atendemos hasta las 22:30' : 'Abrimos todos los días a las 11:30');
    });
  }

  // -------------------------------------------------------------------------
  // Menú dinámico
  // -------------------------------------------------------------------------

  function menuCard(item, index) {
    const isFavorite = state.favorites.has(item.id);
    return `
      <div class="col-md-6 col-lg-4">
        <article class="dish-card" style="--card-index:${index}" data-dish-id="${item.id}">
          <div class="dish-media">
            <img src="${item.image}" alt="${escapeHtml(item.name)} de Morenas Food" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
            ${item.badge ? `<span class="dish-badge ${item.badgeClass}">${escapeHtml(item.badge)}</span>` : ''}
            <button class="dish-favorite ${isFavorite ? 'is-fav' : ''}" type="button" data-favorite-id="${item.id}" aria-label="${isFavorite ? 'Quitar' : 'Agregar'} ${escapeHtml(item.name)} de favoritos" aria-pressed="${isFavorite}">
              <i class="bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>
            </button>
            <span class="dish-time"><i class="bi bi-clock" aria-hidden="true"></i> ${escapeHtml(item.time)}</span>
          </div>
          <div class="dish-body">
            <div class="dish-meta">
              <span>${escapeHtml(item.categoryLabel)}</span>
              <span class="dish-meta__right"><i class="bi bi-star-fill" aria-hidden="true"></i> ${item.rating.toFixed(1)}</span>
            </div>
            <h3 class="dish-title">${escapeHtml(item.name)}</h3>
            <p class="dish-desc">${escapeHtml(item.description)}</p>
            <div class="dish-footer">
              <span class="dish-price"><small>Precio</small><strong>${formatMoney(item.price)}</strong></span>
              <button class="dish-add" type="button" data-add-id="${item.id}" aria-label="Agregar ${escapeHtml(item.name)} al pedido">
                Agregar <i class="bi bi-plus-lg" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function getFilteredItems() {
    let items = [...menuItems];
    if (state.filter === 'favoritos') {
      items = items.filter((item) => state.favorites.has(item.id));
    } else if (state.filter !== 'todos') {
      items = items.filter((item) => item.category === state.filter);
    }

    if (state.search) {
      const query = normalize(state.search);
      items = items.filter((item) => normalize(`${item.name} ${item.description} ${item.categoryLabel}`).includes(query));
    }

    return items;
  }

  function renderMenu() {
    const grid = $('#menuGrid');
    const empty = $('#menuEmpty');
    const results = $('#menuResults');
    const clearSearch = $('#clearSearch');
    if (!grid) return;

    const filtered = getFilteredItems();
    grid.innerHTML = filtered.map(menuCard).join('');
    empty.hidden = filtered.length > 0;
    clearSearch.hidden = state.search.length === 0;

    const favoritesEmpty = state.filter === 'favoritos' && filtered.length === 0;
    const emptyTitle = empty.querySelector('h3');
    const emptyText = empty.querySelector('p');
    if (favoritesEmpty) {
      emptyTitle.textContent = 'Todavía no tienes favoritos';
      emptyText.textContent = 'Toca el corazón de ese plato que te llama. Lo guardamos aquí para tu próximo antojo.';
    } else {
      emptyTitle.textContent = 'No encontramos ese antojo';
      emptyText.textContent = 'Prueba con otra palabra o revisa las categorías. Seguro algo rico te espera.';
    }

    if (filtered.length === 0) {
      results.textContent = favoritesEmpty ? 'Sin favoritos por ahora' : 'Sin resultados';
    } else {
      results.textContent = `${filtered.length} ${filtered.length === 1 ? 'plato' : 'platos'} para elegir`;
    }

    $$('.filter-chip', $('#menuFilters')).forEach((button) => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setFilter(filter) {
    state.filter = filter;
    renderMenu();
  }

  function toggleFavorite(id) {
    const item = getItem(id);
    if (!item) return;

    if (state.favorites.has(id)) {
      state.favorites.delete(id);
      showToast(`${item.name} salió de tus favoritos.`, 'success');
    } else {
      state.favorites.add(id);
      showToast(`${item.name} guardado en tus favoritos.`, 'success');
    }

    saveFavorites();
    renderMenu();
  }

  // -------------------------------------------------------------------------
  // Carrito
  // -------------------------------------------------------------------------

  function addToCart(id) {
    const item = getItem(id);
    if (!item) return;

    const existing = state.cart.find((entry) => entry.id === id);
    if (existing) {
      existing.qty = Math.min(30, existing.qty + 1);
    } else {
      state.cart.push({ id, qty: 1 });
    }

    saveCart();
    renderCart();
    showToast(`${item.name} se sumó a tu pedido.`, 'success', { label: 'Ver pedido', onClick: openCart });
  }

  function changeCartQuantity(id, delta) {
    const entry = state.cart.find((cartEntry) => cartEntry.id === id);
    if (!entry) return;
    entry.qty = Math.min(30, Math.max(1, entry.qty + delta));
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    const index = state.cart.findIndex((entry) => entry.id === id);
    if (index === -1) return;

    const item = getItem(id);
    const quantity = state.cart[index].qty;
    state.cart.splice(index, 1);
    saveCart();
    renderCart();

    showToast(`${item ? item.name : 'El producto'} salió de tu pedido.`, 'success', {
      label: 'Deshacer',
      onClick: () => {
        state.cart.push({ id, qty: quantity });
        saveCart();
        renderCart();
      }
    });
  }

  function renderCart() {
    const empty = $('#cartEmpty');
    const content = $('#cartContent');
    const footer = $('#cartFooter');
    const itemsContainer = $('#cartItems');
    const subtotalLabel = $('#cartSubtotal');
    if (!itemsContainer) return;

    const totalQuantity = getCartCount();
    const details = getCartDetails();
    const subtotal = details.reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);
    $$('[data-cart-count]').forEach((badge) => { badge.textContent = totalQuantity; });

    if (details.length === 0) {
      empty.hidden = false;
      content.hidden = true;
      footer.hidden = true;
    } else {
      empty.hidden = true;
      content.hidden = false;
      footer.hidden = false;

      itemsContainer.innerHTML = details.map(({ item, qty }) => `
        <li class="cart-item" data-cart-id="${item.id}">
          <img class="cart-item__image" src="${item.image}" alt="" width="70" height="70">
          <div class="cart-item__info">
            <h3>${escapeHtml(item.name)}</h3>
            <span>${formatMoney(item.price)} c/u</span>
            <div class="cart-item__bottom">
              <div class="qty-control" role="group" aria-label="Cantidad de ${escapeHtml(item.name)}">
                <button type="button" data-cart-action="decrease" aria-label="Quitar una unidad de ${escapeHtml(item.name)}" ${qty <= 1 ? 'disabled' : ''}><i class="bi bi-dash-lg" aria-hidden="true"></i></button>
                <span aria-live="polite">${qty}</span>
                <button type="button" data-cart-action="increase" aria-label="Agregar una unidad de ${escapeHtml(item.name)}" ${qty >= 30 ? 'disabled' : ''}><i class="bi bi-plus-lg" aria-hidden="true"></i></button>
              </div>
            </div>
          </div>
          <div class="cart-item__side">
            <span class="cart-item__price">${formatMoney(item.price * qty)}</span>
            <button class="cart-item__remove" type="button" data-cart-action="remove" aria-label="Quitar ${escapeHtml(item.name)} del pedido"><i class="bi bi-trash3" aria-hidden="true"></i></button>
          </div>
        </li>
      `).join('');
    }

    if (subtotalLabel) subtotalLabel.textContent = formatMoney(subtotal);
    updateDeliveryProgress(subtotal);
    updateCheckoutSummary();
  }

  function updateDeliveryProgress(subtotal) {
    const box = $('#freeDeliveryBox');
    const text = $('#freeDeliveryText');
    const bar = $('#freeDeliveryBar');
    if (!box || !text || !bar) return;

    const isFree = subtotal >= FREE_DELIVERY_MIN;
    box.classList.toggle('is-free', isFree);
    bar.style.width = `${Math.min(100, (subtotal / FREE_DELIVERY_MIN) * 100)}%`;
    text.textContent = isFree
      ? '¡Listo! Tu pedido tiene delivery gratis.'
      : `Agrega ${formatMoney(FREE_DELIVERY_MIN - subtotal)} más y el delivery va por nuestra cuenta.`;
  }

  function openCart() {
    if (!window.bootstrap) return;
    const drawer = $('#cartDrawer');
    window.bootstrap.Offcanvas.getOrCreateInstance(drawer).show();
  }

  // -------------------------------------------------------------------------
  // Validaciones de formularios
  // -------------------------------------------------------------------------

  const validResult = () => ({ valid: true, message: '' });
  const invalidResult = (message) => ({ valid: false, message });

  const validationRules = {
    name(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return invalidResult('Escribe tu nombre completo.');
      if (trimmed.length < 3) return invalidResult('El nombre debe tener al menos 3 caracteres.');
      if (trimmed.length > 60) return invalidResult('El nombre no puede superar los 60 caracteres.');
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ .'-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/.test(trimmed)) {
        return invalidResult('Usa solo letras, espacios, puntos o guiones.');
      }
      return validResult();
    },

    phone(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return invalidResult('Ingresa tu número de celular.');
      if (!/^\d+$/.test(trimmed)) return invalidResult('El celular debe contener solo números.');
      if (trimmed.length !== 8) return invalidResult('El celular debe tener exactamente 8 dígitos.');
      if (!/^[67]/.test(trimmed)) return invalidResult('El celular debe empezar con 6 o 7.');
      return validResult();
    },

    email(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return invalidResult('Ingresa tu correo electrónico.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trimmed)) return invalidResult('Ingresa un correo válido, por ejemplo ana@correo.com.');
      if (trimmed.length > 100) return invalidResult('El correo es demasiado largo.');
      return validResult();
    },

    notes(value, field) {
      const maximum = Number(field?.maxLength) || 200;
      if (String(value).length > maximum) return invalidResult(`Los comentarios no pueden superar los ${maximum} caracteres.`);
      return validResult();
    },

    reservationDate(value) {
      if (!value) return invalidResult('Elige la fecha de tu reserva.');
      const today = getLaPazNow().date;
      const maximumDate = addDaysToIso(today, 90);
      const selected = new Date(`${value}T12:00:00`);
      if (Number.isNaN(selected.getTime())) return invalidResult('Elige una fecha válida.');
      if (value < today) return invalidResult('La fecha ya pasó. Elige hoy o un día próximo.');
      if (value > maximumDate) return invalidResult('Solo aceptamos reservas con hasta 90 días de anticipación.');
      return validResult();
    },

    reservationTime(value) {
      if (!value) return invalidResult('Elige la hora de tu reserva.');
      const select = $('#resTime');
      const option = select ? [...select.options].find((item) => item.value === value) : null;
      if (!option || option.disabled) return invalidResult('Elige un horario disponible dentro de nuestra atención.');
      const selectedDate = $('#resDate')?.value;
      const now = getLaPazNow();
      if (selectedDate === now.date) {
        const [hours, minutes] = value.split(':').map(Number);
        const selectedMinutes = hours * 60 + minutes;
        if (selectedMinutes < now.minutes + 30) {
          return invalidResult('Elige una hora con al menos 30 minutos de anticipación.');
        }
      }
      return validResult();
    },

    people(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return invalidResult('Indica cuántas personas vendrán.');
      if (!/^\d+$/.test(trimmed)) return invalidResult('El número de personas debe ser un número entero.');
      const count = Number(trimmed);
      if (count < 1) return invalidResult('Debe haber al menos una persona.');
      if (count > 12) return invalidResult('Para más de 12 personas, escríbenos por WhatsApp.');
      return validResult();
    },

    occasion(value) {
      if (!value) return validResult();
      if (!Object.prototype.hasOwnProperty.call(occasionLabels, value)) {
        return invalidResult('Selecciona una ocasión válida.');
      }
      return validResult();
    },

    address(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return invalidResult('Escribe la dirección de entrega.');
      if (trimmed.length < 5) return invalidResult('Agrega más detalle: calle, número y referencia.');
      if (trimmed.length > 120) return invalidResult('La dirección no puede superar los 120 caracteres.');
      return validResult();
    },

    zone(value) {
      if (!value) return invalidResult('Elige tu zona de entrega.');
      if (!zoneOptions.includes(value)) return invalidResult('Elige una zona disponible en la lista.');
      return validResult();
    },

    terms(value, field) {
      return field?.checked ? validResult() : invalidResult('Debes aceptar para continuar.');
    },

    deliveryMethod(value) {
      if (!value) return invalidResult('Elige cómo quieres recibir tu pedido.');
      if (!['delivery', 'pickup'].includes(value)) return invalidResult('Elige un tipo de entrega válido.');
      return validResult();
    },

    paymentMethod(value) {
      if (!value) return invalidResult('Elige una forma de pago.');
      if (!['Efectivo', 'QR simple', 'Transferencia'].includes(value)) return invalidResult('Elige una forma de pago válida.');
      return validResult();
    }
  };

  function errorElementFor(field) {
    return document.getElementById(`err-${field.id}`);
  }

  function setFieldFeedback(field, result) {
    const hasValue = field.type === 'checkbox'
      ? field.checked
      : String(field.value).trim().length > 0;
    field.classList.toggle('is-invalid', !result.valid);
    field.classList.toggle('is-valid', result.valid && hasValue && field.type !== 'checkbox');
    field.setAttribute('aria-invalid', String(!result.valid));
    const error = errorElementFor(field);
    if (error) error.textContent = result.valid ? '' : result.message;
  }

  function validateField(field) {
    if (!field || field.disabled) return true;
    const rule = validationRules[field.dataset.rule];
    if (!rule) return true;
    const value = field.type === 'checkbox' ? (field.checked ? 'on' : '') : field.value;
    const result = rule(value, field);
    setFieldFeedback(field, result);
    return result.valid;
  }

  function groupErrorElement(group) {
    return group.querySelector('.field-error');
  }

  function validateGroup(group) {
    const rule = validationRules[group.dataset.rule];
    if (!rule) return true;
    const checked = group.querySelector('input[type="radio"]:checked');
    const result = rule(checked ? checked.value : '');
    group.classList.toggle('is-invalid', !result.valid);
    group.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.setAttribute('aria-invalid', String(!result.valid));
    });
    const error = groupErrorElement(group);
    if (error) error.textContent = result.valid ? '' : result.message;
    return result.valid;
  }

  function validateForm(form) {
    if (!form) return false;
    let isValid = true;
    let firstInvalid = null;

    $$('[data-rule]', form).forEach((field) => {
      if (field.tagName === 'FIELDSET' || field.type === 'radio' || field.disabled) return;
      if (field.closest('[hidden]')) return;
      field.dataset.touched = 'true';
      if (!validateField(field)) {
        isValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    $$('fieldset[data-rule]', form).forEach((group) => {
      if (group.closest('[hidden]')) return;
      if (!validateGroup(group)) {
        isValid = false;
        if (!firstInvalid) firstInvalid = group.querySelector('input[type="radio"]') || group;
      }
    });

    if (!isValid && firstInvalid) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.requestAnimationFrame(() => {
        firstInvalid.focus({ preventScroll: true });
        const target = firstInvalid.closest('.field, .fieldset-choice') || firstInvalid;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    }

    return isValid;
  }

  function clearFormErrors(form) {
    if (!form) return;
    $$('.is-invalid, .is-valid', form).forEach((field) => field.classList.remove('is-invalid', 'is-valid'));
    $$('.field-error', form).forEach((error) => { error.textContent = ''; });
    $$('[aria-invalid]', form).forEach((field) => field.setAttribute('aria-invalid', 'false'));
    $$('[data-touched]', form).forEach((field) => delete field.dataset.touched);
  }

  function initializeFormValidation(form) {
    if (!form) return;

    $$('[data-rule]', form).forEach((field) => {
      if (field.tagName === 'FIELDSET' || field.type === 'radio') return;

      if (field.type === 'checkbox') {
        field.addEventListener('change', () => {
          field.dataset.touched = 'true';
          validateField(field);
        });
        return;
      }

      field.addEventListener('blur', () => {
        field.dataset.touched = 'true';
        validateField(field);
      });
      field.addEventListener('input', () => {
        if (field.dataset.touched === 'true' || field.classList.contains('is-invalid')) validateField(field);
      });
      field.addEventListener('change', () => {
        field.dataset.touched = 'true';
        validateField(field);
      });
    });

    $$('fieldset[data-rule]', form).forEach((group) => {
      group.addEventListener('change', () => validateGroup(group));
    });
  }

  function setupPhoneInputs() {
    $$('.js-phone').forEach((input) => {
      input.addEventListener('input', () => {
        const digits = input.value.replace(/\D/g, '').slice(0, 8);
        if (input.value !== digits) input.value = digits;
      });
      input.addEventListener('paste', () => {
        window.setTimeout(() => {
          input.value = input.value.replace(/\D/g, '').slice(0, 8);
        }, 0);
      });
    });
  }

  function setupCharacterCounters() {
    $$('[data-counter-for]').forEach((field) => {
      const counter = document.getElementById(`${field.id}Count`);
      if (!counter) return;
      const maximum = field.maxLength || 200;
      const update = () => { counter.textContent = `${field.value.length}/${maximum}`; };
      update();
      field.addEventListener('input', update);
    });
  }

  // -------------------------------------------------------------------------
  // Checkout
  // -------------------------------------------------------------------------

  function syncDeliveryFields() {
    const deliveryFields = $('#deliveryFields');
    const zone = $('#coZone');
    const address = $('#coAddress');
    if (!deliveryFields || !zone || !address) return;

    const isDelivery = getDeliveryMethod() === 'delivery';
    deliveryFields.hidden = !isDelivery;
    zone.disabled = !isDelivery;
    address.disabled = !isDelivery;
    zone.required = isDelivery;
    address.required = isDelivery;

    if (!isDelivery) {
      zone.value = '';
      address.value = '';
      setFieldFeedback(zone, validResult());
      setFieldFeedback(address, validResult());
    }

    updateCheckoutSummary();
  }

  function updateCheckoutSummary() {
    const itemsContainer = $('#summaryItems');
    if (!itemsContainer) return;

    const details = getCartDetails();
    const totals = getCheckoutTotals();

    itemsContainer.innerHTML = details.map(({ item, qty }) => `
      <li class="summary-item">
        <span><em>${qty}×</em> ${escapeHtml(item.name)}</span>
        <strong>${formatMoney(item.price * qty)}</strong>
      </li>
    `).join('');

    const subtotal = $('#sumSubtotal');
    const delivery = $('#sumDelivery');
    const total = $('#sumTotal');
    const eta = $('#sumEta');
    const confirmTotal = $('#confirmOrderTotal');
    const method = getDeliveryMethod();

    if (subtotal) subtotal.textContent = formatMoney(totals.subtotal);
    if (delivery) delivery.textContent = totals.delivery === 0 ? 'Gratis' : formatMoney(totals.delivery);
    if (total) total.textContent = formatMoney(totals.total);
    if (eta) eta.textContent = method === 'pickup' ? '20–30 min' : '30–45 min';
    if (confirmTotal) confirmTotal.textContent = formatMoney(totals.total);
  }

  function openCheckout() {
    if (!state.cart.length) {
      showToast('Tu bolsa está vacía. Agrega algo rico antes de continuar.', 'error');
      return;
    }
    if (!window.bootstrap) return;

    const drawer = $('#cartDrawer');
    const checkoutModalElement = $('#checkoutModal');
    if (!drawer || !checkoutModalElement) return;

    updateCheckoutSummary();
    syncDeliveryFields();
    const checkoutModal = window.bootstrap.Modal.getOrCreateInstance(checkoutModalElement);
    const drawerInstance = window.bootstrap.Offcanvas.getOrCreateInstance(drawer);

    if (!drawer.classList.contains('show')) {
      checkoutModal.show();
      return;
    }

    const showCheckout = () => {
      drawer.removeEventListener('hidden.bs.offcanvas', showCheckout);
      checkoutModal.show();
    };
    drawer.addEventListener('hidden.bs.offcanvas', showCheckout);
    drawerInstance.hide();
  }

  function generateOrderNumber() {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `MF-${suffix}`;
  }

  function buildOrderWhatsappMessage(order) {
    const lines = [
      'Hola Morenas Food, quiero confirmar mi pedido:',
      `N.º de pedido: ${order.number}`,
      '',
      ...order.items.map((entry) => `${entry.qty} × ${entry.item.name} — ${formatMoney(entry.item.price * entry.qty)}`),
      '',
      `Subtotal: ${formatMoney(order.subtotal)}`,
      `Delivery: ${order.delivery === 0 ? 'Gratis' : formatMoney(order.delivery)}`,
      `Total: ${formatMoney(order.total)}`,
      '',
      `Nombre: ${order.name}`,
      `Celular: +591 ${order.phone}`,
      `Correo: ${order.email}`,
      `Entrega: ${order.method === 'delivery' ? `Delivery — ${order.zone}, ${order.address}` : 'Recojo en tienda'}`,
      `Pago: ${order.payment}`,
      order.notes ? `Comentarios: ${order.notes}` : '',
      '',
      '¡Gracias!'
    ];
    return whatsappUrl(lines.filter((line) => line !== null).join('\n'));
  }

  function resetCheckoutForm() {
    const form = $('#checkoutForm');
    if (!form) return;
    form.reset();
    clearFormErrors(form);
    syncDeliveryFields();
    $$('[data-counter-for]', form).forEach((field) => {
      const counter = document.getElementById(`${field.id}Count`);
      if (counter) counter.textContent = `0/${field.maxLength || 200}`;
    });
    updateCheckoutSummary();
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!state.cart.length) {
      showToast('No hay productos en tu pedido.', 'error');
      return;
    }
    if (!validateForm(form)) return;

    const formData = new FormData(form);
    const method = getDeliveryMethod();
    const totals = getCheckoutTotals();
    const details = getCartDetails();
    const order = {
      number: generateOrderNumber(),
      name: String(formData.get('name')).trim(),
      phone: String(formData.get('phone')).trim(),
      email: String(formData.get('email')).trim(),
      method,
      zone: method === 'delivery' ? String(formData.get('zone') || '') : '',
      address: method === 'delivery' ? String(formData.get('address') || '').trim() : '',
      payment: getPaymentMethod(),
      notes: String(formData.get('notes') || '').trim(),
      items: details,
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      total: totals.total,
      eta: method === 'pickup' ? '20–30 min' : '30–45 min'
    };

    const summary = $('#successSummary');
    const name = $('#successName');
    const number = $('#successNumber');
    const total = $('#successTotal');
    const successMethod = $('#successMethod');
    const successEta = $('#successEta');
    const whatsappButton = $('#successWhatsapp');

    if (summary) {
      summary.innerHTML = order.items.map(({ item, qty }) => `
        <li><span>${qty}× ${escapeHtml(item.name)}</span><strong>${formatMoney(item.price * qty)}</strong></li>
      `).join('');
    }
    if (name) name.textContent = getFirstName(order.name);
    if (number) number.textContent = order.number;
    if (total) total.textContent = formatMoney(order.total);
    if (successMethod) successMethod.textContent = method === 'pickup' ? 'Recojo' : 'Delivery';
    if (successEta) successEta.textContent = order.eta;
    if (whatsappButton) whatsappButton.href = buildOrderWhatsappMessage(order);

    state.cart = [];
    saveCart();
    renderCart();
    resetCheckoutForm();

    const checkoutModalElement = $('#checkoutModal');
    const successModalElement = $('#orderSuccessModal');
    const checkoutInstance = window.bootstrap.Modal.getOrCreateInstance(checkoutModalElement);
    const successInstance = window.bootstrap.Modal.getOrCreateInstance(successModalElement);
    const showSuccess = () => {
      checkoutModalElement.removeEventListener('hidden.bs.modal', showSuccess);
      successInstance.show();
    };
    checkoutModalElement.addEventListener('hidden.bs.modal', showSuccess);
    checkoutInstance.hide();
  }

  // -------------------------------------------------------------------------
  // Reservas
  // -------------------------------------------------------------------------

  function reservationTimeChoices() {
    const times = [];
    for (let minutes = OPENING_MINUTES; minutes <= 22 * 60; minutes += 30) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      times.push({
        value: `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`,
        minutes
      });
    }
    return times;
  }

  function populateReservationTimes() {
    const select = $('#resTime');
    const dateInput = $('#resDate');
    if (!select) return;

    const previousValue = select.value;
    const selectedDate = dateInput?.value || '';
    const now = getLaPazNow();
    const isToday = selectedDate === now.date;
    const minimumAllowed = now.minutes + 30;

    select.innerHTML = '<option value="">Elige una hora</option>' + reservationTimeChoices().map((time) => {
      const disabled = isToday && time.minutes < minimumAllowed;
      return `<option value="${time.value}" ${disabled ? 'disabled' : ''}>${time.value}${disabled ? ' (no disponible)' : ''}</option>`;
    }).join('');

    if (previousValue) {
      const previousOption = [...select.options].find((option) => option.value === previousValue && !option.disabled);
      select.value = previousOption ? previousValue : '';
    }
  }

  function updateReservationDateConstraints() {
    const dateInput = $('#resDate');
    if (!dateInput) return;
    const today = getLaPazNow().date;
    dateInput.min = today;
    dateInput.max = addDaysToIso(today, 90);
  }

  function resetReservationForm() {
    const form = $('#reservationForm');
    if (!form) return;
    form.reset();
    clearFormErrors(form);
    updateReservationDateConstraints();
    populateReservationTimes();
    const counter = $('#resNotesCount');
    if (counter) counter.textContent = '0/200';
  }

  function handleReservationSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateForm(form)) return;

    const formData = new FormData(form);
    const name = String(formData.get('name')).trim();
    const phone = String(formData.get('phone')).trim();
    const email = String(formData.get('email')).trim();
    const date = String(formData.get('date'));
    const time = String(formData.get('time'));
    const people = Number(formData.get('people'));
    const occasion = String(formData.get('occasion') || '');
    const notes = String(formData.get('notes') || '').trim();
    const occasionLabel = occasion ? occasionLabels[occasion] : 'Sin ocasión especial';
    const dateLabel = formatDateLong(date);
    const peopleLabel = `${people} ${people === 1 ? 'persona' : 'personas'}`;

    const success = $('#reservationSuccess');
    const formWrap = $('#reservationFormWrap');
    const successText = $('#resSuccessText');
    const ticket = $('#resSuccessTicket');
    const whatsappButton = $('#resSuccessWhatsapp');

    if (successText) {
      successText.textContent = `Gracias, ${getFirstName(name)}. Registramos tu solicitud para el ${dateLabel} a las ${time} para ${peopleLabel}. Te confirmaremos la disponibilidad por WhatsApp.`;
    }

    if (ticket) {
      ticket.innerHTML = `
        <div class="success-ticket__row"><span>Fecha</span><strong>${escapeHtml(dateLabel)}</strong></div>
        <div class="success-ticket__row"><span>Hora</span><strong>${escapeHtml(time)}</strong></div>
        <div class="success-ticket__row"><span>Personas</span><strong>${escapeHtml(peopleLabel)}</strong></div>
        <div class="success-ticket__row"><span>Ocasión</span><strong>${escapeHtml(occasionLabel)}</strong></div>
      `;
    }

    const message = [
      'Hola Morenas Food, quiero confirmar una reserva:',
      '',
      `Nombre: ${name}`,
      `Celular: +591 ${phone}`,
      `Correo: ${email}`,
      `Fecha: ${dateLabel}`,
      `Hora: ${time}`,
      `Personas: ${people}`,
      `Ocasión: ${occasionLabel}`,
      notes ? `Comentarios: ${notes}` : '',
      '',
      '¡Gracias!'
    ].join('\n');
    if (whatsappButton) whatsappButton.href = whatsappUrl(message);

    resetReservationForm();
    if (formWrap) formWrap.hidden = true;
    if (success) {
      success.hidden = false;
      success.focus({ preventScroll: true });
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }

  function setupReservation() {
    const form = $('#reservationForm');
    if (!form) return;

    updateReservationDateConstraints();
    populateReservationTimes();
    $('#resDate')?.addEventListener('change', () => {
      populateReservationTimes();
      const timeField = $('#resTime');
      if (timeField?.dataset.touched === 'true') validateField(timeField);
    });
    $('#resDate')?.addEventListener('focus', updateReservationDateConstraints);
    form.addEventListener('submit', handleReservationSubmit);

    $('#newReservationBtn')?.addEventListener('click', () => {
      const success = $('#reservationSuccess');
      const formWrap = $('#reservationFormWrap');
      if (success) success.hidden = true;
      if (formWrap) formWrap.hidden = false;
      resetReservationForm();
      $('#resName')?.focus();
    });
  }

  // -------------------------------------------------------------------------
  // Newsletter
  // -------------------------------------------------------------------------

  function setupNewsletter() {
    const form = $('#newsletterForm');
    if (!form) return;
    const emailInput = $('#newsletterEmail');
    const success = $('#newsletterSuccess');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateForm(form)) return;

      const email = emailInput.value.trim().toLowerCase();
      const subscribers = safeStorageGet(NEWSLETTER_KEY, []);
      const list = Array.isArray(subscribers) ? subscribers : [];
      if (!list.includes(email)) list.push(email);
      safeStorageSet(NEWSLETTER_KEY, list);

      if (success) success.hidden = false;
      form.reset();
      clearFormErrors(form);
      showToast('Listo, ya eres parte del Club Morenas.', 'success');
    });

    emailInput?.addEventListener('input', () => {
      if (success) success.hidden = true;
    });
  }

  // -------------------------------------------------------------------------
  // Navegación, animaciones y ciclo de la página
  // -------------------------------------------------------------------------

  function setupNavigation() {
    const header = $('#siteHeader');
    const mainNav = $('#mainNav');

    const updateHeader = () => {
      header?.classList.toggle('is-scrolled', window.scrollY > 22);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    const closeMobileNav = () => {
      if (window.innerWidth < 992 && mainNav?.classList.contains('show')) {
        window.bootstrap?.Collapse.getOrCreateInstance(mainNav).hide();
      }
    };

    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        closeMobileNav();
      });
    });

    const links = $$('.navbar-nav .nav-link');
    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      }, { rootMargin: '-38% 0px -56% 0px', threshold: 0 });
      sections.forEach((section) => sectionObserver.observe(section));
    }
  }

  function setupRevealAnimations() {
    const revealItems = $$('.reveal');
    if (!revealItems.length) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  function setupMenu() {
    const filters = $('#menuFilters');
    const search = $('#menuSearch');
    const clearSearch = $('#clearSearch');
    const resetButton = $('#resetMenuBtn');

    filters?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      setFilter(button.dataset.filter);
    });

    search?.addEventListener('input', () => {
      state.search = search.value;
      renderMenu();
    });

    search?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        search.value = '';
        state.search = '';
        renderMenu();
      }
    });

    clearSearch?.addEventListener('click', () => {
      if (search) {
        search.value = '';
        search.focus();
      }
      state.search = '';
      renderMenu();
    });

    resetButton?.addEventListener('click', () => {
      state.filter = 'todos';
      state.search = '';
      if (search) search.value = '';
      renderMenu();
    });
  }

  function setupMenuInteractions() {
    document.addEventListener('click', (event) => {
      const favoriteButton = event.target.closest('[data-favorite-id]');
      if (favoriteButton) {
        event.preventDefault();
        toggleFavorite(favoriteButton.dataset.favoriteId);
        return;
      }

      const addButton = event.target.closest('[data-add-id]');
      if (!addButton) return;
      event.preventDefault();
      addToCart(addButton.dataset.addId);
      addButton.classList.add('is-added');
      window.setTimeout(() => addButton.classList.remove('is-added'), 850);
    });
  }

  function setupCart() {
    const items = $('#cartItems');
    const checkoutButton = $('#checkoutBtn');
    const checkoutForm = $('#checkoutForm');

    items?.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-cart-action]');
      if (!actionButton) return;
      const cartItem = actionButton.closest('[data-cart-id]');
      if (!cartItem) return;
      const id = cartItem.dataset.cartId;
      const action = actionButton.dataset.cartAction;
      if (action === 'increase') changeCartQuantity(id, 1);
      if (action === 'decrease') changeCartQuantity(id, -1);
      if (action === 'remove') removeFromCart(id);
    });

    checkoutButton?.addEventListener('click', openCheckout);

    checkoutForm?.addEventListener('change', (event) => {
      if (event.target.name === 'deliveryMethod') syncDeliveryFields();
      if (event.target.name === 'paymentMethod') validateGroup(event.target.closest('fieldset'));
      updateCheckoutSummary();
    });

    checkoutForm?.addEventListener('submit', handleCheckoutSubmit);

    $('#checkoutModal')?.addEventListener('show.bs.modal', () => {
      updateCheckoutSummary();
      syncDeliveryFields();
    });

    window.addEventListener('storage', (event) => {
      if (event.key === CART_KEY) {
        state.cart = loadCart();
        renderCart();
      }
      if (event.key === FAVORITES_KEY) {
        state.favorites = loadFavorites();
        renderMenu();
      }
    });
  }

  function setupFormValidation() {
    const checkoutForm = $('#checkoutForm');
    const reservationForm = $('#reservationForm');
    const newsletterForm = $('#newsletterForm');

    [checkoutForm, reservationForm, newsletterForm].forEach(initializeFormValidation);
  }

  function setupMiscellaneous() {
    const year = $('#currentYear');
    if (year) year.textContent = new Date().getFullYear();

    $$('[data-open-text]').forEach((label) => {
      label.setAttribute('aria-live', 'polite');
    });

    updateOpenStatus();
    window.setInterval(updateOpenStatus, 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) updateOpenStatus();
    });
  }

  function init() {
    setupPhoneInputs();
    setupCharacterCounters();
    setupFormValidation();
    setupMenu();
    setupMenuInteractions();
    setupCart();
    setupReservation();
    setupNewsletter();
    setupNavigation();
    setupRevealAnimations();
    setupMiscellaneous();

    renderMenu();
    renderCart();
    updateCheckoutSummary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
