import { useState } from 'react';
import { toast } from 'react-toastify';
import {useSaveIncompleteMutation} from '@/redux/features/questionnaireApiSlice'

export default function useSaveResponsesIncomplete() {
    const [isSaving, setIsSaving] = useState(false);
    const [salvarIncompleta] = useSaveIncompleteMutation();

    const saveResponsesIncomplete = async (
        moduleName: string,
        currentDimension: { title: string; questions: { id: number }[] },
        responses: Record<number, number>
    ) => {
        setIsSaving(true);

        const payload = {
            nomeModulo: decodeURIComponent(moduleName),
            dimensaoTitulo: currentDimension.title,
            respostas: currentDimension.questions.map((q) => ({
                id: q.id,
                valor: responses[q.id] ?? null,
            })),
        };

        try {
            await salvarIncompleta(payload).unwrap();
            toast.success('Respostas da dimensão salvas!');
        } catch (error) {
            toast.error('Erro ao salvar respostas incompletas');
            console.error('Erro ao salvar respostas incompletas:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return { 
        saveResponsesIncomplete, 
        isSaving 
    };
}