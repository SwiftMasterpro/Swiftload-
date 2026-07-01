'use client'
export default function Error({ error, reset }: { error:Error; reset:()=>void }) {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:16,background:'#080E1A',padding:'24px',textAlign:'center' }}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:28 }}>Something went wrong</h2>
      <p style={{ color:'#64748B',fontSize:13,maxWidth:300 }}>{error.message || 'An unexpected error occurred'}</p>
      <button onClick={reset} className="btn btn-amber btn-md">Try Again</button>
    </div>
  )
}
