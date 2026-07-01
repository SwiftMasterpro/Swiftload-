import Link from 'next/link'
export function Logo({ size = 32, href = '/' }: { size?: number; href?: string }) {
  const s = size
  return (
    <Link href={href} style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0, textDecoration:'none' }}>
      <svg height={s} viewBox="0 0 50 50" fill="none">
        <circle cx="25" cy="25" r="23" fill="#080E1A" stroke="#F47920" strokeWidth="1.5"/>
        <path d="M15 34L25 10l10 24H15z" fill="#F47920"/>
        <path d="M19 34h12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 38h32" stroke="#F47920" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:s*.38, lineHeight:1, color:'#fff', letterSpacing:'.5px' }}>PRONTO:</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:s*.38, lineHeight:1, color:'#F47920', letterSpacing:'2px' }}>SWIFTLOAD</div>
      </div>
    </Link>
  )
}
