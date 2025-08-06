import { apiSlice } from '../services/apiSlice';

interface Question {
    id: number;
    pergunta: string;
    explicacao: string;
}

export interface Dimensao {
    id: number;
    dimensaoTitulo: string;
    descricao: string;
    perguntas: Question[];
}

export interface Modulo {
    id: number;
    nome: string;
    descricao: string;
    perguntasQntd: number;
    tempo: number;
    dimensoes: Dimensao[];
    respondidads: string[];
    nextDimensionIndex: number;
    respostasIncompletas: {
        dimensao: string;
        respostas: RespostaModulo[];
    };
}

export interface DimensaoIncompleta {
  dimensao: string;
  respostas: RespostaModulo[] | void;
}

export interface RespostaModulo {
    id: number;
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
  media: number;
  resposta_modulo: {
    id: number;
    valorFinal: number;
  };
}

export interface ModuloRelatorio {
  modulo: {
    nome: string;
    descricao: string;
  };
  usuario: {
    username: string;
    email: string;
  };
  valorFinal: number;
  dataResposta: string;
  dimensoes: {
    dimensao: {
        id: number;
        titulo: string;
    };
    valorFinal: number;
  }[];
  media_dimensoes: Record<string, number>;
}

export interface SaveIncomplete {
    nomeModulo: string;
    dimensaoTitulo: string;
    respostas: {
        id: number; 
        valor: number | null
    }[];
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
        getViewRespostaModulo: builder.query<ModuloRelatorio, number>({
            query: (moduloId: number) => `/relatorio/modulo/?modulo_id=${moduloId}`
        }),
        saveIncomplete: builder.mutation<void, SaveIncomplete> ({
            query: (resposta) => ({
                url: 'questionario/salvar-incompleta/',
                method: 'POST',
                body: resposta,
            })
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
    useGetDimensoesQuery,
    useGetViewRespostaModuloQuery,
    useSaveIncompleteMutation
} = questionnaireApiSlice;