import React from 'react';
import { 
  Compass, 
  Globe, 
  Cpu, 
  TrendingUp, 
  Atom, 
  HeartPulse, 
  Film, 
  Trophy 
} from 'lucide-react';

const ICON_MAP = {
  Compass,
  Globe,
  Cpu,
  TrendingUp,
  Atom,
  HeartPulse,
  Film,
  Trophy,
};

export default function CategoryBar({ categories, activeCategory, onSelectCategory, articleCounts = {} }) {
  return (
    <nav className="category-nav-bar" aria-label="News categories">
      <div className="container category-nav-container">
        <ul className="category-list">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Compass;
            const isActive = activeCategory === cat.id;
            const count = articleCounts[cat.id];

            return (
              <li key={cat.id} className="category-item">
                <button
                  type="button"
                  className={`category-pill ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                  aria-pressed={isActive}
                >
                  <IconComponent size={15} className="category-icon" />
                  <span className="category-label">{cat.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="category-count">{count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
