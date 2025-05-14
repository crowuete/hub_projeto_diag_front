'use client';

import { useDownloadReportMutation } from '@/redux/features/questionnaireApiSlice';

export default function QuestionnairePage() {
    const [downloadReport] = useDownloadReportMutation();

    const handleDownloadReport = async () => {
        try {
            const blob = await downloadReport('Diagnóstico Organizacional').unwrap();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'relatorio_diagnostico_organizacional.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar o relatório:', error);
        }
    };

    return (
        <>
            <div className='w-screen min-h-screen flex flex-col items-center space-y-8'>
                <button
                    onClick={handleDownloadReport}
                    className='bg-blue-500 text-white px-4 py-2 rounded'
                >
                    Baixar Relatório
                </button>
            </div>
        </>
    );
}