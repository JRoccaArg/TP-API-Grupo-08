// Íconos SVG sueltos (sin librería). Se elige la forma por nombre.
const FORMAS = {
  carrito: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 12.2a2 2 0 002 1.6h7.8a2 2 0 002-1.5L21 7H6" />
    </>
  ),
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  flechaIzq: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arriba: <path d="M12 19V5M5 12l7-7 7 7" />,
  abajo: <path d="M12 5v14M19 12l-7 7-7-7" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  ojo: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  ojoCerrado: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A10 10 0 0112 6c6.4 0 10 6 10 6a17 17 0 01-3.2 3.9M6.1 7.7C3.6 9.5 2 12 2 12s3.6 6 10 6a10 10 0 003.9-.8" />
      <path d="M9.9 9.9a3 3 0 004.2 4.2" />
    </>
  ),
  diagonal: <path d="M7 17L17 7M8 7h9v9" />,
  mas: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  subir: <path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14" />,
  salir: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  tilde: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  candado: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </>
  ),
  ondas: (
    <>
      <path d="M8.5 8.5a5 5 0 010 7" />
      <path d="M12 6a8.5 8.5 0 010 12" />
      <path d="M15.5 3.5a12 12 0 010 17" />
    </>
  ),
  puntos: (
    <>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </>
  ),
}

export default function Icono({ nombre, tamano = 20, grosor = 1.8 }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {FORMAS[nombre]}
    </svg>
  )
}
