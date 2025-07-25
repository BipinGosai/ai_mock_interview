import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation';
import Link from 'next/link'
import {ReactNode} from 'react'

const RootLayout = async({children}:{children:ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if(!isUserAuthenticated) redirect('/sign-in');
  return (
    <div className='root-layout'>
        <nav>
          <Link href="/" className='flex items-center gap-2'>
            <img src="/logo.svg" alt="Logo" width={38} height={32}/>
            <h2 className="text-primary-100">PrepWise</h2>
          </Link>
        </nav>
        {children}
    </div>
  )
}

export default RootLayout