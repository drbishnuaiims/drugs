/* =========================================================
   THOMSON CLINIC
   DRUG MASTER DATABASE
   MODULE 3
========================================================= */

const DrugDatabase = {

    data: null,


    async load() {

        try {

            const response =
                await fetch(
                    "data/drugs.json"
                );

            if (!response.ok) {

                throw new Error(
                    "Drug database could not be loaded."
                );

            }

            this.data =
                await response.json();

            console.log(
                "Drug database loaded:",
                this.data.database
            );

            return this.data;

        } catch (error) {

            console.error(
                "Database error:",
                error
            );

            return null;
        }
    },


    getAll() {

        return this.data?.drugs || [];

    },


    search(query) {

        if (!query || !this.data) {

            return [];
        }

        const q =
            query
                .trim()
                .toLowerCase();


        return this.data.drugs
            .filter(drug => {

                const text = [

                    drug.genericName,

                    drug.therapeuticClass,

                    ...(drug.searchTerms || []),

                    ...(drug.formulations || [])
                        .map(
                            f =>
                                f.strength
                        ),

                    ...(drug.formulations || [])
                        .map(
                            f =>
                                f.dosageForm
                        )

                ]
                .join(" ")
                .toLowerCase();


                return text.includes(q);

            })
            .slice(0, 8);

    },


    findById(id) {

        return this.data?.drugs
            ?.find(
                drug =>
                    drug.id === id
            ) || null;

    },


    findFormulation(
        drugId,
        formulationId
    ) {

        const drug =
            this.findById(
                drugId
            );


        if (!drug) {

            return null;
        }


        return drug.formulations
            .find(
                formulation =>
                    formulation.id ===
                    formulationId
            ) || null;

    },


    getPriceListings(
        formulation
    ) {

        const listings = [];


        formulation.brands
            .forEach(
                brand => {

                    brand.prices
                        .forEach(
                            price => {

                                const
                                pricePerUnit =
                                    price.sellingPrice /
                                    brand.packSize;


                                const
                                discount =
                                    (
                                        (
                                            price.mrp -
                                            price.sellingPrice
                                        )
                                        /
                                        price.mrp
                                    ) * 100;


                                listings.push({

                                    brandId:
                                        brand.id,

                                    brandName:
                                        brand.brandName,

                                    manufacturer:
                                        brand.manufacturer,

                                    packSize:
                                        brand.packSize,

                                    packUnit:
                                        brand.packUnit,

                                    source:
                                        price.source,

                                    mrp:
                                        price.mrp,

                                    sellingPrice:
                                        price.sellingPrice,

                                    pricePerUnit:
                                        pricePerUnit,

                                    discountPercent:
                                        discount,

                                    currency:
                                        price.currency,

                                    checkedAt:
                                        price.checkedAt

                                });

                            }
                        );

                }
            );


        return listings;

    },


    getDatabaseInfo() {

        return this.data?.database || null;

    }

};