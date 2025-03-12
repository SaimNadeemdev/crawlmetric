import localFont from 'next/font/local'
import { Poppins, Pacifico } from 'next/font/google'

// Custom font for the animated hero heading
export const pacifico = Pacifico({
  weight: '400',
  display: 'swap',
  variable: '--font-pacifico',
  subsets: ['latin'],
})

export const lilgrotesk = localFont({
  src: '../lilgrotesk.bold.otf',
  display: 'swap',
  variable: '--font-lil-grotesk',
})

export const fsMe = localFont({
  src: [
    {
      path: '../FS_Me/FS_Me/FS Me-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../FS_Me/FS_Me/FS Me-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../FS_Me/FS_Me/FS Me-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../FS_Me/FS_Me/FS Me-Bold Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-fs-me',
})

export const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})
