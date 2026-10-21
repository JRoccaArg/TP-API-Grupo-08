// Medios de contacto oficiales de Zenoir. Las redes se abren en otra pestaña.
export default function Footer() {
  return (
    <footer className="pie">
      <div className="pie__datos">
        <div>
          <p className="pie__rotulo">Contactanos</p>
          <a className="pie__mail" href="mailto:zenoir.prod@gmail.com">
            zenoir.prod@gmail.com
          </a>
        </div>
        <div className="pie__redes">
          <p className="pie__rotulo">Redes y teléfono</p>
          <a href="https://instagram.com/zenoir.prod" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://tiktok.com/@zenoir.prod" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="tel:+541173725337">+54 11 7372-5337</a>
          <small>© 2026 —</small>
        </div>
      </div>
      <p className="pie__marca oro-texto" aria-hidden="true">
        zenoir.
      </p>
    </footer>
  )
}
