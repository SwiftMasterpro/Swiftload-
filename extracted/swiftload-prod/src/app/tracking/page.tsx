import { Suspense } from 'react'
import { Tracking } from '@/components/features/Tracking'
import { PageLoader } from '@/components/shared/LoadingSpinner'
export const metadata = { title:'Track Delivery', description:'Live GPS tracking for your SwiftLoad delivery' }
export default function TrackingPage() { return <Suspense fallback={<PageLoader/>}><Tracking/></Suspense> }
