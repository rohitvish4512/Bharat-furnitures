export default function Footer() {
  return (
    <footer style={{ background: 'var(--text-main)', color: 'white', padding: '4rem 0', marginTop: '4rem' }}>
      <div className="container grid grid-cols-4 gap-lg">
        <div>
          <h2 className="h3-subtitle text-gradient mb-4">BharatFurnitures</h2>
          <p className="text-small" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Smart furniture for smart spaces. Space-saving furniture designed for students, hostels and compact rooms.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Shop</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
            <li>Study Tables</li>
            <li>Storage</li>
            <li>Multipurpose</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Help</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
            <li>Track Order</li>
            <li>Returns</li>
            <li>FAQ</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Connect</h4>
          <p className="text-small" style={{ color: 'rgba(255,255,255,0.7)' }}>Follow us on Instagram for dorm room inspiration!</p>
        </div>
      </div>
    </footer>
  );
}
