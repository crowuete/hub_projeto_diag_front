'use client'
import { useState } from 'react'
import {useLazySearchReportQuery, useDownloadReportMutation, useGetRelatorioDatesQuery} from '@/redux/features/questionnaireApiSlice';
import type { Report } from '@/redux/features/questionnaireApiSlice'
import DropdownMenu from "@/components/questionnaire/DropdownMenu"; 
// import TrendChart from "@/components/graphic/TrendChard"; 
import BarChart from "@/components/graphic/BarChart"; 

export default function Dashboard(){

  const [dateSelection, setDateSelection] = useState('')
  const [report, setReport] = useState<Report[] | null>(null)
  const [getReport, {error:errorReport }] = useLazySearchReportQuery();
  const [downloadReport] = useDownloadReportMutation()
  const { data: availableDatesRaw = [] } = useGetRelatorioDatesQuery();
  const availableDates = availableDatesRaw.map((item) => item.data)

  const handleSearch = async () => {
    if (!dateSelection) return

    const formattedDate = new Date(dateSelection).toISOString().slice(0, 10);
    const response = await getReport(formattedDate)

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
    <div className='flex flex-col w-full space-y-8 md:space-y-12 pb-40 bg-bleached-silk dark:bg-gunmetal'>
      
      <div className='p-10 text-center'>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-royal-blue border-b-2 border-teal-primary pb-2 text-center dark:text-blue-darknut">
          Gráfico de Comparação Empresarial
        </h1>
        <div className="flex justify-center">
          <BarChart />
        </div>
      </div>
      <div className="border p-4 sm:p-6 md:p-8 lg:p-10 m-4 sm:m-6 md:m-8 lg:m-10 rounded-md bg-gray-50 shadow-sm dark:bg-gunmetal dark:border-gray-light">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-center sm:text-left">
          Gerar Relatório
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mb-2">
          <select
            value={dateSelection}
            onChange={(e) => setDateSelection(e.target.value)}
            className="w-full sm:flex-grow px-4 py-3 border rounded-md focus:outline-none focus:ring focus:ring-teal-primary dark:bg-gray-light dark:text-black-wash"
          >
            <option value="">Selecione uma data</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-4 py-2 bg-royal-blue text-white rounded-md hover:bg-teal-secundary-opc"
          >
            Buscar 
          </button>
        </div>

        {errorReport && <p className="text-red-500">Erro ao buscar relatórios.</p>}

        {report && report.length > 0 && (
          <div className="p-2 sm:p-4">
            {report.map((item, index) => (
              <div
                key={index}
                className="grid sm:grid-cols-5 border-t py-4 gap-2 sm:gap-4 items-start"
              >
                <div>
                  <div className=" sm:block text-x font-bold text-blue-darknut mb-1">
                    Usuário
                  </div>
                  <div className="text-base">{item.usuario}</div>
                </div>
                <div>
                  <div className=" sm:block text-x font-bold text-blue-darknut mb-1">
                    Módulo
                  </div>
                  <div className="text-base">{item.nome_modulo}</div>
                </div>
                <div>
                  <div className=" sm:block text-x font-bold text-blue-darknut mb-1">
                    Valor Final
                  </div>
                  <div className="text-base">{item.valorFinal}</div>
                </div>
                <div>
                  <div className=" sm:block text-x font-bold text-blue-darknut mb-1">
                    Data Resposta
                  </div>
                  <div className="text-base">{new Date(item.dataResposta + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="flex justify-end items-center">
                  <DropdownMenu item={item} handleDownload={handleDownload} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}