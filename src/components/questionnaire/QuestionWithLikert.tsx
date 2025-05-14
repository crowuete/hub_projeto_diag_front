import { AnimatedText, LikertScale } from '@/components/questionnaire';

interface QuestionWithLikertProps {
    question: string;
    numOptions: number;
    selectedOption: number | null;
    setSelectedOption: (index: number) => void;
}

export default function QuestionWithLikert({ question, numOptions, selectedOption, setSelectedOption }: QuestionWithLikertProps) {
    if (numOptions % 2 === 0) {
        throw new Error('O número de opções deve ser ímpar.');
    }

    return (
        <div className='flex flex-col w-full items-center space-y-6 md:space-y-8 lg:space-y-12'>
            <p className={`text-xl sm:text-2xl font-bold text-center`}>
                {question}
            </p>
            <LikertScale
                numOptions={numOptions}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
            />
        </div>
    );
}