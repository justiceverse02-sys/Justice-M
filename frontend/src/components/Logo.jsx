export const Logo = ({ size = "md" }) => {
  const dim = size === "sm" ? "w-9 h-9 text-base" : "w-11 h-11 text-lg";
  return (
    <div className="flex items-center gap-3" data-testid="jv-logo">
      <div
        className={`${dim} rounded-full border border-[#D4AF37] bg-[#FFFFF0] text-black flex items-center justify-center font-serif font-bold tracking-tighter shrink-0`}
      >
        JV
      </div>
      <div className="leading-none">
        <div className="font-serif text-xl sm:text-2xl tracking-[0.18em] text-[#FFFFF0]">
          JUSTICE VERSE
        </div>
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] text-zinc-500 mt-1">
          PRESTIGE AI WORKSPACE
        </div>
      </div>
    </div>
  );
};

export default Logo;
