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

export interface Report {
    id: number;
    usuario: string;
    nome_modulo: string;
    valorFinal: number;
    dataResposta: number;
}

export interface RelatorioDate {
  data: string;
  valorFinal: number;
}

export interface ResultadoDimensao {
  dimensao: string;
  valorFinal: number;
  data: string;
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
        searchReport: builder.query<Report[], string>({
            query: (data) => `/relatorios/?data=${data}`,
            transformResponse: (response: { resultados: Report[] }) => response.resultados,
        }),
        checkDeadline: builder.query<{ ok_response: boolean; message: string }, string | void>({
            query: (idModulo) => `/questionario/${idModulo}/check_deadline/`,
        }),
        getRelatorioDates: builder.query<RelatorioDate[], void>({
            query: () => '/relatorios/datas/',
        }),
        getDimensoes: builder.query<ResultadoDimensao[], void>({
            query: () => '/relatorios/dimensoes/',
        }),

    }),
});

export const {
    useGetQuestionnairesQuery,
    useGetQuestionnaireByModuleQuery,
    useSaveModuleResponsesMutation,
    useDownloadReportMutation,
    useSearchReportQuery,
    useLazySearchReportQuery, 
    useCheckDeadlineQuery,
    useGetRelatorioDatesQuery,
    useGetDimensoesQuery
} = questionnaireApiSlice;