/**
 * Thomson Clinic
 * Drug Price Refresh Engine
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { fetchDemoPrices } from "./providers/demo-provider.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


const dataPath =
    path.join(
        __dirname,
        "..",
        "data",
        "drugs.json"
    );


async function refreshPrices() {

    console.log(
        "Starting Thomson Clinic price refresh..."
    );


    /*
       Fetch prices from the provider.
    */

    const newPrices =
        await fetchDemoPrices();


    console.log(
        `Received ${newPrices.length} price listings.`
    );


    /*
       Read current drug database.
    */

    const rawData =
        fs.readFileSync(
            dataPath,
            "utf8"
        );

    const database =
        JSON.parse(rawData);


    /*
       Update matching brands.
    */

    let updatedCount = 0;


    for (const drug of database.drugs) {

        for (const formulation of
            drug.formulations || []) {

            for (const brand of
                formulation.brands || []) {

                const matchingPrices =
                    newPrices.filter(
                        price =>
                            price.brandId === brand.id
                    );


                if (matchingPrices.length === 0) {
                    continue;
                }


                brand.prices =
                    matchingPrices.map(
                        price => ({
                            source:
                                price.source,

                            mrp:
                                price.mrp,

                            sellingPrice:
                                price.sellingPrice,

                            currency:
                                price.currency,

                            checkedAt:
                                price.checkedAt
                        })
                    );


                updatedCount++;

            }

        }

    }


    /*
       Update database metadata.
    */

    database.database.lastUpdated =
        new Date().toISOString();

    database.database.priceData =
        "REFRESHED DEMONSTRATION DATA";


    /*
       Save updated database.
    */

    fs.writeFileSync(
        dataPath,
        JSON.stringify(
            database,
            null,
            2
        )
    );


    console.log(
        `Updated ${updatedCount} brands.`
    );

    console.log(
        "Price refresh completed."
    );
}


refreshPrices()
    .catch(error => {

        console.error(
            "Price refresh failed:"
        );

        console.error(error);

        process.exit(1);

    });