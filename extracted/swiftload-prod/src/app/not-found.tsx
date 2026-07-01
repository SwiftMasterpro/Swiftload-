import Link from 'next/link'
export default function NotFound() {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:16,background:'#080E1A',textAlign:'center',padding:'24px' }}>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:80,color:'rgba(245,158,11,.15)',lineHeight:1 }}>404</div>
      <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:32 }}>Page Not Found</h1>
      <p style={{ color:'#64748B',fontSize:14,maxWidth:280 }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display:'flex',gap:9,marginTop:8 }}>
        <Link href="/" className="btn btn-amber btn-md">Go Home</Link>
        <Link href="/marketplace" className="btn btn-ghost btn-md" style={{ color:'#94A3B8' }}>Browse Loads</Link>
      </div>
    </div>
  )
}
