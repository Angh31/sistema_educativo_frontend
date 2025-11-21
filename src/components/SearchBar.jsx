// ====================================
// COMPONENTE DE BÚSQUEDA REUTILIZABLE
// ====================================

import { useState, useEffect } from "react";
import "./SearchBar.css";

/**
 * SearchBar
 * =========
 * Barra de búsqueda con debounce
 *
 * @param {Object} props
 * @param {string} props.placeholder - Texto placeholder
 * @param {function} props.onSearch - Callback al buscar (con debounce)
 * @param {number} props.debounceTime - Tiempo de debounce en ms (default: 500)
 */
const SearchBar = ({
  placeholder = "Buscar...",
  onSearch,
  debounceTime = 500,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce: esperar que el usuario termine de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceTime);

    // Limpiar timer si el usuario sigue escribiendo
    return () => clearTimeout(timer);
  }, [searchTerm, debounceTime, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button className="search-clear-btn" onClick={handleClear}>
          ✕
        </button>
      )}
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default SearchBar;
