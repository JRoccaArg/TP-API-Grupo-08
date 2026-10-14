export default function Footer() {
  return (
    <footer className="pie">
      <div className="pie__datos">
        <div>
          <p className="pie__rotulo">Contactanos</p>
          <a className="pie__mail" href="mailto:info@zenoir.com">
            info@zenoir.com
          </a>
        </div>
        <div className="pie__redes">
          <p className="pie__rotulo">Redes sociales</p>
          <a href="#">Instagram</a>
          <a href="#">TikTok</a>
          <a href="#">WhatsApp</a>
          <small>© 2026 —</small>
        </div>
      </div>
      <p className="pie__marca oro-texto" aria-hidden="true">
        zenoir.
      </p>
    </footer>
  )
}
