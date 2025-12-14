
import { Metadata } from "next";
import {AuthProvider} from '@/contexts/AuthContext'

export const metadata:Metadata=
{ 
    title:'Sketchy',
    description:'Collaborative drawing application'

}

export default function RootLayout({children}:Readonly<{
  children: React.ReactNode;
}>)
{
  return(
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        
      </body>
    </html>
  );
}