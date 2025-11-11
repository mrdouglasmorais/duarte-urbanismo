export default function LogoSVG({ className = "", width = 300 }: { className?: string; width?: number }) {
  const height = width * 0.6; // Proporção aproximada

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ícone D com casa */}
      <g transform="translate(150, 20)">
        {/* Círculo externo do D */}
        <path
          d="M 0,-15 A 15,15 0 1,1 0,15 L -8,15 L -8,-15 Z"
          fill="#000000"
          stroke="#000000"
          strokeWidth="2"
        />

        {/* Casa/Telhado interno */}
        <path
          d="M -3,5 L 0,-3 L 3,5 Z"
          fill="#FFFFFF"
        />
        <rect
          x="-2.5"
          y="5"
          width="5"
          height="5"
          fill="#FFFFFF"
        />
      </g>

      {/* Texto DUARTE */}
      <text
        x="150"
        y="90"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="52"
        fontWeight="900"
        fill="#000000"
        textAnchor="middle"
        letterSpacing="-1"
      >
        DUARTE
      </text>

      {/* Texto URBANISMO */}
      <text
        x="150"
        y="115"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="#000000"
        textAnchor="middle"
        letterSpacing="3"
      >
        URBANISMO
      </text>

      {/* Texto DUARTE URBANISMO LTDA */}
      <text
        x="150"
        y="140"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#000000"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        DUARTE URBANISMO LTDA
      </text>

      {/* Texto CNPJ */}
      <text
        x="150"
        y="160"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="#000000"
        textAnchor="middle"
      >
        CNPJ: 47.200.760/0001-06
      </text>
    </svg>
  );
}

