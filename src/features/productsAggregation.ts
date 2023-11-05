import { PipelineStage } from "mongoose";

export const productsAggregation: PipelineStage[] = [
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },
  {
    $addFields: {
      product: {
        $arrayElemAt: [
          {
            $map: {
              input: "$product",
              as: "product",
              in: {
                $mergeObjects: [
                  {},
                  {
                    name: "$$product.name",
                    images: "$$product.images",
                  },
                ],
              },
            },
          },
          0,
        ],
      },
    },
  },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "userId",
  //       foreignField: "_id",
  //       as: "user",
  //     },
  //   },

  //   {
  //     $addFields: {
  //       user: {
  //         $arrayElemAt: [
  //           {
  //             $map: {
  //               input: "$user",
  //               as: "user",
  //               in: {
  //                 $mergeObjects: [
  //                   {},
  //                   {
  //                     name: "$$user.name",
  //                     images: "$$user.images",
  //                   },
  //                 ],
  //               },
  //             },
  //           },
  //           0,
  //         ],
  //       },
  //     },
  //   },
  //   {
  //     $addFields: {
  //       options: {
  //         $reduce: {
  //           input: "$options",
  //           initialValue: [],
  //           in: {
  //             $toObjectId: "$$this",
  //           },
  //         },
  //       },
  //     },
  //   },
  {
    $lookup: {
      from: "optionsItem",
      localField: "options",
      foreignField: "_id",
      as: "options",
    },
  },

  {
    $replaceWith: {
      $mergeObjects: [
        "$$ROOT",
        {
          id: "$_id",
        },
      ],
    },
  },
  {
    $unset: ["_id", "__v"],
  },
];
