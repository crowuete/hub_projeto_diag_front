'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSubmitResponses } from '@/hooks';
import useSaveResponsesIncomplete from '@/hooks/use-save-responses-incomplete';
import { useGetQuestionnaireByModuleQuery, useDownloadReportMutation, Dimensao, DimensaoIncompleta, RespostaModulo, Modulo} from '@/redux/features/questionnaireApiSlice';
import { QuestionWithLikert } from '@/components/questionnaire';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface CompletedIndex {
  value: number;
  savedAt: Date;
}

export default function Page() {
    const { dimension: moduleName } = useParams();
    const { data: moduleData, isLoading, isError, refetch } = useGetQuestionnaireByModuleQuery(moduleName as string, {
        skip: !moduleName,
        refetchOnMountOrArgChange: true
    });
    const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showDescription, setShowDescription] = useState(true);
    const [showSubmit, setShowSubmit] = useState(false);
    const { responses, setResponses, handleResponseChange, handleSubmitResponses } = useSubmitResponses();
    const [completedIndices, setCompletedIndices] = useState<CompletedIndex[]>([]);
    const { saveResponsesIncomplete } = useSaveResponsesIncomplete();

     const newCompletedIndex: CompletedIndex = {
        value: currentDimensionIndex,
        savedAt: new Date(),
    };

    useEffect(() => {
        if (moduleName) {
            refetch(); 
        }
    }, [moduleName, refetch]);

    useEffect(() => {

        if (!moduleData) return;

        console.log(moduleData)

        const respondidas = moduleData.respondidads
        const indicesRespondidas = (moduleData.dimensoes as Dimensao[]) 
            .map((dim, idx) => respondidas.includes(dim.dimensaoTitulo) ? idx : null)
            .filter((idx): idx is number => idx !== null);
        
        const newCompletedIndices = indicesRespondidas.map(index => ({
            value: index,
            savedAt: new Date(), 
        }));

        setCompletedIndices(newCompletedIndices);

        const respostasIncompletas: DimensaoIncompleta = moduleData.respostasIncompletas || {};
        const respostasAntigas: Record<number, number> = {};
        Object.values(respostasIncompletas).forEach((dim: DimensaoIncompleta) => {
            if (dim.respostas) {
                dim.respostas.forEach((r: RespostaModulo) => {
                    const id = r.id ?? r.id;
                    respostasAntigas[id] = r.valor;
                });
            }
        });
        setResponses(respostasAntigas);

        if (typeof (moduleData as Modulo).nextDimensionIndex === 'number') {
            setCurrentDimensionIndex((moduleData as Modulo).nextDimensionIndex);
            setCurrentQuestionIndex(0);
            setShowDescription(true);
        }

    }, [moduleData, setResponses]);

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading module data.</div>;
    if (!moduleData) return <div>Module not found.</div>;

    const dimensions = moduleData.dimensoes.map((dimension) => ({
        title: dimension.dimensaoTitulo,
        description: dimension.descricao,
        questions: dimension.perguntas.map((question) => ({
            id: question.id,
            text: question.pergunta,
            explanation: question.explicacao,
        })),
    }));

    const totalDimensions = dimensions.length;
    const currentDimension = dimensions[currentDimensionIndex];
    const totalQuestionsInDimension = currentDimension.questions.length;
    const currentQuestion = currentDimension.questions[currentQuestionIndex];

    const isFirstQuestion = currentDimensionIndex === 0 && currentQuestionIndex === 0 && showDescription;

    const handleFinishDimension = async () => {
        await saveResponsesIncomplete(
            moduleName as string,
            currentDimension,
            responses
        );

        setCompletedIndices((prev) => {
            const existingValues = new Set(prev.map(item => item.value));
            if (existingValues.has(newCompletedIndex.value)) {
                return prev;
            }
            return [...prev, newCompletedIndex];
        });
        setShowDescription(true);
    };

    const goToNext = () => {
        if (showDescription && currentQuestionIndex < totalQuestionsInDimension) {
            setShowDescription(false);
        } else if (currentQuestionIndex < totalQuestionsInDimension - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else if (currentDimensionIndex < totalDimensions - 1) {
            handleFinishDimension();
            setCurrentDimensionIndex((prev) => prev + 1);
            setCurrentQuestionIndex(0);
            setShowDescription(true);
        } else if (currentDimensionIndex === totalDimensions - 1) {
            setCompletedIndices((prev) => {
                const existingValues = new Set(prev.map(item => item.value));
                if (existingValues.has(newCompletedIndex.value)) {
                    return prev;
                }
                return [...prev, newCompletedIndex];
            });
            setShowSubmit(true);
        }
    };

    const goToPrevious = () => {
        if (!showDescription && currentQuestionIndex === 0) {
            setShowDescription(true);
        } else if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        } else if (currentDimensionIndex > 0) {
            const newIndex = currentDimensionIndex - 1;
            setCompletedIndices((prev) => prev.filter((item) => item.value !== newIndex));
            setCurrentDimensionIndex(newIndex);
            const previousDimension = dimensions[newIndex];
            if (previousDimension.questions.length > 0) {
                setCurrentQuestionIndex(previousDimension.questions.length - 1);
                setShowDescription(false);
            } else {
                setCurrentQuestionIndex(0);
                setShowDescription(true);
            }
        }
    };

    const currentResponse = responses[currentQuestion.id];

    const DescriptionView = () => (
        <div className='flex flex-col items-center px-3 py-10 sm:px-6 md:px-10'>
            <div className='relative flex w-full items-center justify-center mb-16'>
                <div className='absolute left-[-24px]'>
                    {currentDimensionIndex > 0 && (
                        <NavigationButton onClick={goToPrevious} position='left' size='sm' />
                    )}
                </div>
                <h2 className='text-2xl sm:text-3xl md:text-5xl font-extrabold text-royal-blue dark:text-blue-darknut text-center'>
                    {currentDimension.title}
                </h2>
            </div>
            <p className='mb-16 text-sm md:text-xl text-justify'>{currentDimension.description}</p>
            <button
                className='px-6 py-3 bg-blue-darknut rounded-md text-bleached-silk'
                onClick={goToNext}
            >
                Iniciar
            </button>
        </div>
    );

    const QuestionView = () => (
        <div>
            <div className='text-center text-zinc-400'>
                Questão {currentQuestionIndex + 1} de {totalQuestionsInDimension}
            </div>
            <div className='py-16 px-3 sm:px-8 md:px-12 max-w-4xl mx-auto'>
                <QuestionWithLikert
                    question={currentQuestion.text}
                    numOptions={5}
                    selectedOption={currentResponse}
                    setSelectedOption={(option) => handleResponseChange(currentQuestion.id, option)}
                />
            </div>
            <div className='flex justify-end space-x-3'>
                <NavigationButton
                    onClick={goToPrevious}
                    position='left'
                    disabled={isFirstQuestion}
                />
                <NavigationButton
                    onClick={goToNext}
                    position='right'
                />
            </div>
        </div>
    );

    const SubmitView = () => {
        const [downloadReport] = useDownloadReportMutation();

        const handleSubmitAndDownload = async () => {
            try {
                await handleSubmitResponses(moduleName as string, (moduleData as Modulo).respostasIncompletas);

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
                console.error('Erro ao enviar respostas ou baixar o relatório:', error);
            }
        };

        return (
            <div className='flex flex-col items-center px-3 py-10 sm:px-6 md:px-10'>
                <div className='rounded-full border-2 border-turquoise p-4 mb-8'>
                    <Check className='text-turquoise h-16 w-16' />
                </div>
                <h1 className='text-2xl sm:text-3xl md:text-5xl font-extrabold mb-16'> Questionário Finalizado! </h1>
                <button
                    className='px-6 py-3 bg-turquoise rounded-md text-black-wash'
                    onClick={handleSubmitAndDownload}
                >
                    Enviar Respostas e Baixar Relatório
                </button>
            </div>
        );
    };

    const NavigationButton = ({
        onClick,
        position,
        disabled = false,
        size = 'md',
    }: {
        onClick: () => void;
        position: 'left' | 'right';
        disabled?: boolean;
        size?: 'sm' | 'md' | 'lg';
    }) => {
        const sizeClasses = {
            sm: 'p-1 text-sm',
            md: 'p-2 text-base',
            lg: 'p-3 text-lg',
        };

        return (
           <button
                className={`rounded-full border ${sizeClasses[size]} border-zinc-400 text-zinc-400 hover:border-blue-darknut hover:text-blue-darknut`}
                onClick={onClick}
                disabled={disabled}
            >
                {position === 'left' ? <ChevronLeft /> : <ChevronRight />}
            </button>
        );
    };

    return (
        <div className='flex flex-col min-h-screen p-4 pt-32 sm:p-8 sm:pt-36 md:flex-row md:p-12 md:pt-40 bg-bleached-silk dark:bg-dark-navy-blue gap-6'>

            <div  className='flex flex-col items-center justify-center p-4 md:flex-1 mx-auto bg-off-white dark:bg-gunmetal rounded-md border border-royal-blue dark:border-blue-darknut'>
                {showSubmit
                ? <SubmitView />
                : (showDescription
                    ? <DescriptionView />
                    : <QuestionView />
                )
                }
            </div>

            <div className='flex flex-col justify-center bg-bleached-silk dark:bg-dark-navy-blue rounded-md border border-royal-blue dark:border-blue-darknut p-4 md:w-1/3'>
                <h2 className='text-3xl text-center mb-10 font-bold text-royal-blue dark:text-blue-darknut'>Histórico de preenchimento</h2>
                <div className="space-y-4">
                {dimensions.map((dimension, index) => {
                    const isCurrent = index === currentDimensionIndex;           
                    const completedItem = completedIndices.find(item => item.value === index);
                    const isCompleted = !!completedItem;

                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex-1">
                                <p
                                    className={`text-xl font-semibold pb-2 border-b-2 ${
                                        isCurrent
                                            ? 'text-royal-blue border-royal-blue dark:text-blue-darknut dark:border-blue-darknut'
                                            : 'border-black-wash dark:border-white'
                                    }`}
                                >
                                    {dimension.title}
                                </p>
                                {completedItem && (
                                    <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                                        Respondido em: {completedItem.savedAt.toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            
                            {isCompleted && (
                                <span className="ml-4 w-6 h-6 flex items-center justify-center rounded-full bg-royal-blue text-white text-sm font-bold dark:bg-blue-darknut">
                                    ✓
                                </span>
                            )}
                        </div>
                    );
                })}
                </div>
            </div>
  
        </div>
    );
}