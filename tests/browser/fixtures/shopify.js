// Test double for the Web Components boundary, not Shopify inventory or payment verification.
class TestStore extends HTMLElement {}
class TestContext extends HTMLElement {
  connectedCallback() {
    queueMicrotask(() => {
      const template = this.querySelector('template');
      if (!template) return;
      if (this.getAttribute('type') !== 'product' || this.getAttribute('handle') !== 'test-shirt') throw new Error('Unexpected product context');
      this.append(template.content.cloneNode(true));
      this.querySelector('[shopify-loading-placeholder]')?.remove();
      this.querySelector('shopify-data[query="product.title"]').textContent = 'Teszt póló';
      this.querySelector('shopify-data[query="product.description"]').textContent = 'Helyi teszttermék';
      this.querySelector('shopify-money').textContent = '6 000 Ft';
      this.selected = 'M';
      const selector = this.querySelector('shopify-variant-selector');
      selector.innerHTML = '<label>Méret<select aria-label="Méret"><option>M</option><option>L</option><option>XL</option></select></label>';
      selector.addEventListener('change', event => { this.selected = event.target.value; this.update(); });
      this.update();
      this.dispatchEvent(new CustomEvent('data-loaded', { detail: { data: {} } }));
      this.dispatchEvent(new CustomEvent('shopify-render', { bubbles: true, composed: true }));
    });
  }
  update() {
    const available = this.selected !== 'XL';
    for (const node of this.querySelectorAll('[shopify-attr--disabled]')) {
      if (node.getAttribute('shopify-attr--disabled') !== '!product.selectedOrFirstAvailableVariant.availableForSale') throw new Error('Unexpected availability binding');
      node.disabled = !available;
    }
    for (const node of this.querySelectorAll('[shopify-attr--hidden]')) {
      const query = node.getAttribute('shopify-attr--hidden');
      if (!['product.selectedOrFirstAvailableVariant.availableForSale', '!product.selectedOrFirstAvailableVariant.availableForSale'].includes(query)) throw new Error('Unexpected visibility binding');
      node.hidden = query.startsWith('!') ? !available : available;
    }
  }
}
class TestCart extends HTMLElement {
  connectedCallback() {
    this.lines = new Map();
    this.attachShadow({ mode: 'open' }).innerHTML = '<dialog aria-label="Kosár"><h2><slot name="header"></slot></h2><div id="lines"></div><p id="empty"><slot name="empty"></slot></p><a href="https://djentries-test.myshopify.com/checkouts/test"><slot name="checkout-button"></slot></a><button id="close">Bezárás</button></dialog>';
    this.shadowRoot.querySelector('#close').onclick = () => this.shadowRoot.querySelector('dialog').close();
  }
  addLine(event) {
    const context = event.target.closest('shopify-context');
    if (!context || context.selected === 'XL') throw new Error('Unavailable variant');
    const size = context.selected;
    this.lines.set(size, (this.lines.get(size) || 0) + 1);
    this.renderLines();
    return this;
  }
  renderLines() {
    this.shadowRoot.querySelector('#empty').hidden = this.lines.size > 0;
    const list = this.shadowRoot.querySelector('#lines');
    list.replaceChildren();
    for (const [size, quantity] of this.lines) {
      const row = document.createElement('label');
      row.textContent = `Teszt póló / ${size}`;
      const input = document.createElement('input');
      input.type = 'number'; input.min = '1'; input.value = quantity;
      input.setAttribute('aria-label', `${size} mennyiség`);
      input.onchange = () => { this.lines.set(size, Number(input.value)); };
      row.append(input); list.append(row);
    }
  }
  showModal() { this.shadowRoot.querySelector('dialog').showModal(); return this; }
}
customElements.define('shopify-store', TestStore);
customElements.define('shopify-context', TestContext);
customElements.define('shopify-cart', TestCart);
