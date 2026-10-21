// Auspiciantes de "Nos acompañan". Los logos son SVG blancos (para el fondo negro) y su tamaño se ajusta en CSS (.sponsors__logo--id).
// El orden alterna logos anchos y altos para que la cinta tenga ritmo.
import merle from '../assets/sponsors/merle.svg'
import uade from '../assets/sponsors/uade.svg'
import spiritoBlu from '../assets/sponsors/spirito-blu.svg'
import blackrock from '../assets/sponsors/blackrock.svg'
import fernetBranca from '../assets/sponsors/fernet-branca.svg'
import lpf from '../assets/sponsors/lpf.svg'
import sernova from '../assets/sponsors/sernova.svg'
import num from '../assets/sponsors/num.svg'
import voltra from '../assets/sponsors/voltra.svg'
import speedUnlimited from '../assets/sponsors/speed-unlimited.svg'

export const sponsors = [
  { id: 'merle', nombre: 'Merle', logo: merle },
  { id: 'uade', nombre: 'UADE', logo: uade },
  { id: 'spirito-blu', nombre: 'Spirito Blu London Dry Gin', logo: spiritoBlu },
  { id: 'blackrock', nombre: 'BlackRock', logo: blackrock },
  { id: 'fernet-branca', nombre: 'Fernet Branca', logo: fernetBranca },
  { id: 'lpf', nombre: 'Liga Profesional de Fútbol', logo: lpf },
  { id: 'sernova', nombre: 'Sernova Vodka', logo: sernova },
  { id: 'num', nombre: 'NUM', logo: num },
  { id: 'voltra', nombre: 'Voltra', logo: voltra },
  { id: 'speed-unlimited', nombre: 'Speed Unlimited Energy Drink', logo: speedUnlimited },
]
