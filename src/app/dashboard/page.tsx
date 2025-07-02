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
    <div className='flex flex-col w-full space-y-8 md:space-y-12 p-12'>
      
      <div className='p-4 m-10 text-center'>
        {/* <h1 className="text-4xl font-bold text-royal-blue border-b-2 border-royal-blue pb-2">
          Gráfico de Evolução
        </h1>
        <div className="flex justify-center">
          <TrendChart />
        </div> */}
         <h1 className="text-4xl font-bold text-royal-blue border-b-2 border-royal-blue pb-2">
          Gráfico de Comparação Empresarial
        </h1>
        <div className="flex justify-center">
          <BarChart />
        </div>
      </div>
      <div className='border-2 border-blue-darknut p-4 m-10 rounded-md bg-gray-50 shadow-sm'>
        <h2 className="text-xl font-semibold mb-4">Gerar Relatório</h2>
        <div className="flex space-x-2 mb-4">
          <select
            value={dateSelection}
            onChange={(e) => setDateSelection(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring focus:royal-blue"
          >
            <option value="">Selecione uma data</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString("pt-BR")}
              </option>
            ))}
          </select>
           <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" > Buscar Relatório  </button>
        </div>

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
                <div className='flex space-x gap-2 justify-end'>
                  <DropdownMenu item={item} handleDownload={handleDownload}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}