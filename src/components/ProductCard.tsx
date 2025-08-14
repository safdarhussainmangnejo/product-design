import React, {useEffect, useMemo, useState} from 'react';
import './ProductCard.css';

export type AvailabilityMap = Record<string, boolean>; // keys like "S|Black" or "S|" or "|Black"

export interface ProductCardProps {
  title: string;
  price: number; // in the smallest currency unit or as a float; display uses Intl
  currency?: string; // default 'USD'
  imageSrc: string;
  imageAlt?: string;
  sizes?: string[]; // optional
  colors?: string[]; // optional
  availability?: AvailabilityMap; // optional; if missing, assume available
  initialSize?: string;
  initialColor?: string;
  onAddToCart?: (payload: {
    title: string;
    price: number;
    currency: string;
    size?: string;
    color?: string;
  }) => void;
  className?: string;
}

function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  currency = 'USD',
  imageSrc,
  imageAlt,
  sizes,
  colors,
  availability,
  initialSize,
  initialColor,
  onAddToCart,
  className,
}) => {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(initialSize || (sizes && sizes[0]) || undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialColor || (colors && colors[0]) || undefined);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!selectedSize && sizes && sizes.length > 0) setSelectedSize(sizes[0]);
  }, [sizes, selectedSize]);

  useEffect(() => {
    if (!selectedColor && colors && colors.length > 0) setSelectedColor(colors[0]);
  }, [colors, selectedColor]);

  const isAvailable = useMemo(() => {
    if (!availability) return true;
    const keyBoth = `${selectedSize ?? ''}|${selectedColor ?? ''}`;
    const keySizeOnly = `${selectedSize ?? ''}|`;
    const keyColorOnly = `|${selectedColor ?? ''}`;

    if (Object.prototype.hasOwnProperty.call(availability, keyBoth)) return Boolean(availability[keyBoth]);
    if (Object.prototype.hasOwnProperty.call(availability, keySizeOnly)) return Boolean(availability[keySizeOnly]);
    if (Object.prototype.hasOwnProperty.call(availability, keyColorOnly)) return Boolean(availability[keyColorOnly]);
    return true;
  }, [availability, selectedColor, selectedSize]);

  function handleAddToCart() {
    if (!isAvailable) return;
    onAddToCart?.({ title, price, currency, size: selectedSize, color: selectedColor });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  }

  const priceText = formatPrice(price, currency);
  const composedClassName = ['productCard', className].filter(Boolean).join(' ');

  return (
    <article className={composedClassName} data-available={String(isAvailable)} aria-labelledby="productTitle">
      <div className="productCard__media">
        <img src={imageSrc} alt={imageAlt || title} loading="lazy" decoding="async" />
      </div>

      <div className="productCard__body">
        <h3 id="productTitle" className="productCard__name">{title}</h3>
        <p className="productCard__price" aria-label="Price">{priceText}</p>

        {(sizes || colors) && (
          <div className="productCard__variants" aria-label="Select product options">
            {sizes && sizes.length > 0 && (
              <label className="variantGroup">
                <span className="variantLabel">Size</span>
                <select
                  className="variantSelect"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            )}

            {colors && colors.length > 0 && (
              <label className="variantGroup">
                <span className="variantLabel">Color</span>
                <select
                  className="variantSelect"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  {colors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        <div className="productCard__actions">
          <button
            type="button"
            className="btn"
            disabled={!isAvailable}
            aria-disabled={!isAvailable}
            onClick={handleAddToCart}
          >
            {justAdded ? 'Added ✓' : 'Add to Cart'}
          </button>
          <span className="stockLabel" aria-live="polite" hidden={isAvailable}>Out of Stock</span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;