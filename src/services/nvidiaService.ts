export type NvidiaResponse<T = unknown> = { ok: boolean; payload: T };

export const NvidiaService = {
  compute: async (payload: unknown): Promise<NvidiaResponse> =>
    Promise.resolve({ ok: true, payload }),
  inference: async (payload: unknown): Promise<NvidiaResponse> =>
    Promise.resolve({ ok: true, payload }),
  vision: async (payload: unknown): Promise<NvidiaResponse> =>
    Promise.resolve({ ok: true, payload }),
  audio: async (payload: unknown): Promise<NvidiaResponse> =>
    Promise.resolve({ ok: true, payload }),
};
