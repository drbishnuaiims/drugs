/**
 * Thomson Clinic
 * Drug Price Provider Interface
 *
 * Every future price provider should follow
 * this normalized structure.
 */

export function normalizePriceListing({
    source,
    brandId,
    brandName,
    manufacturer,
    packSize,
    packUnit,
    mrp,
    sellingPrice,
    currency = "INR"
}) {

    if (!source) {
        throw new Error("Provider source is required.");
    }

    if (!brandId) {
        throw new Error("Brand ID is required.");
    }

    if (!sellingPrice || sellingPrice <= 0) {
        throw new Error("Valid selling price is required.");
    }

    const pricePerUnit =
        sellingPrice / packSize;

    const discountPercent =
        mrp > 0
            ? ((mrp - sellingPrice) / mrp) * 100
            : 0;

    return {

        source,

        brandId,

        brandName,

        manufacturer,

        packSize,

        packUnit,

        mrp,

        sellingPrice,

        currency,

        pricePerUnit:
            Number(pricePerUnit.toFixed(2)),

        discountPercent:
            Number(discountPercent.toFixed(1)),

        checkedAt:
            new Date().toISOString()
    };
}