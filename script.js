/* Script: cart, smooth scroll, form validation, theme toggle */
(() => {
  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Elements
  const cartBtn = $('#cart-button');
  const cartCountEl = $('#cart-count');
  const cartPanel = $('#cart-panel');
  const cartItemsEl = $('#cart-items');
  const cartTotalEl = $('#cart-total');
  const checkoutBtn = $('#checkout-btn');
  const closeCart = $('#close-cart');
  const modalOverlay = $('#modal-overlay');
  const modalClose = $('#modal-close');
  const modalDone = $('#modal-done');
  const buyNow = $('#buy-now');
  const addButtons = $$('.btn-add');
  const yearEl = $('#year');
  const hamburger = $('#hamburger');
  const mainNav = $('#main-nav');
  const themeToggle = $('#theme-toggle');
  const body = document.body;
  const contactForm = $('#contact-form');
  const formSuccess = $('#form-success');

  yearEl.textContent = new Date().getFullYear();

  // Cart data
  let cart = JSON.parse(localStorage.getItem('cart_demo') || '[]');

  function saveCart(){ localStorage.setItem('cart_demo', JSON.stringify(cart)); }
  function updateCartUI(){
    const total = cart.reduce((s,item)=> s + item.price * item.qty, 0);
    cartCountEl.textContent = cart.reduce((s,i)=> s + i.qty, 0) || 0;
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
    // render items
    cartItemsEl.innerHTML = '';
    if(cart.length === 0){
      cartItemsEl.innerHTML = '<p class="empty">Your cart is empty — add features to get started.</p>';
      checkoutBtn.disabled = true;
      return;
    }
    checkoutBtn.disabled = false;
    cart.forEach(item=>{
      const wrap = document.createElement('div');
      wrap.className = 'cart-item';
      wrap.innerHTML = `
        <div class="meta">
          <h4>${escapeHtml(item.title)}</h4>
          <div class="muted small">$${item.price.toFixed(2)} each</div>
        </div>
        <div class="qty-controls" data-id="${item.id}">
          <button class="dec">−</button>
          <div class="qty">${item.qty}</div>
          <button class="inc">+</button>
          <button class="remove" title="Remove">✕</button>
        </div>
      `;
      cartItemsEl.appendChild(wrap);
    });
  }

  function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

  // Add to cart
  addButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.feature-card');
      const id = card.dataset.id;
      const title = card.dataset.title;
      const price = Number(card.dataset.price)||0;
      const existing = cart.find(i => i.id === id);
      if(existing) existing.qty += 1;
      else cart.push({id, title, price, qty:1});
      saveCart();
      updateCartUI();
      // show cart
      openCart();
      // brief pulse on cart button
      cartBtn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});
    });
  });

  // Quantity controls (event delegation)
  cartItemsEl.addEventListener('click', e => {
    const btn = e.target;
    const ctr = btn.closest('.qty-controls');
    if(!ctr) return;
    const id = ctr.dataset.id;
    const item = cart.find(i => i.id === id);
    if(!item) return;
    if(btn.classList.contains('inc')) item.qty++;
    else if(btn.classList.contains('dec')) item.qty = Math.max(1, item.qty - 1);
    else if(btn.classList.contains('remove')) cart = cart.filter(i=> i.id !== id);
    saveCart();
    updateCartUI();
  });

  // Open / close cart
  function openCart(){
    cartPanel.setAttribute('aria-hidden','false');
  }
  function closeCartPanel(){
    cartPanel.setAttribute('aria-hidden','true');
  }
  cartBtn.addEventListener('click', ()=> {
    const wasOpen = cartPanel.getAttribute('aria-hidden') === 'false';
    if(wasOpen) closeCartPanel();
    else openCart();
  });
  closeCart.addEventListener('click', closeCartPanel);

  // Checkout -> show modal
  checkoutBtn.addEventListener('click', () => {
    modalOverlay.setAttribute('aria-hidden','false');
    // (simulate placing an order)
    // Clear cart after a short delay when "Done"
  });
  modalClose.addEventListener('click', ()=> modalOverlay.setAttribute('aria-hidden','true'));
  modalDone.addEventListener('click', ()=>{
    // Clear cart and close modal
    cart = [];
    saveCart();
    updateCartUI();
    modalOverlay.setAttribute('aria-hidden','true');
    closeCartPanel();
    alert('Fictional order placed — thank you! 🎉');
  });

  // Buy now = open cart
  buyNow.addEventListener('click', () => {
    // add a base product if cart empty
    const baseId = 'base-watch';
    const baseTitle = 'SmartWatch Pro X (Base)';
    if(!cart.find(i=>i.id === baseId)){
      cart.push({id:baseId,title:baseTitle,price:199,qty:1});
      saveCart();
      updateCartUI();
    }
    openCart();
  });

  // Smooth nav for small screens
  $$('.nav-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      if(window.innerWidth < 900 && mainNav.style.display !== 'none'){
        mainNav.style.display = 'none';
      }
    });
  });

  // Hamburger toggles menu (mobile)
  hamburger.addEventListener('click', ()=>{
    const visible = getComputedStyle(mainNav).display !== 'none';
    mainNav.style.display = visible ? 'none' : 'flex';
  });

  // Form validation
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    formSuccess.textContent = '';
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    if(!name || !email || !message){
      formSuccess.textContent = 'Please complete all fields.';
      formSuccess.style.color = '#ff6b6b';
      return;
    }
    if(!/^\S+@\S+\.\S+$/.test(email)){
      formSuccess.textContent = 'Please enter a valid email address.';
      formSuccess.style.color = '#ff6b6b';
      return;
    }
    // success
    formSuccess.textContent = 'Thanks! Your message has been sent (demo).';
    formSuccess.style.color = '';
    contactForm.reset();
  });

  // Theme toggling with localStorage
  const savedTheme = localStorage.getItem('theme_pref');
  if(savedTheme === 'light') body.classList.add('light');
  themeToggle.textContent = body.classList.contains('light') ? '🌙' : '🌞';
  themeToggle.addEventListener('click', ()=>{
    body.classList.toggle('light');
    const isLight = body.classList.contains('light');
    localStorage.setItem('theme_pref', isLight ? 'light' : 'dark');
    themeToggle.textContent = isLight ? '🌙' : '🌞';
  });

  // Close modal by ESC
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      modalOverlay.setAttribute('aria-hidden','true');
      closeCartPanel();
      mainNav.style.display = '';
    }
  });

  // Init
  updateCartUI();

  // Basic accessibility / progressive enhancement:
  // ensure modal overlay aria attribute reflects state
  const observer = new MutationObserver(() => {
    const attr = modalOverlay.getAttribute('aria-hidden');
    if(attr === 'false') modalOverlay.style.pointerEvents = 'auto';
    else modalOverlay.style.pointerEvents = 'none';
  });
  observer.observe(modalOverlay, {attributes:true});

})();