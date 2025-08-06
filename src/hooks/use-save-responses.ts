import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaveModuleResponsesMutation, DimensaoIncompleta, RespostaModulo } from '@/redux/features/questionnaireApiSlice';
import { toast } from 'react-toastify';

export default function useSubmitResponses() {
    const router = useRouter();
    const [saveModuleResponses, { isLoading }] = useSaveModuleResponsesMutation();
    const [responses, setResponses] = useState<Record<number, number>>({});

    const handleResponseChange = (questionID: number, selectedOption: number) => {
        setResponses((prev) => ({
            ...prev,
            [questionID]: selectedOption,
        }));
    };

    const handleSubmitResponses = async (moduleName: string, respostasIncompletas: DimensaoIncompleta) => {
        
        const formattedResponses = Object.entries(responses).map(([ID, selectedOption]) => ({
            id: parseInt(ID, 10),
            valor: selectedOption + 1,
        }));

        let todasRespostas: RespostaModulo[] = [];
        if (respostasIncompletas) {
            Object.values(respostasIncompletas).forEach((dim: DimensaoIncompleta) => {
                if (dim.respostas) {
                    const corrigidas = dim.respostas.map((r: RespostaModulo) => ({
                        id: r.id ?? r.id,
                        valor: r.valor,
                    }));
                    todasRespostas = todasRespostas.concat(corrigidas);
                }
            });
        }
        todasRespostas = todasRespostas.concat(formattedResponses);

        const respostasUnicas = Object.values(
            todasRespostas.reduce((acc, resposta) => {
                acc[resposta.id] = resposta;
                return acc;
            }, {} as Record<number, { id: number; valor: number }>)
        ) as { id: number; valor: number }[];

        try {
            await saveModuleResponses({
                nomeModulo: moduleName,
                respostas: respostasUnicas,
            }).unwrap();
            toast.success('Respostas enviadas com sucesso!');
            router.push('/questionnaire');
        } catch (error) {
            toast.error('Erro ao enviar respostas');
            console.error('Erro ao enviar respostas:', error);
        }
    };

    return {
        responses,
        setResponses,
        isLoading,
        handleResponseChange,
        handleSubmitResponses,
    };
}