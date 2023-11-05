import mongoPaginate from "mongoose-paginate-v2";

const options = {
  prevPage: "Prev",
  nextPage: "Next",
  limit: 25,
  sort: "-createdAt",
  customLabels: {
    totalDocs: "total",
    docs: "data",
    limit: "perPage",
    page: "current_page",
    nextPage: "next",
    prevPage: "prev",
    meta: "pagination",
  },
};

mongoPaginate.paginate.options = options;

export { mongoPaginate, options };
