'use client'

import Link from 'next/link';
import React from 'react';
import { useCheckDeadlineQuery } from '@/redux/features/questionnaireApiSlice'; 
import { useAsyncValue } from '@/hooks/index'; 


type Props = {
  params: { module: string } | Promise<{ module: string }>;
}


export default function Questionnaire({ params }: Props) {
    const resolvedParams = useAsyncValue(params);

    const { data, isLoading, error } = useCheckDeadlineQuery(resolvedParams?.module, {
        skip: !resolvedParams?.module,
    });

    return (
        <>
            <div className='min-h-screen'>
                <div
                    className='pt-12 px-4 pb-20 md:p-16 md:pb-36 bg-gradient-to-r from-[#041024] via-midnight-blue to-[#041024]'
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0% 100%)',
                    }}>
                    <div
                        className='flex flex-col max-w-4xl mx-auto space-y-8'
                    >
                        <div className='flex flex-col'>
                            <span className='text-blue-darknut'>
                                Módulo
                            </span>
                            <h1 className='text-4xl md:text-6xl text-blue-darknut font-bold mb-4'>
                                Diagnóstico Organizacional
                            </h1>
                            <p className='text-zinc-300 mb-6'>
                                O Diagnóstico Organizacional é uma ferramenta essencial para entender a saúde da sua empresa.
                                Ele ajuda a identificar pontos fortes e áreas que precisam de melhorias, permitindo que você
                                tome decisões informadas para o futuro do seu negócio.
                            </p>
                        </div>

                        {isLoading ? (
                                <span className="text-bleached-silk">Verificando disponibilidade...</span>
                            ) : error ? (
                                <span className="text-red-500">Erro ao verificar o prazo.</span>
                            ) : data?.ok_response ? (
                                <div className='flex w-max h-max space-x-2 mx-auto items-center md:px-4 md:py-2 bg-gunmetal rounded-md border border-vivid-cerulean'>
                                    <a className='text-bleached-silk'>
                                        Número de Questões
                                    </a>
                                    <div className='w-[1px] h-12 bg-zinc-500'></div>
                                    <a className='text-bleached-silk'>
                                        Tempo Estimado
                                    </a>
                                    <div className='hidden md:block w-[1px] h-12 bg-zinc-500'></div>
                                    <Link
                                        href='/questionnaire/x/Diagnóstico Organizacional'
                                        className='hidden md:block w-fit md:px-4 md:py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600'>
                                        Iniciar Questionário
                                    </Link>
                                </div>
                            ) : (
                                <span className="text-blue-darknut font-semibold">{data?.message}</span>
                            )
                        }

                    </div>
                </div>
                <div className='p-12 max-w-4xl mx-auto'>
                    <h1 className='text-2xl'>
                        Conheça nossos outros questionários:
                    </h1>
                </div>
            </div >
        </>
    );
}