import { apiSlice } from '../services/apiSlice';

interface Question {
    id: number;
    pergunta: string;
    explicacao: string;
}

interface Dimensao {
    id: number;
    dimensaoTitulo: string;
    descricao: string;
    tipo: 'OBRIGATORIO' | 'COMERCIO' | 'SERVICO' | 'INDUSTRIA';
    perguntas: Question[];
}

interface Modulo {
    id: number;
    nome: string;
    descricao: string;
    perguntasQntd: number;
    tempo: number;
    dimensoes: Dimensao[];
}

interface RespostaModulo {
    perguntaId: number;
    valor: number;
}

export const questionnaireApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getQuestionnaires: builder.query<Dimensao[], void>({
            query: () => '/questionario/',
        }),
        getQuestionnaireByModule: builder.query<Modulo, string>({
            query: (nomeModulo: string) => `/questionario/modulos/${nomeModulo}/`,
        }),
        saveModuleResponses: builder.mutation<void, { nomeModulo: string; respostas: RespostaModulo[] }>({
            query: ({ nomeModulo, respostas }) => ({
                url: `/modulos/${nomeModulo}/respostas/`,
                method: 'POST',
                body: { respostas },
            }),
        }),
        downloadReport: builder.mutation<Blob, string>({
            query: (nomeModulo) => ({
                url: `/modulos/${nomeModulo}/relatorio/`,
                method: 'GET',
                responseHandler: (response) => response.blob(),
            }),
        }),
    }),
});

export const {
    useGetQuestionnairesQuery,
    useGetQuestionnaireByModuleQuery,
    useSaveModuleResponsesMutation,
    useDownloadReportMutation,
} = questionnaireApiSlice;