import { Circle, Square, Triangle, Hexagon, Octagon, Star, Box, Cylinder, Globe, Cone } from 'lucide-react';

export const ShapeCircle = ({ size, ...props }) => <Circle size={size} {...props} />;
export const ShapeSquare = ({ size, ...props }) => <Square size={size} {...props} />;
export const ShapeTriangle = ({ size, ...props }) => <Triangle size={size} {...props} />;
export const ShapeHexagon = ({ size, ...props }) => <Hexagon size={size} {...props} />;
export const ShapeOctagon = ({ size, ...props }) => <Octagon size={size} {...props} />;
export const ShapeStar = ({ size, ...props }) => <Star size={size} {...props} />;
export const ShapeCubo = ({ size, ...props }) => <Box size={size} {...props} />;
export const ShapeCilindro = ({ size, ...props }) => <Cylinder size={size} {...props} />;
export const ShapeEsfera = ({ size, ...props }) => <Globe size={size} {...props} />;

// Lucide's Cone might exist, but drawing a solid Pirámide is necessary.

export const ShapeRectangle = ({ size = 24, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
  </svg>
);

export const ShapeRombo = ({ size = 24, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 22 12 12 22 2 12" />
  </svg>
);

export const ShapeTrapecio = ({ size = 24, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="6 6 18 6 22 18 2 18" />
  </svg>
);

export const ShapePentagon = ({ size = 24, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 22 9.5 18 21 6 21 2 9.5" />
  </svg>
);

export const ShapeCono = ({ size = 24, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2 L2 20 Q12 24 22 20 Z" />
    <path d="M2 20 Q12 16 22 20" />
  </svg>
);

export const ShapePiramide = ({ size = 24, strokeWidth = 2, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2 L2 20 L22 20 Z" />
    <path d="M12 2 L12 20" />
    <path d="M2 20 L12 15 L22 20" />
  </svg>
);
