import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product, addProduct }) {
  const variants = useMemo(() => {
    return product?.variants ? product.variants : [];
  }, [product?.variants]);

  const hasVariants = variants.length > 0;

  const firstInStock = useMemo(
    () => variants.find((v) => v.inStock) ?? variants[0] ?? null,
    [variants]
  );
  const [variantId, setVariantId] = useState(firstInStock?.id || "");

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId) || null,
    [variants, variantId]
  );

  const productInStock = product.inStock !== false; // default to true if not provided
  const canPurchase =
    productInStock &&
    (!hasVariants || (selectedVariant && selectedVariant.inStock));

  return (
    <div className="pcard">
      <div className="pcard-inner card border-0 shadow-none h-100">
        {/* Image */}
        <div className="ratio ratio-1x1 pcard-media rounded-top">
          <img
            src={product.image}
            alt={product.title}
            className="w-100 h-100 p-3 object-fit-contain"
            loading="lazy"
          />
        </div>

        {/* Body */}
        <div className="card-body d-flex flex-column p-3 p-lg-4">
          <h5
            className="card-title fw-semibold text-truncate mb-1"
            title={product.title}
          >
            {product.title}
          </h5>

          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="fs-5 fw-semibold">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.rating && (
              <span className="small text-secondary">
                ⭐ {product.rating.rate} ({product.rating.count})
              </span>
            )}
            {!productInStock && (
              <span className="badge text-bg-secondary">Out of stock</span>
            )}
          </div>

          {product.description && (
            <p className="card-text small text-secondary mb-3">
              {product.description.slice(0, 100)}
              {product.description.length > 100 ? "…" : ""}
            </p>
          )}

          {/* Variant selector */}
          {hasVariants && (
            <div className="mb-3">
              <label
                htmlFor={`variant-${product.id}`}
                className="form-label small text-secondary mb-1"
              >
                Select {product.variantType || "Variant"}
              </label>
              <select
                id={`variant-${product.id}`}
                className="form-select"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                aria-label={`Select ${product.variantType || "variant"} for ${
                  product.title
                }`}
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.inStock}>
                    {v.label}
                    {!v.inStock ? " — Out of stock" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto d-grid gap-2">
            <Link
              to={`/product/${product.id}`}
              className="btn btn-outline-dark pcard-btn-outline"
            >
              View Details
            </Link>

            <button
              type="button"
              className="btn btn-dark pcard-btn-cta"
              disabled={!canPurchase}
              aria-disabled={!canPurchase}
              onClick={() => {
                if (!canPurchase) return;
                addProduct?.({
                  ...product,
                  selectedVariantId: selectedVariant?.id ?? null,
                });
              }}
            >
              {canPurchase ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
