import { AxiosError } from "axios";
import type { ProcessCallbackFunction } from "bull";
import SallaRequest from "../../../features/salla/request";

let page = 1;
let recall = false;

export const syncBranches: ProcessCallbackFunction<any> = (job) => {
  return new Promise(async (resolve) => {
    const { user_id, token } = job.data;
    await main(token);
    // sendNamespaceRoomMessage(user_id, "Branches maybe synced!!");
    resolve(true);
  });
};

async function main(token: string) {
  return new Promise(async (resolve) => {
    recall = await fetchBranches(token, page);

    if (!recall) return resolve(true);

    page += 1;

    await main(token);
    return resolve(true);
  });
}

async function fetchBranches(token: string, page: number) {
  let hasMore = false;
  try {
    console.log("called!!");
    const { data } = await SallaRequest({
      token,
      url: "products",
      method: "get",
      params: { page, per_page: 10 },
    });

    const pagination = data.pagination;

    hasMore = pagination.total !== pagination.currentPage;
    return hasMore;
  } catch (error: AxiosError | any) {
    const errorResponse = error?.response?.data;
    console.log(errorResponse);
  }
}
