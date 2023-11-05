export default async function ModelFactor(model: any, query: any, filter: any) {
  const { page, search_key, ...queries } = query;
  const current_page = parseInt(page) || 0;

  const result = await model.paginate(
    {
      ...(search_key && {
        $text: {
          $search: search_key,
        },
      }),
      ...filter,
    },
    { page: current_page, ...queries }
  );

  return result;
}
