export default function Footer() {
  return (
    <footer className="bg-text-main text-white py-16 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h2 className="font-heading font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            BharatFurnitures
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Smart furniture for smart spaces. Space-saving furniture designed for students, hostels and compact rooms.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-lg text-white mb-4">Shop</h4>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            <li className="hover:text-primary transition-colors cursor-pointer">Study Tables</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Storage</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Multipurpose</li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-lg text-white mb-4">Help</h4>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            <li className="hover:text-primary transition-colors cursor-pointer">Track Order</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Returns</li>
            <li className="hover:text-primary transition-colors cursor-pointer">FAQ</li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-lg text-white mb-4">Connect</h4>
          <p className="text-sm text-white/70 leading-relaxed">Follow us on Instagram for dorm room inspiration!</p>
        </div>
      </div>
    </footer>
  );
}
