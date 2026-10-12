import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-[100] py-4 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="font-heading font-extrabold text-2xl tracking-tight text-text-main">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Bharat</span>Furnitures
        </Link>
      </div>
    </nav>
  );
}
