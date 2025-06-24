'use client'
import { useState } from 'react'
import {useLazySearchReportQuery, useDownloadReportMutation} from '@/redux/features/questionnaireApiSlice';
import type { Report } from '@/redux/features/questionnaireApiSlice'

export default function Dashboard(){

  const [dateSelection, setDateSelection] = useState('')
  const [report, setReport] = useState<Report[] | null>(null)

  const [getReport, { isLoading:isLoadingReport, error:errorReport }] = useLazySearchReportQuery();
  const [downloadReport] = useDownloadReportMutation()


  const handleSearch = async () => {
    if (!dateSelection) return

    const response = await getReport(dateSelection)

    if ('data' in response && response.data) {
      setReport(response.data)
    } else {
      setReport(null)
    }
  }

  const handleDownload = async (nomeModulo: string) => {
    try {
      const blob = await downloadReport(nomeModulo).unwrap();

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_diagnostico_organizacional.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
    }
  };


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
           <button onClick={handleSearch} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700" > Buscar Relatório  </button>
        </div>

        {isLoadingReport && <p>Carregando...</p>}
        {errorReport && <p className="text-red-500">Erro ao buscar relatórios.</p>}

        {report && report.length > 0 && (
          <div className="p-4">
            <div className="grid grid-cols-5 font-semibold mb-2 text-start">
              <div>Usuário</div>
              <div>Módulo</div>
              <div>Valor Final</div>
              <div>Data Resposta</div>
            </div>

            {report.map((item, index) => (
              <div key={index} className="grid grid-cols-5 border-t py-2 text-start">
                <div>{item.usuario}</div>
                <div>{item.nome_modulo}</div>
                <div>{item.valorFinal}</div>
                <div>{item.dataResposta}</div>
                <div className='flex space-x gap-2'>
                  <button 
                    onClick={() => handleDownload(item.id.toString())} 
                    className="w-40 h-10 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  > Baixar </button>
                  <button // onClick={handleDownload} 
                    className="w-40 h-10 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  > Vizualizar </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}