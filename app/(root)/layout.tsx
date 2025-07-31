import { isAuthenticated, signOut } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation';
import Link from 'next/link'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/auth.action';

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect('/sign-in');
  
  const user = await getCurrentUser();

  return (
    <div className='root-layout'>
      <nav className='flex justify-between items-center p-3 border-b border-gray-200'>
        <Link href="/" className='flex items-center gap-2'>
          <img src="/logo.svg" alt="Logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>
        
        <div className='flex items-center gap-4'>
          <span className='text-sm text-gray-600'>{user?.email}</span>
          <form action={async () => {
            'use server'
            await signOut();
            redirect('/sign-in');
          }}>
            <Button type="submit" variant="outline" className='border-gray-300 text-gray-700 hover:bg-gray-50'>
              Logout
            </Button>
          </form>
        </div>
      </nav>
      <main className='p-4'>
        {children}
      </main>
    </div>
  )
}

export default RootLayout