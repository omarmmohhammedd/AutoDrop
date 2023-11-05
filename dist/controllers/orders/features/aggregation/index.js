"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersAggregation = void 0;
exports.ordersAggregation = [
    {
        $set: {
            payment_vat: 0,
            subtotal: 0,
            shipping_amount: 0,
            total: 0,
        },
    },
    {
        $addFields: {
            customer_address: {
                $cond: {
                    if: "$shipping.address.address",
                    then: {
                        $mergeObjects: [
                            "$shipping.address",
                            {
                                source: "address",
                            },
                        ],
                    },
                    else: {
                        $mergeObjects: [
                            "$shipping.pickup_address",
                            {
                                source: "pickup_address",
                            },
                        ],
                    },
                },
            },
        },
    },
    {
        $addFields: {
            items_amount: {
                $sum: {
                    $reduce: {
                        input: "$items",
                        initialValue: [],
                        in: {
                            $multiply: [
                                {
                                    $convert: {
                                        input: "$$this.quantity",
                                        to: "double",
                                        onError: 0,
                                        onNull: 0,
                                    },
                                },
                                {
                                    $convert: {
                                        input: {
                                            $reduce: {
                                                input: "$$this.options",
                                                initialValue: 0,
                                                in: "$$this.value.original_price",
                                            },
                                        },
                                        to: "double",
                                        onError: 0,
                                        onNull: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
    {
        $addFields: {
            shipping_amount: {
                $round: [
                    {
                        $sum: {
                            $round: [
                                {
                                    $sum: {
                                        $reduce: {
                                            input: "$products_shipping_services",
                                            initialValue: 0,
                                            in: {
                                                $convert: {
                                                    input: "$$this.amount",
                                                    to: "double",
                                                    onError: 0,
                                                    onNull: 0,
                                                },
                                            },
                                        },
                                    },
                                },
                                2,
                            ],
                        },
                    },
                    2,
                ],
            },
        },
    },
    {
        $addFields: {
            items: {
                $map: {
                    input: "$items",
                    as: "item",
                    in: {
                        $mergeObjects: [
                            "$$item",
                            {
                                total: {
                                    $multiply: [
                                        {
                                            $convert: {
                                                input: {
                                                    $reduce: {
                                                        input: "$$item.options",
                                                        initialValue: 0,
                                                        in: {
                                                            $convert: {
                                                                input: "$$this.value.original_price",
                                                                to: "double",
                                                                onError: 0,
                                                                onNull: 0,
                                                            },
                                                        },
                                                    },
                                                },
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                        "$$item.quantity",
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
        },
    },
    {
        $addFields: {
            subtotal: {
                $round: [
                    {
                        $sum: {
                            $add: [
                                {
                                    $convert: {
                                        input: "$shipping_amount",
                                        to: "double",
                                        onError: 0,
                                        onNull: 0,
                                    },
                                },
                                {
                                    $convert: {
                                        input: "$items_amount",
                                        to: "double",
                                        onError: 0,
                                        onNull: 0,
                                    },
                                },
                            ],
                        },
                    },
                    2,
                ],
            },
        },
    },
    {
        $addFields: {
            payment_vat: {
                $round: [
                    {
                        $multiply: ["$subtotal", 0.07],
                    },
                    2,
                ],
            },
        },
    },
    {
        $addFields: {
            total: {
                $round: [
                    {
                        $sum: {
                            $add: ["$subtotal", "$payment_vat"],
                        },
                    },
                    2,
                ],
            },
        },
    },
    {
        $addFields: {
            profit: {
                $round: [
                    {
                        $reduce: {
                            input: "$items",
                            initialValue: [],
                            in: {
                                $multiply: [
                                    {
                                        $convert: {
                                            input: "$$this.quantity",
                                            to: "double",
                                            onError: 0,
                                            onNull: 0,
                                        },
                                    },
                                    {
                                        $convert: {
                                            input: {
                                                $reduce: {
                                                    input: "$$this.options",
                                                    initialValue: 0,
                                                    in: {
                                                        $subtract: [
                                                            "$$this.value.price",
                                                            "$$this.value.original_price",
                                                        ],
                                                    },
                                                },
                                            },
                                            to: "double",
                                            onError: 0,
                                            onNull: 0,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    2,
                ],
            },
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
        $unset: [
            "shipping",
            "meta",
            "items.product.options",
            "items.options.option.value",
            "__v",
            "_id",
        ],
    },
];
