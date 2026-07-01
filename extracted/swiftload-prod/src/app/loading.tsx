export default function Loading() {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:16,background:'#080E1A' }}>
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" className="animate-spin">
        <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" strokeOpacity=".2"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <p style={{ color:'#64748B',fontSize:13 }}>Loading SwiftLoad…</p>
    </div>
  )
}
