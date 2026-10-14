// Íconos SVG sueltos (sin librería). Se elige la forma por nombre.
const FORMAS = {
  bolsa: (
    <>
      <path d="M5.5 8.5h13l-1.1 11.5H6.6L5.5 8.5z" />
      <path d="M9 8.5V7a3 3 0 016 0v1.5" />
    </>
  ),
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  diagonal: <path d="M7 17L17 7M8 7h9v9" />,
  mas: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  subir: <path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14" />,
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
