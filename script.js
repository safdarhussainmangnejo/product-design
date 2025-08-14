document.addEventListener('DOMContentLoaded', () => {
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach((card) => {
    const sizeSelect = card.querySelector('select[name="size"]');
    const colorSelect = card.querySelector('select[name="color"]');
    const addToCartButton = card.querySelector('.add-to-cart');
    const stockLabel = card.querySelector('.stock-label');
    const availabilityScript = card.querySelector('.availability-map');

    let availabilityByCombination = {};
    try {
      availabilityByCombination = JSON.parse(availabilityScript?.textContent || '{}');
    } catch (error) {
      availabilityByCombination = {};
    }

    function getSelectedKey() {
      const size = sizeSelect?.value || '';
      const color = colorSelect?.value || '';
      return `${size}|${color}`;
    }

    function updateAvailability() {
      const combinationKey = getSelectedKey();
      const isAvailable = availabilityByCombination.hasOwnProperty(combinationKey)
        ? Boolean(availabilityByCombination[combinationKey])
        : true;

      card.dataset.available = String(isAvailable);
      addToCartButton.disabled = !isAvailable;
      addToCartButton.setAttribute('aria-disabled', String(!isAvailable));
      stockLabel.hidden = isAvailable;
    }

    sizeSelect?.addEventListener('change', updateAvailability);
    colorSelect?.addEventListener('change', updateAvailability);
    updateAvailability();

    addToCartButton?.addEventListener('click', () => {
      if (addToCartButton.disabled) return;
      const originalText = addToCartButton.textContent;
      addToCartButton.textContent = 'Added ✓';
      addToCartButton.classList.add('added');
      setTimeout(() => {
        addToCartButton.textContent = originalText || 'Add to Cart';
        addToCartButton.classList.remove('added');
      }, 1200);
      // TODO: Integrate with actual cart logic here or emit a custom event
      const detail = {
        productTitle: card.querySelector('.product-name')?.textContent?.trim() || '',
        priceText: card.querySelector('.product-price')?.textContent?.trim() || '',
        size: sizeSelect?.value || '',
        color: colorSelect?.value || '',
      };
      card.dispatchEvent(new CustomEvent('product:add-to-cart', { bubbles: true, detail }));
    });
  });
});