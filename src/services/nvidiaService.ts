export const NvidiaService = {
  compute: async (payload: any) => Promise.resolve({ ok: true, payload }),
  inference: async (payload: any) => Promise.resolve({ ok: true, payload }),
  vision: async (payload: any) => Promise.resolve({ ok: true, payload }),
  audio: async (payload: any) => Promise.resolve({ ok: true, payload }),
};
