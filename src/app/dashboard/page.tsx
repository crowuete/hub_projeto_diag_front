'use client'
import { useState } from 'react'
// import { Metadata } from 'next';
import {useLazySearchReportQuery} from '@/redux/features/questionnaireApiSlice';
import type { Report } from '@/redux/features/questionnaireApiSlice'

// export const metadata: Metadata = {
//   title: 'Projeto Diagnóstico | Dashboard',
// };

export default function Dashboard(){

  const [dateSelection, setDateSelection] = useState('')
  const [report, setReport] = useState<Report[] | null>(null)

  const [getReport, { isLoading, error }] = useLazySearchReportQuery()

  const handleSearch = async () => {
    if (!dateSelection) return

    const response = await getReport(dateSelection)

    if ('data' in response && response.data) {
      setReport(response.data)
    } else {
      setReport(null)
    }
  }

  return (
    <div className='flex flex-col w-full space-y-8 md:space-y-12 p-12'>
      <div className='border border-black-wash p-4 m-10 text-center'>
        <h1>GRÁFICO DE COMPARAÇÃO</h1>
      </div>
      <div className='border border-black-wash p-4 m-10 rounded-md bg-gray-50 shadow-sm'>
        <h2 className="text-xl font-semibold mb-4">Gerar Relatório</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="date"
            value={dateSelection}
            onChange={(e) => setDateSelection(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-teal-500"
          />
           <button
            onClick={handleSearch}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Visualizar
          </button>
          <button
            // onClick={handleDownload}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Baixar
          </button>
        </div>

        {isLoading && <p>Carregando...</p>}
        {error && <p className="text-red-500">Erro ao buscar relatórios.</p>}

        {report && (
          <div className="p-4 border rounded-md bg-white shadow-inner">
            <pre className="whitespace-pre-wrap">{JSON.stringify(report, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}