import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";
import { RagQueryRequest, RagQueryResponse } from "../../models/Rag";

export const ragService = {
  async query(
    data: RagQueryRequest,
    signal?: AbortSignal
  ): Promise<RagQueryResponse> {
    const res = await axiosClient.post<RagQueryResponse>(
      endpoints.rag.query,
      data,
      { signal }
    );
    return res.data;
  },
};
