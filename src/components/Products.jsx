import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import toast from "react-hot-toast";
import ProductCard from "../pages/ProductCard";


// Category → sensible sizes/colors
const SIZE_MAP = {
  "men's clothing": ["S", "M", "L", "XL"],
  "women's clothing": ["XS", "S", "M", "L"],
};
const COLOR_MAP = {
  electronics: ["Black", "Silver", "Space Gray"],
  jewelery: ["Gold", "Silver", "Rose Gold"],
  default: ["Black", "Navy", "Olive", "Sand"],
};

// Tiny deterministic PRNG so the same product gets the same extras every time
function seededRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x); // 0..1
}

function enrichProduct(p) {
  // Decide which option type we’ll show as "variants"
  const sizes = SIZE_MAP[p.category] || null;
  const colors = COLOR_MAP[p.category] || COLOR_MAP.default;

  // Overall product stock (about ~88% available)
  const inStock = seededRand(p.id) > 0.12;
  const stockCount = Math.max(
    0,
    Math.floor(seededRand(p.id * 7) * 25) + (inStock ? 1 : 0)
  );

  // Build variants based on category: sizes for clothing, colors otherwise
  const baseOptions = sizes || colors;
  const variantType = sizes ? "Size" : "Color";

  const variants = baseOptions.map((opt, idx) => ({
    id: `${p.id}-${opt.toLowerCase().replace(/\s+/g, "")}`,
    label: opt,
    inStock: inStock && seededRand(p.id + idx) > 0.18, // some options can be OOS
  }));

  const firstInStock = variants.find((v) => v.inStock) || variants[0];

  // Pick a default color (even for sized items we still keep a color palette)
  const defaultColor =
    colors[Math.floor(seededRand(p.id * 11) * colors.length)];

  return {
    ...p,

    // 🔹 New fields you asked for
    inStock, // boolean
    stockCount, // number (for badges/caps)
    variants, // [{ id, label, inStock }]
    variantType, // "Size" or "Color" — helps label the dropdown
    color: defaultColor, // default/selected color
    colors, // all available colors for swatches

    // 🔹 Helpful extras you might use later
    sku: `FS-${String(p.id).padStart(4, "0")}`,
    discountPercent: Math.floor(seededRand(p.id * 5) * 30), // 0–29%
    isNew: seededRand(p.id * 3) > 0.85,
    defaultVariantId: firstInStock?.id || null,
  };
}

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(data);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const componentMounted = useRef(true);

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
    toast.success("Added to cart");
  };

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      const response = await fetch("https://fakestoreapi.com/products/");

      if (componentMounted.current) {
        const data = await response.json();

        // Add fake keys here
        const enriched = data.map(enrichProduct);
        setData(enriched);
        setFilter(enriched);

        // setData(await response.clone().json());
        // setFilter(await response.json());
        setLoading(false);
      }
      return () => {
        componentMounted.current = false;
      };
    };
    getProducts();
  }, []);

  const Loading = () => {
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
        <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      </>
    );
  };

  const filterProduct = (cat) => {
    const updatedList = data.filter((item) => item.category === cat);
    setFilter(updatedList);
    setSelectedCategory(cat); // <-- mark selected
  };

  const ShowProducts = () => {
    return (
      <>
        <div className="buttons text-center py-5">
          <button
            className={`btn ${
              selectedCategory === null ? "btn-dark" : "btn-outline-dark"
            } btn-sm m-2`}
            onClick={() => {
              setFilter(data);
              setSelectedCategory(null);
            }}
          >
            All
          </button>
          <button
            className={`btn ${
              selectedCategory === "men's clothing"
                ? "btn-dark"
                : "btn-outline-dark"
            } btn-sm m-2`}
            onClick={() => filterProduct("men's clothing")}
          >
            Men's Clothing
          </button>
          <button
            className={`btn ${
              selectedCategory === "women's clothing"
                ? "btn-dark"
                : "btn-outline-dark"
            } btn-sm m-2`}
            onClick={() => filterProduct("women's clothing")}
          >
            Women's Clothing
          </button>
          <button
            className={`btn ${
              selectedCategory === "jewelery" ? "btn-dark" : "btn-outline-dark"
            } btn-sm m-2`}
            onClick={() => filterProduct("jewelery")}
          >
            Jewelery
          </button>
          <button
            className={`btn ${
              selectedCategory === "electronics"
                ? "btn-dark"
                : "btn-outline-dark"
            } btn-sm m-2`}
            onClick={() => filterProduct("electronics")}
          >
            Electronics
          </button>
        </div>

        <div className="container">
          <div className="row g-4">
            {filter.map((p) => (
              <div key={p.id} className="col-12 col-sm-6 col-lg-4">
                <ProductCard product={p} addProduct={addProduct} />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container my-3 py-3">
        <div className="row">
          <div className="col-12">
            <h2 className="display-5 text-center">Latest Products</h2>
            <hr />
          </div>
        </div>
        <div className="row justify-content-center">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>
    </>
  );
};

export default Products;
