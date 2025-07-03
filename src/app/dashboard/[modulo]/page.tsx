'use client'

import { useParams } from 'next/navigation';
import { useGetViewRespostaModuloQuery } from '@/redux/features/questionnaireApiSlice';
import RadarChart from "@/components/graphic/RadarChart"; 

export default function ViewModulo() {
  const params = useParams();
  const idModulo = Number(params.modulo);
  const { data, isLoading, error } = useGetViewRespostaModuloQuery(idModulo);

  if (isLoading) return <p>Carregando...</p>;
  if (error || !data) return <p>Erro ao carregar dados.</p>;

  const modulo = data.modulo;
  const usuario = data.usuario;
  const dimensoes = data.dimensoes;

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-royal-blue" >Relatório de Desempenho</h1>
      <div className="mt-2 mb-10 text-sm text-gray-700 text-center">
        Respondido por: {usuario.username} ({usuario.email})
      </div>
      <h1 className="text-2xl font-bold">Módulo: {modulo.nome}</h1>
      <p className="text-gray-700"><strong>Descrição:</strong> {modulo.descricao}</p>

      <div className="mt-4">
        <p><strong>Resultado final do módulo:</strong> {data.valorFinal} - pontos</p>
        <p><strong>Data de resposta do módulo:</strong> {new Date(data.dataResposta).toLocaleString()}</p>
      </div>

      <h1 className="text-2xl font-bold mt-10 mb-5">Resultado por Dimensões:</h1>
      <ul className="mt-2 space-y-2">
        {dimensoes.map((dim, idx) => (
          <li key={idx} className="border-2 p-3 rounded shadow-sm border-gray-light  hover:border-blue-darknut hover:-translate-y-1 transition transform duration-500">
            <strong className='text-blue-darknut'>{dim.dimensao.titulo}</strong>
            <p className="text-gray-600"> Pontuação: {dim.valorFinal}</p>
          </li>
        ))}
      </ul>

      <h1 className="text-2xl font-bold mt-10 text-center text-royal-blue">Gráfico Empresarial</h1>
      <div className="my-10 flex justify-center">
        <RadarChart data={data} />
      </div>
    </main>
  );
}
