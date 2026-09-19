/**
 * Thomson Clinic
 * DEMO Price Provider
 *
 * This simulates a permitted external
 * price source so that the refresh
 * pipeline can be tested safely.
 */

import { normalizePriceListing } from "./provider-interface.js";


export async function fetchDemoPrices() {

    const prices = [

        normalizePriceListing({
            source: "DEMO-1",
            brandId: "demo-escitalopram-10",
            brandName: "Demo Escitalopram 10",
            manufacturer: "Demo Pharma",
            packSize: 10,
            packUnit: "tablets",
            mrp: 120,
            sellingPrice: 96
        }),

        normalizePriceListing({
            source: "DEMO-2",
            brandId: "demo-escitalopram-10",
            brandName: "Demo Escitalopram 10",
            manufacturer: "Demo Pharma",
            packSize: 10,
            packUnit: "tablets",
            mrp: 120,
            sellingPrice: 102
        })

    ];

    return prices;
}