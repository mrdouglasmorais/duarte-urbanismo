import LogoSVG from './LogoSVG';

export default function Logo({ className = "", width = 300 }: { className?: string; width?: number }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <LogoSVG width={width} />
    </div>
  );
}

