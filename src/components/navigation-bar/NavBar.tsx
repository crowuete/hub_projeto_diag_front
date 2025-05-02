'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/features/authApiSlice';
import { logout as setLogout } from '@/redux/features/authSlice';
import NavLink from './NavLink';

export default function Navbar() {
    const pathname = usePathname() || '';
    const dispatch = useAppDispatch();
    const [logout] = useLogoutMutation();
    const { isAuthenticated } = useAppSelector(state => state.auth);

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        logout(undefined)
            .unwrap()
            .then(() => {
                dispatch(setLogout());
            });
    };

    const isSelected = (path: string) => (pathname === path ? true : false);

    const navItems = [
        { name: 'Sobre', href: '/about' },
        { name: 'Questionário', href: '/questionnaire' },
        { name: 'Contato', href: '/contact' },
    ];

    const navLinks = (isMobile: boolean, close?: () => void) => (
        <>
            {navItems.map((item, index) => (
                <NavLink
                    isNavItem={true}
                    isSelected={isSelected(item.href)}
                    isMobile={isMobile}
                    href={item.href}
                    key={index}
                    className='relative group'
                    onClick={() => {
                        if (close) close();
                    }}
                >
                    {item.name}
                    <div className='absolute bottom-0 left-0 bg-blue-darknut h-[2px] w-0 group-hover:w-full transition-all duration-500'></div>
                </NavLink>
            ))}
        </>
    );

    const authLinks = (isMobile: boolean, close?: () => void) => (
        <>
            <NavLink
                isMobile={isMobile}
                href='/'
                onClick={() => {
                    handleLogout();
                    if (close) close();
                }}
            >
                Sair
            </NavLink>
        </>
    );

    const guestLinks = (isMobile: boolean, close?: () => void) => (
        <>
            <NavLink
                isMobile={isMobile}
                href='/authentication/login'
                className='bg-blue-darknut text-bleached-silk py-2 px-4 hover:bg-vivid-cerulean rounded-md'
                onClick={() => {
                    if (close) close();
                }}
            >
                Entrar
            </NavLink>
        </>
    );

    return (
        <Disclosure
            as='nav'
            className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-midnight-blue/90 border-b border-white dark:border-blue-darknut py-2' : 'bg-midnight-blue py-4'
                } text-zinc-100`}
        >
            {({ open, close }) => (
                <>
                    <div className='relative flex w-full items-center'>
                        <div className='flex sticky left-1 md:hidden'>
                            <DisclosureButton className='p-2 rounded-md hover:bg-gray-700 hover:text-white'>
                                {open ? <X size={24} /> : <Menu size={24} />}
                            </DisclosureButton>
                        </div>
                        <div className='max-w-5xl mx-auto flex flex-1 p-3 sm:p-4 items-center justify-center md:justify-between'>
                            <div className='flex flex-shrink-0'>
                                <NavLink
                                    href='/'
                                    isBanner
                                    onClick={() => {
                                        close();
                                    }}
                                >
                                    Projeto Diagnóstico
                                </NavLink>
                            </div>
                            <div className='hidden md:block md:space-x-5 lg:space-x-12'>
                                {navLinks(false)}
                            </div>
                            <div className='hidden md:block'>
                                {isAuthenticated ? authLinks(false) : guestLinks(false)}
                            </div>
                        </div>
                    </div>
                    <DisclosurePanel transition className='origin-top transition duration-300 ease-out data-[closed]:-translate-y-4'>
                        <div className='flex flex-col items-center space-y-4 py-4 md:hidden'>
                            {navLinks(true, close)}
                            {isAuthenticated ? authLinks(true, close) : guestLinks(true, close)}
                        </div>
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}