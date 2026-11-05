import { Link } from 'react-router-dom';
import { MessageCircle, Package, ArrowUpRight, MapPin, Clock, Phone } from 'lucide-react';

export default function Footer() {
  const whatsappNumber = "917067753335";
  const whatsappMessage = encodeURIComponent("Hello Bharat Furnitures! I need assistance with furniture products / order inquiry.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <footer className="bg-[#1C1917] text-white py-14 mt-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* 1. Brand Description */}
        <div>
          <div className="mb-4">
            <Link to="/" className="inline-block group select-none">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 leading-none">
                  <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-[#D4A373] via-[#E9EDC9] to-amber-200 bg-clip-text text-transparent">
                    Bharat
                  </span>
                  <div className="w-8 h-8 rounded-full bg-black p-[2px] border border-amber-600/40 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src="/logo.png" 
                      alt="Bharat Furnitures" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <span className="text-[0.68rem] font-bold tracking-[0.25em] uppercase text-stone-400 font-sans mt-1 pl-0.5">
                  Furnitures
                </span>
              </div>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Smart, durable, and space-saving furniture designed for modern homes, compact rooms, and everyday comfort.
          </p>
        </div>

        {/* 2. Shop by Category */}
        <div>
          <h4 className="font-heading font-bold text-base text-stone-100 mb-4 tracking-wide uppercase text-xs">
            Shop Categories
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-stone-400">
            <li>
              <Link 
                to="/category/study-laptop-tables" 
                className="hover:text-[#D4A373] hover:translate-x-1 inline-flex items-center gap-1 transition-all"
              >
                <span>Study & Laptop Tables</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/category/storage-racks" 
                className="hover:text-[#D4A373] hover:translate-x-1 inline-flex items-center gap-1 transition-all"
              >
                <span>Storage Racks</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/category/chairs" 
                className="hover:text-[#D4A373] hover:translate-x-1 inline-flex items-center gap-1 transition-all"
              >
                <span>Study & Utility Chairs</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Visit Our Offline Store */}
        <div>
          <h4 className="font-heading font-bold text-base text-stone-100 mb-4 tracking-wide uppercase text-xs flex items-center gap-1.5">
            <MapPin size={14} className="text-[#D4A373]" />
            <span>Visit Offline Store</span>
          </h4>
          <div className="space-y-2 text-xs text-stone-400">
            <p className="font-semibold text-stone-200 leading-snug">
              114, MIG Colony, Ambedkar Nagar, Indore, MP 452011
            </p>
            <p className="flex items-center gap-1.5 text-stone-400">
              <Clock size={13} className="text-[#D4A373] shrink-0" />
              <span>11:00 AM – 8:00 PM (Daily)</span>
            </p>
            <div className="pt-1.5">
              <a
                href="https://maps.app.goo.gl/TBFTMMWHbgGQuT2L9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4A373] hover:text-white transition-colors group"
              >
                <span>Open in Google Maps</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* 4. Connect With Us & Orders */}
        <div>
          <h4 className="font-heading font-bold text-base text-stone-100 mb-4 tracking-wide uppercase text-xs">
            Help & Orders
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-stone-400 mb-4">
            <li>
              <Link 
                to="/orders" 
                className="hover:text-[#D4A373] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all font-medium text-stone-300"
              >
                <Package size={15} className="text-[#D4A373]" />
                <span>Track Order</span>
              </Link>
            </li>
          </ul>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all group"
          >
            <MessageCircle size={16} className="fill-white/20 group-hover:scale-110 transition-transform" />
            <span>Chat on WhatsApp</span>
            <ArrowUpRight size={12} className="text-emerald-200" />
          </a>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.7rem] text-stone-500">
        <p>© {new Date().getFullYear()} Bharat Furnitures. All rights reserved.</p>
        <p>Handcrafted Quality Furniture for Indian Homes</p>
      </div>
    </footer>
  );
}
