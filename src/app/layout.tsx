import Provider from '@/redux/provider';
import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/navigation-bar/NavBar';
import Footer from '@/components/footer/Footer';
import { Setup } from '@/utils';
import { ThemeProvider, ToggleTheme } from '@/components/themes';
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
})

const roboto_mono = Roboto_Mono({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
	title: 'Projeto Diagnóstico',
	description: 'Projeto Diagnóstico para avaliação empresarial',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='pt-BR' suppressHydrationWarning className={`${inter.variable} ${roboto_mono.variable}`}>
			<Provider>
				<body className='font-sans text-sm sm:text-lg md:text-lg'>
					<ThemeProvider
						attribute='class'
						defaultTheme='system'
						enableSystem
						disableTransitionOnChange
					>
						<Setup />
						<NavBar />
						<main>
							{children}
						</main>
						<div className='fixed bottom-4 right-4 md:bottom-8 md:right-8 lg:bottom-12 lg:right-12'>
							<ToggleTheme />
						</div>
						<Footer />
					</ThemeProvider>
				</body>
			</Provider>
		</html >
	);
}