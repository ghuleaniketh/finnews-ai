import React from 'react';

/**
 * Icon: Google Material Symbols (Outlined style) wrapper component.
 * Renders <span className="material-symbols-outlined" aria-hidden="true">{name}</span>
 * with font-size set from size prop and font-variation-settings.
 */
export default function Icon({
  name,
  size = 20,
  className = '',
  style = {},
  ...props
}) {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      className={`material-symbols-outlined select-none shrink-0 inline-flex items-center justify-center leading-none ${className}`}
      aria-hidden="true"
      style={{
        fontSize: sizeValue,
        width: sizeValue,
        height: sizeValue,
        fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  );
}
